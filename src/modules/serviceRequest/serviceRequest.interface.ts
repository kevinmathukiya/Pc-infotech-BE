import { Document } from 'mongoose';

export type ServiceRequestStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

export interface IServiceRequest extends Document {
  customerName: string;
  mobileNumber: string;
  email: string;
  productName: string;
  brand: string;
  modelNumber: string;
  serialNumber: string;
  problemDescription: string;
  preferredVisitDate: Date;
  address: string;
  status: ServiceRequestStatus;
  engineerRemarks: string;
  isDeleted: boolean;
}
