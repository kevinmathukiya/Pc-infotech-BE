import { Schema, model } from 'mongoose';
import { IBrand } from './brand.interface';

const brandSchema = new Schema<IBrand>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    logo: {
      url: { type: String, required: true },
      publicId: { type: String, required: true },
    },
    banner: {
      url: { type: String, required: true },
      publicId: { type: String, required: true },
    },
    description: { type: String, required: true },
    status: { type: String, enum: ['active', 'inactive'], default: 'active', index: true },
    isDeleted: { type: Boolean, default: false, index: true },
  },
  {
    timestamps: true,
  }
);

export const Brand = model<IBrand>('Brand', brandSchema);
