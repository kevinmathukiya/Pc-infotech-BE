import { Request, Response, NextFunction } from 'express';
import { ServiceService } from './service.service';
import { ApiResponse } from '../../utils/apiResponse';
import { AppError } from '../../utils/appError';
import { HttpStatus } from '../../constants/httpStatusCodes';
import { getParam } from '../../utils/getParam';

export class ServiceController {
  static async getAllServices(req: Request, res: Response, next: NextFunction) {
    try {
      const { services, total } = await ServiceService.getAllServices(req.query);
      return ApiResponse.success(res, 'Services retrieved successfully', { services, total });
    } catch (error) { next(error); }
  }

  static async getServiceBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const service = await ServiceService.getServiceBySlug(getParam(req.params.slug));
      return ApiResponse.success(res, 'Service details retrieved', { service });
    } catch (error) { next(error); }
  }

  static async createService(req: Request, res: Response, next: NextFunction) {
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
      const imageFile = files?.['image']?.[0];
      const galleryFiles = files?.['gallery'] ?? [];
      if (!imageFile) throw new AppError('Service main image is required.', HttpStatus.BAD_REQUEST);
      const service = await ServiceService.createService(req.body, imageFile.buffer, galleryFiles.map((f) => f.buffer));
      return ApiResponse.success(res, 'Service created successfully', { service }, HttpStatus.CREATED);
    } catch (error) { next(error); }
  }

  static async updateService(req: Request, res: Response, next: NextFunction) {
    try {
      const id = getParam(req.params.id);
      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
      const imageFile = files?.['image']?.[0];
      const galleryFiles = files?.['gallery'] ?? [];
      const service = await ServiceService.updateService(id, req.body, imageFile?.buffer, galleryFiles.length > 0 ? galleryFiles.map((f) => f.buffer) : undefined);
      return ApiResponse.success(res, 'Service updated successfully', { service });
    } catch (error) { next(error); }
  }

  static async deleteService(req: Request, res: Response, next: NextFunction) {
    try {
      await ServiceService.deleteService(getParam(req.params.id));
      return ApiResponse.success(res, 'Service deleted successfully');
    } catch (error) { next(error); }
  }
}
