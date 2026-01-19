'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AdminAuthGuard } from '@/components/admin-auth-guard';

type EventFormat = 'online' | 'offline' | 'hybrid';
type EventStatus = 'draft' | 'published' | 'archived';

export default function CreateEventPage() {
  const router = useRouter();
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [form, setForm] = React.useState({
    slug: '',
    title: '',
    description_markdown: '',
    starts_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    ends_at: '',
    format: 'online' as EventFormat,
    location_text: '',
    status: 'draft' as EventStatus,
    capacity: '',
    registration_open: true,
  });

  const submit = async () => {
    setSaving(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          slug: form.slug.trim(),
          title: form.title.trim(),
          description_markdown: form.description_markdown,
          starts_at: form.starts_at,
          ends_at: form.ends_at.trim() ? form.ends_at : null,
          format: form.format,
          location_text: form.location_text.trim() || null,
          status: form.status,
          capacity: form.capacity === '' ? null : Number(form.capacity),
          registration_open: form.registration_open,
        }),
      });
      if (!response.ok) {
        const err = await response.json().catch(() => null);
        throw new Error(err?.message || 'Не удалось создать мероприятие');
      }
      router.push('/events');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminAuthGuard allowedRoles={['owner']}>
      <div className="p-8 space-y-6">
        <div>
          <Link href="/events" className="text-indigo-600 hover:text-indigo-900">
            ← Назад к списку
          </Link>
          <h1 className="text-2xl font-bold mt-4">Создать мероприятие</h1>
          {error && <div className="mt-2 text-red-500">{error}</div>}
        </div>

      <div className="bg-white rounded-lg shadow p-6 space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium mb-2">Slug</label>
            <input
              value={form.slug}
              onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
              className="w-full px-3 py-2 border rounded"
              placeholder="webinar-anxiety"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Название</label>
            <input
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              className="w-full px-3 py-2 border rounded"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Описание (Markdown)</label>
          <textarea
            value={form.description_markdown}
            onChange={(e) => setForm((p) => ({ ...p, description_markdown: e.target.value }))}
            className="w-full px-3 py-2 border rounded"
            rows={10}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium mb-2">Начало (ISO)</label>
            <input
              value={form.starts_at}
              onChange={(e) => setForm((p) => ({ ...p, starts_at: e.target.value }))}
              className="w-full px-3 py-2 border rounded font-mono text-xs"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Окончание (ISO, опционально)</label>
            <input
              value={form.ends_at}
              onChange={(e) => setForm((p) => ({ ...p, ends_at: e.target.value }))}
              className="w-full px-3 py-2 border rounded font-mono text-xs"
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <div>
            <label className="block text-sm font-medium mb-2">Формат</label>
            <select
              value={form.format}
              onChange={(e) => setForm((p) => ({ ...p, format: e.target.value as EventFormat }))}
              className="w-full px-3 py-2 border rounded"
            >
              <option value="online">online</option>
              <option value="offline">offline</option>
              <option value="hybrid">hybrid</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2">Локация (опционально)</label>
            <input
              value={form.location_text}
              onChange={(e) => setForm((p) => ({ ...p, location_text: e.target.value }))}
              className="w-full px-3 py-2 border rounded"
              placeholder="Zoom / Москва, ... "
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Статус</label>
            <select
              value={form.status}
              onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as EventStatus }))}
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
            <label className="block text-sm font-medium mb-2">Вместимость (опционально)</label>
            <input
              type="number"
              min={0}
              value={form.capacity}
              onChange={(e) => setForm((p) => ({ ...p, capacity: e.target.value }))}
              className="w-full px-3 py-2 border rounded"
              placeholder="например 30"
            />
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.registration_open}
                onChange={(e) => setForm((p) => ({ ...p, registration_open: e.target.checked }))}
              />
              Регистрация открыта
            </label>
          </div>
        </div>

        <button
          onClick={() => void submit()}
          disabled={saving}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? 'Создаём...' : 'Создать'}
        </button>
      </div>
      </div>
    </AdminAuthGuard>
  );
}

