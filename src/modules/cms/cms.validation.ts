


import { z } from 'zod';

export const updateCmsSchema = z.object({
  body: z.object({
    whyChooseUs: z
      .array(
        z.object({
          title: z.string().min(1, 'Title is required'),
          description: z.string().min(1, 'Description is required'),
          icon: z.string().optional(),
        })
      )
      .optional(),
    featuredProducts: z.array(z.string().min(1, 'Product ID must be a string')).optional(),
    brandSectionTitle: z.string().optional(),
    servicesSectionTitle: z.string().optional(),
    testimonialsSectionTitle: z.string().optional(),
    whatsappNumber: z.string().optional(),
  }),
});

export const addHeroSlideSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Hero slide title is required'),
    subtitle: z.string().optional(),
    link: z.string().optional(),
    order: z.preprocess(
      (val) => (val === undefined || val === '' || val === null ? undefined : Number(val)),
      z.number().optional()
    ),
  }),
});
