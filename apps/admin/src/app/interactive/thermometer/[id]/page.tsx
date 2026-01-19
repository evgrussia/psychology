'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { AdminAuthGuard } from '@/components/admin-auth-guard';
import { useAdminAuth } from '@/components/admin-auth-context';

type InteractiveStatus = 'draft' | 'published' | 'archived';

interface ThermometerDefinition {
  id: string;
  slug: string;
  title: string;
  topicCode: string | null;
  status: InteractiveStatus;
  config: any | null;
}

function safeStringify(value: unknown) {
  return JSON.stringify(value ?? {}, null, 2);
}

export default function EditThermometerPage() {
  const params = useParams();
  const id = params.id as string;
  const { user } = useAdminAuth();
  const canEdit = Boolean(user?.roles.some((role) => role === 'owner' || role === 'editor'));

  const [definition, setDefinition] = useState<ThermometerDefinition | null>(null);
  const [configText, setConfigText] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDefinition();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchDefinition = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/interactive/definitions/${id}`, {
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to fetch thermometer');
      }
      const data = await response.json();
      setDefinition(data);
      setConfigText(safeStringify(data.config));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const parsedConfig = useMemo(() => {
    try {
      return JSON.parse(configText || '{}');
    } catch {
      return null;
    }
  }, [configText]);

  const handleSave = async () => {
    if (!definition) return;
    if (!canEdit) {
      return;
    }
    setSaving(true);
    setError(null);
    try {
      if (!parsedConfig) {
        throw new Error('Конфиг не является валидным JSON.');
      }
      const response = await fetch(`/api/admin/interactive/definitions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: definition.title,
          topicCode: definition.topicCode,
          config: parsedConfig,
        }),
      });
      if (!response.ok) {
        const err = await response.json().catch(() => null);
        throw new Error(err?.message || 'Failed to save thermometer');
      }
      alert('Сохранено успешно');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!definition) return;
    if (!canEdit) {
      return;
    }
    setPublishing(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/interactive/definitions/${id}/publish`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!response.ok) {
        const err = await response.json().catch(() => null);
        throw new Error(err?.message || 'Failed to publish thermometer');
      }
      alert('Опубликовано успешно');
      await fetchDefinition();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setPublishing(false);
    }
  };

  return (
    <AdminAuthGuard allowedRoles={['owner', 'assistant', 'editor']}>
      {loading ? (
        <div className="p-8">Загрузка...</div>
      ) : error && !definition ? (
        <div className="p-8 text-red-500">Ошибка: {error}</div>
      ) : !definition ? (
        <div className="p-8">Термометр не найден</div>
      ) : (
        <div className="p-8 space-y-6">
          <div>
            <Link href="/interactive/thermometer" className="text-indigo-600 hover:text-indigo-900">
              ← Назад к списку
            </Link>
            <h1 className="text-2xl font-bold mt-4">Редактирование: {definition.title}</h1>
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
        {canEdit && definition.status !== 'published' && (
          <button
            onClick={handlePublish}
            disabled={publishing}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            {publishing ? 'Публикация...' : 'Опубликовать'}
          </button>
        )}
      </div>

      <div className="bg-white rounded-lg shadow p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Название</label>
          <input
            type="text"
            value={definition.title}
            onChange={(e) => setDefinition({ ...definition, title: e.target.value })}
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Тема (topicCode)</label>
          <input
            type="text"
            value={definition.topicCode || ''}
            onChange={(e) => setDefinition({ ...definition, topicCode: e.target.value || null })}
            className="w-full px-3 py-2 border rounded"
            placeholder="anxiety, burnout, ..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Config (JSON)</label>
          <textarea
            value={configText}
            onChange={(e) => setConfigText(e.target.value)}
            className="w-full font-mono text-xs px-3 py-2 border rounded"
            rows={24}
          />
          {!parsedConfig && (
            <div className="mt-2 text-sm text-red-600">JSON некорректен — сохранение невозможно.</div>
          )}
          <div className="mt-2 text-xs text-gray-500">
            Подсказка: config должен содержать `scales`, `thresholds`, `results`.
          </div>
        </div>
      </div>
        </div>
      )}
    </AdminAuthGuard>
  );
}

