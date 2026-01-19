'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AdminAuthGuard } from '@/components/admin-auth-guard';
import { useAdminAuth } from '@/components/admin-auth-context';

interface EventListItem {
  id: string;
  slug: string;
  title: string;
  status: 'draft' | 'published' | 'archived';
  starts_at: string;
  ends_at: string | null;
  format: 'online' | 'offline' | 'hybrid';
  location_text: string | null;
  capacity: number | null;
  registration_open: boolean;
  published_at: string | null;
}

export default function EventsPage() {
  const { user } = useAdminAuth();
  const canEdit = Boolean(user?.roles.includes('owner'));
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<EventListItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/events', { credentials: 'include' });
      if (!response.ok) {
        throw new Error('Не удалось загрузить мероприятия');
      }
      const data = await response.json();
      setItems(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminAuthGuard allowedRoles={['owner', 'editor']}>
      {loading ? (
        <div className="p-8">Загрузка...</div>
      ) : error ? (
        <div className="p-8 text-red-500">Ошибка: {error}</div>
      ) : (
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">Мероприятия</h1>
              <p className="text-sm text-gray-500">Создание, публикация и просмотр регистраций.</p>
            </div>
            {canEdit && (
              <Link href="/events/new" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                Создать мероприятие
              </Link>
            )}
          </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Название</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Дата</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Статус</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Регистрация</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Действия</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {items.map((event) => (
              <tr key={event.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{event.title}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(event.starts_at).toLocaleString('ru-RU')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      event.status === 'published'
                        ? 'bg-green-100 text-green-800'
                        : event.status === 'draft'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {event.status === 'published' ? 'Опубликовано' : event.status === 'draft' ? 'Черновик' : 'Архив'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {event.registration_open ? 'открыта' : 'закрыта'}
                  {event.capacity !== null ? ` · cap=${event.capacity}` : ''}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <Link href={`/events/${event.id}`} className="text-indigo-600 hover:text-indigo-900">
                    Редактировать
                  </Link>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                  Мероприятий пока нет
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
        </div>
      )}
    </AdminAuthGuard>
  );
}
