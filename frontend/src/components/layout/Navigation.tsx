'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';

export function Navigation() {
  const pathname = usePathname();
  const { isAuthenticated } = useAuthStore();

  const navLinks = [
    { href: '/topics', label: 'С чем я помогаю' },
    { href: '/booking', label: 'Запись' },
  ];

  return (
    <nav className="flex items-center gap-4" aria-label="Основная навигация">
      {navLinks.map((link) => {
        const isActive = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              'transition-colors hover:text-primary',
              isActive ? 'text-primary font-medium' : 'text-muted-foreground'
            )}
            aria-current={isActive ? 'page' : undefined}
          >
            {link.label}
          </Link>
        );
      })}
      {isAuthenticated() ? (
        <Link
          href="/cabinet"
          className={cn(
            'transition-colors hover:text-primary',
            pathname === '/cabinet' ? 'text-primary font-medium' : 'text-muted-foreground'
          )}
          aria-current={pathname === '/cabinet' ? 'page' : undefined}
        >
          Личный кабинет
        </Link>
      ) : (
        <Button asChild variant="default" size="sm">
          <Link href="/login">Войти</Link>
        </Button>
      )}
    </nav>
  );
}

