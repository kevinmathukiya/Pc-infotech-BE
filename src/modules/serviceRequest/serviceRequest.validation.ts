import { z } from 'zod';

export const createServiceRequestSchema = z.object({
  body: z.object({
    customerName: z.string().min(1, 'Customer name is required'),
    mobileNumber: z.string().min(10, 'Valid mobile number is required'),
    email: z.string().email('Invalid email address'),
    productName: z.string().min(1, 'Product name is required'),
    brand: z.string().min(1, 'Brand is required'),
    modelNumber: z.string().min(1, 'Model number is required'),
    serialNumber: z.string().min(1, 'Serial number is required'),
    problemDescription: z.string().min(10, 'Please describe the problem in at least 10 characters'),
    preferredVisitDate: z.string().min(1, 'Preferred visit date is required'),
    address: z.string().min(1, 'Address is required'),
  }),
});

export const updateServiceRequestSchema = z.object({
  params: z.object({ id: z.string().min(1, 'Request ID is required') }),
  body: z.object({
    status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']).optional(),
    engineerRemarks: z.string().optional(),
  }),
});
