/**
 * Типы для auth endpoints по контракту docs/api/api-contracts.md и бэкенду.
 */

export interface User {
  id: string;
  email: string;
  display_name?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  display_name?: string;
  consents?: Record<string, boolean>;
}

export interface AuthResponseData {
  user: User;
  mfa_required?: boolean;
  mfa_type?: string;
}

export interface AuthResponse {
  data: AuthResponseData;
}
