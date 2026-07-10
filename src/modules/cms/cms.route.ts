import { Router } from 'express';
import { CmsController } from './cms.controller';
import { authenticateAdmin } from '../../middleware/auth';
import { upload } from '../../middleware/upload';

const router = Router();

router.get('/', CmsController.getCms);
router.put('/', authenticateAdmin, CmsController.updateCms);
router.post('/hero-slider', authenticateAdmin, upload.fields([{ name: 'image', maxCount: 1 }]), CmsController.addHeroSlide);
router.delete('/hero-slider/:slideId', authenticateAdmin, CmsController.removeHeroSlide);

export default router;
