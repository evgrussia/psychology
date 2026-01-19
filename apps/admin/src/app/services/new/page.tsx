'use client';

import { useRouter } from 'next/navigation';
import React from 'react';
import Link from 'next/link';
import { AdminAuthGuard } from '@/components/admin-auth-guard';

type ServiceFormat = 'online' | 'offline' | 'hybrid';
type ServiceStatus = 'draft' | 'published' | 'archived';

export default function CreateServicePage() {
  const router = useRouter();
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [form, setForm] = React.useState({
    slug: '',
    title: '',
    descriptionMarkdown: '',
    format: 'online' as ServiceFormat,
    offlineAddress: '',
    durationMinutes: 50,
    priceAmount: 0,
    depositAmount: '',
    cancelFreeHours: '',
    cancelPartialHours: '',
    rescheduleMinHours: '',
    rescheduleMaxCount: '',
    status: 'draft' as ServiceStatus,
    topicCode: '',
  });

  const handleSubmit = async () => {
    setSaving(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          slug: form.slug.trim(),
          title: form.title.trim(),
          descriptionMarkdown: form.descriptionMarkdown,
          format: form.format,
          offlineAddress: form.format === 'offline' ? (form.offlineAddress.trim() || null) : null,
          durationMinutes: Number(form.durationMinutes),
          priceAmount: Number(form.priceAmount),
          depositAmount: form.depositAmount === '' ? null : Number(form.depositAmount),
          cancelFreeHours: form.cancelFreeHours === '' ? null : Number(form.cancelFreeHours),
          cancelPartialHours: form.cancelPartialHours === '' ? null : Number(form.cancelPartialHours),
          rescheduleMinHours: form.rescheduleMinHours === '' ? null : Number(form.rescheduleMinHours),
          rescheduleMaxCount: form.rescheduleMaxCount === '' ? null : Number(form.rescheduleMaxCount),
          status: form.status,
          topicCode: form.topicCode.trim() || null,
        }),
      });
      if (!response.ok) {
        const err = await response.json().catch(() => null);
        throw new Error(err?.message || 'Не удалось создать услугу');
      }
      router.push('/services');
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
          <Link href="/services" className="text-indigo-600 hover:text-indigo-900">
            ← Назад к списку
          </Link>
          <h1 className="text-2xl font-bold mt-4">Создать услугу</h1>
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
              placeholder="primary_consultation"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Название</label>
            <input
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              className="w-full px-3 py-2 border rounded"
              placeholder="Первичная консультация"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Описание (Markdown)</label>
          <textarea
            value={form.descriptionMarkdown}
            onChange={(e) => setForm((p) => ({ ...p, descriptionMarkdown: e.target.value }))}
            className="w-full px-3 py-2 border rounded"
            rows={8}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="block text-sm font-medium mb-2">Формат</label>
            <select
              value={form.format}
              onChange={(e) => setForm((p) => ({ ...p, format: e.target.value as ServiceFormat }))}
              className="w-full px-3 py-2 border rounded"
            >
              <option value="online">online</option>
              <option value="offline">offline</option>
              <option value="hybrid">hybrid</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Длительность (мин)</label>
            <input
              type="number"
              min={10}
              value={form.durationMinutes}
              onChange={(e) => setForm((p) => ({ ...p, durationMinutes: Number(e.target.value) }))}
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Статус</label>
            <select
              value={form.status}
              onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as ServiceStatus }))}
              className="w-full px-3 py-2 border rounded"
            >
              <option value="draft">draft</option>
              <option value="published">published</option>
              <option value="archived">archived</option>
            </select>
          </div>
        </div>

        {form.format === 'offline' && (
          <div>
            <label className="block text-sm font-medium mb-2">Адрес (для офлайн)</label>
            <input
              value={form.offlineAddress}
              onChange={(e) => setForm((p) => ({ ...p, offlineAddress: e.target.value }))}
              className="w-full px-3 py-2 border rounded"
            />
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="block text-sm font-medium mb-2">Цена (₽)</label>
            <input
              type="number"
              min={0}
              value={form.priceAmount}
              onChange={(e) => setForm((p) => ({ ...p, priceAmount: Number(e.target.value) }))}
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Депозит (₽, опционально)</label>
            <input
              type="number"
              min={0}
              value={form.depositAmount}
              onChange={(e) => setForm((p) => ({ ...p, depositAmount: e.target.value }))}
              className="w-full px-3 py-2 border rounded"
              placeholder="например 1000"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Тема (topicCode)</label>
            <input
              value={form.topicCode}
              onChange={(e) => setForm((p) => ({ ...p, topicCode: e.target.value }))}
              className="w-full px-3 py-2 border rounded"
              placeholder="anxiety"
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <div>
            <label className="block text-sm font-medium mb-2">Отмена без штрафа (ч)</label>
            <input
              type="number"
              min={0}
              value={form.cancelFreeHours}
              onChange={(e) => setForm((p) => ({ ...p, cancelFreeHours: e.target.value }))}
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Отмена с частичным штрафом (ч)</label>
            <input
              type="number"
              min={0}
              value={form.cancelPartialHours}
              onChange={(e) => setForm((p) => ({ ...p, cancelPartialHours: e.target.value }))}
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Перенос минимум (ч)</label>
            <input
              type="number"
              min={0}
              value={form.rescheduleMinHours}
              onChange={(e) => setForm((p) => ({ ...p, rescheduleMinHours: e.target.value }))}
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Перенос максимум (раз)</label>
            <input
              type="number"
              min={0}
              value={form.rescheduleMaxCount}
              onChange={(e) => setForm((p) => ({ ...p, rescheduleMaxCount: e.target.value }))}
              className="w-full px-3 py-2 border rounded"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Создаём...' : 'Создать'}
          </button>
        </div>
      </div>
      </div>
    </AdminAuthGuard>
  );
}

