# TrippieAI Travel Planner

TrippieAI is a state-of-the-art, intelligent travel planning application that leverages advanced AI (Gemini/OpenAI) to craft personalized high-end itineraries. Designed for the modern explorer, it transforms vague travel ideas into detailed, day-by-day plans in seconds.

## 🏗️ Technical Architecture

TrippieAI is built on a robust, decoupled architecture designed for performance and scalability:

- **Frontend (UI Layer)**: Built with **Next.js 15** (App Router). It uses **Redux Toolkit** for sophisticated state management, **Tailwind CSS v4** for cutting-edge aesthetics, and **Framer Motion** for fluid, premium animations.
- **Backend (API Layer)**: A **Node.js & Express** service authored in **TypeScript**. It handles secure **JWT & Google OAuth** authentication, complex itinerary processing, and multi-provider AI integrations.
- **Intelligence (AI Layer)**: Seamlessly integrates with **Google Gemini** and **OpenAI** to generate structured JSON-based travel plans tailored to user-specific vibre, budget, and durations.
- **Data (Persistence Layer)**: Uses **MongoDB** (Mongoose) to securely store user profiles, encrypted credentials, and personalized itineraries.

## 🤖 AI Agent Design

TrippieAI employs a sophisticated, multi-provider AI strategy to ensure highly reliable and high-quality itinerary generation:

- **Multi-Model Orchestration**: The system prioritizes **Google Gemini** (including `gemini-2.5-flash`, `flash-lite`, and `pro` models) for its superior speed and structured output capabilities.
- **Fail-Safe Fallbacks**: In case of rate limits or service interruptions, the backend seamlessly falls back to **OpenAI's GPT-3.5-Turbo**, ensuring a consistent user experience.
- **Structured Intelligence**: Uses specialized prompts to enforce strict JSON schemas, allowing the frontend to parse and render complex travel data with precision.

## ✨ Creative Feature: Live Day Regeneration

Unlike static travel planners, TrippieAI offers a unique **"Live Regeneration"** engine:
- **Dynamic Updates**: Users can request changes to specific days (e.g., "make it more adventurous" or "remove hiking") without losing the rest of their itinerary.
- **Smart Recalculation**: The AI intelligently updates only the target days while simultaneously recalculating the entire trip's budget and logistics in real-time.
- **Granular Control**: This allows for a collaborative planning experience where the AI acts as a flexible travel agent rather than a one-shot generator.

## 📂 Project Structure

- **[`frontend/`](file:///Users/vedantkhatri/Trao-AI-Travel-Planner/frontend/README.md)**: Next.js 15 web application.
- **[`backend/`](file:///Users/vedantkhatri/Trao-AI-Travel-Planner/backend/README.md)**: TypeScript Express API.
- **[`Documentation/`](file:///Users/vedantkhatri/.gemini/antigravity/brain/63625e08-b8dc-4e9b-8b0b-8b51fa2bcd07/walkthrough.md)**: Detailed feature walkthroughs and implementation notes.

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: v18.17+ or v20+
- **MongoDB**: Local instance or a free cluster on MongoDB Atlas.
- **AI Access**: A Gemini API Key or OpenAI API Key.

### 2. Fast Setup

```bash
# Backend Setup
cd backend
npm install
cp .env.example .env # Create and configure your secrets

# Frontend Setup
cd ../frontend
npm install
```

### 3. Environment Configuration

The backend requires a `.env` file with the following minimum configuration:
```env
PORT=5001
MONGO_URI=mongodb://localhost:27017/trippieai
JWT_SECRET=your_secret_key
GEMINI_API_KEY=your_key_here
```

## 🌐 Deployment

Ready to go live? Check out our **[Step-by-Step Deployment Guide](file:///Users/vedantkhatri/.gemini/antigravity/brain/63625e08-b8dc-4e9b-8b0b-8b51fa2bcd07/deployment_guide.md)** for detailed instructions on hosting for free on:
- **Vercel** (Frontend)
- **Render** (Backend)
- **MongoDB Atlas** (Database)
