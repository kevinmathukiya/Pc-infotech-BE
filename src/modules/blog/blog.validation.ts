import { z } from 'zod';

const stringToJSON = (schema: z.ZodTypeAny) =>
  z.preprocess((val) => {
    if (typeof val === 'string') {
      try { return JSON.parse(val); } catch { return val; }
    }
    return val;
  }, schema);

export const createBlogSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().min(1, 'Description is required'),
    tags: stringToJSON(z.array(z.string())).default([]),
    seo: stringToJSON(
      z.object({
        title: z.string().optional(),
        description: z.string().optional(),
        keywords: z.array(z.string()).optional(),
      })
    ).default({}),
    publishedDate: z.string().optional(),
    status: z.enum(['draft', 'published']).default('draft'),
  }),
});

export const updateBlogSchema = z.object({
  params: z.object({ id: z.string().min(1, 'Blog ID is required') }),
  body: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    tags: stringToJSON(z.array(z.string())).optional(),
    seo: stringToJSON(
      z.object({
        title: z.string().optional(),
        description: z.string().optional(),
        keywords: z.array(z.string()).optional(),
      })
    ).optional(),
    publishedDate: z.string().optional(),
    status: z.enum(['draft', 'published']).optional(),
  }),
});
