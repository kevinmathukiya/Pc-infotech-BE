import { Document } from 'mongoose';

export interface IBrand extends Document {
  name: string;
  slug: string;
  logo: {
    url: string;
    publicId: string;
  };
  banner: {
    url: string;
    publicId: string;
  };
  description: string;
  status: 'active' | 'inactive';
  isDeleted: boolean;
}
