import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import {
  AuthResponse,
  LoginDto,
  User,
  CreateUserDto,
  UpdateUserDto,
  RequestItem,
  CreateRequestDto,
  UpdateRequestStatusDto,
  AssignRequestDto,
  AdminStats,
  EmployeeStats,
  ClientStats,
  ApiResponse,
} from '@app/types';

export interface ApiClientConfig {
  baseURL: string;
  getToken?: () => string | null | Promise<string | null>;
  onUnauthorized?: () => void;
}

export class ApiClient {
  private axiosInstance: AxiosInstance;
  private token: string | null = null;
  private getTokenFn?: () => string | null | Promise<string | null>;

  constructor(config: ApiClientConfig) {
    this.getTokenFn = config.getToken;
    this.axiosInstance = axios.create({
      baseURL: config.baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 15000,
    });

    this.axiosInstance.interceptors.request.use(async (reqConfig) => {
      let token = this.token;
      if (!token && this.getTokenFn) {
        token = await this.getTokenFn();
      }
      if (token) {
        reqConfig.headers.Authorization = `Bearer ${token}`;
      }
      return reqConfig;
    });

    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401 && config.onUnauthorized) {
          config.onUnauthorized();
        }
        return Promise.reject(error);
      }
    );
  }

  public setToken(token: string | null) {
    this.token = token;
  }

  // --- Auth Endpoints ---
  async login(dto: LoginDto): Promise<AuthResponse> {
    const res = await this.axiosInstance.post<ApiResponse<AuthResponse>>('/auth/login', dto);
    const data = res.data.data!;
    this.setToken(data.token);
    return data;
  }

  async getProfile(): Promise<User> {
    const res = await this.axiosInstance.get<ApiResponse<User>>('/auth/me');
    return res.data.data!;
  }

  // --- Users Endpoints (ADMIN) ---
  async getUsers(search?: string, role?: string): Promise<User[]> {
    const res = await this.axiosInstance.get<ApiResponse<User[]>>('/users', {
      params: { search, role },
    });
    return res.data.data!;
  }

  async getUser(id: string): Promise<User> {
    const res = await this.axiosInstance.get<ApiResponse<User>>(`/users/${id}`);
    return res.data.data!;
  }

  async createUser(dto: CreateUserDto): Promise<User> {
    const res = await this.axiosInstance.post<ApiResponse<User>>('/users', dto);
    return res.data.data!;
  }

  async updateUser(id: string, dto: UpdateUserDto): Promise<User> {
    const res = await this.axiosInstance.patch<ApiResponse<User>>(`/users/${id}`, dto);
    return res.data.data!;
  }

  async deleteUser(id: string): Promise<{ success: boolean }> {
    const res = await this.axiosInstance.delete<ApiResponse<{ success: boolean }>>(`/users/${id}`);
    return res.data.data!;
  }

  // --- Requests Endpoints ---
  async getRequests(params?: { status?: string; clientId?: string; employeeId?: string }): Promise<RequestItem[]> {
    const res = await this.axiosInstance.get<ApiResponse<RequestItem[]>>('/requests', { params });
    return res.data.data!;
  }

  async getRequest(id: string): Promise<RequestItem> {
    const res = await this.axiosInstance.get<ApiResponse<RequestItem>>(`/requests/${id}`);
    return res.data.data!;
  }

  async createRequest(dto: CreateRequestDto): Promise<RequestItem> {
    const res = await this.axiosInstance.post<ApiResponse<RequestItem>>('/requests', dto);
    return res.data.data!;
  }

  async updateRequestStatus(id: string, dto: UpdateRequestStatusDto): Promise<RequestItem> {
    const res = await this.axiosInstance.patch<ApiResponse<RequestItem>>(`/requests/${id}/status`, dto);
    return res.data.data!;
  }

  async assignRequest(id: string, dto: AssignRequestDto): Promise<RequestItem> {
    const res = await this.axiosInstance.patch<ApiResponse<RequestItem>>(`/requests/${id}/assign`, dto);
    return res.data.data!;
  }

  // --- Stats / KPI Endpoints ---
  async getAdminStats(): Promise<AdminStats> {
    const res = await this.axiosInstance.get<ApiResponse<AdminStats>>('/stats/admin');
    return res.data.data!;
  }

  async getEmployeeStats(): Promise<EmployeeStats> {
    const res = await this.axiosInstance.get<ApiResponse<EmployeeStats>>('/stats/employee');
    return res.data.data!;
  }

  async getClientStats(): Promise<ClientStats> {
    const res = await this.axiosInstance.get<ApiResponse<ClientStats>>('/stats/client');
    return res.data.data!;
  }
}

export function createApiClient(config: ApiClientConfig): ApiClient {
  return new ApiClient(config);
}

