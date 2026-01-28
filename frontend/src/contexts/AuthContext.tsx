/**
 * Контекст авторизации: user, login, logout, refresh.
 * По плану: frontend/docs/BACKEND-INTEGRATION-PLAN.md § 2.4
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import * as authApi from '@/api/endpoints/auth';
import { setOnUnauthorized } from '@/api/client';
import type { User } from '@/api/types/auth';
import type { LoginRequest, RegisterRequest } from '@/api/types/auth';

const AUTH_USER_KEY = 'auth_user';

function loadUserFromStorage(): User | null {
  try {
    const raw = localStorage.getItem(AUTH_USER_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as User;
    return data?.id && data?.email ? data : null;
  } catch {
    return null;
  }
}

function saveUserToStorage(user: User | null): void {
  if (user) {
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(AUTH_USER_KEY);
  }
}

interface AuthContextValue {
  user: User | null;
  pendingMfaUser: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<{ mfaRequired?: boolean } | void>;
  mfaVerify: (code: string) => Promise<void>;
  clearPendingMfa: () => void;
  register: (payload: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(loadUserFromStorage);
  const [pendingMfaUser, setPendingMfaUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      await authApi.refresh();
      const stored = loadUserFromStorage();
      setUser(stored);
    } catch {
      setUser(null);
      saveUserToStorage(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    setOnUnauthorized(() => {
      setUser(null);
      saveUserToStorage(null);
    });
    refreshUser();
  }, [refreshUser]);

  const login = useCallback(async (credentials: LoginRequest): Promise<{ mfaRequired?: boolean } | void> => {
    const res = await authApi.login(credentials);
    const u = res?.data?.user ?? null;
    if (res?.data?.mfa_required && u) {
      setPendingMfaUser(u);
      return { mfaRequired: true };
    }
    if (u) {
      setUser(u);
      saveUserToStorage(u);
    }
  }, []);

  const mfaVerify = useCallback(async (code: string) => {
    const res = await authApi.mfaVerify({ code });
    const u = res?.data?.user ?? null;
    if (u) {
      setUser(u);
      saveUserToStorage(u);
      setPendingMfaUser(null);
    }
  }, []);

  const register = useCallback(async (payload: RegisterRequest) => {
    const res = await authApi.register(payload);
    const u = res?.data?.user ?? null;
    if (u) {
      setUser(u);
      saveUserToStorage(u);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // очищаем локально в любом случае
    }
    setUser(null);
    saveUserToStorage(null);
  }, []);

  const clearPendingMfa = useCallback(() => setPendingMfaUser(null), []);

  const value: AuthContextValue = {
    user,
    pendingMfaUser,
    isLoading,
    isAuthenticated: !!user,
    login,
    mfaVerify,
    clearPendingMfa,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
