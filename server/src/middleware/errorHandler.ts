import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('API Error:', err);

  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'Validation failed',
      details: err.errors.map(e => ({ field: e.path.join('.'), message: e.message }))
    });
  }

  if (err.status) {
    return res.status(err.status).json({ error: err.message });
  }

  return res.status(500).json({
    error: err.message || 'Internal server error'
  });
};
