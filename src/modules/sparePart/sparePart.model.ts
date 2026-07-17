import { Schema, model } from 'mongoose';
import { ISparePart } from './sparePart.interface';

const sparePartSchema = new Schema<ISparePart>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    sku: { type: String, required: true, unique: true, index: true },
    brand: { type: String, enum: ['HP', 'Canon'], required: true, index: true },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    description: { type: String },
    shortDescription: { type: String, required: true },
    fullDescription: { type: String, required: true },
    specifications: [
      {
        key: { type: String, required: true },
        value: { type: String, required: true },
      },
    ],
    compatibleModels: { type: String },
    modelNumber: { type: String }, // For admin dashboard compatibility
    price: { type: Number, required: true, min: 0 },
    discountPrice: { type: Number, min: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
    stockQuantity: { type: Number, required: true, min: 0, default: 0 }, // For admin dashboard compatibility
    warranty: { type: String, required: true },
    images: [
      {
        url: { type: String, required: true },
        publicId: { type: String, required: true },
      },
    ],
    featured: { type: Boolean, default: false, index: true },
    status: { type: String, enum: ['active', 'inactive'], default: 'active', index: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'Admin', required: true },
    isDeleted: { type: Boolean, default: false, index: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

sparePartSchema.virtual('thumbnail').get(function (this: any) {
  return this.images && this.images.length > 0 ? this.images[0] : undefined;
});

// Keep stock and stockQuantity in sync
sparePartSchema.pre('save', function () {
  const doc = this as any;
  if (doc.isModified('stock') && !doc.isModified('stockQuantity')) {
    doc.stockQuantity = doc.stock;
  } else if (doc.isModified('stockQuantity') && !doc.isModified('stock')) {
    doc.stock = doc.stockQuantity;
  }
});

sparePartSchema.index({
  name: 'text',
  sku: 'text',
  compatibleModels: 'text',
  modelNumber: 'text',
});

export const SparePart = model<ISparePart>('SparePart', sparePartSchema);
