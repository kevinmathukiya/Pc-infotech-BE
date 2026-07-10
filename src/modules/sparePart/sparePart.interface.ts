import { Document, Types } from 'mongoose';
import { IAsset, ISpecification } from '../product/product.interface';

export interface ISparePart extends Document {
  name: string;
  slug: string;
  sku: string;
  brand: Types.ObjectId;
  category: Types.ObjectId;
  product: Types.ObjectId;
  description?: string;
  shortDescription: string;
  fullDescription: string;
  specifications: ISpecification[];
  compatibleModels?: string;
  modelNumber?: string; // Stored to preserve admin dashboard compatibility
  price: number;
  discountPrice?: number;
  stock: number;
  stockQuantity: number; // Linked directly to stock to preserve admin dashboard compatibility
  warranty: string;
  thumbnail: IAsset;
  images: IAsset[];
  featured: boolean;
  status: 'active' | 'inactive';
  createdBy: Types.ObjectId;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}
