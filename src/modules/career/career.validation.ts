import { z } from 'zod';

const stringToJSON = (schema: z.ZodTypeAny) =>
  z.preprocess((val) => {
    if (typeof val === 'string') {
      try {
        return JSON.parse(val);
      } catch (e) {
        return [val];
      }
    }
    return val;
  }, schema);

export const createCareerSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required'),
    department: z.string().min(1, 'Department is required'),
    location: z.string().min(1, 'Location is required'),
    type: z.enum(['Full-time', 'Part-time', 'Contract', 'Internship']),
    experienceLevel: z.string().min(1, 'Experience level is required'),
    salaryRange: z.string().optional(),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    requirements: stringToJSON(z.array(z.string()).min(1, 'At least one requirement is required')),
    benefits: stringToJSON(z.array(z.string())).optional(),
    status: z.enum(['active', 'inactive']).default('active'),
  }),
});

export const updateCareerSchema = z.object({
  body: z.object({
    title: z.string().optional(),
    department: z.string().optional(),
    location: z.string().optional(),
    type: z.enum(['Full-time', 'Part-time', 'Contract', 'Internship']).optional(),
    experienceLevel: z.string().optional(),
    salaryRange: z.string().optional(),
    description: z.string().optional(),
    requirements: stringToJSON(z.array(z.string())).optional(),
    benefits: stringToJSON(z.array(z.string())).optional(),
    status: z.enum(['active', 'inactive']).optional(),
  }),
});

// New schema for status‑only updates
export const statusUpdateSchema = z.object({
  body: z.object({
    status: z.enum(['active','inactive']),
  }),
});
