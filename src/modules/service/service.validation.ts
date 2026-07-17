import { z } from 'zod';

const stringToJSON = (schema: z.ZodTypeAny) =>
  z.preprocess((val) => {
    if (typeof val === 'string') {
      try { return JSON.parse(val); } catch { return val; }
    }
    return val;
  }, schema);

export const createServiceSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Service name is required'),
    brand: z.enum(['HP', 'Canon']).optional(),
    serviceCategory: z.string().min(1, 'Service category is required'),
    shortDescription: z.string().min(1, 'Short description is required'),
    fullDescription: z.string().min(1, 'Full description is required'),
    benefits: stringToJSON(z.array(z.string())).default([]),
    features: stringToJSON(z.array(z.string())).default([]),
    faq: stringToJSON(
      z.array(z.object({ question: z.string(), answer: z.string() }))
    ).default([]),
    status: z.enum(['active', 'inactive']).default('active'),
    metaTitle: z.string().optional(),
    metaDescription: z.string().optional(),
  }),
});

export const updateServiceSchema = z.object({
  params: z.object({ id: z.string().min(1, 'Service ID is required') }),
  body: z.object({
    name: z.string().optional(),
    brand: z.enum(['HP', 'Canon']).optional(),
    serviceCategory: z.string().optional(),
    shortDescription: z.string().optional(),
    fullDescription: z.string().optional(),
    benefits: stringToJSON(z.array(z.string())).optional(),
    features: stringToJSON(z.array(z.string())).optional(),
    faq: stringToJSON(
      z.array(z.object({ question: z.string(), answer: z.string() }))
    ).optional(),
    status: z.enum(['active', 'inactive']).optional(),
    metaTitle: z.string().optional(),
    metaDescription: z.string().optional(),
  }),
});
