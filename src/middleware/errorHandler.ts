import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/appError';
import { ApiResponse } from '../utils/apiResponse';
import { logger } from '../logger/index';
import { HttpStatus } from '../constants/httpStatusCodes';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  err.statusCode = err.statusCode || HttpStatus.INTERNAL_SERVER_ERROR;

  // Log the error using Winston
  logger.error(`${err.statusCode} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`, err);

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `Duplicate value for ${field}. Please use another value.`;
    err = new AppError(message, HttpStatus.CONFLICT);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map((el: any) => el.message).join(', ');
    err = new AppError(message, HttpStatus.BAD_REQUEST);
  }

  // CastError (e.g. invalid ObjectId)
  if (err.name === 'CastError') {
    const message = `Invalid ${err.path}: ${err.value}.`;
    err = new AppError(message, HttpStatus.BAD_REQUEST);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    err = new AppError('Invalid token. Please log in again.', HttpStatus.UNAUTHORIZED);
  }
  if (err.name === 'TokenExpiredError') {
    err = new AppError('Your token has expired. Please log in again.', HttpStatus.UNAUTHORIZED);
  }

  if (err instanceof AppError) {
    return ApiResponse.error(res, err.message, err.errors, err.statusCode);
  }

  // Fallback for unhandled/internal errors
  const responseMsg = process.env.NODE_ENV === 'production' 
    ? 'Something went wrong on our end.' 
    : err.message;

  return res.status(err.statusCode).json({
    success: false,
    message: responseMsg,
    errors: err.errors || null,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  });
};
