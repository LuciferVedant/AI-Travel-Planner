import mongoose from 'mongoose';
const { Schema } = mongoose;

export interface IJoinRequest extends mongoose.Document {
  itineraryId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  status: 'pending' | 'accepted' | 'rejected';
  type: 'request' | 'invitation';
  createdAt: Date;
  updatedAt: Date;
}

const JoinRequestSchema = new Schema({
  itineraryId: { type: Schema.Types.ObjectId, ref: 'Itinerary', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
  type: { type: String, enum: ['request', 'invitation'], required: true },
}, { timestamps: true });

// Ensure a user can only have one pending request per itinerary
JoinRequestSchema.index({ itineraryId: 1, userId: 1, type: 1 }, { unique: true });

export default mongoose.model<IJoinRequest>('JoinRequest', JoinRequestSchema);
