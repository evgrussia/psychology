"use client";

import React from 'react';
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
  FileText, 
  MessageSquare, 
  Book, 
  Activity 
} from 'lucide-react';

const navItems = [
  { title: 'Дашборд', icon: LayoutDashboard, href: '/admin' },
  { title: 'Контент', icon: FileText, href: '/admin/content' },
  { title: 'Квизы', icon: MessageSquare, href: '/admin/interactive/quizzes' },
  { title: 'Словарь', icon: Book, href: '/admin/glossary' },
  { title: 'Логи аудита', icon: Activity, href: '/admin/audit-log' },
];

export function AdminLayoutClientWrapper({ children }: { children: React.ReactNode }) {
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
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton asChild>
                  <a href={item.href} className="flex items-center gap-2">
                    <item.icon className="w-4 h-4" />
                    <span>{item.title}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
        </header>
        <main className="flex-1 p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
