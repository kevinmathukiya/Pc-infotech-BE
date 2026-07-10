import { Router } from 'express';
import { UserController } from './user.controller';
import { validate } from '../../middleware/validate';
import { signupUserSchema, loginUserSchema } from './user.validation';
import { authenticateUser } from '../../middleware/auth';

const router = Router();

router.post('/signup', validate(signupUserSchema), UserController.signup);
router.post('/login', validate(loginUserSchema), UserController.login);
router.get('/me', authenticateUser, UserController.getMe);

export default router;
