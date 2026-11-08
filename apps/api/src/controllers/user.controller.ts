import { Request, Response, NextFunction } from 'express';
import { userService } from '../services/user.service';

export class UserController {
  async listUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const search = req.query.search as string | undefined;
      const role = req.query.role as string | undefined;
      const users = await userService.listUsers(search, role);
      res.status(200).json({
        success: true,
        data: users,
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const user = await userService.getUserById(id);
      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  async createUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await userService.createUser(req.body);
      res.status(201).json({
        success: true,
        data: user,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to create user',
      });
    }
  }

  async updateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const user = await userService.updateUser(id, req.body);
      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to update user',
      });
    }
  }

  async deleteUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      if (req.user?.userId === id) {
        res.status(400).json({
          success: false,
          error: 'You cannot delete your own account',
        });
        return;
      }
      await userService.deleteUser(id);
      res.status(200).json({
        success: true,
        data: { success: true },
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to delete user',
      });
    }
  }
}

export const userController = new UserController();
