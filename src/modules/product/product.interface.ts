import { Document, Types } from 'mongoose';

export interface ISpecification {
  key: string;
  value: string;
}

export interface IAsset {
  url: string;
  publicId: string;
}

export interface IProduct extends Document {
  name: string;
  slug: string;
  brand: 'HP' | 'Canon';
  category: Types.ObjectId;
  modelNumber: string;
  sku: string;
  shortDescription: string;
  fullDescription: string;
  specifications: ISpecification[];
  features: string[];
  warranty: string;
  price: number;
  discountPrice?: number;
  stockQuantity: number;
  images: IAsset[];
  thumbnail?: IAsset;
  brochure?: IAsset;
  status: 'active' | 'inactive';
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
  productType: 'product' | 'spare_part';
  metaTitle?: string;
  metaDescription?: string;
  isDeleted: boolean;
}
