# TrippieAI - Backend

The core API engine for **TrippieAI**, handling itinerary generation, secure authentication, and data orchestration.

## ⚙️ Tech Stack
- **Runtime**: [Node.js](https://nodejs.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/) (Strictly typed)
- **Framework**: [Express](https://expressjs.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) via [Mongoose](https://mongoosejs.com/)
- **Security**: JWT, Bcrypt, and Google Auth Library.
- **Tooling**: `ts-node-dev` for rapid development, `rimraf` for clean builds.

## 🧠 AI Integration
The backend features a unified generator capable of interacting with multiple LLM providers:
- **Google Gemini**: Uses `@google/generative-ai` for lightning-fast planning.
- **OpenAI**: Support for GPT models.
- **Structured Output**: Forces models to return clean, reliable JSON that reflects the itinerary model precisely.

## 🏗️ Architecture
- **Models (`src/models/`)**: Strongly typed Mongoose schemas for Users and Itineraries.
- **Routes (`src/routes/`)**: Decoupled API endpoints for Auth, Itineraries, and Profile management.
- **Middleware (`src/middleware/`)**: JWT verification and role-based access control.
- **Auth Provider Logic**: Specialized handling for Local (Email/Pass) vs Google-linked accounts.

## 🚀 Getting Started

### 1. Requirements
Ensure you have a MongoDB instance running (Local or Atlas).

### 2. Setup
```bash
npm install
npm run build
```

### 3. Environment Variables
Create a `.env` file:
```env
PORT=5001
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_google_ai_key
```

## 🌐 Deployment (Render)
1. Link your repo to [Render](https://render.com).
2. Create a **Web Service**.
3. Set **Build Command**: `cd backend && npm install && npm run build`
4. Set **Start Command**: `cd backend && npm start`
5. Configure environment variables in the Settings tab.
