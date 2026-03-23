import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import itineraryRoutes from './routes/itinerary.js';
import groupRoutes from './routes/group.js';
import chatRoutes from './routes/chat.js';


dotenv.config();

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/itineraries', itineraryRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/chat', chatRoutes);



app.get('/', (req, res) => {
  res.send('AI Travel Planner API');
});

export default app;
