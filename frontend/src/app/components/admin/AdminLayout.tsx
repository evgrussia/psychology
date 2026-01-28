/**
 * Layout админки: боковое меню, проверка роли (owner/assistant/editor).
 * При отсутствии доступа — редирект в кабинет или на главную.
 */

import { useEffect, useState } from 'react';
import { LayoutDashboard, Calendar, Users, FileText, MessageSquare, LogOut, Menu, X } from 'lucide-react';
import { getAdminMe } from '@/api/endpoints/admin';
import { Button } from '@/app/components/ui/button';
import { cn } from '@/app/components/ui/utils';

export type AdminSubPage = 'dashboard' | 'appointments' | 'leads' | 'content' | 'moderation';

interface AdminLayoutProps {
  subPage: AdminSubPage;
  onNavigate: (sub: AdminSubPage) => void;
  onExitAdmin: () => void;
  children: React.ReactNode;
}

const NAV_ITEMS: { id: AdminSubPage; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Дашборд', icon: LayoutDashboard },
  { id: 'appointments', label: 'Встречи', icon: Calendar },
  { id: 'leads', label: 'Лиды', icon: Users },
  { id: 'content', label: 'Контент', icon: FileText },
  { id: 'moderation', label: 'Модерация', icon: MessageSquare },
];

export default function AdminLayout({ subPage, onNavigate, onExitAdmin, children }: AdminLayoutProps) {
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    getAdminMe()
      .then(() => setAllowed(true))
      .catch(() => setAllowed(false));
  }, []);

  useEffect(() => {
    if (allowed === false) {
      onExitAdmin();
    }
  }, [allowed, onExitAdmin]);

  if (allowed === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#A8B5FF]/5">
        <div className="text-[#2D3748]">Проверка доступа…</div>
      </div>
    );
  }

  if (allowed === false) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white">
      {/* Sidebar */}
      <aside
        className={cn(
          'md:w-56 border-r border-gray-100 bg-white flex-shrink-0',
          'fixed md:static inset-y-0 left-0 z-40 transform transition-transform duration-200 ease-out',
          menuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between h-14 px-4 border-b border-gray-100">
            <span className="font-semibold text-[#2D3748]">Админ-панель</span>
            <button
              type="button"
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
              onClick={() => setMenuOpen(false)}
              aria-label="Закрыть меню"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => {
                  onNavigate(id);
                  setMenuOpen(false);
                }}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm font-medium transition-colors',
                  subPage === id
                    ? 'bg-[#A8B5FF]/15 text-[#A8B5FF]'
                    : 'text-[#2D3748] hover:bg-[#A8B5FF]/5'
                )}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {label}
              </button>
            ))}
          </nav>
          <div className="p-3 border-t border-gray-100">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-[#718096] hover:text-[#2D3748]"
              onClick={onExitAdmin}
            >
              <LogOut className="w-5 h-5" />
              Выйти из админки
            </Button>
          </div>
        </div>
      </aside>
      {/* Overlay on mobile when menu open */}
      {menuOpen && (
        <button
          type="button"
          className="fixed inset-0 bg-black/20 z-30 md:hidden"
          onClick={() => setMenuOpen(false)}
          aria-label="Закрыть"
        />
      )}
      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center h-14 px-4 border-b border-gray-100 md:px-6">
          <button
            type="button"
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 mr-2"
            onClick={() => setMenuOpen(true)}
            aria-label="Открыть меню"
          >
            <Menu className="w-5 h-5 text-[#2D3748]" />
          </button>
          <h1 className="text-lg font-semibold text-[#2D3748]">
            {NAV_ITEMS.find((i) => i.id === subPage)?.label ?? 'Админка'}
          </h1>
        </header>
        <main className="flex-1 p-4 md:p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
