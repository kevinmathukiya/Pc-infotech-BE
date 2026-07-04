import { Request, Response, NextFunction } from 'express';
import { CategoryService } from './category.service';
import { ApiResponse } from '../../utils/apiResponse';
import { getParam } from '../../utils/getParam';

export class CategoryController {
  static async getAllCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const { categories, total } = await CategoryService.getAllCategories(req.query);
      return ApiResponse.success(res, 'Categories retrieved successfully', { categories, total });
    } catch (error) { next(error); }
  }

  static async createCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const category = await CategoryService.createCategory(req.body);
      return ApiResponse.success(res, 'Category created successfully', { category });
    } catch (error) { next(error); }
  }

  static async updateCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const category = await CategoryService.updateCategory(getParam(req.params.id), req.body);
      return ApiResponse.success(res, 'Category updated successfully', { category });
    } catch (error) { next(error); }
  }

  static async deleteCategory(req: Request, res: Response, next: NextFunction) {
    try {
      await CategoryService.deleteCategory(getParam(req.params.id));
      return ApiResponse.success(res, 'Category deleted successfully');
    } catch (error) { next(error); }
  }
}
