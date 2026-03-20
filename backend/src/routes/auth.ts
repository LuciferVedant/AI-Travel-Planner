import express from 'express';
import type { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

import { authenticate } from '../middleware/auth.js';
import { OAuth2Client } from 'google-auth-library';

const router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const newUser = new User({ username, email, password, provider: 'local' });
    await newUser.save();

    const token = jwt.sign(
      { userId: newUser._id, provider: 'local' }, 
      process.env.JWT_SECRET || 'secret_key', 
      { expiresIn: '7d' }
    );
    res.status(201).json({ token, user: { id: newUser._id, username, email, provider: 'local' } });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || user.provider !== 'local') {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword!(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user._id, provider: 'local' }, 
      process.env.JWT_SECRET || 'secret_key', 
      { expiresIn: '7d' }
    );
    res.status(200).json({ token, user: { id: user._id, username: user.username, email: user.email, provider: 'local' } });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Google Auth
router.post('/google', async (req: Request, res: Response) => {
  try {
    const { credential } = req.body;
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload || !payload.email) return res.status(400).json({ message: 'Invalid Google token' });

    const { email, name, sub: googleId } = payload;

    let user = await User.findOne({ email });

    if (!user) {
      // Create new user, generating a unique username if necessary
      let username = name?.replace(/\s+/g, '').toLowerCase() || email.split('@')[0];
      const existingUsername = await User.findOne({ username });
      if (existingUsername) username = `${username}_${Math.floor(Math.random() * 1000)}`;

      user = new User({
        username,
        email,
        googleId,
        provider: 'google'
      });
      await user.save();
    } else if (user.provider === 'local') {
      // Link Google ID if user already exists as local
      user.googleId = googleId;
      user.provider = 'google'; // Mark as Google user to disable editing as requested
      await user.save();
    }

    const token = jwt.sign(
      { userId: user._id, provider: 'google' }, 
      process.env.JWT_SECRET || 'secret_key', 
      { expiresIn: '7d' }
    );
    res.status(200).json({ token, user: { id: user._id, username: user.username, email: user.email, provider: 'google' } });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Update Profile
router.put('/profile', authenticate, async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    const userId = req.user?.userId;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.provider === 'google') {
      return res.status(403).json({ message: 'Google accounts cannot be modified manually' });
    }

    if (username) {
      const existing = await User.findOne({ username, _id: { $ne: userId } });
      if (existing) return res.status(400).json({ message: 'Username already taken' });
      user.username = username;
    }

    if (password) user.password = password;

    await user.save();
    res.json({ message: 'Profile updated successfully', user: { id: user._id, username: user.username, email: user.email, provider: user.provider } });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
