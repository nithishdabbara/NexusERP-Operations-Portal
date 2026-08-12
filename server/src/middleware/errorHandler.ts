import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('API Error details:', err);

  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'Validation failed',
      details: err.errors.map(e => ({ field: e.path.join('.'), message: e.message }))
    });
  }

  const statusCode = err.status || err.statusCode || 500;
  return res.status(statusCode).json({
    error: err.message || 'Internal server error'
  });
};
