import { Request, Response, NextFunction } from 'express';
import { requestService } from '../services/request.service';

export class RequestController {
  async listRequests(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const filters = {
        status: req.query.status as string | undefined,
        clientId: req.query.clientId as string | undefined,
        employeeId: req.query.employeeId as string | undefined,
      };
      const requests = await requestService.listRequests(req.user!, filters);
      res.status(200).json({
        success: true,
        data: requests,
      });
    } catch (error) {
      next(error);
    }
  }

  async getRequestById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const request = await requestService.getRequestById(id, req.user!);
      res.status(200).json({
        success: true,
        data: request,
      });
    } catch (error: any) {
      res.status(404).json({
        success: false,
        error: error.message || 'Request not found',
      });
    }
  }

  async createRequest(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const request = await requestService.createRequest(req.body, req.user!);
      res.status(201).json({
        success: true,
        data: request,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to create request',
      });
    }
  }

  async updateRequestStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const request = await requestService.updateRequestStatus(id, req.body, req.user!);
      res.status(200).json({
        success: true,
        data: request,
      });
    } catch (error: any) {
      res.status(403).json({
        success: false,
        error: error.message || 'Failed to update request status',
      });
    }
  }

  async assignRequest(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const request = await requestService.assignRequest(id, req.body, req.user!);
      res.status(200).json({
        success: true,
        data: request,
      });
    } catch (error: any) {
      res.status(403).json({
        success: false,
        error: error.message || 'Failed to assign request',
      });
    }
  }
}

export const requestController = new RequestController();
