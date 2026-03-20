import express from 'express';
import type { Request, Response } from 'express';
import { authenticate } from '../middleware/auth.js';
import Itinerary from '../models/Itinerary.js';
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Real LLM Generation Function
const generateAIItinerary = async (destination: string, days: number, interests: string[]) => {
  // Check if API key is still the placeholder
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.includes('your_openai_api_key')) {
    throw new Error('OpenAI API Key is missing or invalid. Please update your .env file with a real key.');
  }

  const prompt = `Plan a ${days}-day travel itinerary for ${destination} focusing on interests like ${interests.join(', ')}. 
  Provide a day-by-day plan with specific activities.
  Also suggest 3 hotels for ${destination} with estimated price and rating.
  
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
    ]
  }`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-1106",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error('No content returned from AI');
    
    return JSON.parse(content);
  } catch (err: any) {
    console.error('AI Generation Error:', err);
    
    // Provide a cleaner message for common OpenAI errors
    if (err.status === 401) {
      throw new Error('Invalid OpenAI API Key. Please check your .env configuration.');
    }
    if (err.status === 429) {
      throw new Error('OpenAI API rate limit exceeded. Please try again later.');
    }
    
    throw new Error('Failed to generate AI itinerary: ' + (err.message || 'Unknown error'));
  }
};

// Create (Generate) Itinerary
router.post('/generate', authenticate, async (req: Request, res: Response) => {
  try {
    const { destination, days, interests, budget } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: 'User ID missing' });
    }

    // Call real LLM API
    const aiResponse = await generateAIItinerary(destination, days, interests);
    
    const newItinerary = new Itinerary({
      userId,
      destination,
      days,
      interests,
      budget,
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
    if (!userId) {
      return res.status(401).json({ message: 'User ID missing' });
    }
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
    if (!userId) {
      return res.status(401).json({ message: 'User ID missing' });
    }
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
    if (!userId) {
      return res.status(401).json({ message: 'User ID missing' });
    }
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
    if (!userId) {
      return res.status(401).json({ message: 'User ID missing' });
    }
    const itinerary = await Itinerary.findOneAndDelete({ _id: req.params.id, userId });
    if (!itinerary) return res.status(404).json({ message: 'Itinerary not found' });
    res.json({ message: 'Itinerary deleted' });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
