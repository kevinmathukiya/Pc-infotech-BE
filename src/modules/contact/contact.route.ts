import { Router } from 'express';
import { ContactController } from './contact.controller';
import { validate } from '../../middleware/validate';
import { authenticateAdmin } from '../../middleware/auth';
import { createContactSchema } from './contact.validation';

const router = Router();

// Public – rate limited at app level
router.post('/', validate(createContactSchema), ContactController.submit);

// Admin protected
router.get('/', authenticateAdmin, ContactController.getAllContacts);
router.patch('/:id/read', authenticateAdmin, ContactController.markAsRead);
router.delete('/:id', authenticateAdmin, ContactController.deleteContact);

export default router;
