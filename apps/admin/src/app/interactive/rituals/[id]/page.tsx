'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface RitualStep {
  id: string;
  title: string;
  content: string;
  durationSeconds?: number;
}

interface RitualConfig {
  why: string;
  steps: RitualStep[];
  totalDurationSeconds?: number;
  audioMediaAssetId?: string;
}

interface RitualDefinition {
  id: string;
  slug: string;
  title: string;
  topicCode: string | null;
  status: 'draft' | 'published' | 'archived';
  config: RitualConfig | null;
}

const createId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `tmp_${Date.now()}_${Math.random().toString(16).slice(2)}`;
};

export default function EditRitualPage() {
  const params = useParams();
  const id = params.id as string;

  const [definition, setDefinition] = useState<RitualDefinition | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewVersion, setPreviewVersion] = useState<'draft' | 'published'>('draft');
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [previewDefinition, setPreviewDefinition] = useState<RitualDefinition | null>(null);

  useEffect(() => {
    fetchDefinition();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (!showPreview) return;
    fetchPreview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showPreview, previewVersion, id]);

  const fetchDefinition = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/interactive/definitions/${id}`, {
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Не удалось загрузить ритуал');
      }
      const data = await response.json();
      setDefinition(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchPreview = async () => {
    setPreviewLoading(true);
    setPreviewError(null);
    try {
      const response = await fetch(
        `/api/admin/interactive/definitions/${id}/preview?version=${previewVersion}`,
        { credentials: 'include' },
      );
      if (!response.ok) {
        throw new Error(previewVersion === 'published'
          ? 'Опубликованная версия не найдена'
          : 'Не удалось загрузить черновик');
      }
      const data = await response.json();
      setPreviewDefinition(data);
    } catch (err: any) {
      setPreviewDefinition(null);
      setPreviewError(err.message);
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleSave = async () => {
    if (!definition) return;
    setSaving(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/interactive/definitions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: definition.title,
          topicCode: definition.topicCode,
          config: definition.config,
        }),
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Не удалось сохранить');
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
    setPublishing(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/interactive/definitions/${id}/publish`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Не удалось опубликовать');
      }
      alert('Опубликовано успешно');
      fetchDefinition();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setPublishing(false);
    }
  };

  const updateStep = (index: number, field: keyof RitualStep, value: any) => {
    if (!definition?.config) return;
    const steps = [...definition.config.steps];
    steps[index] = { ...steps[index], [field]: value };
    setDefinition({ ...definition, config: { ...definition.config, steps } });
  };

  const addStep = () => {
    if (!definition?.config) return;
    const steps = [...definition.config.steps, { id: createId(), title: '', content: '', durationSeconds: undefined }];
    setDefinition({ ...definition, config: { ...definition.config, steps } });
  };

  const removeStep = (index: number) => {
    if (!definition?.config) return;
    const steps = definition.config.steps.filter((_, idx) => idx !== index);
    setDefinition({ ...definition, config: { ...definition.config, steps } });
  };

  if (loading) return <div className="p-8">Загрузка...</div>;
  if (error && !definition) return <div className="p-8 text-red-500">Ошибка: {error}</div>;
  if (!definition) return <div className="p-8">Ритуал не найден</div>;

  return (
    <div className="p-8">
      <div className="mb-6">
        <Link href="/interactive/rituals" className="text-blue-600">← Назад к списку</Link>
        <h1 className="text-2xl font-bold mt-4">Редактирование: {definition.title}</h1>
        {error && <div className="mt-2 text-red-500">{error}</div>}
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? 'Сохранение...' : 'Сохранить'}
        </button>
        {definition.status !== 'published' && (
          <button
            onClick={handlePublish}
            disabled={publishing}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            {publishing ? 'Публикация...' : 'Опубликовать'}
          </button>
        )}
        <button
          onClick={() => setShowPreview(!showPreview)}
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          {showPreview ? 'Скрыть превью' : 'Показать превью'}
        </button>
      </div>

      {showPreview && (
        <div className="mb-8 p-4 bg-gray-50 rounded border">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h2 className="text-xl font-bold">Превью ритуала</h2>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Версия:</span>
              <select
                value={previewVersion}
                onChange={(event) => setPreviewVersion(event.target.value as 'draft' | 'published')}
                className="rounded border px-2 py-1"
              >
                <option value="draft">Черновик</option>
                <option value="published">Опубликовано</option>
              </select>
            </div>
          </div>
          {previewLoading && <div className="text-sm text-muted-foreground">Загрузка превью...</div>}
          {previewError && <div className="text-sm text-red-500">{previewError}</div>}
          {previewDefinition?.config && (
            <div className="bg-white p-6 rounded space-y-4">
              <h3 className="text-lg font-semibold">{previewDefinition.title}</h3>
              <p className="text-sm text-gray-700 whitespace-pre-line">{previewDefinition.config.why}</p>
              <div>
                <h4 className="font-semibold mb-2">Шаги</h4>
                <ol className="list-decimal list-inside text-sm text-gray-700 space-y-2">
                  {previewDefinition.config.steps.map((step) => (
                    <li key={step.id}>
                      <div className="font-medium">{step.title}</div>
                      <div className="whitespace-pre-line text-gray-600">{step.content}</div>
                    </li>
                  ))}
                </ol>
              </div>
              {previewDefinition.config.audioMediaAssetId && (
                <div className="text-sm text-gray-600">
                  Аудио: {previewDefinition.config.audioMediaAssetId}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Название</label>
          <input
            type="text"
            value={definition.title}
            onChange={(event) => setDefinition({ ...definition, title: event.target.value })}
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Тема (код)</label>
          <input
            type="text"
            value={definition.topicCode || ''}
            onChange={(event) => setDefinition({ ...definition, topicCode: event.target.value || null })}
            className="w-full px-3 py-2 border rounded"
            placeholder="anxiety, stress, etc."
          />
        </div>

        {definition.config && (
          <>
            <div>
              <label className="block text-sm font-medium mb-2">Зачем</label>
              <textarea
                value={definition.config.why}
                onChange={(event) => setDefinition({
                  ...definition,
                  config: { ...definition.config, why: event.target.value },
                })}
                className="w-full px-3 py-2 border rounded"
                rows={3}
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium mb-2">Общая длительность (сек)</label>
                <input
                  type="number"
                  value={definition.config.totalDurationSeconds ?? ''}
                  onChange={(event) => setDefinition({
                    ...definition,
                    config: {
                      ...definition.config,
                      totalDurationSeconds: event.target.value ? Number(event.target.value) : undefined,
                    },
                  })}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">ID аудио (MediaAsset)</label>
                <input
                  type="text"
                  value={definition.config.audioMediaAssetId || ''}
                  onChange={(event) => setDefinition({
                    ...definition,
                    config: {
                      ...definition.config,
                      audioMediaAssetId: event.target.value || undefined,
                    },
                  })}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xl font-bold">Шаги</h2>
                <button onClick={addStep} className="text-sm text-blue-600">Добавить шаг</button>
              </div>
              <div className="space-y-4">
                {definition.config.steps.map((step, index) => (
                  <div key={step.id} className="rounded border p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Шаг {index + 1}</span>
                      <button
                        type="button"
                        onClick={() => removeStep(index)}
                        className="text-xs text-red-500"
                      >
                        Удалить
                      </button>
                    </div>
                    <div className="mt-3 grid gap-3 md:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium mb-1">Заголовок</label>
                        <input
                          type="text"
                          value={step.title}
                          onChange={(event) => updateStep(index, 'title', event.target.value)}
                          className="w-full px-3 py-2 border rounded"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Длительность (сек)</label>
                        <input
                          type="number"
                          value={step.durationSeconds ?? ''}
                          onChange={(event) => updateStep(
                            index,
                            'durationSeconds',
                            event.target.value ? Number(event.target.value) : undefined,
                          )}
                          className="w-full px-3 py-2 border rounded"
                        />
                      </div>
                    </div>
                    <div className="mt-3">
                      <label className="block text-sm font-medium mb-1">Инструкция</label>
                      <textarea
                        value={step.content}
                        onChange={(event) => updateStep(index, 'content', event.target.value)}
                        className="w-full px-3 py-2 border rounded"
                        rows={3}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
