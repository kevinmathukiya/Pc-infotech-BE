import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../../config/index';
import { FeedbackService } from './feedback.service';
import { ApiResponse } from '../../utils/apiResponse';
import { HttpStatus } from '../../constants/httpStatusCodes';
import { getParam } from '../../utils/getParam';

export class FeedbackController {
  static async getAllFeedbacks(req: Request, res: Response, next: NextFunction) {
    try {
      const { feedbacks, total } = await FeedbackService.getAllFeedbacks(req.query);
      return ApiResponse.success(res, 'Approved feedbacks retrieved successfully', { feedbacks, total });
    } catch (error) {
      next(error);
    }
  }

  static async getFeedbacksForAdmin(req: Request, res: Response, next: NextFunction) {
    try {
      const { feedbacks, total } = await FeedbackService.getFeedbacksForAdmin(req.query);
      return ApiResponse.success(res, 'All feedbacks retrieved successfully for admin', { feedbacks, total });
    } catch (error) {
      next(error);
    }
  }

  static async createFeedback(req: Request, res: Response, next: NextFunction) {
    try {
      let userId: string | undefined;

      // Extract optional userId if authorization header is present and valid
      if (req.headers.authorization?.startsWith('Bearer ')) {
        const token = req.headers.authorization.split(' ')[1];
        try {
          const decoded: any = jwt.verify(token, config.JWT_ACCESS_SECRET);
          userId = decoded.sub;
        } catch (err) {
          // Continue as guest if token is invalid or expired
        }
      }

      const feedback = await FeedbackService.createFeedback(req.body, userId);
      return ApiResponse.success(res, 'Feedback submitted successfully. It is pending admin approval.', { feedback }, HttpStatus.CREATED);
    } catch (error) {
      next(error);
    }
  }

  static async updateFeedbackStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const id = getParam(req.params.id);
      const { status } = req.body;
      const feedback = await FeedbackService.updateFeedbackStatus(id, status);
      return ApiResponse.success(res, `Feedback status updated to ${status}`, { feedback });
    } catch (error) {
      next(error);
    }
  }

  static async deleteFeedback(req: Request, res: Response, next: NextFunction) {
    try {
      const id = getParam(req.params.id);
      await FeedbackService.deleteFeedback(id);
      return ApiResponse.success(res, 'Feedback deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}
