import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

export const validateBody = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error: any) {
      if (error instanceof ZodError) {
        res.status(400).json({
          success: false,
          error: error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', '),
          details: error.errors,
        });
        return;
      }
      res.status(400).json({ success: false, error: 'Malformed request payload' });
    }
  };
};
