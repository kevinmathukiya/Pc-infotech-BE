import { z } from 'zod';

export const createJobApplicationSchema = z.object({
  body: z.object({
    career: z.string().min(1, 'Career reference ID is required'),
    name: z.string().min(1, 'Candidate name is required'),
    email: z.string().email('Invalid email address'),
    phone: z.string().min(1, 'Phone number is required'),
    coverLetter: z.string().optional(),
  }),
});

export const updateJobApplicationStatusSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Application ID is required'),
  }),
  body: z.object({
    status: z.enum(['pending', 'reviewed', 'accepted', 'rejected']),
  }),
});
