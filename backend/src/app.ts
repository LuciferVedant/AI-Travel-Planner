import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import itineraryRoutes from './routes/itinerary.js';

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

app.get('/', (req, res) => {
  res.send('AI Travel Planner API');
});

export default app;
