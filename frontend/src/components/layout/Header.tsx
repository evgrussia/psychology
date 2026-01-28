'use client';

import Link from 'next/link';
import { Navigation } from './Navigation';

export function Header() {
  return (
    <header className="border-b bg-card sticky top-0 z-40 w-full">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-xl font-bold transition-colors hover:text-primary/90">
            Эмоциональный баланс
          </Link>
          <Navigation />
        </div>
      </div>
    </header>
  );
}

