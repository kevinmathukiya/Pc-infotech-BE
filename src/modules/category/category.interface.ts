import { Document, Types } from 'mongoose';

export interface ICategory extends Document {
  brand?: 'HP' | 'Canon';
  name: string;
  slug: string;
  description?: string;
  status: 'active' | 'inactive';
  isDeleted: boolean;
}
