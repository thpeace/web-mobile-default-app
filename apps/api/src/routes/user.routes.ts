import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { authenticateToken } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/rbac.middleware';
import { validateBody } from '../middlewares/validate.middleware';
import { createUserSchema, updateUserSchema } from '@app/validation';

export const userRouter = Router();

// All user management routes require ADMIN role
userRouter.use(authenticateToken, requireRole('ADMIN'));

userRouter.get('/', (req, res, next) => userController.listUsers(req, res, next));
userRouter.get('/:id', (req, res, next) => userController.getUserById(req, res, next));
userRouter.post('/', validateBody(createUserSchema), (req, res, next) => userController.createUser(req, res, next));
userRouter.patch('/:id', validateBody(updateUserSchema), (req, res, next) => userController.updateUser(req, res, next));
userRouter.delete('/:id', (req, res, next) => userController.deleteUser(req, res, next));

