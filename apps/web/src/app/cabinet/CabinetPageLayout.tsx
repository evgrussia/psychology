'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Container, Section } from '@psychology/design-system';

const navItems = [
  { href: '/cabinet', label: 'Обзор' },
  { href: '/cabinet/appointments', label: 'Встречи' },
  { href: '/cabinet/materials', label: 'Материалы' },
  { href: '/cabinet/diary', label: 'Дневники' },
  { href: '/cabinet/settings', label: 'Настройки' },
];

interface CabinetPageLayoutProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export function CabinetPageLayout({ title, description, children }: CabinetPageLayoutProps) {
  const pathname = usePathname();

  return (
    <Section>
      <Container className="max-w-5xl space-y-8">
        <header className="space-y-3">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">{title}</h1>
          {description ? (
            <p className="text-muted-foreground text-lg max-w-2xl">{description}</p>
          ) : null}
        </header>

        <nav className="flex flex-wrap gap-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border text-muted-foreground hover:text-foreground'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {children}
      </Container>
    </Section>
  );
}
