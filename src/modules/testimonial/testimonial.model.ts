import { Schema, model } from 'mongoose';
import { ITestimonial } from './testimonial.interface';

const testimonialSchema = new Schema<ITestimonial>(
  {
    customerName: { type: String, required: true, trim: true },
    company: { type: String, required: true },
    photo: {
      url: { type: String, required: true },
      publicId: { type: String, required: true },
    },
    rating: { type: Number, required: true, min: 1, max: 5 },
    review: { type: String, required: true },
    status: { type: String, enum: ['active', 'inactive'], default: 'active', index: true },
    isDeleted: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

export const Testimonial = model<ITestimonial>('Testimonial', testimonialSchema);
