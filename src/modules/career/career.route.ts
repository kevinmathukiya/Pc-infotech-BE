import { Router } from 'express';
import { CareerController } from './career.controller';
import { authenticateAdmin } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { upload } from '../../middleware/upload';
import { createCareerSchema, updateCareerSchema } from './career.validation';

const router = Router();

// Public routes
router.get('/', CareerController.getAllCareers);
router.get('/:id', CareerController.getCareerById);

// Admin protected routes
router.get('/admin/all', authenticateAdmin, CareerController.getAllCareers);
router.post('/', authenticateAdmin, upload.single('image'), validate(createCareerSchema), CareerController.createCareer);
router.put('/:id', authenticateAdmin, upload.single('image'), validate(updateCareerSchema), CareerController.updateCareer);
router.patch('/:id/status', authenticateAdmin, CareerController.toggleCareerStatus);
router.delete('/:id', authenticateAdmin, CareerController.deleteCareer);

export const careerRoutes = router;
export default router;
