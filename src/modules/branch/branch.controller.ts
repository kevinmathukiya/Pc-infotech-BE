import { Request, Response, NextFunction } from 'express';
import { BranchService } from './branch.service';
import { ApiResponse } from '../../utils/apiResponse';
import { HttpStatus } from '../../constants/httpStatusCodes';
import { getParam } from '../../utils/getParam';

export class BranchController {
  static async getAllBranches(req: Request, res: Response, next: NextFunction) {
    try {
      const { branches, total } = await BranchService.getAllBranches(req.query);
      return ApiResponse.success(res, 'Branches retrieved successfully', { branches, total });
    } catch (error) { next(error); }
  }

  static async createBranch(req: Request, res: Response, next: NextFunction) {
    try {
      const branch = await BranchService.createBranch(req.body);
      return ApiResponse.success(res, 'Branch created successfully', { branch }, HttpStatus.CREATED);
    } catch (error) { next(error); }
  }

  static async updateBranch(req: Request, res: Response, next: NextFunction) {
    try {
      const branch = await BranchService.updateBranch(getParam(req.params.id), req.body);
      return ApiResponse.success(res, 'Branch updated successfully', { branch });
    } catch (error) { next(error); }
  }

  static async deleteBranch(req: Request, res: Response, next: NextFunction) {
    try {
      await BranchService.deleteBranch(getParam(req.params.id));
      return ApiResponse.success(res, 'Branch deleted successfully');
    } catch (error) { next(error); }
  }
}
