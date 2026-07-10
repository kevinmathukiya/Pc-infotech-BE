import { Router } from 'express';
import { BrandController } from './brand.controller';
import { validate } from '../../middleware/validate';
import { authenticateAdmin } from '../../middleware/auth';
import { upload } from '../../middleware/upload';
import { createBrandSchema, updateBrandSchema } from './brand.validation';

const router = Router();

router.get('/', BrandController.getAllBrands);
router.get('/:slug', BrandController.getBrandBySlug);

// Admin protected routes
router.post(
  '/',
  authenticateAdmin,
  upload.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'banner', maxCount: 1 },
  ]),
  validate(createBrandSchema),
  BrandController.createBrand
);

router.put(
  '/:id',
  authenticateAdmin,
  upload.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'banner', maxCount: 1 },
  ]),
  validate(updateBrandSchema),
  BrandController.updateBrand
);

router.delete('/:id', authenticateAdmin, BrandController.deleteBrand);

export default router;
