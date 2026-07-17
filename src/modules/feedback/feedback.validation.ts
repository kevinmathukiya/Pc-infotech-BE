import { z } from 'zod';

export const createFeedbackSchema = z.object({
  body: z.object({
    customerName: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email address').optional().or(z.literal('')),
    rating: z.preprocess((v) => Number(v), z.number().min(1).max(5, 'Rating must be between 1 and 5')),
    comment: z.string().min(3, 'Comment must be at least 3 characters'),
  }),
});

export const updateFeedbackStatusSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Feedback ID is required'),
  }),
  body: z.object({
    status: z.enum(['pending', 'approved', 'rejected']),
  }),
});
