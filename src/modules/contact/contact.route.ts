import { Router } from 'express';
import { ContactController } from './contact.controller';
import { validate } from '../../middleware/validate';
import { authenticateAdmin } from '../../middleware/auth';
import { createContactSchema } from './contact.validation';
import { formLimiter } from '../../middleware/rateLimiter';

const router = Router();

// Public – rate limited
router.post('/', formLimiter, validate(createContactSchema), ContactController.submit);

// Admin protected
router.get('/', authenticateAdmin, ContactController.getAllContacts);
router.patch('/:id/read', authenticateAdmin, ContactController.markAsRead);
router.delete('/:id', authenticateAdmin, ContactController.deleteContact);

export default router;
