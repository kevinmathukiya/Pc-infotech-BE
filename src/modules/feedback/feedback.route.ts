import { Router } from 'express';
import { FeedbackController } from './feedback.controller';
import { authenticateAdmin } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { createFeedbackSchema, updateFeedbackStatusSchema } from './feedback.validation';

const router = Router();

// Public routes
router.post('/', validate(createFeedbackSchema), FeedbackController.createFeedback);
router.get('/', FeedbackController.getAllFeedbacks);

// Admin-only routes
router.get('/admin', authenticateAdmin, FeedbackController.getFeedbacksForAdmin);
router.patch('/:id/status', authenticateAdmin, validate(updateFeedbackStatusSchema), FeedbackController.updateFeedbackStatus);
router.delete('/:id', authenticateAdmin, FeedbackController.deleteFeedback);

export const feedbackRoutes = router;
