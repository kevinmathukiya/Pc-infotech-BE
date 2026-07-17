import { rateLimit } from 'express-rate-limit';
import { HttpStatus } from '../constants/httpStatusCodes';
import { ApiResponse } from '../utils/apiResponse';
import { config } from '../config/index';

// General API rate limiter: max 100 requests per 15 minutes (relaxed in dev)
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: config.NODE_ENV === 'development' ? 10000 : 500,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return ApiResponse.error(
      res,
      'Too many requests from this IP. Please try again after 15 minutes.',
      null,
      HttpStatus.TOO_MANY_REQUESTS
    );
  },
});

// Authentication rate limiter: max 10 login/OTP attempts per 15 minutes (relaxed in dev)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: config.NODE_ENV === 'development' ? 1000 : 30,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return ApiResponse.error(
      res,
      'Too many login or OTP attempts. Please try again after 15 minutes.',
      null,
      HttpStatus.TOO_MANY_REQUESTS
    );
  },
});

// Public form submission rate limiter: max 5 requests per hour (relaxed in dev)
export const formLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: config.NODE_ENV === 'development' ? 1000 : 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return ApiResponse.error(
      res,
      'Too many submissions. Please try again after an hour.',
      null,
      HttpStatus.TOO_MANY_REQUESTS
    );
  },
});
