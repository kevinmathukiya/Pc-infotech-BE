import { Request, Response, NextFunction } from 'express';
import { UserService } from './user.service';
import { ApiResponse } from '../../utils/apiResponse';
import { AppError } from '../../utils/appError';
import { HttpStatus } from '../../constants/httpStatusCodes';

export class UserController {
  static async signup(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, email, mobileNumber, password } = req.body;
      const data = await UserService.signup({ name, email, mobileNumber, password });
      return ApiResponse.success(res, 'User registered successfully', data, HttpStatus.CREATED);
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const data = await UserService.login({ email, password });
      return ApiResponse.success(res, 'User login successful', data);
    } catch (error) {
      next(error);
    }
  }

  static async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        throw new AppError('Unauthorized access', HttpStatus.UNAUTHORIZED);
      }
      const user = await UserService.getUserById(userId);
      return ApiResponse.success(res, 'User details retrieved', { user });
    } catch (error) {
      next(error);
    }
  }
}
