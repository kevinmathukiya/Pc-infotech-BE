import { z } from 'zod';

export const createCategorySchema = z.object({
  body: z.object({
    brand: z.enum(['HP', 'Canon']).optional(),
    name: z.string().min(1, 'Category name is required'),
    description: z.string().optional(),
    status: z.enum(['active', 'inactive']).default('active'),
  }),
});

export const updateCategorySchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Category ID is required'),
  }),
  body: z.object({
    brand: z.enum(['HP', 'Canon']).optional(),
    name: z.string().optional(),
    description: z.string().optional(),
    status: z.enum(['active', 'inactive']).optional(),
  }),
});
