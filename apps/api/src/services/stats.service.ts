import { prisma } from '@app/db';
import { AdminStats, EmployeeStats, ClientStats } from '@app/types';
import { checkDbConnection, memoryStore } from './store';
import { JwtPayload } from '../middlewares/auth.middleware';

export class StatsService {
  async getAdminStats(): Promise<AdminStats> {
    const isDb = await checkDbConnection();

    if (isDb) {
      const totalActiveClients = await prisma.user.count({
        where: { role: 'CLIENT', isActive: true },
      });

      const unassignedPendingRequests = await prisma.request.count({
        where: { status: 'PENDING', employeeId: null },
      });

      const allRequests = await prisma.request.findMany({
        include: {
          client: { select: { id: true, name: true, email: true } },
          employee: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
      });

      // Calculate Average Resolution Time
      const resolvedRequests = allRequests.filter((r) => r.resolvedAt && r.status === 'RESOLVED');
      let averageResolutionTimeMinutes = 0;
      if (resolvedRequests.length > 0) {
        const totalMinutes = resolvedRequests.reduce((acc, r) => {
          const diffMs = new Date(r.resolvedAt!).getTime() - new Date(r.createdAt).getTime();
          return acc + Math.max(0, Math.floor(diffMs / 60000));
        }, 0);
        averageResolutionTimeMinutes = Math.round(totalMinutes / resolvedRequests.length);
      }

      // Group counts
      const counts = {
        pending: allRequests.filter((r) => r.status === 'PENDING').length,
        inProgress: allRequests.filter((r) => r.status === 'IN_PROGRESS').length,
        resolved: allRequests.filter((r) => r.status === 'RESOLVED').length,
        cancelled: allRequests.filter((r) => r.status === 'CANCELLED').length,
      };

      // 30 days timeline
      const timeline: Array<{ date: string; created: number; resolved: number }> = [];
      const today = new Date();
      for (let i = 29; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];

        const created = allRequests.filter(
          (r) => new Date(r.createdAt).toISOString().split('T')[0] === dateStr
        ).length;

        const resolved = allRequests.filter(
          (r) => r.resolvedAt && new Date(r.resolvedAt).toISOString().split('T')[0] === dateStr
        ).length;

        timeline.push({ date: dateStr, created, resolved });
      }

      return {
        totalActiveClients,
        unassignedPendingRequests,
        averageResolutionTimeMinutes,
        totalRequests: allRequests.length,
        requestsByStatus: counts,
        createdVsResolved30Days: timeline,
        recentActivity: allRequests.slice(0, 10).map((r) => ({
          id: r.id,
          title: r.title,
          description: r.description,
          status: r.status as any,
          clientId: r.clientId,
          client: r.client,
          employeeId: r.employeeId,
          employee: r.employee,
          createdAt: r.createdAt,
          updatedAt: r.updatedAt,
          resolvedAt: r.resolvedAt,
        })),
      };
    } else {
      const totalActiveClients = memoryStore.users.filter(
        (u) => u.role === 'CLIENT' && u.isActive
      ).length;

      const unassignedPendingRequests = memoryStore.requests.filter(
        (r) => r.status === 'PENDING' && !r.employeeId
      ).length;

      const resolved = memoryStore.requests.filter(
        (r) => r.status === 'RESOLVED' && r.resolvedAt
      );

      let averageResolutionTimeMinutes = 0;
      if (resolved.length > 0) {
        const totalMinutes = resolved.reduce((acc, r) => {
          const diffMs = new Date(r.resolvedAt!).getTime() - new Date(r.createdAt).getTime();
          return acc + Math.max(0, Math.floor(diffMs / 60000));
        }, 0);
        averageResolutionTimeMinutes = Math.round(totalMinutes / resolved.length);
      }

      const counts = {
        pending: memoryStore.requests.filter((r) => r.status === 'PENDING').length,
        inProgress: memoryStore.requests.filter((r) => r.status === 'IN_PROGRESS').length,
        resolved: memoryStore.requests.filter((r) => r.status === 'RESOLVED').length,
        cancelled: memoryStore.requests.filter((r) => r.status === 'CANCELLED').length,
      };

      const timeline: Array<{ date: string; created: number; resolved: number }> = [];
      const today = new Date();
      for (let i = 29; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];

        const created = memoryStore.requests.filter(
          (r) => new Date(r.createdAt).toISOString().split('T')[0] === dateStr
        ).length;

        const resCount = memoryStore.requests.filter(
          (r) => r.resolvedAt && new Date(r.resolvedAt).toISOString().split('T')[0] === dateStr
        ).length;

        timeline.push({ date: dateStr, created, resolved: resCount });
      }

      const recentActivity = memoryStore.requests.slice(0, 10).map((r) => {
        const clientUser = memoryStore.users.find((u) => u.id === r.clientId);
        const employeeUser = r.employeeId ? memoryStore.users.find((u) => u.id === r.employeeId) : null;
        return {
          ...r,
          client: clientUser ? { id: clientUser.id, name: clientUser.name, email: clientUser.email } : undefined,
          employee: employeeUser ? { id: employeeUser.id, name: employeeUser.name, email: employeeUser.email } : null,
        };
      });

      return {
        totalActiveClients,
        unassignedPendingRequests,
        averageResolutionTimeMinutes,
        totalRequests: memoryStore.requests.length,
        requestsByStatus: counts,
        createdVsResolved30Days: timeline,
        recentActivity,
      };
    }
  }

  async getEmployeeStats(user: JwtPayload): Promise<EmployeeStats> {
    const isDb = await checkDbConnection();

    if (isDb) {
      const assignedTasksCount = await prisma.request.count({
        where: { employeeId: user.userId },
      });

      const openTasksCount = await prisma.request.count({
        where: {
          employeeId: user.userId,
          status: { in: ['PENDING', 'IN_PROGRESS'] },
        },
      });

      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);

      const tasksResolvedToday = await prisma.request.count({
        where: {
          employeeId: user.userId,
          status: 'RESOLVED',
          resolvedAt: { gte: startOfToday },
        },
      });

      const recentAssigned = await prisma.request.findMany({
        where: { employeeId: user.userId },
        include: {
          client: { select: { id: true, name: true, email: true } },
        },
        orderBy: { updatedAt: 'desc' },
        take: 5,
      });

      return {
        assignedTasksCount,
        openTasksCount,
        tasksResolvedToday,
        recentAssigned: recentAssigned.map((r) => ({
          id: r.id,
          title: r.title,
          description: r.description,
          status: r.status as any,
          clientId: r.clientId,
          client: r.client,
          employeeId: r.employeeId,
          createdAt: r.createdAt,
          updatedAt: r.updatedAt,
          resolvedAt: r.resolvedAt,
        })),
      };
    } else {
      const myRequests = memoryStore.requests.filter((r) => r.employeeId === user.userId);
      const assignedTasksCount = myRequests.length;
      const openTasksCount = myRequests.filter((r) => r.status === 'PENDING' || r.status === 'IN_PROGRESS').length;

      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);

      const tasksResolvedToday = myRequests.filter(
        (r) => r.status === 'RESOLVED' && r.resolvedAt && new Date(r.resolvedAt) >= startOfToday
      ).length;

      const recentAssigned = myRequests.slice(0, 5).map((r) => {
        const clientUser = memoryStore.users.find((u) => u.id === r.clientId);
        return {
          ...r,
          client: clientUser ? { id: clientUser.id, name: clientUser.name, email: clientUser.email } : undefined,
        };
      });

      return {
        assignedTasksCount,
        openTasksCount,
        tasksResolvedToday,
        recentAssigned,
      };
    }
  }

  async getClientStats(user: JwtPayload): Promise<ClientStats> {
    const isDb = await checkDbConnection();

    if (isDb) {
      const totalHistoricalRequestsCount = await prisma.request.count({
        where: { clientId: user.userId },
      });

      const openRequestsCount = await prisma.request.count({
        where: {
          clientId: user.userId,
          status: { in: ['PENDING', 'IN_PROGRESS'] },
        },
      });

      const recentRequests = await prisma.request.findMany({
        where: { clientId: user.userId },
        include: {
          employee: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      });

      return {
        openRequestsCount,
        totalHistoricalRequestsCount,
        recentRequests: recentRequests.map((r) => ({
          id: r.id,
          title: r.title,
          description: r.description,
          status: r.status as any,
          clientId: r.clientId,
          employeeId: r.employeeId,
          employee: r.employee,
          createdAt: r.createdAt,
          updatedAt: r.updatedAt,
          resolvedAt: r.resolvedAt,
        })),
      };
    } else {
      const myRequests = memoryStore.requests.filter((r) => r.clientId === user.userId);
      const totalHistoricalRequestsCount = myRequests.length;
      const openRequestsCount = myRequests.filter(
        (r) => r.status === 'PENDING' || r.status === 'IN_PROGRESS'
      ).length;

      const recentRequests = myRequests.slice(0, 5).map((r) => {
        const employeeUser = r.employeeId ? memoryStore.users.find((u) => u.id === r.employeeId) : null;
        return {
          ...r,
          employee: employeeUser ? { id: employeeUser.id, name: employeeUser.name, email: employeeUser.email } : null,
        };
      });

      return {
        openRequestsCount,
        totalHistoricalRequestsCount,
        recentRequests,
      };
    }
  }
}

export const statsService = new StatsService();

