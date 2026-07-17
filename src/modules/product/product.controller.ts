import { Request, Response, NextFunction } from 'express';
import { ProductService } from './product.service';
import { SparePartService } from '../sparePart/sparePart.service';
import { ApiResponse } from '../../utils/apiResponse';
import { AppError } from '../../utils/appError';
import { HttpStatus } from '../../constants/httpStatusCodes';
import { getParam } from '../../utils/getParam';

export class ProductController {
  static async getProductSpareParts(req: Request, res: Response, next: NextFunction) {
    try {
      const productId = getParam(req.params.productId);
      const spareParts = await SparePartService.getSparePartsByProductId(productId);
      return ApiResponse.success(res, 'Spare parts for product retrieved successfully', { spareParts });
    } catch (error) { next(error); }
  }

  static async getAllProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const { products, total } = await ProductService.getAllProducts(req.query);
      return ApiResponse.success(res, 'Products retrieved successfully', { products, total });
    } catch (error) { next(error); }
  }

  static async getProductBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await ProductService.getProductBySlug(getParam(req.params.slug));
      return ApiResponse.success(res, 'Product details retrieved', { product });
    } catch (error) { next(error); }
  }

  static async createProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
      const imageFiles = files?.['images'] ?? [];
      if (imageFiles.length === 0) throw new AppError('At least one product image is required.', HttpStatus.BAD_REQUEST);

      const product = await ProductService.createProduct(req.body, {
        images: imageFiles.map((f) => f.buffer),
      });
      return ApiResponse.success(res, 'Product created successfully', { product }, HttpStatus.CREATED);
    } catch (error) { next(error); }
  }

  static async updateProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const id = getParam(req.params.id);
      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
      const imageFiles = files?.['images'] ?? [];
      const product = await ProductService.updateProduct(id, req.body, {
        images: imageFiles.length > 0 ? imageFiles.map((f) => f.buffer) : undefined,
      });
      return ApiResponse.success(res, 'Product updated successfully', { product });
    } catch (error) { next(error); }
  }

  static async deleteProduct(req: Request, res: Response, next: NextFunction) {
    try {
      await ProductService.deleteProduct(getParam(req.params.id));
      return ApiResponse.success(res, 'Product deleted successfully');
    } catch (error) { next(error); }
  }
}
