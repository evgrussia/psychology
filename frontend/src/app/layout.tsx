import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { SkipLink } from '@/components/layout/SkipLink';
import { Providers } from './providers';
import '../styles/globals.css';

const inter = Inter({ subsets: ['latin', 'cyrillic'] });

export const metadata: Metadata = {
  title: 'Эмоциональный баланс — Психологическая помощь онлайн',
  description: 'Первый шаг к эмоциональному балансу. Интерактивные инструменты, консультации, ресурсы.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" className={inter.className}>
      <body className="flex flex-col min-h-screen">
        <SkipLink />
        <Providers>
          <main id="main-content" className="flex-1">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
