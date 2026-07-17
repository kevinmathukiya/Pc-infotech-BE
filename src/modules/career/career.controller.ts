import { Request, Response, NextFunction } from 'express';
import { CareerService } from './career.service';
import { ApiResponse } from '../../utils/apiResponse';
import { HttpStatus } from '../../constants/httpStatusCodes';
import { getParam } from '../../utils/getParam';

export class CareerController {
  static async getAllCareers(req: Request, res: Response, next: NextFunction) {
    try {
      // Determine if request is from admin by checking route path
      const forAdmin = req.path.includes('/admin') || req.originalUrl.includes('/admin');
      const { careers, total } = await CareerService.getAllCareers(req.query, forAdmin);
      return ApiResponse.success(res, 'Career listings retrieved successfully', { careers, total });
    } catch (error) {
      next(error);
    }
  }

  static async getCareerById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = getParam(req.params.id);
      const career = await CareerService.getCareerById(id);
      return ApiResponse.success(res, 'Career detail retrieved successfully', { career });
    } catch (error) {
      next(error);
    }
  }

  static async createCareer(req: Request, res: Response, next: NextFunction) {
    try {
      const career = await CareerService.createCareer(req.body, req.file?.buffer);
      return ApiResponse.success(res, 'Career posting created successfully', { career }, HttpStatus.CREATED);
    } catch (error) {
      next(error);
    }
  }

  static async updateCareer(req: Request, res: Response, next: NextFunction) {
    try {
      const id = getParam(req.params.id);
      const career = await CareerService.updateCareer(id, req.body, req.file?.buffer);
      return ApiResponse.success(res, 'Career posting updated successfully', { career });
    } catch (error) {
      next(error);
    }
  }

  static async deleteCareer(req: Request, res: Response, next: NextFunction) {
    try {
      const id = getParam(req.params.id);
      await CareerService.deleteCareer(id);
      return ApiResponse.success(res, 'Career posting deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  static async toggleCareerStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const id = getParam(req.params.id);
      const { status } = req.body;
      const career = await CareerService.updateCareer(id, { status }, undefined);
      return ApiResponse.success(res, 'Career status updated successfully', { career });
    } catch (error) {
      next(error);
    }
  }
}
