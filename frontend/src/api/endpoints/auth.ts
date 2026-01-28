/**
 * Auth endpoints: login, register, logout, refresh.
 * Бэкенд: POST auth/login/, auth/register/, auth/logout/, auth/refresh/
 */

import { request } from '../client';
import type { AuthResponse, LoginRequest, RegisterRequest } from '../types/auth';

const AUTH = 'auth';

export async function login(payload: LoginRequest): Promise<AuthResponse> {
  return request<AuthResponse>('POST', `${AUTH}/login/`, payload);
}

export async function register(payload: RegisterRequest): Promise<AuthResponse> {
  return request<AuthResponse>('POST', `${AUTH}/register/`, payload);
}

export async function logout(): Promise<void> {
  await request<void>('POST', `${AUTH}/logout/`, undefined, { skipRefresh: false });
}

export async function refresh(): Promise<void> {
  await request('POST', `${AUTH}/refresh/`, {}, { skipRefresh: true });
}
