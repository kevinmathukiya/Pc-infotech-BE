import { Schema, model } from 'mongoose';
import { ICategory } from './category.interface';

const categorySchema = new Schema<ICategory>(
  {
    brand: { type: String, enum: ['HP', 'Canon'], required: false, index: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String },
    status: { type: String, enum: ['active', 'inactive'], default: 'active', index: true },
    isDeleted: { type: Boolean, default: false, index: true },
  },
  {
    timestamps: true,
  }
);

export const Category = model<ICategory>('Category', categorySchema);
