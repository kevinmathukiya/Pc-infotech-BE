import { Router } from 'express';
import { TestimonialController } from './testimonial.controller';
import { validate } from '../../middleware/validate';
import { authenticateAdmin } from '../../middleware/auth';
import { upload } from '../../middleware/upload';
import { createTestimonialSchema, updateTestimonialSchema } from './testimonial.validation';

const router = Router();

router.get('/', TestimonialController.getAllTestimonials);
router.post('/', authenticateAdmin, upload.fields([{ name: 'photo', maxCount: 1 }]), validate(createTestimonialSchema), TestimonialController.createTestimonial);
router.put('/:id', authenticateAdmin, upload.fields([{ name: 'photo', maxCount: 1 }]), validate(updateTestimonialSchema), TestimonialController.updateTestimonial);
router.delete('/:id', authenticateAdmin, TestimonialController.deleteTestimonial);

export default router;
