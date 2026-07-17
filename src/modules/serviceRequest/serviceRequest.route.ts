import { Router } from 'express';
import { ServiceRequestController } from './serviceRequest.controller';
import { validate } from '../../middleware/validate';
import { authenticateAdmin } from '../../middleware/auth';
import { createServiceRequestSchema, updateServiceRequestSchema } from './serviceRequest.validation';
import { formLimiter } from '../../middleware/rateLimiter';

const router = Router();

// Public – client submits a request
router.post('/', formLimiter, validate(createServiceRequestSchema), ServiceRequestController.createRequest);

// Admin protected
router.get('/', authenticateAdmin, ServiceRequestController.getAllRequests);
router.patch('/:id', authenticateAdmin, validate(updateServiceRequestSchema), ServiceRequestController.updateRequest);
router.delete('/:id', authenticateAdmin, ServiceRequestController.deleteRequest);

export default router;
