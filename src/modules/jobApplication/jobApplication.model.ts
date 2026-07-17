import { Schema, model } from 'mongoose';
import { IJobApplication } from './jobApplication.interface';

const jobApplicationSchema = new Schema<IJobApplication>(
  {
    career: {
      type: Schema.Types.ObjectId,
      ref: 'Career',
      required: [true, 'Career reference ID is required'],
      index: true,
    },
    name: { type: String, required: [true, 'Candidate name is required'], trim: true },
    email: { type: String, required: [true, 'Email address is required'], trim: true },
    phone: { type: String, required: [true, 'Phone number is required'], trim: true },
    resume: {
      url: { type: String, required: [true, 'Resume file URL is required'] },
      publicId: { type: String, required: [true, 'Resume Cloudinary ID is required'] },
    },
    coverLetter: { type: String },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'accepted', 'rejected'],
      default: 'pending',
      index: true,
    },
    isDeleted: { type: Boolean, default: false, index: true },
  },
  {
    timestamps: true,
  }
);

export const JobApplication = model<IJobApplication>('JobApplication', jobApplicationSchema);
