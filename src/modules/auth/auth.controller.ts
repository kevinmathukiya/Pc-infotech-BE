import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { Admin, RefreshToken } from './auth.model';
import { ApiResponse } from '../../utils/apiResponse';
import { AppError } from '../../utils/appError';
import { HttpStatus } from '../../constants/httpStatusCodes';
import { config } from '../../config/index';

const COOKIE_NAME = 'refreshToken';

const getRefreshTokenFromReq = (req: Request): string | undefined => {
  if (req.body.refreshToken) return String(req.body.refreshToken);
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) return undefined;
  const cookieStr = Array.isArray(cookieHeader) ? cookieHeader[0] : cookieHeader;
  const cookies = Object.fromEntries(
  cookieStr.split('; ').map((c: string) => {
      const parts = c.split('=');
      return [parts[0], parts.slice(1).join('=')];
    })
  );
  return cookies[COOKIE_NAME];
};

const setRefreshTokenCookie = (res: Response, token: string) => {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: config.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

export class AuthController {
  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;

      const admin = await Admin.findOne({ email: email.toLowerCase() }).select('+password');
      if (!admin || !(await admin.comparePassword(password))) {
        throw new AppError('Invalid email or password.', HttpStatus.UNAUTHORIZED);
      }

      const accessToken = AuthService.generateAccessToken(admin._id.toString());
      const refreshToken = await AuthService.generateRefreshToken(admin._id.toString());

      setRefreshTokenCookie(res, refreshToken);

      return ApiResponse.success(res, 'Login successful', {
        admin: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
        },
        accessToken,
      });
    } catch (error) {
      next(error);
    }
  }

  static async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const token = getRefreshTokenFromReq(req);

      if (!token) {
        throw new AppError('Refresh token is required.', HttpStatus.BAD_REQUEST);
      }

      const { accessToken, refreshToken: newRefreshToken } = await AuthService.rotateRefreshToken(token);

      setRefreshTokenCookie(res, newRefreshToken);

      return ApiResponse.success(res, 'Token refreshed successfully', {
        accessToken,
      });
    } catch (error) {
      next(error);
    }
  }

  static async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const token = getRefreshTokenFromReq(req);

      if (token) {
        await AuthService.logout(token);
      }

      res.clearCookie(COOKIE_NAME);
      return ApiResponse.success(res, 'Logout successful');
    } catch (error) {
      next(error);
    }
  }

  static async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;
      await AuthService.forgotPassword(email);

      return ApiResponse.success(res, 'Verification OTP sent to your registered email address.');
    } catch (error) {
      next(error);
    }
  }

  static async verifyOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, otp } = req.body;
      const resetToken = await AuthService.verifyOtp(email, otp);

      return ApiResponse.success(res, 'OTP verified successfully. You may now reset your password.', {
        resetToken,
      });
    } catch (error) {
      next(error);
    }
  }

  static async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { token, password } = req.body;

      await AuthService.resetPassword(token, password);

      return ApiResponse.success(res, 'Password reset successful. Please log in with your new password.');
    } catch (error) {
      next(error);
    }
  }

  static async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const adminId = (req as any).admin.id;
      const { currentPassword, newPassword } = req.body;

      const admin = await Admin.findById(adminId).select('+password');
      if (!admin || !(await admin.comparePassword(currentPassword))) {
        throw new AppError('Invalid current password.', HttpStatus.BAD_REQUEST);
      }

      admin.password = newPassword;
      admin.passwordChangedAt = new Date();
      await admin.save();

      // Revoke all refresh tokens for safety
      await RefreshToken.updateMany({ userId: admin._id }, { isRevoked: true });

      res.clearCookie(COOKIE_NAME);
      return ApiResponse.success(res, 'Password changed successfully. Please log in again.');
    } catch (error) {
      next(error);
    }
  }

  static async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      const adminId = (req as any).admin.id;
      const admin = await Admin.findById(adminId);
      if (!admin) {
        throw new AppError('Admin not found.', HttpStatus.NOT_FOUND);
      }
      return ApiResponse.success(res, 'Admin details retrieved', { admin });
    } catch (error) {
      next(error);
    }
  }

  static async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const adminId = (req as any).admin.id;
      const { name, email, age, mobileNumber } = req.body;

      if (email) {
        const existingAdmin = await Admin.findOne({ email: email.toLowerCase(), _id: { $ne: adminId } });
        if (existingAdmin) {
          throw new AppError('Email is already in use by another admin.', HttpStatus.BAD_REQUEST);
        }
      }

      const updatedFields: any = {};
      if (name !== undefined) updatedFields.name = name;
      if (email !== undefined) updatedFields.email = email.toLowerCase();
      if (age !== undefined) updatedFields.age = age;
      if (mobileNumber !== undefined) updatedFields.mobileNumber = mobileNumber;

      const updatedAdmin = await Admin.findByIdAndUpdate(
        adminId,
        { $set: updatedFields },
        { new: true, runValidators: true }
      );

      if (!updatedAdmin) {
        throw new AppError('Admin not found.', HttpStatus.NOT_FOUND);
      }

      return ApiResponse.success(res, 'Profile updated successfully', {
        admin: {
          id: updatedAdmin._id,
          name: updatedAdmin.name,
          email: updatedAdmin.email,
          age: updatedAdmin.age,
          mobileNumber: updatedAdmin.mobileNumber,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
