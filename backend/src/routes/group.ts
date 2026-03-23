import express from 'express';
import type { Request, Response } from 'express';
import { authenticate } from '../middleware/auth.js';
import Itinerary from '../models/Itinerary.js';
import JoinRequest from '../models/JoinRequest.js';
import User from '../models/User.js';

const router = express.Router();

// Request to join a trip
router.post('/request-join/:itineraryId', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { itineraryId } = req.params;

    const itinerary = await Itinerary.findById(itineraryId);
    if (!itinerary) return res.status(404).json({ message: 'Itinerary not found' });
    if (!itinerary.isPublic) return res.status(403).json({ message: 'This trip is private' });

    // Check if user is already a member
    const isMember = (itinerary.members || []).some(m => m.user.toString() === userId?.toString()) || itinerary.userId.toString() === userId?.toString();
    if (isMember) return res.status(400).json({ message: 'You are already a member' });

    const joinRequest = new JoinRequest({
      itineraryId,
      userId,
      type: 'request',
      status: 'pending'
    });

    await joinRequest.save();
    res.status(201).json(joinRequest);
  } catch (err: any) {
    if (err.code === 11000) return res.status(400).json({ message: 'Request already exists' });
    res.status(500).json({ message: err.message });
  }
});

// Admin: Get all pending requests for an itinerary
router.get('/requests/:itineraryId', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { itineraryId } = req.params;

    const itinerary = await Itinerary.findOne({ _id: itineraryId, $or: [{ userId }, { 'members.user': userId, 'members.role': 'admin' }] });
    if (!itinerary) return res.status(403).json({ message: 'Access denied' });

    const requests = await JoinRequest.find({ itineraryId, status: 'pending' }).populate('userId', 'username email');
    res.json(requests);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Admin: Respond to a join request
router.post('/respond-request/:requestId', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { requestId } = req.params;
    const { status } = req.body; // 'accepted' or 'rejected'

    if (!['accepted', 'rejected'].includes(status)) return res.status(400).json({ message: 'Invalid status' });

    const joinRequest = await JoinRequest.findById(requestId);
    if (!joinRequest) return res.status(404).json({ message: 'Request not found' });

    const itinerary = await Itinerary.findOne({ _id: joinRequest.itineraryId, $or: [{ userId }, { 'members.user': userId, 'members.role': 'admin' }] });
    if (!itinerary) return res.status(403).json({ message: 'Access denied' });

    joinRequest.status = status;
    await joinRequest.save();

    if (status === 'accepted') {
      // Add user to itinerary members
      itinerary.members.push({ user: joinRequest.userId, role: 'member' });
      await itinerary.save();
    }

    res.json(joinRequest);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Admin: Invite a user to a group
router.post('/invite/:itineraryId', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { itineraryId } = req.params;
    const { username } = req.body;

    const itinerary = await Itinerary.findOne({ _id: itineraryId, $or: [{ userId }, { 'members.user': userId, 'members.role': 'admin' }] });
    if (!itinerary) return res.status(403).json({ message: 'Access denied' });

    const targetUser = await User.findOne({ username });
    if (!targetUser) return res.status(404).json({ message: 'User not found' });

    const invitation = new JoinRequest({
      itineraryId,
      userId: targetUser._id,
      type: 'invitation',
      status: 'pending'
    });

    await invitation.save();
    res.status(201).json(invitation);
  } catch (err: any) {
    if (err.code === 11000) return res.status(400).json({ message: 'Invitation already exists' });
    res.status(500).json({ message: err.message });
  }
});

// Admin: Manage member roles (promote/demote)
router.patch('/manage-member/:itineraryId', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { itineraryId } = req.params;
    const { targetUserId, role } = req.body; // role: 'admin' or 'member'

    if (!['admin', 'member'].includes(role)) return res.status(400).json({ message: 'Invalid role' });

    if (!req.user) return res.status(401).json({ message: 'User ID missing' });
    const itinerary = await Itinerary.findOne({ _id: itineraryId, userId: req.user.userId }); // Only the main creator can promote/demote other admins
    if (!itinerary) return res.status(403).json({ message: 'Only the trip creator can manage admin roles' });

    const memberIndex = itinerary.members.findIndex(m => m.user.toString() === targetUserId);
    if (memberIndex === -1) return res.status(404).json({ message: 'Member not found' });

    if (itinerary.members[memberIndex]) {
      itinerary.members[memberIndex].role = role as 'admin' | 'member';
      await itinerary.save();
    }

    res.json({ message: 'Member role updated', members: itinerary.members });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
