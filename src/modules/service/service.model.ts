import { Schema, model } from 'mongoose';
import { IService } from './service.interface';

const serviceSchema = new Schema<IService>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    brand: { type: String, enum: ['HP', 'Canon'], index: true },
    serviceCategory: { type: String, required: true, trim: true },
    shortDescription: { type: String, required: true },
    fullDescription: { type: String, required: true },
    image: {
      url: { type: String, required: true },
      publicId: { type: String, required: true },
    },
    gallery: [
      {
        url: { type: String, required: true },
        publicId: { type: String, required: true },
      },
    ],
    benefits: [{ type: String }],
    features: [{ type: String }],
    faq: [
      {
        question: { type: String, required: true },
        answer: { type: String, required: true },
      },
    ],
    status: { type: String, enum: ['active', 'inactive'], default: 'active', index: true },
    metaTitle: { type: String },
    metaDescription: { type: String },
    isDeleted: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

export const Service = model<IService>('Service', serviceSchema);
