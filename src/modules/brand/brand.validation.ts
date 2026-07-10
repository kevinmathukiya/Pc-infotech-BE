import { z } from 'zod';

export const createBrandSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Brand name is required'),
    description: z.string().min(1, 'Description is required'),
    status: z.enum(['active', 'inactive']).default('active'),
  }),
});

export const updateBrandSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Brand ID is required'),
  }),
  body: z.object({
    name: z.string().optional(),
    description: z.string().optional(),
    status: z.enum(['active', 'inactive']).optional(),
  }),
});
