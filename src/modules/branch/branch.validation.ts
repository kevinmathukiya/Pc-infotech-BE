import { z } from 'zod';

export const createBranchSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Branch name is required'),
    branchType: z.string().min(1, 'Branch type is required'), // e.g. "head_office" or "branch_partner"
    address: z.string().min(1, 'Address is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    pincode: z.string().min(6, 'Valid pincode is required').max(6),
    region: z.string().min(1, 'Region is required'), // e.g. "GUJARAT REGION"
    phoneNumber: z.string().min(1, 'Phone number is required'),
    email: z.string().email('Invalid email address'),
    googleMapUrl: z.string().min(1, 'Valid Google Map URL is required'),
    workingHours: z.string().min(1, 'Working hours are required'),
    supportScope: z.string().min(1, 'Support scope is required'),
    status: z.enum(['active', 'inactive']).default('active'),
  }),
});

export const updateBranchSchema = z.object({
  params: z.object({ id: z.string().min(1, 'Branch ID is required') }),
  body: z.object({
    name: z.string().optional(),
    branchType: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    pincode: z.string().optional(),
    region: z.string().optional(),
    phoneNumber: z.string().optional(),
    email: z.string().email().optional(),
    googleMapUrl: z.string().min(1).optional(),
    workingHours: z.string().optional(),
    supportScope: z.string().optional(),
    status: z.enum(['active', 'inactive']).optional(),
  }),
});
