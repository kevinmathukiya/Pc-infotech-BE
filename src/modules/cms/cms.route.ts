import { Router } from 'express';
import { CmsController } from './cms.controller';
import { authenticateAdmin } from '../../middleware/auth';
import { upload } from '../../middleware/upload';
import { validate } from '../../middleware/validate';
import { updateCmsSchema, addHeroSlideSchema } from './cms.validation';

const router = Router();

router.get('/', CmsController.getCms);
router.put('/', authenticateAdmin, validate(updateCmsSchema), CmsController.updateCms);
router.post(
  '/hero-slider',
  authenticateAdmin,
  upload.fields([{ name: 'image', maxCount: 1 }]),
  validate(addHeroSlideSchema),
  CmsController.addHeroSlide
);
router.delete('/hero-slider/:slideId', authenticateAdmin, CmsController.removeHeroSlide);

export default router;
