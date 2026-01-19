"use client";

import React, { useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell, LayoutDashboard, ShieldCheck, LogOut } from 'lucide-react';
import { useAdminAuth } from './admin-auth-context';

const navItems = [
  { title: 'Дашборд', href: '/', icon: LayoutDashboard, roles: ['owner'] },
  { title: 'Модерация', href: '/moderation', icon: ShieldCheck, roles: ['owner', 'assistant'] },
  { title: 'Уведомления', href: '/notifications', icon: Bell, roles: ['owner', 'assistant'] },
];

export function MobileAdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAdminAuth();

  const filteredNav = useMemo(() => {
    if (!user) return [];
    return navItems.filter((item) => item.roles.some((role) => user.roles.includes(role)));
  }, [user]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b bg-background/95 px-4 py-3 backdrop-blur">
        <div>
          <div className="text-sm font-semibold">Админка</div>
          <div className="text-xs text-muted-foreground">
            {user ? `${user.displayName || user.email || 'Администратор'} · ${user.roles.join(', ')}` : 'Гость'}
          </div>
        </div>
        {user && (
          <button
            type="button"
            onClick={logout}
            className="inline-flex items-center gap-1 rounded-md border px-3 py-1 text-xs font-medium"
            aria-label="Выйти из админки"
          >
            <LogOut className="h-3.5 w-3.5" />
            Выйти
          </button>
        )}
      </header>

      <main className="flex-1 px-4 pb-24 pt-4">{children}</main>

      <nav className="fixed bottom-0 left-0 right-0 border-t bg-background/95 px-4 py-2 backdrop-blur">
        <div className="flex items-center justify-around gap-2">
          {filteredNav.map((item) => {
            const isActive =
              pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-1 flex-col items-center gap-1 rounded-md py-2 text-xs ${
                  isActive ? 'text-primary' : 'text-muted-foreground'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon className="h-4 w-4" />
                <span>{item.title}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
