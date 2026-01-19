'use client';

import { useParams, useRouter } from 'next/navigation';
import React from 'react';
import Link from 'next/link';
import { AdminAuthGuard } from '@/components/admin-auth-guard';
import { useAdminAuth } from '@/components/admin-auth-context';

type ServiceFormat = 'online' | 'offline' | 'hybrid';
type ServiceStatus = 'draft' | 'published' | 'archived';

interface ServiceModel {
  id: string;
  slug: string;
  title: string;
  descriptionMarkdown: string;
  format: ServiceFormat;
  offlineAddress: string | null;
  durationMinutes: number;
  priceAmount: number;
  depositAmount: number | null;
  cancelFreeHours: number | null;
  cancelPartialHours: number | null;
  rescheduleMinHours: number | null;
  rescheduleMaxCount: number | null;
  status: ServiceStatus;
  topicCode: string | null;
}

export default function EditServicePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { user } = useAdminAuth();
  const canEdit = Boolean(user?.roles.includes('owner'));

  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [publishing, setPublishing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [service, setService] = React.useState<ServiceModel | null>(null);

  React.useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/services/${id}`, { credentials: 'include' });
      if (!response.ok) throw new Error('Не удалось загрузить услугу');
      const data = await response.json();
      setService(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!service) return;
    if (!canEdit) {
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/services/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          slug: service.slug,
          title: service.title,
          descriptionMarkdown: service.descriptionMarkdown,
          format: service.format,
          offlineAddress: service.format === 'offline' ? (service.offlineAddress || null) : null,
          durationMinutes: service.durationMinutes,
          priceAmount: service.priceAmount,
          depositAmount: service.depositAmount,
          cancelFreeHours: service.cancelFreeHours,
          cancelPartialHours: service.cancelPartialHours,
          rescheduleMinHours: service.rescheduleMinHours,
          rescheduleMaxCount: service.rescheduleMaxCount,
          status: service.status,
          topicCode: service.topicCode,
        }),
      });
      if (!response.ok) {
        const err = await response.json().catch(() => null);
        throw new Error(err?.message || 'Не удалось сохранить услугу');
      }
      alert('Сохранено');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!canEdit) {
      return;
    }
    setPublishing(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/services/${id}/publish`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!response.ok) {
        const err = await response.json().catch(() => null);
        throw new Error(err?.message || 'Не удалось опубликовать услугу');
      }
      await load();
      alert('Опубликовано');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setPublishing(false);
    }
  };

  return (
    <AdminAuthGuard allowedRoles={['owner', 'assistant']}>
      {loading ? (
        <div className="p-8">Загрузка...</div>
      ) : error && !service ? (
        <div className="p-8 text-red-500">Ошибка: {error}</div>
      ) : !service ? (
        <div className="p-8">Услуга не найдена</div>
      ) : (
        <div className="p-8 space-y-6">
          <div>
            <Link href="/services" className="text-indigo-600 hover:text-indigo-900">
              ← Назад к списку
            </Link>
            <h1 className="text-2xl font-bold mt-4">Редактирование услуги</h1>
            {error && <div className="mt-2 text-red-500">{error}</div>}
          </div>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleSave}
          disabled={!canEdit || saving}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? 'Сохранение...' : 'Сохранить'}
        </button>
        {canEdit && service.status !== 'published' && (
          <button
            onClick={handlePublish}
            disabled={publishing}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            {publishing ? 'Публикация...' : 'Опубликовать'}
          </button>
        )}
        <button
          onClick={() => router.push(`/services/${service.id}`)}
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          Обновить
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-6 space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium mb-2">Slug</label>
            <input
              value={service.slug}
              onChange={(e) => setService({ ...service, slug: e.target.value })}
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Название</label>
            <input
              value={service.title}
              onChange={(e) => setService({ ...service, title: e.target.value })}
              className="w-full px-3 py-2 border rounded"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Описание (Markdown)</label>
          <textarea
            value={service.descriptionMarkdown}
            onChange={(e) => setService({ ...service, descriptionMarkdown: e.target.value })}
            className="w-full px-3 py-2 border rounded"
            rows={8}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="block text-sm font-medium mb-2">Формат</label>
            <select
              value={service.format}
              onChange={(e) => setService({ ...service, format: e.target.value as ServiceFormat })}
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
              value={service.durationMinutes}
              onChange={(e) => setService({ ...service, durationMinutes: Number(e.target.value) })}
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Статус</label>
            <select
              value={service.status}
              onChange={(e) => setService({ ...service, status: e.target.value as ServiceStatus })}
              className="w-full px-3 py-2 border rounded"
            >
              <option value="draft">draft</option>
              <option value="published">published</option>
              <option value="archived">archived</option>
            </select>
          </div>
        </div>

        {service.format === 'offline' && (
          <div>
            <label className="block text-sm font-medium mb-2">Адрес (офлайн)</label>
            <input
              value={service.offlineAddress || ''}
              onChange={(e) => setService({ ...service, offlineAddress: e.target.value })}
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
              value={service.priceAmount}
              onChange={(e) => setService({ ...service, priceAmount: Number(e.target.value) })}
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Депозит (₽)</label>
            <input
              type="number"
              min={0}
              value={service.depositAmount ?? ''}
              onChange={(e) =>
                setService({ ...service, depositAmount: e.target.value === '' ? null : Number(e.target.value) })
              }
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Тема (topicCode)</label>
            <input
              value={service.topicCode || ''}
              onChange={(e) => setService({ ...service, topicCode: e.target.value || null })}
              className="w-full px-3 py-2 border rounded"
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <div>
            <label className="block text-sm font-medium mb-2">Отмена без штрафа (ч)</label>
            <input
              type="number"
              min={0}
              value={service.cancelFreeHours ?? ''}
              onChange={(e) =>
                setService({ ...service, cancelFreeHours: e.target.value === '' ? null : Number(e.target.value) })
              }
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Отмена с частичным штрафом (ч)</label>
            <input
              type="number"
              min={0}
              value={service.cancelPartialHours ?? ''}
              onChange={(e) =>
                setService({ ...service, cancelPartialHours: e.target.value === '' ? null : Number(e.target.value) })
              }
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Перенос минимум (ч)</label>
            <input
              type="number"
              min={0}
              value={service.rescheduleMinHours ?? ''}
              onChange={(e) =>
                setService({ ...service, rescheduleMinHours: e.target.value === '' ? null : Number(e.target.value) })
              }
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Перенос максимум (раз)</label>
            <input
              type="number"
              min={0}
              value={service.rescheduleMaxCount ?? ''}
              onChange={(e) =>
                setService({ ...service, rescheduleMaxCount: e.target.value === '' ? null : Number(e.target.value) })
              }
              className="w-full px-3 py-2 border rounded"
            />
          </div>
        </div>
      </div>
        </div>
      )}
    </AdminAuthGuard>
  );
}

