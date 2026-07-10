import { Request, Response, NextFunction } from 'express';
import { ZodType, ZodError } from 'zod';
import { AppError } from '../utils/appError';
import { HttpStatus } from '../constants/httpStatusCodes';

export const validate = (schema: ZodType) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      }) as any;
      // Only reassign body — req.query and req.params are getter-only in Express 5
      if (parsed.body !== undefined) req.body = parsed.body;
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        const issueList = ((error as any).issues || []) as any[];
        const errors = issueList.map((err: any) => ({
          field: Array.isArray(err.path) ? err.path.slice(1).join('.') : '',
          message: err.message,
        }));
        return next(new AppError('Validation Error', HttpStatus.BAD_REQUEST, errors));
      }
      return next(error);
    }
  };
};
