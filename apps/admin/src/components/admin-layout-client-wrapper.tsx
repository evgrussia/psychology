"use client";

import React, { useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  SidebarProvider, 
  Sidebar, 
  SidebarContent, 
  SidebarHeader, 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger
} from '@psychology/design-system';
import { 
  LayoutDashboard, 
  CalendarDays,
  Briefcase,
  FileText,
  Gamepad2,
  LibraryBig,
  Book,
  Calendar,
  Users,
  ShieldCheck,
  Mail,
  BarChart3,
  Activity,
  Settings
} from 'lucide-react';
import { AdminAuthProvider, useAdminAuth } from './admin-auth-context';
import { AdminAuthGuard } from './admin-auth-guard';
import { DesktopOnlyGuard } from './desktop-only-guard';

const navItems = [
  { title: 'Дашборд', icon: LayoutDashboard, href: '/', roles: ['owner', 'assistant'] },
  { title: 'Расписание', icon: CalendarDays, href: '/schedule', roles: ['owner', 'assistant'] },
  { title: 'Услуги', icon: Briefcase, href: '/services', roles: ['owner', 'assistant'] },
  { title: 'Контент', icon: FileText, href: '/content', roles: ['owner', 'assistant', 'editor'] },
  { title: 'Интерактивы', icon: Gamepad2, href: '/interactive', roles: ['owner', 'assistant', 'editor'] },
  { title: 'Подборки', icon: LibraryBig, href: '/curated', roles: ['owner', 'assistant', 'editor'] },
  { title: 'Словарь', icon: Book, href: '/glossary', roles: ['owner', 'assistant', 'editor'] },
  { title: 'Мероприятия', icon: Calendar, href: '/events', roles: ['owner', 'assistant', 'editor'] },
  { title: 'CRM-лиды', icon: Users, href: '/leads', roles: ['owner', 'assistant'] },
  { title: 'Модерация', icon: ShieldCheck, href: '/moderation', roles: ['owner', 'assistant'] },
  { title: 'Шаблоны', icon: Mail, href: '/templates', roles: ['owner', 'assistant'] },
  { title: 'Аналитика', icon: BarChart3, href: '/analytics', roles: ['owner', 'assistant'] },
  { title: 'Аудит-лог', icon: Activity, href: '/audit-log', roles: ['owner', 'assistant'] },
  { title: 'Настройки', icon: Settings, href: '/settings', roles: ['owner'] },
];

function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAdminAuth();

  const filteredNav = useMemo(() => {
    if (!user) return [];
    return navItems.filter((item) => item.roles.some((role) => user.roles.includes(role)));
  }, [user]);

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="p-4">
          <div className="flex items-center gap-2 font-bold text-xl text-primary">
            <span>Admin</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {filteredNav.map((item) => {
              const isActive =
                pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              return (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-2 ${
                        isActive ? 'text-primary font-medium' : 'text-muted-foreground'
                      }`}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b px-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {user ? (
              <>
                <span>
                  {user.displayName || user.email || 'Администратор'} · {user.roles.join(', ')}
                </span>
                <button
                  onClick={logout}
                  className="rounded-md border px-3 py-1 text-xs font-medium text-foreground"
                >
                  Выйти
                </button>
              </>
            ) : (
              <span>Гость</span>
            )}
          </div>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}

export function AdminLayoutClientWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname === '/login';

  return (
    <AdminAuthProvider>
      <DesktopOnlyGuard>
        {isLogin ? (
          <div className="min-h-screen bg-background">{children}</div>
        ) : (
          <AdminAuthGuard allowedRoles={['owner', 'assistant', 'editor']}>
            <AdminShell>{children}</AdminShell>
          </AdminAuthGuard>
        )}
      </DesktopOnlyGuard>
    </AdminAuthProvider>
  );
}
