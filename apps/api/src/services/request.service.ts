import { prisma } from '@app/db';
import { RequestItem, CreateRequestDto, UpdateRequestStatusDto, AssignRequestDto, RequestStatus } from '@app/types';
import { checkDbConnection, memoryStore } from './store';
import { JwtPayload } from '../middlewares/auth.middleware';
import { randomUUID } from 'crypto';

export class RequestService {
  async listRequests(
    user: JwtPayload,
    filters?: { status?: string; clientId?: string; employeeId?: string }
  ): Promise<RequestItem[]> {
    const isDb = await checkDbConnection();

    if (isDb) {
      const where: any = {};

      // RBAC rules for viewing requests
      if (user.role === 'CLIENT') {
        where.clientId = user.userId;
      } else if (user.role === 'EMPLOYEE') {
        // Employees can see their assigned tasks or all open tasks
        if (filters?.employeeId) {
          where.employeeId = filters.employeeId;
        } else {
          where.OR = [
            { employeeId: user.userId },
            { employeeId: null },
          ];
        }
      } else if (user.role === 'ADMIN') {
        if (filters?.clientId) where.clientId = filters.clientId;
        if (filters?.employeeId) where.employeeId = filters.employeeId;
      }

      if (filters?.status) {
        where.status = filters.status.toUpperCase();
      }

      const requests = await prisma.request.findMany({
        where,
        include: {
          client: { select: { id: true, name: true, email: true } },
          employee: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
      });

      return requests.map((r) => ({
        id: r.id,
        title: r.title,
        description: r.description,
        status: r.status as RequestStatus,
        clientId: r.clientId,
        client: r.client,
        employeeId: r.employeeId,
        employee: r.employee,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
        resolvedAt: r.resolvedAt,
      }));
    } else {
      let filtered = [...memoryStore.requests];

      if (user.role === 'CLIENT') {
        filtered = filtered.filter((r) => r.clientId === user.userId);
      } else if (user.role === 'EMPLOYEE') {
        if (filters?.employeeId) {
          filtered = filtered.filter((r) => r.employeeId === filters.employeeId);
        } else {
          filtered = filtered.filter(
            (r) => r.employeeId === user.userId || r.employeeId === null
          );
        }
      } else if (user.role === 'ADMIN') {
        if (filters?.clientId) filtered = filtered.filter((r) => r.clientId === filters.clientId);
        if (filters?.employeeId) filtered = filtered.filter((r) => r.employeeId === filters.employeeId);
      }

      if (filters?.status) {
        filtered = filtered.filter((r) => r.status.toUpperCase() === filters.status!.toUpperCase());
      }

      // Enrich with client and employee objects
      return filtered.map((r) => {
        const clientUser = memoryStore.users.find((u) => u.id === r.clientId);
        const employeeUser = r.employeeId ? memoryStore.users.find((u) => u.id === r.employeeId) : null;
        return {
          ...r,
          client: clientUser ? { id: clientUser.id, name: clientUser.name, email: clientUser.email } : undefined,
          employee: employeeUser ? { id: employeeUser.id, name: employeeUser.name, email: employeeUser.email } : null,
        };
      });
    }
  }

  async getRequestById(id: string, user: JwtPayload): Promise<RequestItem> {
    const isDb = await checkDbConnection();

    if (isDb) {
      const request = await prisma.request.findUnique({
        where: { id },
        include: {
          client: { select: { id: true, name: true, email: true } },
          employee: { select: { id: true, name: true, email: true } },
        },
      });

      if (!request) throw new Error('Request not found');

      if (user.role === 'CLIENT' && request.clientId !== user.userId) {
        throw new Error('Forbidden: You can only view your own requests');
      }

      return {
        id: request.id,
        title: request.title,
        description: request.description,
        status: request.status as RequestStatus,
        clientId: request.clientId,
        client: request.client,
        employeeId: request.employeeId,
        employee: request.employee,
        createdAt: request.createdAt,
        updatedAt: request.updatedAt,
        resolvedAt: request.resolvedAt,
      };
    } else {
      const request = memoryStore.requests.find((r) => r.id === id);
      if (!request) throw new Error('Request not found');

      if (user.role === 'CLIENT' && request.clientId !== user.userId) {
        throw new Error('Forbidden: You can only view your own requests');
      }

      const clientUser = memoryStore.users.find((u) => u.id === request.clientId);
      const employeeUser = request.employeeId ? memoryStore.users.find((u) => u.id === request.employeeId) : null;

      return {
        ...request,
        client: clientUser ? { id: clientUser.id, name: clientUser.name, email: clientUser.email } : undefined,
        employee: employeeUser ? { id: employeeUser.id, name: employeeUser.name, email: employeeUser.email } : null,
      };
    }
  }

  async createRequest(dto: CreateRequestDto, user: JwtPayload): Promise<RequestItem> {
    const isDb = await checkDbConnection();

    if (isDb) {
      const request = await prisma.request.create({
        data: {
          title: dto.title,
          description: dto.description || null,
          status: 'PENDING',
          clientId: user.userId,
        },
        include: {
          client: { select: { id: true, name: true, email: true } },
        },
      });

      return {
        id: request.id,
        title: request.title,
        description: request.description,
        status: request.status as RequestStatus,
        clientId: request.clientId,
        client: request.client,
        employeeId: null,
        employee: null,
        createdAt: request.createdAt,
        updatedAt: request.updatedAt,
        resolvedAt: null,
      };
    } else {
      const newRequest: RequestItem = {
        id: randomUUID(),
        title: dto.title,
        description: dto.description || null,
        status: 'PENDING',
        clientId: user.userId,
        employeeId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        resolvedAt: null,
      };

      memoryStore.requests.unshift(newRequest);

      const clientUser = memoryStore.users.find((u) => u.id === user.userId);
      return {
        ...newRequest,
        client: clientUser ? { id: clientUser.id, name: clientUser.name, email: clientUser.email } : undefined,
      };
    }
  }

  async updateRequestStatus(
    id: string,
    dto: UpdateRequestStatusDto,
    user: JwtPayload
  ): Promise<RequestItem> {
    // Only EMPLOYEE or ADMIN can update request status
    if (user.role === 'CLIENT') {
      throw new Error('Forbidden: Clients cannot modify request statuses');
    }

    const isDb = await checkDbConnection();
    const resolvedAt = dto.status === 'RESOLVED' ? new Date() : null;

    if (isDb) {
      const existing = await prisma.request.findUnique({ where: { id } });
      if (!existing) throw new Error('Request not found');

      if (user.role === 'EMPLOYEE' && existing.employeeId && existing.employeeId !== user.userId) {
        throw new Error('Forbidden: You can only update tasks assigned to you');
      }

      // If employee updates an unassigned task, assign it to them
      const employeeId =
        user.role === 'EMPLOYEE' && !existing.employeeId ? user.userId : undefined;

      const updated = await prisma.request.update({
        where: { id },
        data: {
          status: dto.status as any,
          resolvedAt: dto.status === 'RESOLVED' ? new Date() : undefined,
          ...(employeeId ? { employeeId } : {}),
        },
        include: {
          client: { select: { id: true, name: true, email: true } },
          employee: { select: { id: true, name: true, email: true } },
        },
      });

      return {
        id: updated.id,
        title: updated.title,
        description: updated.description,
        status: updated.status as RequestStatus,
        clientId: updated.clientId,
        client: updated.client,
        employeeId: updated.employeeId,
        employee: updated.employee,
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt,
        resolvedAt: updated.resolvedAt,
      };
    } else {
      const index = memoryStore.requests.findIndex((r) => r.id === id);
      if (index === -1) throw new Error('Request not found');

      const existing = memoryStore.requests[index];

      if (user.role === 'EMPLOYEE' && existing.employeeId && existing.employeeId !== user.userId) {
        throw new Error('Forbidden: You can only update tasks assigned to you');
      }

      const assignedEmployeeId =
        user.role === 'EMPLOYEE' && !existing.employeeId ? user.userId : existing.employeeId;

      const updated: RequestItem = {
        ...existing,
        status: dto.status,
        employeeId: assignedEmployeeId,
        updatedAt: new Date(),
        resolvedAt: dto.status === 'RESOLVED' ? new Date() : existing.resolvedAt,
      };

      memoryStore.requests[index] = updated;

      const clientUser = memoryStore.users.find((u) => u.id === updated.clientId);
      const employeeUser = updated.employeeId
        ? memoryStore.users.find((u) => u.id === updated.employeeId)
        : null;

      return {
        ...updated,
        client: clientUser ? { id: clientUser.id, name: clientUser.name, email: clientUser.email } : undefined,
        employee: employeeUser ? { id: employeeUser.id, name: employeeUser.name, email: employeeUser.email } : null,
      };
    }
  }

  async assignRequest(id: string, dto: AssignRequestDto, user: JwtPayload): Promise<RequestItem> {
    // Only ADMIN can re-assign requests
    if (user.role !== 'ADMIN') {
      throw new Error('Forbidden: Only Administrators can assign requests to employees');
    }

    const isDb = await checkDbConnection();

    if (isDb) {
      const updated = await prisma.request.update({
        where: { id },
        data: {
          employeeId: dto.employeeId,
          // When assigned, if still pending, move to in-progress
          status: dto.employeeId ? 'IN_PROGRESS' : undefined,
        },
        include: {
          client: { select: { id: true, name: true, email: true } },
          employee: { select: { id: true, name: true, email: true } },
        },
      });

      return {
        id: updated.id,
        title: updated.title,
        description: updated.description,
        status: updated.status as RequestStatus,
        clientId: updated.clientId,
        client: updated.client,
        employeeId: updated.employeeId,
        employee: updated.employee,
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt,
        resolvedAt: updated.resolvedAt,
      };
    } else {
      const index = memoryStore.requests.findIndex((r) => r.id === id);
      if (index === -1) throw new Error('Request not found');

      const existing = memoryStore.requests[index];
      const updated: RequestItem = {
        ...existing,
        employeeId: dto.employeeId,
        status: dto.employeeId && existing.status === 'PENDING' ? 'IN_PROGRESS' : existing.status,
        updatedAt: new Date(),
      };

      memoryStore.requests[index] = updated;

      const clientUser = memoryStore.users.find((u) => u.id === updated.clientId);
      const employeeUser = updated.employeeId
        ? memoryStore.users.find((u) => u.id === updated.employeeId)
        : null;

      return {
        ...updated,
        client: clientUser ? { id: clientUser.id, name: clientUser.name, email: clientUser.email } : undefined,
        employee: employeeUser ? { id: employeeUser.id, name: employeeUser.name, email: employeeUser.email } : null,
      };
    }
  }
}

export const requestService = new RequestService();

