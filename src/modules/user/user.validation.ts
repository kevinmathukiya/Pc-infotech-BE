import { z } from 'zod';

export const signupUserSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required').trim(),
    email: z.string().email('Invalid email address').toLowerCase().trim(),
    mobileNumber: z.string().min(10, 'Valid 10-digit mobile number is required').max(15).trim(),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
  }),
});

export const loginUserSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address').toLowerCase().trim(),
    password: z.string().min(1, 'Password is required'),
  }),
});
