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

export const createProductSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Product name is required'),
    brand: z.string().min(1, 'Brand ID is required'),
    category: z.string().min(1, 'Category ID is required'),
    modelNumber: z.string().min(1, 'Model number is required'),
    sku: z.string().min(1, 'SKU is required'),
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
    features: stringToJSON(z.array(z.string())).default([]),
    warranty: z.string().min(1, 'Warranty is required'),
    price: z.preprocess((val) => Number(val), z.number().min(0, 'Price must be positive')),
    discountPrice: z.preprocess(
      (val) => (val === undefined || val === '' || val === null ? undefined : Number(val)),
      z.number().min(0).optional()
    ),
    stockQuantity: z.preprocess((val) => Number(val), z.number().min(0).default(0)),
    status: z.enum(['active', 'inactive']).default('active'),
    isFeatured: z.preprocess((val) => val === 'true' || val === true, z.boolean().default(false)),
    isNewArrival: z.preprocess((val) => val === 'true' || val === true, z.boolean().default(false)),
    isBestSeller: z.preprocess((val) => val === 'true' || val === true, z.boolean().default(false)),
    productType: z.enum(['product', 'spare_part']).default('product'),
    metaTitle: z.string().optional(),
    metaDescription: z.string().optional(),
  }),
});

export const updateProductSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Product ID is required'),
  }),
  body: z.object({
    name: z.string().optional(),
    brand: z.string().optional(),
    category: z.string().optional(),
    modelNumber: z.string().optional(),
    sku: z.string().optional(),
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
    features: stringToJSON(z.array(z.string())).optional(),
    warranty: z.string().optional(),
    price: z.preprocess((val) => (val === undefined ? undefined : Number(val)), z.number().min(0).optional()),
    discountPrice: z.preprocess(
      (val) => (val === undefined || val === '' || val === null ? undefined : Number(val)),
      z.number().min(0).optional()
    ),
    stockQuantity: z.preprocess((val) => (val === undefined ? undefined : Number(val)), z.number().min(0).optional()),
    status: z.enum(['active', 'inactive']).optional(),
    isFeatured: z.preprocess(
      (val) => (val === undefined ? undefined : val === 'true' || val === true),
      z.boolean().optional()
    ),
    isNewArrival: z.preprocess(
      (val) => (val === undefined ? undefined : val === 'true' || val === true),
      z.boolean().optional()
    ),
    isBestSeller: z.preprocess(
      (val) => (val === undefined ? undefined : val === 'true' || val === true),
      z.boolean().optional()
    ),
    productType: z.enum(['product', 'spare_part']).optional(),
    metaTitle: z.string().optional(),
    metaDescription: z.string().optional(),
  }),
});
