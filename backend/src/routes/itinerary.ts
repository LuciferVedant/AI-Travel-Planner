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
  days: number, 
  interests: string[], 
  guests: { adults: number; children: number; pets: number },
  budget?: number, 
  currency: string = 'INR'
) => {
  const budgetInfo = budget ? `within a budget of ${currency} ${budget}` : `with an estimated budget calculation in ${currency}`;
  const guestInfo = `${guests.adults} adults, ${guests.children} children, and ${guests.pets} pets`;

  const prompt = `Plan a ${days}-day travel itinerary for ${destination} for ${guestInfo}, focusing on interests like ${interests.join(', ')} ${budgetInfo}. 
  Provide a day-by-day plan with specific activities suitable for ${guestInfo}.
  Also suggest 3 hotels for ${destination} that can accommodate ${guestInfo} with estimated price (in ${currency}) and rating.
  
  If the budget was not provided, please calculate a realistic estimated budget for this trip.
  
  Return the response in strictly this JSON format:
  {
    "itineraryData": [
      {
        "day": 1,
        "title": "...",
        "activities": ["...", "..."]
      }
    ],
    "hotels": [
      { "name": "...", "price": "...", "rating": 4.5 }
    ],
    "estimatedBudget": 1234
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
    const { destination, days, interests, budget, currency = 'INR', guests = { adults: 1, children: 0, pets: 0 } } = req.body;
    const userId = req.user?.userId;

    if (!userId) return res.status(401).json({ message: 'User ID missing' });

    // Call real LLM API
    const aiResponse = await generateAIItinerary(destination, days, interests, guests, budget, currency);
    
    const finalBudget = budget || aiResponse.estimatedBudget;

    const newItinerary = new Itinerary({
      userId,
      destination,
      days,
      interests,
      guests,
      budget: finalBudget,
      currency,
      itineraryData: aiResponse.itineraryData,
      hotels: aiResponse.hotels
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
