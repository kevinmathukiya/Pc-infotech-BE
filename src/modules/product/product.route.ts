import { Router } from 'express';
import { ProductController } from './product.controller';
import { validate } from '../../middleware/validate';
import { authenticateAdmin } from '../../middleware/auth';
import { upload } from '../../middleware/upload';
import { createProductSchema, updateProductSchema } from './product.validation';

const router = Router();

// Public routes
router.get('/', ProductController.getAllProducts);
router.get('/:productId/spare-parts', ProductController.getProductSpareParts);
router.get('/:slug', ProductController.getProductBySlug);

// Admin protected routes
router.post(
  '/',
  authenticateAdmin,
  upload.fields([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'images', maxCount: 10 },
    { name: 'brochure', maxCount: 1 },
  ]),
  validate(createProductSchema),
  ProductController.createProduct
);

router.put(
  '/:id',
  authenticateAdmin,
  upload.fields([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'images', maxCount: 10 },
    { name: 'brochure', maxCount: 1 },
  ]),
  validate(updateProductSchema),
  ProductController.updateProduct
);

router.delete('/:id', authenticateAdmin, ProductController.deleteProduct);

export default router;
