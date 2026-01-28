/**
 * Auth endpoints: login, register, logout, refresh, MFA.
 * Бэкенд: POST auth/login/, auth/register/, auth/logout/, auth/refresh/, auth/mfa/setup/, auth/mfa/verify/
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

export interface MfaVerifyRequest {
  code: string;
}

export interface MfaSetupResponse {
  data: {
    provisioning_uri: string;
    secret: string;
  };
}

export async function mfaVerify(payload: MfaVerifyRequest): Promise<AuthResponse> {
  return request<AuthResponse>('POST', `${AUTH}/mfa/verify/`, payload);
}

export async function mfaSetup(): Promise<MfaSetupResponse> {
  return request<MfaSetupResponse>('POST', `${AUTH}/mfa/setup/`, {});
}
