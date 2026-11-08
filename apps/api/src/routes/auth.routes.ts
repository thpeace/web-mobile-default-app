import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authenticateToken } from '../middlewares/auth.middleware';
import { validateBody } from '../middlewares/validate.middleware';
import { loginSchema } from '@app/validation';

export const authRouter = Router();

authRouter.post('/login', validateBody(loginSchema), (req, res, next) => {
  authController.login(req, res, next);
});

authRouter.get('/me', authenticateToken, (req, res, next) => {
  authController.getProfile(req, res, next);
});
