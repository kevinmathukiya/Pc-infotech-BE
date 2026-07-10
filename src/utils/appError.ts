import { HttpStatus } from '../constants/httpStatusCodes';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly errors: any;

  constructor(message: string, statusCode: number = HttpStatus.INTERNAL_SERVER_ERROR, errors: any = null) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.errors = errors;

    Error.captureStackTrace(this, this.constructor);
  }
}
