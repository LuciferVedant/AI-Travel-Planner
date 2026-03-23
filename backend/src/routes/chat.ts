import express from 'express';
import type { Request, Response } from 'express';
import { authenticate } from '../middleware/auth.js';
import Message from '../models/Message.js';
import Itinerary from '../models/Itinerary.js';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

const router = express.Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer-Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const isVideo = file.mimetype.startsWith('video/');
    return {
      folder: 'trippie-chat',
      resource_type: isVideo ? 'video' : 'auto',
      public_id: `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`,
    };
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
});

// Get chat history for an itinerary
router.get('/:itineraryId', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { itineraryId } = req.params;

    const itinerary = await Itinerary.findById(itineraryId);
    if (!itinerary) return res.status(404).json({ message: 'Itinerary not found' });

    // Check permission: creator, member, or public
    const isCreator = itinerary.userId.toString() === userId?.toString();
    const isMember = (itinerary.members || []).some(m => m.user.toString() === userId?.toString());
    
    if (!isCreator && !isMember && !itinerary.isPublic) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const messages = await Message.find({ itineraryId })
      .populate('senderId', 'username')
      .sort({ createdAt: 1 });
    
    res.json(messages);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Upload media for chat (now stored on Cloudinary permanently)
router.post('/upload', authenticate, upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    // Cloudinary returns the full permanent URL as req.file.path
    const fileUrl = req.file.path;
    res.json({ fileUrl, originalName: req.file.originalname, mimetype: req.file.mimetype });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
