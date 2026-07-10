import { Response } from 'express';
import { HttpStatus } from '../constants/httpStatusCodes';

export class ApiResponse {
  static success(res: Response, message: string, data: any = null, statusCode: number = HttpStatus.OK) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  }

  static error(
    res: Response,
    message: string,
    errors: any = null,
    statusCode: number = HttpStatus.INTERNAL_SERVER_ERROR
  ) {
    return res.status(statusCode).json({
      success: false,
      message,
      errors,
    });
  }
}
