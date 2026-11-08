import { Request, Response, NextFunction } from 'express';
import { Role } from '@app/types';

export const requireRole = (...allowedRoles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized. Authentication required.',
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: `Forbidden. Role '${req.user.role}' lacks permission for this action. Allowed: ${allowedRoles.join(', ')}`,
      });
      return;
    }

    next();
  };
};

