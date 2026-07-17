import { Router } from 'express';
import { JobApplicationController } from './jobApplication.controller';
import { authenticateAdmin } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { upload } from '../../middleware/upload';
import { JobApplicationService } from './jobApplication.service';
import { createJobApplicationSchema, updateJobApplicationStatusSchema } from './jobApplication.validation';

const router = Router();

// Public route for applying (contains PDF resume upload)
router.post(
  '/',
  upload.single('resume'),
  validate(createJobApplicationSchema),
  JobApplicationController.createApplication
);

// Admin protected routes
router.get('/', authenticateAdmin, JobApplicationController.getAllApplications);
router.get('/pending-count', authenticateAdmin, async (req, res, next) => {
  try {
    const result = await JobApplicationService.getPendingCount();
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
});
router.get('/:id', authenticateAdmin, JobApplicationController.getApplicationById);
router.patch('/:id/status', authenticateAdmin, JobApplicationController.updateApplicationStatus);
router.delete('/:id', authenticateAdmin, JobApplicationController.deleteApplication);

export const jobApplicationRoutes = router;
export default router;
