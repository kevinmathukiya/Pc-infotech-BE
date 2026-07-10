import { Router } from 'express';
import { ServiceController } from './service.controller';
import { validate } from '../../middleware/validate';
import { authenticateAdmin } from '../../middleware/auth';
import { upload } from '../../middleware/upload';
import { createServiceSchema, updateServiceSchema } from './service.validation';

const router = Router();

router.get('/', ServiceController.getAllServices);
router.get('/:slug', ServiceController.getServiceBySlug);

router.post(
  '/',
  authenticateAdmin,
  upload.fields([{ name: 'image', maxCount: 1 }, { name: 'gallery', maxCount: 10 }]),
  validate(createServiceSchema),
  ServiceController.createService
);
router.put(
  '/:id',
  authenticateAdmin,
  upload.fields([{ name: 'image', maxCount: 1 }, { name: 'gallery', maxCount: 10 }]),
  validate(updateServiceSchema),
  ServiceController.updateService
);
router.delete('/:id', authenticateAdmin, ServiceController.deleteService);

export default router;
