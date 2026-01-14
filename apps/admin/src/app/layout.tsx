import './globals.css';
import type { Metadata } from 'next';

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
    <html lang="ru">
      <body>
        <div className="admin-layout">
          <nav className="admin-nav">
            <div className="nav-logo">Admin</div>
            <ul>
              <li><a href="/admin">Дашборд</a></li>
              <li><a href="/admin/content">Контент</a></li>
              <li><a href="/admin/interactive/quizzes">Квизы</a></li>
              <li><a href="/admin/glossary">Словарь</a></li>
              <li><a href="/admin/audit-log">Логи аудита</a></li>
            </ul>
          </nav>
          <main className="admin-main">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
