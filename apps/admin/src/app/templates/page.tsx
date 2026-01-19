'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { AdminAuthGuard } from '@/components/admin-auth-guard';

interface TemplateItem {
  id: string;
  channel: string;
  category: string;
  name: string;
  status: string;
  language: string;
  active_version_id?: string | null;
  activated_at?: string | null;
  created_at: string;
}

const statusLabels: Record<string, string> = {
  draft: 'Черновик',
  active: 'Активен',
  archived: 'Архив',
};

const channelLabels: Record<string, string> = {
  email: 'Email',
  telegram: 'Telegram',
};

const categoryLabels: Record<string, string> = {
  booking: 'Запись',
  waitlist: 'Лист ожидания',
  event: 'Мероприятия',
  moderation: 'Модерация',
};

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<TemplateItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    channel: '',
    category: '',
    status: '',
    search: '',
  });

  const query = useMemo(() => {
    const params = new URLSearchParams();
    if (filters.channel) params.set('channel', filters.channel);
    if (filters.category) params.set('category', filters.category);
    if (filters.status) params.set('status', filters.status);
    if (filters.search) params.set('search', filters.search);
    return params.toString();
  }, [filters]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    fetch(`/api/admin/templates?${query}`, { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => {
        if (!active) return;
        setTemplates(data);
      })
      .catch((err) => {
        console.error(err);
        if (!active) return;
        setError('Не удалось загрузить шаблоны.');
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [query]);

  return (
    <AdminAuthGuard allowedRoles={['owner', 'assistant']}>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">Шаблоны сообщений</h1>
            <p className="text-sm text-muted-foreground">Email и Telegram уведомления по ключевым сценариям.</p>
          </div>
          <Link href="/templates/new" className="rounded-md bg-primary px-4 py-2 text-sm text-white">
            Создать шаблон
          </Link>
        </div>

        <div className="flex flex-wrap gap-3 rounded-lg border bg-white p-4 text-sm">
          <input
            className="w-full max-w-xs rounded-md border px-3 py-2"
            placeholder="Поиск по названию"
            value={filters.search}
            onChange={(event) => setFilters((prev) => ({ ...prev, search: event.target.value }))}
          />
          <select
            className="rounded-md border px-3 py-2"
            value={filters.channel}
            onChange={(event) => setFilters((prev) => ({ ...prev, channel: event.target.value }))}
          >
            <option value="">Все каналы</option>
            <option value="email">Email</option>
            <option value="telegram">Telegram</option>
          </select>
          <select
            className="rounded-md border px-3 py-2"
            value={filters.category}
            onChange={(event) => setFilters((prev) => ({ ...prev, category: event.target.value }))}
          >
            <option value="">Все категории</option>
            <option value="booking">Запись</option>
            <option value="waitlist">Лист ожидания</option>
            <option value="event">Мероприятия</option>
            <option value="moderation">Модерация</option>
          </select>
          <select
            className="rounded-md border px-3 py-2"
            value={filters.status}
            onChange={(event) => setFilters((prev) => ({ ...prev, status: event.target.value }))}
          >
            <option value="">Все статусы</option>
            <option value="draft">Черновик</option>
            <option value="active">Активен</option>
            <option value="archived">Архив</option>
          </select>
        </div>

        {loading ? (
          <div className="text-sm text-muted-foreground">Загрузка...</div>
        ) : error ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">{error}</div>
        ) : (
          <div className="overflow-hidden rounded-lg border bg-white">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Название</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Категория</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Канал</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Статус</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Активирован</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {templates.map((template) => (
                  <tr key={template.id}>
                    <td className="px-4 py-3 font-medium">{template.name}</td>
                    <td className="px-4 py-3">{categoryLabels[template.category] || template.category}</td>
                    <td className="px-4 py-3">{channelLabels[template.channel] || template.channel}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700">
                        {statusLabels[template.status] || template.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {template.activated_at ? new Date(template.activated_at).toLocaleString('ru-RU') : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/templates/${template.id}`} className="text-primary">
                        Открыть
                      </Link>
                    </td>
                  </tr>
                ))}
                {templates.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-sm text-gray-500">
                      Шаблоны не найдены
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminAuthGuard>
  );
}
