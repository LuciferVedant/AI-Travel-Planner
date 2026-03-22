import mongoose from 'mongoose';
const { Schema } = mongoose;

export interface IItinerary extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  destination: string;
  departureLocation: string;
  days: number;
  interests: string[];
  guests: {
    adults: number;
    children: number;
    pets: number;
  };
  budget?: number; // User provided budget
  currency: string;
  startDate?: string;
  endDate?: string;
  itineraryData: any; // Structured JSON from LLM (now includes activity costs)
  hotels: any[];
  flights?: any; // New field for transportation/flight details
  totalEstimatedCost?: number; // Calculated total from AI
  createdAt: Date;
  updatedAt: Date;
}

const ItinerarySchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  destination: { type: String, required: true },
  departureLocation: { type: String, required: true },
  days: { type: Number, required: true },
  interests: { type: [String], default: [] },
  guests: {
    adults: { type: Number, default: 1 },
    children: { type: Number, default: 0 },
    pets: { type: Number, default: 0 }
  },
  budget: { type: Number },
  currency: { type: String, default: 'INR' },
  startDate: { type: String },
  endDate: { type: String },
  itineraryData: { type: Schema.Types.Mixed, required: true },
  hotels: { type: [Schema.Types.Mixed], default: [] },
  flights: { type: Schema.Types.Mixed },
  totalEstimatedCost: { type: Number }
}, { timestamps: true });

export default mongoose.model<IItinerary>('Itinerary', ItinerarySchema);
