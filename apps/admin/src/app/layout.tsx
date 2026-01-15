import './globals.css';
import '@psychology/design-system/styles.css';
import type { Metadata } from 'next';
import { ThemeProvider } from '@/components/theme-provider';
import { AdminLayoutClientWrapper } from '@/components/admin-layout-client-wrapper';

export const metadata: Metadata = {
  title: 'Эмоциональный баланс - Админ-панель',
  description: 'Управление контентом и системой',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <AdminLayoutClientWrapper>
            {children}
          </AdminLayoutClientWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}
