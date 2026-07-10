import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/index';
import { Admin } from '../modules/auth/auth.model';
import { User } from '../modules/user/user.model';
import { AppError } from '../utils/appError';
import { HttpStatus } from '../constants/httpStatusCodes';

export interface AuthenticatedRequest extends Request {
  admin?: {
    id: string;
    email: string;
  };
  user?: {
    id: string;
    email: string;
  };
}

export const authenticateAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let token: string | undefined;

    if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      throw new AppError('Authentication required. Please log in.', HttpStatus.UNAUTHORIZED);
    }

    // Verify token
    let decoded: any;
    try {
      decoded = jwt.verify(token, config.JWT_ACCESS_SECRET);
    } catch (err) {
      throw new AppError('Invalid or expired access token. Please refresh token.', HttpStatus.UNAUTHORIZED);
    }

    // Check if admin still exists
    const admin = await Admin.findById(decoded.sub);
    if (!admin) {
      throw new AppError('The user belonging to this token no longer exists.', HttpStatus.UNAUTHORIZED);
    }

    // Check if admin changed password after the token was issued
    if (admin.passwordChangedAt) {
      const changedTimestamp = Math.floor(admin.passwordChangedAt.getTime() / 1000);
      if (decoded.iat && decoded.iat < changedTimestamp) {
        throw new AppError('Password was changed recently. Please log in again.', HttpStatus.UNAUTHORIZED);
      }
    }

    (req as AuthenticatedRequest).admin = {
      id: admin._id.toString(),
      email: admin.email,
    };

    next();
  } catch (error) {
    next(error);
  }
};

export const authenticateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let token: string | undefined;

    if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      throw new AppError('Authentication required. Please log in.', HttpStatus.UNAUTHORIZED);
    }

    // Verify token
    let decoded: any;
    try {
      decoded = jwt.verify(token, config.JWT_ACCESS_SECRET);
    } catch (err) {
      throw new AppError('Invalid or expired access token.', HttpStatus.UNAUTHORIZED);
    }

    // Check if customer user still exists and is active
    const user = await User.findById(decoded.sub);
    if (!user || user.status !== 'active') {
      throw new AppError('The user belonging to this token no longer exists or is deactivated.', HttpStatus.UNAUTHORIZED);
    }

    (req as AuthenticatedRequest).user = {
      id: user._id.toString(),
      email: user.email,
    };

    next();
  } catch (error) {
    next(error);
  }
};
