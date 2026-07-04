import { Request, Response, NextFunction } from 'express';
import { TestimonialService } from './testimonial.service';
import { ApiResponse } from '../../utils/apiResponse';
import { AppError } from '../../utils/appError';
import { HttpStatus } from '../../constants/httpStatusCodes';
import { getParam } from '../../utils/getParam';

export class TestimonialController {
  static async getAllTestimonials(req: Request, res: Response, next: NextFunction) {
    try {
      const { testimonials, total } = await TestimonialService.getAllTestimonials(req.query);
      return ApiResponse.success(res, 'Testimonials retrieved', { testimonials, total });
    } catch (error) { next(error); }
  }

  static async createTestimonial(req: Request, res: Response, next: NextFunction) {
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
      const photoFile = files?.['photo']?.[0];
      if (!photoFile) throw new AppError('Customer photo is required.', HttpStatus.BAD_REQUEST);
      const testimonial = await TestimonialService.createTestimonial(req.body, photoFile.buffer);
      return ApiResponse.success(res, 'Testimonial created', { testimonial }, HttpStatus.CREATED);
    } catch (error) { next(error); }
  }

  static async updateTestimonial(req: Request, res: Response, next: NextFunction) {
    try {
      const id = getParam(req.params.id);
      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
      const photoFile = files?.['photo']?.[0];
      const testimonial = await TestimonialService.updateTestimonial(id, req.body, photoFile?.buffer);
      return ApiResponse.success(res, 'Testimonial updated', { testimonial });
    } catch (error) { next(error); }
  }

  static async deleteTestimonial(req: Request, res: Response, next: NextFunction) {
    try {
      await TestimonialService.deleteTestimonial(getParam(req.params.id));
      return ApiResponse.success(res, 'Testimonial deleted');
    } catch (error) { next(error); }
  }
}
