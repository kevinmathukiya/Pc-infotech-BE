import { Schema, model } from 'mongoose';
import { IFeedback } from './feedback.interface';

const feedbackSchema = new Schema<IFeedback>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: false },
    customerName: { type: String, required: true, trim: true },
    email: { type: String, required: false, trim: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, trim: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending', index: true },
    isDeleted: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

export const Feedback = model<IFeedback>('Feedback', feedbackSchema);
