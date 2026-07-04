import { Document } from 'mongoose';

export interface IBlog extends Document {
  title: string;
  slug: string;
  featuredImage: { url: string; publicId: string };
  description: string;
  tags: string[];
  seo: { title?: string; description?: string; keywords?: string[] };
  publishedDate: Date;
  status: 'draft' | 'published';
  isDeleted: boolean;
}
