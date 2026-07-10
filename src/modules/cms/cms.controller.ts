import { Request, Response, NextFunction } from 'express';
import { CmsService } from './cms.service';
import { ApiResponse } from '../../utils/apiResponse';
import { AppError } from '../../utils/appError';
import { HttpStatus } from '../../constants/httpStatusCodes';
import { getParam } from '../../utils/getParam';

export class CmsController {
  static async getCms(req: Request, res: Response, next: NextFunction) {
    try {
      const cms = await CmsService.getCms();
      return ApiResponse.success(res, 'CMS data retrieved', { cms });
    } catch (error) { next(error); }
  }

  static async updateCms(req: Request, res: Response, next: NextFunction) {
    try {
      const cms = await CmsService.updateCms(req.body);
      return ApiResponse.success(res, 'CMS updated successfully', { cms });
    } catch (error) { next(error); }
  }

  static async addHeroSlide(req: Request, res: Response, next: NextFunction) {
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
      const imageFile = files?.['image']?.[0];
      if (!imageFile) throw new AppError('Slide image is required.', HttpStatus.BAD_REQUEST);
      const cms = await CmsService.addHeroSlide(req.body, imageFile.buffer);
      return ApiResponse.success(res, 'Hero slide added', { cms }, HttpStatus.CREATED);
    } catch (error) { next(error); }
  }

  static async removeHeroSlide(req: Request, res: Response, next: NextFunction) {
    try {
      const slideId = getParam(req.params.slideId);
      const cms = await CmsService.removeHeroSlide(slideId);
      return ApiResponse.success(res, 'Hero slide removed', { cms });
    } catch (error) { next(error); }
  }
}
