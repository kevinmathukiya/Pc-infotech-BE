import { Document } from 'mongoose';
export interface ITestimonial extends Document {
  customerName: string;
  company: string;
  photo: { url: string; publicId: string };
  rating: number;
  review: string;
  status: 'active' | 'inactive';
  isDeleted: boolean;
}
