import { Request, Response, NextFunction } from 'express';
import { JobApplicationService } from './jobApplication.service';
import { ApiResponse } from '../../utils/apiResponse';
import { HttpStatus } from '../../constants/httpStatusCodes';
import { getParam } from '../../utils/getParam';

export class JobApplicationController {
  static async getAllApplications(req: Request, res: Response, next: NextFunction) {
    try {
      const { applications, total } = await JobApplicationService.getAllApplications(req.query);
      return ApiResponse.success(res, 'Job applications retrieved successfully', { applications, total });
    } catch (error) {
      next(error);
    }
  }

  static async getApplicationById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = getParam(req.params.id);
      const application = await JobApplicationService.getApplicationById(id);
      return ApiResponse.success(res, 'Job application detail retrieved successfully', { application });
    } catch (error) {
      next(error);
    }
  }

  static async createApplication(req: Request, res: Response, next: NextFunction) {
    try {
      const application = await JobApplicationService.createApplication(req.body, req.file);
      return ApiResponse.success(
        res,
        'Job application submitted successfully. Thank you!',
        { application },
        HttpStatus.CREATED
      );
    } catch (error) {
      next(error);
    }
  }

  static async updateApplicationStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const id = getParam(req.params.id);
      const { status } = req.body;
      const application = await JobApplicationService.updateApplicationStatus(id, status);
      return ApiResponse.success(res, `Job application status updated to ${status}`, { application });
    } catch (error) {
      next(error);
    }
  }

  static async deleteApplication(req: Request, res: Response, next: NextFunction) {
    try {
      const id = getParam(req.params.id);
      await JobApplicationService.deleteApplication(id);
      return ApiResponse.success(res, 'Job application deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}
