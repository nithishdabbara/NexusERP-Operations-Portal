import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';

export const requireRoles = (allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'User unauthenticated' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: `Access forbidden: Required role (${allowedRoles.join(', ')}) does not match current user role (${req.user.role})` 
      });
    }

    next();
  };
};
