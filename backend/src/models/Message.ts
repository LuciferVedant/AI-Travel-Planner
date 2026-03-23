import mongoose from 'mongoose';
const { Schema } = mongoose;

export interface IMessage extends mongoose.Document {
  itineraryId: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  content: string;
  messageType: 'text' | 'image' | 'video' | 'file';
  fileUrl?: string;
  createdAt: Date;
}

const MessageSchema = new Schema({
  itineraryId: { type: Schema.Types.ObjectId, ref: 'Itinerary', required: true },
  senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  messageType: { type: String, enum: ['text', 'image', 'video', 'file'], default: 'text' },
  fileUrl: { type: String },
}, { timestamps: { createdAt: true, updatedAt: false } });

// Message history should be indexable by itineraryId
MessageSchema.index({ itineraryId: 1, createdAt: 1 });

export default mongoose.model<IMessage>('Message', MessageSchema);
