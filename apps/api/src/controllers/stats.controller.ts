import { Request, Response, NextFunction } from 'express';
import { statsService } from '../services/stats.service';

export class StatsController {
  async getAdminStats(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await statsService.getAdminStats();
      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }

  async getEmployeeStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await statsService.getEmployeeStats(req.user!);
      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }

  async getClientStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await statsService.getClientStats(req.user!);
      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const statsController = new StatsController();
