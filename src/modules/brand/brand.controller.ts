import { Request, Response, NextFunction } from 'express';
import { BrandService } from './brand.service';
import { ApiResponse } from '../../utils/apiResponse';
import { AppError } from '../../utils/appError';
import { HttpStatus } from '../../constants/httpStatusCodes';
import { getParam } from '../../utils/getParam';

export class BrandController {
  static async getAllBrands(req: Request, res: Response, next: NextFunction) {
    try {
      const { brands, total } = await BrandService.getAllBrands(req.query);
      return ApiResponse.success(res, 'Brands retrieved successfully', { brands, total });
    } catch (error) { next(error); }
  }

  static async getBrandBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const slug = getParam(req.params.slug);
      const brand = await BrandService.getBrandBySlug(slug);
      return ApiResponse.success(res, 'Brand details retrieved', { brand });
    } catch (error) { next(error); }
  }

  static async createBrand(req: Request, res: Response, next: NextFunction) {
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
      const logoFile = files?.['logo']?.[0];
      const bannerFile = files?.['banner']?.[0];
      if (!logoFile || !bannerFile) throw new AppError('Both logo and banner images are required.', HttpStatus.BAD_REQUEST);
      const brand = await BrandService.createBrand(req.body, logoFile.buffer, bannerFile.buffer);
      return ApiResponse.success(res, 'Brand created successfully', { brand }, HttpStatus.CREATED);
    } catch (error) { next(error); }
  }

  static async updateBrand(req: Request, res: Response, next: NextFunction) {
    try {
      const id = getParam(req.params.id);
      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
      const brand = await BrandService.updateBrand(id, req.body, files?.['logo']?.[0]?.buffer, files?.['banner']?.[0]?.buffer);
      return ApiResponse.success(res, 'Brand updated successfully', { brand });
    } catch (error) { next(error); }
  }

  static async deleteBrand(req: Request, res: Response, next: NextFunction) {
    try {
      await BrandService.deleteBrand(getParam(req.params.id));
      return ApiResponse.success(res, 'Brand deleted successfully');
    } catch (error) { next(error); }
  }
}
