import { Request, Response, NextFunction } from 'express';
import { ServiceRequestService } from './serviceRequest.service';
import { ApiResponse } from '../../utils/apiResponse';
import { HttpStatus } from '../../constants/httpStatusCodes';
import { getParam } from '../../utils/getParam';

export class ServiceRequestController {
  static async createRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const request = await ServiceRequestService.createRequest(req.body);
      return ApiResponse.success(res, 'Service request submitted successfully', { request }, HttpStatus.CREATED);
    } catch (error) { next(error); }
  }

  static async getAllRequests(req: Request, res: Response, next: NextFunction) {
    try {
      const { requests, total } = await ServiceRequestService.getAllRequests(req.query);
      return ApiResponse.success(res, 'Service requests retrieved', { requests, total });
    } catch (error) { next(error); }
  }

  static async updateRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const request = await ServiceRequestService.updateRequest(getParam(req.params.id), req.body);
      return ApiResponse.success(res, 'Service request updated', { request });
    } catch (error) { next(error); }
  }

  static async deleteRequest(req: Request, res: Response, next: NextFunction) {
    try {
      await ServiceRequestService.deleteRequest(getParam(req.params.id));
      return ApiResponse.success(res, 'Service request deleted');
    } catch (error) { next(error); }
  }
}
