"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export interface AdminUser {
  id: string;
  email: string | null;
  displayName: string | null;
  roles: string[];
}

interface AdminAuthContextValue {
  user: AdminUser | null;
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
  logout: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextValue | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadUser = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include',
      });

      if (!response.ok) {
        setUser(null);
        if (response.status !== 401) {
          setError('Не удалось проверить доступ.');
        }
        return;
      }

      const data = (await response.json()) as AdminUser;
      setUser(data);
    } catch (err) {
      console.error('Failed to load admin user:', err);
      setUser(null);
      setError('Ошибка сети при проверке доступа.');
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (err) {
      console.error('Failed to logout:', err);
    } finally {
      await loadUser();
    }
  }, [loadUser]);

  useEffect(() => {
    let active = true;

    (async () => {
      if (!active) return;
      await loadUser();
    })();

    return () => {
      active = false;
    };
  }, [loadUser]);

  const value = useMemo(
    () => ({
      user,
      loading,
      error,
      reload: loadUser,
      logout,
    }),
    [user, loading, error, loadUser, logout],
  );

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth(): AdminAuthContextValue {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider');
  }
  return context;
}
