import { Schema, model } from 'mongoose';
import { IBranch } from './branch.interface';

const branchSchema = new Schema<IBranch>(
  {
    name: { type: String, required: true, trim: true },
    branchType: { type: String, required: true, default: 'branch_partner', index: true },
    address: { type: String, required: true },
    city: { type: String, required: true, index: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    region: { type: String, required: true, index: true },
    phoneNumber: { type: String, required: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    googleMapUrl: { type: String, required: true },
    workingHours: { type: String, required: true },
    supportScope: { type: String, required: true },
    status: { type: String, enum: ['active', 'inactive'], default: 'active', index: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true }, // [longitude, latitude]
    },
    isDeleted: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

branchSchema.index({ location: '2dsphere' });

export const Branch = model<IBranch>('Branch', branchSchema);
