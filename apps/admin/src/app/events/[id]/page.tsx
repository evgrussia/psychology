'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { AdminAuthGuard } from '@/components/admin-auth-guard';
import { useAdminAuth } from '@/components/admin-auth-context';

type EventFormat = 'online' | 'offline' | 'hybrid';
type EventStatus = 'draft' | 'published' | 'archived';

interface EventModel {
  id: string;
  slug: string;
  title: string;
  description_markdown: string;
  starts_at: string;
  ends_at: string | null;
  format: EventFormat;
  location_text: string | null;
  status: EventStatus;
  capacity: number | null;
  registration_open: boolean;
  published_at: string | null;
}

interface RegistrationModel {
  id: string;
  preferred_contact: string;
  submitted_at: string;
  consent_personal_data: boolean;
  consent_communications: boolean;
}

export default function EditEventPage() {
  const params = useParams();
  const id = params.id as string;
  const { user } = useAdminAuth();
  const canEdit = Boolean(user?.roles.includes('owner'));

  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [publishing, setPublishing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [event, setEvent] = React.useState<EventModel | null>(null);
  const [registrations, setRegistrations] = React.useState<RegistrationModel[]>([]);
  const [registrationsLoading, setRegistrationsLoading] = React.useState(false);

  React.useEffect(() => {
    void load();
    void loadRegistrations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/events/${id}`, { credentials: 'include' });
      if (!response.ok) throw new Error('Не удалось загрузить мероприятие');
      const data = await response.json();
      setEvent(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadRegistrations = async () => {
    setRegistrationsLoading(true);
    try {
      const response = await fetch(`/api/admin/events/${id}/registrations`, { credentials: 'include' });
      if (!response.ok) throw new Error('Не удалось загрузить регистрации');
      const data = await response.json();
      setRegistrations(data);
    } catch {
      // silently ignore (registrations can be empty)
    } finally {
      setRegistrationsLoading(false);
    }
  };

  const save = async () => {
    if (!event) return;
    if (!canEdit) {
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/events/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          slug: event.slug,
          title: event.title,
          description_markdown: event.description_markdown,
          starts_at: event.starts_at,
          ends_at: event.ends_at,
          format: event.format,
          location_text: event.location_text,
          status: event.status,
          capacity: event.capacity,
          registration_open: event.registration_open,
        }),
      });
      if (!response.ok) {
        const err = await response.json().catch(() => null);
        throw new Error(err?.message || 'Не удалось сохранить');
      }
      alert('Сохранено');
      await load();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const publish = async () => {
    if (!canEdit) {
      return;
    }
    setPublishing(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/events/${id}/publish`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!response.ok) {
        const err = await response.json().catch(() => null);
        throw new Error(err?.message || 'Не удалось опубликовать');
      }
      alert('Опубликовано');
      await load();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setPublishing(false);
    }
  };

  return (
    <AdminAuthGuard allowedRoles={['owner', 'editor']}>
      {loading ? (
        <div className="p-8">Загрузка...</div>
      ) : error && !event ? (
        <div className="p-8 text-red-500">Ошибка: {error}</div>
      ) : !event ? (
        <div className="p-8">Мероприятие не найдено</div>
      ) : (
        <div className="p-8 space-y-6">
          <div>
            <Link href="/events" className="text-indigo-600 hover:text-indigo-900">
              ← Назад к списку
            </Link>
            <h1 className="text-2xl font-bold mt-4">Редактирование мероприятия</h1>
            {error && <div className="mt-2 text-red-500">{error}</div>}
          </div>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => void save()}
          disabled={!canEdit || saving}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? 'Сохранение...' : 'Сохранить'}
        </button>
        {canEdit && event.status !== 'published' && (
          <button
            onClick={() => void publish()}
            disabled={publishing}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            {publishing ? 'Публикация...' : 'Опубликовать'}
          </button>
        )}
        <a
          href={`/events/${event.slug}`}
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          target="_blank"
          rel="noreferrer"
        >
          Публичная страница
        </a>
      </div>

      <div className="bg-white rounded-lg shadow p-6 space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium mb-2">Slug</label>
            <input
              value={event.slug}
              onChange={(e) => setEvent({ ...event, slug: e.target.value })}
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Название</label>
            <input
              value={event.title}
              onChange={(e) => setEvent({ ...event, title: e.target.value })}
              className="w-full px-3 py-2 border rounded"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Описание (Markdown)</label>
          <textarea
            value={event.description_markdown}
            onChange={(e) => setEvent({ ...event, description_markdown: e.target.value })}
            className="w-full px-3 py-2 border rounded"
            rows={10}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium mb-2">Начало (ISO)</label>
            <input
              value={event.starts_at}
              onChange={(e) => setEvent({ ...event, starts_at: e.target.value })}
              className="w-full px-3 py-2 border rounded font-mono text-xs"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Окончание (ISO)</label>
            <input
              value={event.ends_at || ''}
              onChange={(e) => setEvent({ ...event, ends_at: e.target.value || null })}
              className="w-full px-3 py-2 border rounded font-mono text-xs"
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <div>
            <label className="block text-sm font-medium mb-2">Формат</label>
            <select
              value={event.format}
              onChange={(e) => setEvent({ ...event, format: e.target.value as EventFormat })}
              className="w-full px-3 py-2 border rounded"
            >
              <option value="online">online</option>
              <option value="offline">offline</option>
              <option value="hybrid">hybrid</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2">Локация</label>
            <input
              value={event.location_text || ''}
              onChange={(e) => setEvent({ ...event, location_text: e.target.value || null })}
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Статус</label>
            <select
              value={event.status}
              onChange={(e) => setEvent({ ...event, status: e.target.value as EventStatus })}
              className="w-full px-3 py-2 border rounded"
            >
              <option value="draft">draft</option>
              <option value="published">published</option>
              <option value="archived">archived</option>
            </select>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="block text-sm font-medium mb-2">Вместимость</label>
            <input
              type="number"
              min={0}
              value={event.capacity ?? ''}
              onChange={(e) => setEvent({ ...event, capacity: e.target.value === '' ? null : Number(e.target.value) })}
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={event.registration_open}
                onChange={(e) => setEvent({ ...event, registration_open: e.target.checked })}
              />
              Регистрация открыта
            </label>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Регистрации</h2>
          <button onClick={() => void loadRegistrations()} className="text-sm text-indigo-600 hover:text-indigo-900">
            Обновить
          </button>
        </div>
        {registrationsLoading ? (
          <div className="text-sm text-gray-500">Загрузка...</div>
        ) : registrations.length === 0 ? (
          <div className="text-sm text-gray-500">Пока нет регистраций</div>
        ) : (
          <div className="overflow-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Контакт</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Дата</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Согласия</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {registrations.map((r) => (
                  <tr key={r.id}>
                    <td className="px-4 py-2 text-xs font-mono">{r.id}</td>
                    <td className="px-4 py-2 text-sm text-gray-600">{r.preferred_contact}</td>
                    <td className="px-4 py-2 text-sm text-gray-600">{new Date(r.submitted_at).toLocaleString('ru-RU')}</td>
                    <td className="px-4 py-2 text-sm text-gray-600">
                      PD: {r.consent_personal_data ? 'yes' : 'no'}, COM: {r.consent_communications ? 'yes' : 'no'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
        </div>
      )}
    </AdminAuthGuard>
  );
}

