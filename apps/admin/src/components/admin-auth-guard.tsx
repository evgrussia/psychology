"use client";

import React from 'react';
import Link from 'next/link';
import { useAdminAuth } from './admin-auth-context';

interface AdminAuthGuardProps {
  allowedRoles?: string[];
  children: React.ReactNode;
}

export function AdminAuthGuard({ allowedRoles, children }: AdminAuthGuardProps) {
  const { user, loading, error } = useAdminAuth();

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-sm text-muted-foreground">
        Проверяем доступ...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
        {error}
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-center">
        <h1 className="text-xl font-semibold">Требуется вход</h1>
        <p className="text-sm text-muted-foreground">
          Доступ к админке возможен только для авторизованных пользователей.
        </p>
        <Link
          href="/login"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          Перейти к логину
        </Link>
      </div>
    );
  }

  if (allowedRoles && !allowedRoles.some((role) => user.roles.includes(role))) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-center">
        <h1 className="text-xl font-semibold">Нет доступа</h1>
        <p className="text-sm text-muted-foreground">
          У вашей роли нет прав на этот раздел админки.
        </p>
        <Link href="/" className="text-sm font-medium text-primary">
          Вернуться к дашборду
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
