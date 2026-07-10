import { Schema, model } from 'mongoose';
import { IBlog } from './blog.interface';

const blogSchema = new Schema<IBlog>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    featuredImage: {
      url: { type: String, required: true },
      publicId: { type: String, required: true },
    },
    description: { type: String, required: true },
    tags: [{ type: String, index: true }],
    seo: {
      title: { type: String },
      description: { type: String },
      keywords: [{ type: String }],
    },
    publishedDate: { type: Date, default: Date.now },
    status: { type: String, enum: ['draft', 'published'], default: 'draft', index: true },
    isDeleted: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

blogSchema.index({ title: 'text', tags: 'text' });

export const Blog = model<IBlog>('Blog', blogSchema);
