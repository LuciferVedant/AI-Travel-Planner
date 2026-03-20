import mongoose from 'mongoose';
const { Schema } = mongoose;

export interface IItinerary extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  destination: string;
  days: number;
  interests: string[];
  budget?: number;
  currency: string;
  itineraryData: any; // Structured JSON from LLM
  hotels: any[];
  createdAt: Date;
  updatedAt: Date;
}

const ItinerarySchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  destination: { type: String, required: true },
  days: { type: Number, required: true },
  interests: { type: [String], default: [] },
  budget: { type: Number },
  currency: { type: String, default: 'INR' },
  itineraryData: { type: Schema.Types.Mixed, required: true },
  hotels: { type: [Schema.Types.Mixed], default: [] },
}, { timestamps: true });

export default mongoose.model<IItinerary>('Itinerary', ItinerarySchema);
