import { Request, Response, NextFunction } from 'express';
import { BlogService } from './blog.service';
import { ApiResponse } from '../../utils/apiResponse';
import { AppError } from '../../utils/appError';
import { HttpStatus } from '../../constants/httpStatusCodes';
import { getParam } from '../../utils/getParam';

export class BlogController {
  static async getAllBlogs(req: Request, res: Response, next: NextFunction) {
    try {
      const { blogs, total } = await BlogService.getAllBlogs(req.query);
      return ApiResponse.success(res, 'Blog posts retrieved', { blogs, total });
    } catch (error) { next(error); }
  }

  static async getAllBlogsAdmin(req: Request, res: Response, next: NextFunction) {
    try {
      const { blogs, total } = await BlogService.getAllBlogs(req.query, true);
      return ApiResponse.success(res, 'All blog posts retrieved', { blogs, total });
    } catch (error) { next(error); }
  }

  static async getBlogBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const blog = await BlogService.getBlogBySlug(getParam(req.params.slug));
      return ApiResponse.success(res, 'Blog post retrieved', { blog });
    } catch (error) { next(error); }
  }

  static async createBlog(req: Request, res: Response, next: NextFunction) {
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
      const imageFile = files?.['featuredImage']?.[0];
      if (!imageFile) throw new AppError('Featured image is required.', HttpStatus.BAD_REQUEST);
      const blog = await BlogService.createBlog(req.body, imageFile.buffer);
      return ApiResponse.success(res, 'Blog post created', { blog }, HttpStatus.CREATED);
    } catch (error) { next(error); }
  }

  static async updateBlog(req: Request, res: Response, next: NextFunction) {
    try {
      const id = getParam(req.params.id);
      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
      const imageFile = files?.['featuredImage']?.[0];
      const blog = await BlogService.updateBlog(id, req.body, imageFile?.buffer);
      return ApiResponse.success(res, 'Blog post updated', { blog });
    } catch (error) { next(error); }
  }

  static async deleteBlog(req: Request, res: Response, next: NextFunction) {
    try {
      await BlogService.deleteBlog(getParam(req.params.id));
      return ApiResponse.success(res, 'Blog post deleted');
    } catch (error) { next(error); }
  }
}
