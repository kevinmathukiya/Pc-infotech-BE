import { Document, Types } from 'mongoose';

export interface IFeedback extends Document {
  user?: Types.ObjectId;
  customerName: string;
  email?: string;
  rating: number;
  comment: string;
  status: 'pending' | 'approved' | 'rejected';
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}
