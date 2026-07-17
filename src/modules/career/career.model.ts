import { Schema, model } from 'mongoose';
import { ICareer } from './career.interface';

const careerSchema = new Schema<ICareer>(
  {
    title: { type: String, required: true, trim: true },
    department: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ['Full-time', 'Part-time', 'Contract', 'Internship'],
      required: true,
    },
    experienceLevel: { type: String, required: true, trim: true },
    salaryRange: { type: String, trim: true },
    description: { type: String, required: true },
    requirements: { type: [String], required: true, default: [] },
    benefits: { type: [String], default: [] },
    image: {
      url: { type: String },
      publicId: { type: String },
    },
    status: { type: String, enum: ['active', 'inactive'], default: 'active', index: true },
    isDeleted: { type: Boolean, default: false, index: true },
  },
  {
    timestamps: true,
  }
);

export const Career = model<ICareer>('Career', careerSchema);
