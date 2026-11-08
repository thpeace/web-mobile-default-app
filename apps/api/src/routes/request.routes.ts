import { Router } from 'express';
import { requestController } from '../controllers/request.controller';
import { authenticateToken } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/rbac.middleware';
import { validateBody } from '../middlewares/validate.middleware';
import { createRequestSchema, updateRequestStatusSchema, assignRequestSchema } from '@app/validation';

export const requestRouter = Router();

requestRouter.use(authenticateToken);

requestRouter.get('/', (req, res, next) => requestController.listRequests(req, res, next));
requestRouter.get('/:id', (req, res, next) => requestController.getRequestById(req, res, next));

// Only CLIENT (or ADMIN) can create requests
requestRouter.post(
  '/',
  requireRole('CLIENT', 'ADMIN'),
  validateBody(createRequestSchema),
  (req, res, next) => requestController.createRequest(req, res, next)
);

// Only EMPLOYEE or ADMIN can update status
requestRouter.patch(
  '/:id/status',
  requireRole('EMPLOYEE', 'ADMIN'),
  validateBody(updateRequestStatusSchema),
  (req, res, next) => requestController.updateRequestStatus(req, res, next)
);

// Only ADMIN can assign tasks
requestRouter.patch(
  '/:id/assign',
  requireRole('ADMIN'),
  validateBody(assignRequestSchema),
  (req, res, next) => requestController.assignRequest(req, res, next)
);

