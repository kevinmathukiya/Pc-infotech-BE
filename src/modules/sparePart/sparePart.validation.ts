import { z } from 'zod';

const stringToJSON = (schema: z.ZodTypeAny) =>
  z.preprocess((val) => {
    if (typeof val === 'string') {
      try {
        return JSON.parse(val);
      } catch (e) {
        return val;
      }
    }
    return val;
  }, schema);

export const createSparePartSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Spare part name is required'),
    sku: z.string().min(1, 'SKU is required'),
    brand: z.string().min(1, 'Brand ID is required'),
    category: z.string().min(1, 'Category ID is required'),
    product: z.string().min(1, 'Product ID is required'),
    description: z.string().optional(),
    shortDescription: z.string().min(1, 'Short description is required'),
    fullDescription: z.string().min(1, 'Full description is required'),
    specifications: stringToJSON(
      z.array(
        z.object({
          key: z.string().min(1, 'Specification key is required'),
          value: z.string().min(1, 'Specification value is required'),
        })
      )
    ).default([]),
    compatibleModels: z.string().optional(),
    modelNumber: z.string().optional(), // For admin dashboard compatibility
    price: z.preprocess((val) => Number(val), z.number().min(0, 'Price must be positive')),
    discountPrice: z.preprocess(
      (val) => (val === undefined || val === '' || val === null ? undefined : Number(val)),
      z.number().min(0).optional()
    ),
    stock: z.preprocess(
      (val) => (val === undefined || val === '' || val === null ? undefined : Number(val)),
      z.number().min(0).optional()
    ),
    stockQuantity: z.preprocess(
      (val) => (val === undefined || val === '' || val === null ? undefined : Number(val)),
      z.number().min(0).optional()
    ),
    warranty: z.string().min(1, 'Warranty is required'),
    featured: z.preprocess(
      (val) => val === 'true' || val === true,
      z.boolean().default(false)
    ),
    status: z.enum(['active', 'inactive']).default('active'),
  }),
});

export const updateSparePartSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Spare Part ID or slug is required'),
  }),
  body: z.object({
    name: z.string().optional(),
    sku: z.string().optional(),
    brand: z.string().optional(),
    category: z.string().optional(),
    product: z.string().optional(),
    description: z.string().optional(),
    shortDescription: z.string().optional(),
    fullDescription: z.string().optional(),
    specifications: stringToJSON(
      z.array(
        z.object({
          key: z.string(),
          value: z.string(),
        })
      )
    ).optional(),
    compatibleModels: z.string().optional(),
    modelNumber: z.string().optional(), // For admin dashboard compatibility
    price: z.preprocess(
      (val) => (val === undefined ? undefined : Number(val)),
      z.number().min(0).optional()
    ),
    discountPrice: z.preprocess(
      (val) => (val === undefined || val === '' || val === null ? undefined : Number(val)),
      z.number().min(0).optional()
    ),
    stock: z.preprocess(
      (val) => (val === undefined || val === '' || val === null ? undefined : Number(val)),
      z.number().min(0).optional()
    ),
    stockQuantity: z.preprocess(
      (val) => (val === undefined || val === '' || val === null ? undefined : Number(val)),
      z.number().min(0).optional()
    ),
    warranty: z.string().optional(),
    featured: z.preprocess(
      (val) => (val === undefined ? undefined : val === 'true' || val === true),
      z.boolean().optional()
    ),
    status: z.enum(['active', 'inactive']).optional(),
  }),
});
