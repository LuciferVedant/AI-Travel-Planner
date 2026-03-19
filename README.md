# Trao AI Travel Planner

Trao AI is an intelligent travel planning application that generates personalized travel itineraries using AI. Users can specify their destination, travel duration, interests, and budget to receive a tailored day-by-day travel plan and hotel recommendations.

## Project Structure

- **`frontend/`**: Next.js 15 web application with Tailwind CSS.
- **`backend/`**: Node.js & Express API with MongoDB and TypeScript.

## Getting Started

### 1. Prerequisites
- **Node.js**: v18 or later
- **MongoDB**: A running instance (local or Cloud Atlas)
- **API Key**: (Optional) OpenAI API Key for real-time itinerary generation.

### 2. Installation

Clone the repository and install dependencies for both the frontend and backend.

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 3. Setup Environment Variables

Create a `.env` file in the `backend/` directory with the following content:

```env
PORT=5001
MONGO_URI=mongodb://localhost:27017/trao-travel-planner
JWT_SECRET=your_jwt_secret_here
OPENAI_API_KEY=your_openai_api_key_here
```

### 4. Running the Project

Open two terminal windows:

**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```

The application will be available at `http://localhost:3000`.

---

## Technical Stack
- **Frontend**: Next.js, Tailwind CSS, Lucide Icons, Axios.
- **Backend**: Express, MongoDB (Mongoose), TypeScript.
- **Auth**: JWT-based secure authentication.
