import { Schema, model } from 'mongoose';
import { IProduct } from './product.interface';

const productSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    brand: { type: Schema.Types.ObjectId, ref: 'Brand', required: true, index: true },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
    modelNumber: { type: String, required: true, trim: true },
    sku: { type: String, required: true, unique: true, index: true },
    shortDescription: { type: String, required: true },
    fullDescription: { type: String, required: true },
    specifications: [
      {
        key: { type: String, required: true },
        value: { type: String, required: true },
      },
    ],
    features: [{ type: String }],
    warranty: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    discountPrice: { type: Number, min: 0 },
    stockQuantity: { type: Number, required: true, min: 0, default: 0 },
    images: [
      {
        url: { type: String, required: true },
        publicId: { type: String, required: true },
      },
    ],
    thumbnail: {
      url: { type: String, required: true },
      publicId: { type: String, required: true },
    },
    brochure: {
      url: { type: String },
      publicId: { type: String },
    },
    status: { type: String, enum: ['active', 'inactive'], default: 'active', index: true },
    isFeatured: { type: Boolean, default: false, index: true },
    isNewArrival: { type: Boolean, default: false, index: true },
    isBestSeller: { type: Boolean, default: false, index: true },
    productType: { type: String, enum: ['product', 'spare_part'], default: 'product', required: true, index: true },
    metaTitle: { type: String },
    metaDescription: { type: String },
    isDeleted: { type: Boolean, default: false, index: true },
  },
  {
    timestamps: true,
  }
);

productSchema.index({
  name: 'text',
  modelNumber: 'text',
  sku: 'text',
  shortDescription: 'text',
});

export const Product = model<IProduct>('Product', productSchema);
