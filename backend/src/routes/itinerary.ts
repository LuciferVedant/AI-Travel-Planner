import express from 'express';
import type { Request, Response } from 'express';
import { authenticate } from '../middleware/auth.js';
import Itinerary from '../models/Itinerary.js';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

const openai = process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.includes('your_openai') 
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) 
  : null;

const genAI = process.env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY.includes('your_gemini')
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

// Real LLM Generation Function
const generateAIItinerary = async (
  destination: string,
  departureLocation: string,
  days: number, 
  interests: string[], 
  guests: { adults: number; children: number; pets: number },
  budget?: number, 
  currency: string = 'INR',
  startDate?: string,
  endDate?: string
) => {
  const budgetInfo = budget ? `within a budget of ${currency} ${budget}` : `with an estimated budget calculation in ${currency}`;
  const guestInfo = `${guests.adults} adults, ${guests.children} children, and ${guests.pets} pets`;
  const dateInfo = startDate && endDate ? `from ${startDate} to ${endDate} (${days} days)` : `for ${days} days`;

  const prompt = `Plan a travel itinerary for a trip to ${destination} starting from ${departureLocation} ${dateInfo}. 
  The squad consists of ${guestInfo}. Our interests are: ${interests.join(', ')}.
  The plan should be ${budgetInfo}.
  
  Provide a day-by-day plan with specific activities suitable for this group. Since we are starting from ${departureLocation}, please consider travel time/logistics for the first and last day if relevant.
  
  Flights/Transportation estimation:
  - Estimate the cost of traveling from ${departureLocation} to ${destination} for the entire squad (${guestInfo}).
  - Provide details for 'Flights' or 'Train/Car' based on the destination and distance.
  
  Activity & Food Costs:
  - For EACH activity in the daily plan, provide an estimated cost (in ${currency}).
  - Provide an estimated daily cost for food/meals for the entire squad.
  
  Hotels:
  - Suggest 3 hotels in ${destination} that can accommodate ${guestInfo} with estimated price per night (in ${currency}) and rating.
  
  IMPORTANT: The totalEstimatedCost should be the sum of (Flights + Total Activity Costs + Total Hotel Costs + Total Food Costs).
  
  Return the response in strictly this JSON format:
  {
    "itineraryData": [
      {
        "day": 1,
        "title": "...",
        "activities": [
          { "name": "...", "description": "...", "cost": 100 }
        ],
        "dailyFoodCost": 50,
        "transportation": { "type": "Local Taxi", "cost": 20 }
      }
    ],
    "hotels": [
      { "name": "...", "price": 500, "rating": 4.5, "description": "..." }
    ],
    "flights": {
      "mode": "Flight",
      "route": "${departureLocation} to ${destination}",
      "estimatedCost": 2500,
      "details": "..."
    },
    "totalEstimatedCost": 1234
  }`;

  // Prioritize Gemini as default if key is available
  if (genAI) {
const modelsToTry = [
  "gemini-2.5-flash",         // Current stable free-tier favorite
  "gemini-2.5-flash-lite",    // High-speed, high-quota free option
  "gemini-3-flash-preview",   // Latest series (experimental/preview)
  "gemini-2.5-pro"            // Higher reasoning (strict rate limits)
];
    let lastError = null;

    for (const modelName of modelsToTry) {
      try {
        console.log(`[Gemini] Attempting ${modelName}...`);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: "application/json",
          }
        });
        
        const response = await result.response;
        let text = response.text();
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(text);
      } catch (err: any) {
        console.warn(`[Gemini] ${modelName} failed:`, err.message);
        lastError = err;
        if (err.message?.includes('404') || err.message?.includes('not found')) continue;
        break;
      }
    }
  } 
  
  // Fallback to OpenAI
  if (openai) {
    try {
      console.log('[AI] Falling back to OpenAI...');
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo-1106",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      });
      const content = response.choices[0]?.message?.content;
      if (!content) throw new Error('No content returned from OpenAI');
      return JSON.parse(content);
    } catch (err: any) {
      console.error('[OpenAI] Error:', err.message);
      throw new Error('Failed to generate with any LLM.');
    }
  }

  throw new Error('No valid AI API Key found.');
};

// Function to regenerate a single day
const generateAIItineraryDay = async (
  destination: string,
  dayNumber: number,
  interests: string[],
  guests: { adults: number; children: number; pets: number },
  query: string,
  currency: string = 'INR'
) => {
  const guestInfo = `${guests.adults} adults, ${guests.children} children, and ${guests.pets} pets`;
  
  const prompt = `Regenerate Day ${dayNumber} of a travel itinerary for ${destination} based on this specific request: "${query}".
  The squad consists of ${guestInfo}. Original interests were: ${interests.join(', ')}.
  
  Provide a revised plan for Day ${dayNumber} with specific activities suitable for this group and matching the new request.
  
  Activity & Food Costs:
  - For EACH activity in the daily plan, provide an estimated cost (in ${currency}).
  - Provide an estimated daily cost for food/meals for the entire squad.
  
  Return the response in strictly this JSON format:
  {
    "day": ${dayNumber},
    "title": "...",
    "activities": [
      { "name": "...", "description": "...", "cost": 100 }
    ],
    "dailyFoodCost": 50,
    "transportation": { "type": "Local Taxi", "cost": 20 }
  }`;

  // Prioritize Gemini
  if (genAI) {
    const modelsToTry = [
      "gemini-2.5-flash",
      "gemini-2.5-flash-lite",
      "gemini-3-flash-preview",
      "gemini-2.5-pro",
      "gemini-2.0-flash",
      "gemini-1.5-flash"
    ];
    let lastError = null;

    for (const modelName of modelsToTry) {
      try {
        console.log(`[Gemini-Day] Attempting ${modelName}...`);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: "application/json",
          }
        });
        
        const response = await result.response;
        let text = response.text();
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(text);
      } catch (err: any) {
        console.warn(`[Gemini-Day] ${modelName} failed:`, err.message);
        lastError = err;
        continue; // Try next model
      }
    }
  }

  // Fallback to OpenAI
  if (openai) {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo-1106",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      });
      const content = response.choices[0]?.message?.content;
      if (!content) throw new Error('No content returned from OpenAI');
      return JSON.parse(content);
    } catch (err: any) {
      throw new Error('Failed to regenerate day with any LLM.');
    }
  }

  throw new Error('No valid AI API Key found.');
};

// Create (Generate) Itinerary
router.post('/generate', authenticate, async (req: Request, res: Response) => {
  try {
    const { 
      destination, 
      departureLocation, 
      days, 
      interests, 
      budget, 
      currency = 'INR', 
      guests = { adults: 1, children: 0, pets: 0 },
      startDate,
      endDate
    } = req.body;
    
    const userId = req.user?.userId;

    if (!userId) return res.status(401).json({ message: 'User ID missing' });
    if (!departureLocation) return res.status(400).json({ message: 'Departure location is required' });

    // Call real LLM API
    const aiResponse = await generateAIItinerary(destination, departureLocation, days, interests, guests, budget, currency, startDate, endDate);
    
    const finalBudget = budget || aiResponse.totalEstimatedCost;
    
    const newItinerary = new Itinerary({
      userId,
      destination,
      departureLocation,
      days,
      interests,
      guests,
      budget: finalBudget,
      currency,
      startDate,
      endDate,
      itineraryData: aiResponse.itineraryData,
      hotels: aiResponse.hotels,
      flights: aiResponse.flights,
      totalEstimatedCost: aiResponse.totalEstimatedCost
    });

    await newItinerary.save();
    res.status(201).json(newItinerary);
  } catch (err: any) {
    console.error('Itinerary Route Error:', err);
    res.status(500).json({ message: err.message });
  }
});

// Get all itineraries for user (either creator or member)
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ message: 'User ID missing' });
    
    // Find itineraries where the user is either the creator OR a member
    const itineraries = await Itinerary.find({
      $or: [
        { userId },
        { 'members.user': userId }
      ]
    }).sort({ createdAt: -1 });
    
    res.json(itineraries);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Get all public itineraries
router.get('/public', authenticate, async (req: Request, res: Response) => {
  try {
    const itineraries = await Itinerary.find({ isPublic: true })
      .populate('userId', 'username') // Only basic info
      .sort({ createdAt: -1 });
    res.json(itineraries);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Get single itinerary (creator, member, or public)
router.get('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ message: 'User ID missing' });
    
    const itinerary = await Itinerary.findById(req.params.id)
      .populate('userId', 'username email')
      .populate('members.user', 'username email');
    
    if (!itinerary) return res.status(404).json({ message: 'Itinerary not found' });
    
    // Check permission: creator, member, or public
    const isCreator = (itinerary.userId?._id || itinerary.userId)?.toString() === userId.toString();
    const isMember = itinerary.members?.some((m: any) => (m.user?._id || m.user)?.toString() === userId.toString());
    
    if (!isCreator && !isMember && !itinerary.isPublic) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    res.json(itinerary);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Toggle trip visibility
router.patch('/:id/toggle-visibility', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const itinerary = await Itinerary.findOne({ _id: req.params.id, userId }); // Only creator
    if (!itinerary) return res.status(404).json({ message: 'Itinerary not found or permission denied' });
    
    itinerary.isPublic = !itinerary.isPublic;
    await itinerary.save();
    res.json({ isPublic: itinerary.isPublic });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Update itinerary
router.put('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ message: 'User ID missing' });
    const { itineraryData } = req.body;
    
    const itinerary = await Itinerary.findById(req.params.id);
    if (!itinerary) return res.status(404).json({ message: 'Itinerary not found' });

    const isCreator = itinerary.userId.toString() === userId.toString();
    const isAdmin = (itinerary.members || []).some(m => m.user.toString() === userId.toString() && m.role === 'admin');

    if (!isCreator && !isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }

    itinerary.itineraryData = itineraryData;
    await itinerary.save();
    
    res.json(itinerary);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

import Message from '../models/Message.js';
import JoinRequest from '../models/JoinRequest.js';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Delete itinerary
router.delete('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ message: 'User ID missing' });
    
    // Only the creator (default admin) can delete the itinerary
    const itinerary = await Itinerary.findOneAndDelete({ _id: req.params.id, userId });
    if (!itinerary) return res.status(404).json({ message: 'Itinerary not found or you do not have permission to delete it' });
    
    // Delete Cloudinary files from chat messages before removing them
    const fileMessages = await Message.find({
      itineraryId: req.params.id,
      messageType: { $in: ['image', 'video', 'file'] },
      fileUrl: { $exists: true, $ne: null }
    });

    for (const msg of fileMessages) {
      try {
        if (msg.fileUrl && msg.fileUrl.startsWith('http')) {
          // Extract the public ID from the Cloudinary URL
          // URL format: https://res.cloudinary.com/cloud/image/upload/v.../trippie-chat/filename.ext
          const urlParts = msg.fileUrl.split('/');
          const uploadIndex = urlParts.indexOf('upload');
          if (uploadIndex !== -1) {
            // public_id = everything after /upload/v1234567890/ (and strip extension)
            const publicIdWithVersion = urlParts.slice(uploadIndex + 2).join('/');
            const publicId = publicIdWithVersion.replace(/\.[^/.]+$/, ''); // remove extension
            const resourceType = msg.messageType === 'video' ? 'video' : 'image';
            await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
          }
        }
      } catch (cloudErr) {
        console.warn('Failed to delete Cloudinary asset:', msg.fileUrl, cloudErr);
        // Don't block deletion if Cloudinary cleanup fails
      }
    }

    // Delete all related messages and join requests from MongoDB
    await Message.deleteMany({ itineraryId: req.params.id });
    await JoinRequest.deleteMany({ itineraryId: req.params.id });
    
    res.json({ message: 'Itinerary and all related data deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Regenerate specific day(s)
router.post('/regenerate-day/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ message: 'User ID missing' });

    const { dayNumbers, query } = req.body; // dayNumbers can be a single number or an array
    if (!dayNumbers || !query) {
      return res.status(400).json({ message: 'Day numbers and query are required' });
    }

    const daysToRegenerate = Array.isArray(dayNumbers) ? dayNumbers : [dayNumbers];

    const itinerary = await Itinerary.findById(req.params.id);
    if (!itinerary) return res.status(404).json({ message: 'Itinerary not found' });

    const isCreator = itinerary.userId.toString() === userId.toString();
    const isAdmin = (itinerary.members || []).some(m => m.user.toString() === userId.toString() && m.role === 'admin');

    if (!isCreator && !isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updatedItineraryData = [...itinerary.itineraryData];

    for (const dayNum of daysToRegenerate) {
      // Generate new data for that day
      const newDayData = await generateAIItineraryDay(
        itinerary.destination,
        dayNum,
        itinerary.interests,
        itinerary.guests,
        query,
        itinerary.currency
      );

      // Update itineraryData array
      const dayIndex = updatedItineraryData.findIndex((d: any) => d.day === dayNum);
      
      if (dayIndex !== -1) {
        updatedItineraryData[dayIndex] = newDayData;
      } else {
        updatedItineraryData.push(newDayData);
      }
    }

    // Sort by day number
    updatedItineraryData.sort((a: any, b: any) => a.day - b.day);

    // Recalculate total cost
    let totalActivityCost = 0;
    let totalFoodCost = 0;
    
    updatedItineraryData.forEach((day: any) => {
      day.activities.forEach((act: any) => {
        totalActivityCost += (act.cost || 0);
      });
      totalFoodCost += (day.dailyFoodCost || 0);
      if (day.transportation && day.transportation.cost) {
        totalActivityCost += day.transportation.cost;
      }
    });

    const totalHotelCost = itinerary.hotels.reduce((sum: number, hotel: any) => sum + (hotel.price || 0), 0);
    const flightCost = itinerary.flights?.estimatedCost || 0;
    
    const newTotalCost = totalActivityCost + totalFoodCost + totalHotelCost + flightCost;

    itinerary.itineraryData = updatedItineraryData;
    itinerary.totalEstimatedCost = newTotalCost;
    
    await itinerary.save();
    res.json(itinerary);
  } catch (err: any) {
    console.error('Regenerate Day Error:', err);
    res.status(500).json({ message: err.message });
  }
});

export default router;
