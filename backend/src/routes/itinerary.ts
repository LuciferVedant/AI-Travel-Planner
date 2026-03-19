import express from 'express';
import type { Request, Response } from 'express';
import { authenticate } from '../middleware/auth.js';
import Itinerary from '../models/Itinerary.js';

const router = express.Router();

// Mock LLM Generation Function
const generateMockItinerary = (destination: string, days: number, interests: string[]) => {
  const itinerary = [];
  for (let i = 1; i <= days; i++) {
    itinerary.push({
      day: i,
      title: `Day ${i} in ${destination}`,
      activities: [
        `Morning: Visit ${interests[0] || 'local landmarks'}`,
        `Afternoon: Explore ${interests[1] || 'downtown area'}`,
        `Evening: Dinner at a popular ${destination} restaurant`
      ]
    });
  }
  return itinerary;
};

// Mock Hotel Suggestions
const getMockHotels = (destination: string) => {
  return [
    { name: `${destination} Grand Hotel`, price: '$200/night', rating: 4.5 },
    { name: `The ${destination} Inn`, price: '$120/night', rating: 4.0 },
    { name: `Budget Stay ${destination}`, price: '$60/night', rating: 3.5 }
  ];
};

// Create (Generate) Itinerary
router.post('/generate', authenticate, async (req: Request, res: Response) => {
  try {
    const { destination, days, interests, budget } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: 'User ID missing' });
    }

    // In a real scenario, call LLM API here
    const itineraryData = generateMockItinerary(destination, days, interests);
    const hotels = getMockHotels(destination);

    const newItinerary = new Itinerary({
      userId,
      destination,
      days,
      interests,
      budget,
      itineraryData,
      hotels
    });

    await newItinerary.save();
    res.status(201).json(newItinerary);
  } catch (err: any) {
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
