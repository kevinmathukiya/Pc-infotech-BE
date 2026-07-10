import { Router } from 'express';
import { SparePartController } from './sparePart.controller';
import { validate } from '../../middleware/validate';
import { authenticateAdmin } from '../../middleware/auth';
import { upload } from '../../middleware/upload';
import { createSparePartSchema, updateSparePartSchema } from './sparePart.validation';

const router = Router();

// Public routes
router.get('/search', SparePartController.searchSpareParts);
router.get('/', SparePartController.getAllSpareParts);
router.get('/:id', SparePartController.getSparePartByIdOrSlug);

// Admin protected routes
router.post(
  '/',
  authenticateAdmin,
  upload.fields([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'images', maxCount: 10 },
  ]),
  validate(createSparePartSchema),
  SparePartController.createSparePart
);

// Support both PUT and PATCH for updates to maintain compatibility
router.put(
  '/:id',
  authenticateAdmin,
  upload.fields([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'images', maxCount: 10 },
  ]),
  validate(updateSparePartSchema),
  SparePartController.updateSparePart
);

router.patch(
  '/:id',
  authenticateAdmin,
  upload.fields([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'images', maxCount: 10 },
  ]),
  validate(updateSparePartSchema),
  SparePartController.updateSparePart
);

router.delete('/:id', authenticateAdmin, SparePartController.deleteSparePart);

export default router;
