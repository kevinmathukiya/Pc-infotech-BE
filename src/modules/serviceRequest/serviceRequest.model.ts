import { Schema, model } from 'mongoose';
import { IServiceRequest } from './serviceRequest.interface';

const serviceRequestSchema = new Schema<IServiceRequest>(
  {
    customerName: { type: String, required: true, trim: true },
    mobileNumber: { type: String, required: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    productName: { type: String, required: true },
    brand: { type: String, required: true },
    modelNumber: { type: String, required: true },
    serialNumber: { type: String, required: true },
    problemDescription: { type: String, required: true },
    preferredVisitDate: { type: Date, required: true },
    address: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed', 'cancelled'],
      default: 'pending',
      index: true,
    },
    engineerRemarks: { type: String, default: '' },
    isDeleted: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

export const ServiceRequest = model<IServiceRequest>('ServiceRequest', serviceRequestSchema);
