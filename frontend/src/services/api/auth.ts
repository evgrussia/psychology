import { apiClient } from './client';
import { AuthResponse, RegisterRequest, LoginRequest, RefreshTokenResponse } from '@/types/api';

export const authService = {
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<{ data: AuthResponse }>('/auth/register/', data);
    return response.data.data;
  },

  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<{ data: AuthResponse }>('/auth/login/', data);
    return response.data.data;
  },

  refreshToken: async (): Promise<RefreshTokenResponse> => {
    const response = await apiClient.post<RefreshTokenResponse>('/auth/refresh/');
    return response.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout/');
  },
};
