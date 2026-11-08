import { createApiClient, ApiClient } from '@app/api-client';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export const api: ApiClient = createApiClient({
  baseURL: API_BASE_URL,
  getToken: () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token');
    }
    return null;
  },
  onUnauthorized: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
  },
});
