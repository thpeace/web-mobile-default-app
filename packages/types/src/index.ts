export type Role = 'ADMIN' | 'EMPLOYEE' | 'CLIENT';

export const Roles = {
  ADMIN: 'ADMIN' as Role,
  EMPLOYEE: 'EMPLOYEE' as Role,
  CLIENT: 'CLIENT' as Role,
};

export type RequestStatus = 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'CANCELLED';

export const RequestStatuses = {
  PENDING: 'PENDING' as RequestStatus,
  IN_PROGRESS: 'IN_PROGRESS' as RequestStatus,
  RESOLVED: 'RESOLVED' as RequestStatus,
  CANCELLED: 'CANCELLED' as RequestStatus,
};

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  isActive: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface RequestItem {
  id: string;
  title: string;
  description: string | null;
  status: RequestStatus;
  clientId: string;
  client?: Pick<User, 'id' | 'name' | 'email'>;
  employeeId: string | null;
  employee?: Pick<User, 'id' | 'name' | 'email'> | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  resolvedAt: string | Date | null;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface CreateUserDto {
  email: string;
  password: string;
  name: string;
  role: Role;
}

export interface UpdateUserDto {
  email?: string;
  password?: string;
  name?: string;
  role?: Role;
  isActive?: boolean;
}

export interface CreateRequestDto {
  title: string;
  description?: string;
}

export interface UpdateRequestStatusDto {
  status: RequestStatus;
}

export interface AssignRequestDto {
  employeeId: string | null;
}

export interface AdminStats {
  totalActiveClients: number;
  unassignedPendingRequests: number;
  averageResolutionTimeMinutes: number;
  totalRequests: number;
  requestsByStatus: {
    pending: number;
    inProgress: number;
    resolved: number;
    cancelled: number;
  };
  createdVsResolved30Days: Array<{
    date: string;
    created: number;
    resolved: number;
  }>;
  recentActivity: RequestItem[];
}

export interface EmployeeStats {
  assignedTasksCount: number;
  openTasksCount: number;
  tasksResolvedToday: number;
  recentAssigned: RequestItem[];
}

export interface ClientStats {
  openRequestsCount: number;
  totalHistoricalRequestsCount: number;
  recentRequests: RequestItem[];
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

