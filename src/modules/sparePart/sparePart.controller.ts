import { Request, Response, NextFunction } from 'express';
import { SparePartService } from './sparePart.service';
import { ApiResponse } from '../../utils/apiResponse';
import { AppError } from '../../utils/appError';
import { HttpStatus } from '../../constants/httpStatusCodes';
import { getParam } from '../../utils/getParam';
import { AuthenticatedRequest } from '../../middleware/auth';

export class SparePartController {
  static async getAllSpareParts(req: Request, res: Response, next: NextFunction) {
    try {
      const { spareParts, total } = await SparePartService.getAllSpareParts(req.query);
      return ApiResponse.success(res, 'Spare parts retrieved successfully', { spareParts, total });
    } catch (error) {
      next(error);
    }
  }

  static async getSparePartByIdOrSlug(req: Request, res: Response, next: NextFunction) {
    try {
      const idOrSlug = getParam(req.params.id || req.params.slug);
      const sparePart = await SparePartService.getSparePartByIdOrSlug(idOrSlug);
      return ApiResponse.success(res, 'Spare part details retrieved', { sparePart });
    } catch (error) {
      next(error);
    }
  }

  static async createSparePart(req: Request, res: Response, next: NextFunction) {
    try {
      const adminId = (req as AuthenticatedRequest).admin?.id;
      if (!adminId) {
        throw new AppError('Unauthorized access', HttpStatus.UNAUTHORIZED);
      }

      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
      const thumbnailFile = files?.['thumbnail']?.[0];
      const imageFiles = files?.['images'] ?? [];

      if (!thumbnailFile) {
        throw new AppError('Thumbnail image is required.', HttpStatus.BAD_REQUEST);
      }
      if (imageFiles.length === 0) {
        throw new AppError('At least one spare part image is required.', HttpStatus.BAD_REQUEST);
      }

      const sparePart = await SparePartService.createSparePart(
        req.body,
        {
          thumbnail: thumbnailFile.buffer,
          images: imageFiles.map((f) => f.buffer),
        },
        adminId
      );

      return ApiResponse.success(
        res,
        'Spare part created successfully',
        { sparePart },
        HttpStatus.CREATED
      );
    } catch (error) {
      next(error);
    }
  }

  static async updateSparePart(req: Request, res: Response, next: NextFunction) {
    try {
      const idOrSlug = getParam(req.params.id || req.params.slug);
      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
      const thumbnailFile = files?.['thumbnail']?.[0];
      const imageFiles = files?.['images'] ?? [];

      const sparePart = await SparePartService.updateSparePart(idOrSlug, req.body, {
        thumbnail: thumbnailFile?.buffer,
        images: imageFiles.length > 0 ? imageFiles.map((f) => f.buffer) : undefined,
      });

      return ApiResponse.success(res, 'Spare part updated successfully', { sparePart });
    } catch (error) {
      next(error);
    }
  }

  static async deleteSparePart(req: Request, res: Response, next: NextFunction) {
    try {
      const idOrSlug = getParam(req.params.id || req.params.slug);
      await SparePartService.deleteSparePart(idOrSlug);
      return ApiResponse.success(res, 'Spare part deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getSparePartsByProductId(req: Request, res: Response, next: NextFunction) {
    try {
      const productId = getParam(req.params.productId);
      const spareParts = await SparePartService.getSparePartsByProductId(productId);
      return ApiResponse.success(res, 'Spare parts for product retrieved successfully', { spareParts });
    } catch (error) {
      next(error);
    }
  }

  static async searchSpareParts(req: Request, res: Response, next: NextFunction) {
    try {
      const { spareParts, total } = await SparePartService.searchSpareParts(req.query);
      return ApiResponse.success(res, 'Search results for spare parts retrieved successfully', {
        spareParts,
        total,
      });
    } catch (error) {
      next(error);
    }
  }
}
