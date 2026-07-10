import { Document } from 'mongoose';

export interface IBranch extends Document {
  name: string;
  branchType: string; // e.g. "head_office", "branch_partner"
  address: string;
  city: string;
  state: string;
  pincode: string;
  region: string; // e.g. "GUJARAT REGION", "MAHARASHTRA REGION"
  phoneNumber: string;
  email: string;
  googleMapUrl: string;
  workingHours: string;
  supportScope: string; // e.g. Support Scope details in cards
  status: 'active' | 'inactive';
  latitude: number;
  longitude: number;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  isDeleted: boolean;
}
