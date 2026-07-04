import { Router } from 'express';
import { AuthController } from './auth.controller';
import { validate } from '../../middleware/validate';
import { authenticateAdmin } from '../../middleware/auth';
import {
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  updateProfileSchema,
} from './auth.validation';

const router = Router();

router.post('/login', validate(loginSchema), AuthController.login);
router.post('/refresh-token', AuthController.refreshToken);
router.post('/logout', AuthController.logout);
router.post('/forgot-password', validate(forgotPasswordSchema), AuthController.forgotPassword);
router.post('/reset-password/:token', validate(resetPasswordSchema), AuthController.resetPassword);

// Protected routes
router.patch('/change-password', authenticateAdmin, validate(changePasswordSchema), AuthController.changePassword);
router.put('/update-profile', authenticateAdmin, validate(updateProfileSchema), AuthController.updateProfile);
router.get('/me', authenticateAdmin, AuthController.getMe);

export default router;
