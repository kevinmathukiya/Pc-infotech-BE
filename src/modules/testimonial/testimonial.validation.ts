import { z } from 'zod';

export const createTestimonialSchema = z.object({
  body: z.object({
    customerName: z.string().min(1, 'Customer name is required'),
    company: z.string().min(1, 'Company is required'),
    rating: z.preprocess((v) => Number(v), z.number().min(1).max(5, 'Rating must be between 1 and 5')),
    review: z.string().min(10, 'Review must be at least 10 characters'),
    status: z.enum(['active', 'inactive']).default('active'),
  }),
});

export const updateTestimonialSchema = z.object({
  params: z.object({ id: z.string().min(1, 'Testimonial ID is required') }),
  body: z.object({
    customerName: z.string().optional(),
    company: z.string().optional(),
    rating: z.preprocess((v) => (v === undefined ? undefined : Number(v)), z.number().min(1).max(5).optional()),
    review: z.string().optional(),
    status: z.enum(['active', 'inactive']).optional(),
  }),
});
