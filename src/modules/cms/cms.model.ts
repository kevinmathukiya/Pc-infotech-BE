import { Schema, model } from 'mongoose';
import { ICms } from './cms.interface';
import { config } from '../../config/index';

const cmsSchema = new Schema<ICms>(
  {
    heroSlider: [
      {
        title: { type: String, required: true },
        subtitle: { type: String },
        image: {
          url: { type: String, required: true },
          publicId: { type: String, required: true },
        },
        link: { type: String },
        order: { type: Number, default: 0 },
      },
    ],
    whyChooseUs: [
      {
        title: { type: String, required: true },
        description: { type: String, required: true },
        icon: { type: String },
      },
    ],
    featuredProducts: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
    brandSectionTitle: { type: String, default: 'Our Brand Partners' },
    servicesSectionTitle: { type: String, default: 'Services We Offer' },
    testimonialsSectionTitle: { type: String, default: 'What Our Clients Say' },
    whatsappNumber: { type: String, default: () => config.WHATSAPP_NUMBER },
  },
  { timestamps: true }
);

export const Cms = model<ICms>('Cms', cmsSchema);
