import { Document, Types } from 'mongoose';

export interface IJobApplication extends Document {
  career: Types.ObjectId;
  name: string;
  email: string;
  phone: string;
  resume: {
    url: string;
    publicId: string;
  };
  coverLetter?: string;
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
  isDeleted: boolean;
}
