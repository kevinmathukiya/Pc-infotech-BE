import { Document, Types } from 'mongoose';

export interface IHeroSlide {
  title: string;
  subtitle?: string;
  image: { url: string; publicId: string };
  link?: string;
  order: number;
}

export interface IWhyChooseUs {
  title: string;
  description: string;
  icon?: string;
}

export interface ICms extends Document {
  heroSlider: IHeroSlide[];
  whyChooseUs: IWhyChooseUs[];
  featuredProducts: Types.ObjectId[];
  brandSectionTitle: string;
  servicesSectionTitle: string;
  testimonialsSectionTitle: string;
  whatsappNumber: string;
}
