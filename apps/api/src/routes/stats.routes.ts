import { Router } from 'express';
import { statsController } from '../controllers/stats.controller';
import { authenticateToken } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/rbac.middleware';

export const statsRouter = Router();

statsRouter.use(authenticateToken);

statsRouter.get('/admin', requireRole('ADMIN'), (req, res, next) => {
  statsController.getAdminStats(req, res, next);
});

statsRouter.get('/employee', requireRole('EMPLOYEE', 'ADMIN'), (req, res, next) => {
  statsController.getEmployeeStats(req, res, next);
});

statsRouter.get('/client', requireRole('CLIENT', 'ADMIN'), (req, res, next) => {
  statsController.getClientStats(req, res, next);
});

