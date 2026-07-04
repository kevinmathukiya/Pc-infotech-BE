import { Document, Types } from 'mongoose';

export interface ICategory extends Document {
  brand: Types.ObjectId;
  name: string;
  slug: string;
  description?: string;
  status: 'active' | 'inactive';
  isDeleted: boolean;
}
