import { Document, Types } from 'mongoose';

export interface IFaq {
  question: string;
  answer: string;
}

export interface IAsset {
  url: string;
  publicId: string;
}

export interface IService extends Document {
  name: string;
  slug: string;
  brand?: 'HP' | 'Canon';
  serviceCategory: string;
  shortDescription: string;
  fullDescription: string;
  image: IAsset;
  gallery: IAsset[];
  benefits: string[];
  features: string[];
  faq: IFaq[];
  status: 'active' | 'inactive';
  metaTitle?: string;
  metaDescription?: string;
  isDeleted: boolean;
}
