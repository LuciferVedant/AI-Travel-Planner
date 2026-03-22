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

// Get all itineraries for user
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ message: 'User ID missing' });
    const itineraries = await Itinerary.find({ userId }).sort({ createdAt: -1 });
    res.json(itineraries);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Get single itinerary
router.get('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ message: 'User ID missing' });
    const itinerary = await Itinerary.findOne({ _id: req.params.id, userId });
    if (!itinerary) return res.status(404).json({ message: 'Itinerary not found' });
    res.json(itinerary);
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
    const itinerary = await Itinerary.findOneAndUpdate(
      { _id: req.params.id, userId },
      { itineraryData },
      { new: true }
    );
    if (!itinerary) return res.status(404).json({ message: 'Itinerary not found' });
    res.json(itinerary);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Delete itinerary
router.delete('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ message: 'User ID missing' });
    const itinerary = await Itinerary.findOneAndDelete({ _id: req.params.id, userId });
    if (!itinerary) return res.status(404).json({ message: 'Itinerary not found' });
    res.json({ message: 'Itinerary deleted' });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
