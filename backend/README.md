# TrippieAI - Backend

The API providing the logic and data management for the TrippieAI Travel Planner.

## Tech Stack
- **Runtime**: Node.js
- **Framework**: Express with TypeScript
- **Database**: MongoDB (Mongoose)
- **Authentication**: JWT & Bcryptjs

## Project Structure
- `src/models/`: MongoDB schemas (User, Itinerary)
- `src/routes/`: Express API endpoints (Auth, Itinerary)
- `src/middleware/`: Custom middleware (Authentication)
- `src/server.ts`: Entry point for the server.

## Scripts
- `npm run dev`: Starts the server in development mode using `ts-node-dev`.
- `npm run build`: Compiles TypeScript to JavaScript in the `dist/` folder.
- `npm start`: Runs the compiled server from the `dist/` folder.

## AI Integration
The backend currently uses a mock LLM service to generate itineraries. To use real AI generation, update the `generateMockItinerary` function in `src/routes/itinerary.ts` to call your preferred LLM API.
