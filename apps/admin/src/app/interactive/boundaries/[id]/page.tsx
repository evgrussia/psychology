'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface BoundaryScriptVariant {
  variant_id: string;
  text: string;
}

interface BoundaryScriptScenario {
  id: string;
  name: string;
  description?: string;
  is_unsafe?: boolean;
}

interface BoundaryScriptTone {
  id: string;
  name: string;
}

interface BoundaryScriptGoal {
  id: string;
  name: string;
}

interface BoundaryScriptMatrixItem {
  scenario_id: string;
  tone_id: string;
  goal_id: string;
  variants: BoundaryScriptVariant[];
}

interface BoundariesConfig {
  scenarios: BoundaryScriptScenario[];
  tones: BoundaryScriptTone[];
  goals: BoundaryScriptGoal[];
  matrix: BoundaryScriptMatrixItem[];
  safety_block: {
    text: string;
  };
}

interface BoundariesDefinition {
  id: string;
  slug: string;
  title: string;
  topicCode: string | null;
  status: 'draft' | 'published' | 'archived';
  config: BoundariesConfig | null;
}

const createId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `tmp_${Date.now()}_${Math.random().toString(16).slice(2)}`;
};

export default function EditBoundariesPage() {
  const params = useParams();
  const id = params.id as string;

  const [definition, setDefinition] = useState<BoundariesDefinition | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewVersion, setPreviewVersion] = useState<'draft' | 'published'>('draft');
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [previewDefinition, setPreviewDefinition] = useState<BoundariesDefinition | null>(null);

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
        throw new Error('Не удалось загрузить интерактив');
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

  const updateScenario = (index: number, field: keyof BoundaryScriptScenario, value: any) => {
    if (!definition?.config) return;
    const scenarios = [...definition.config.scenarios];
    scenarios[index] = { ...scenarios[index], [field]: value };
    setDefinition({ ...definition, config: { ...definition.config, scenarios } });
  };

  const updateTone = (index: number, value: string) => {
    if (!definition?.config) return;
    const tones = [...definition.config.tones];
    tones[index] = { ...tones[index], name: value };
    setDefinition({ ...definition, config: { ...definition.config, tones } });
  };

  const updateGoal = (index: number, value: string) => {
    if (!definition?.config) return;
    const goals = [...definition.config.goals];
    goals[index] = { ...goals[index], name: value };
    setDefinition({ ...definition, config: { ...definition.config, goals } });
  };

  const updateMatrixItem = (index: number, field: keyof BoundaryScriptMatrixItem, value: any) => {
    if (!definition?.config) return;
    const matrix = [...definition.config.matrix];
    matrix[index] = { ...matrix[index], [field]: value };
    setDefinition({ ...definition, config: { ...definition.config, matrix } });
  };

  const updateVariant = (matrixIndex: number, variantIndex: number, field: keyof BoundaryScriptVariant, value: any) => {
    if (!definition?.config) return;
    const matrix = [...definition.config.matrix];
    const variants = [...matrix[matrixIndex].variants];
    variants[variantIndex] = { ...variants[variantIndex], [field]: value };
    matrix[matrixIndex] = { ...matrix[matrixIndex], variants };
    setDefinition({ ...definition, config: { ...definition.config, matrix } });
  };

  const addScenario = () => {
    if (!definition?.config) return;
    const scenarios = [...definition.config.scenarios, { id: createId(), name: '', description: '', is_unsafe: false }];
    setDefinition({ ...definition, config: { ...definition.config, scenarios } });
  };

  const addTone = () => {
    if (!definition?.config) return;
    const tones = [...definition.config.tones, { id: createId(), name: '' }];
    setDefinition({ ...definition, config: { ...definition.config, tones } });
  };

  const addGoal = () => {
    if (!definition?.config) return;
    const goals = [...definition.config.goals, { id: createId(), name: '' }];
    setDefinition({ ...definition, config: { ...definition.config, goals } });
  };

  const addMatrixItem = () => {
    if (!definition?.config) return;
    const scenarioId = definition.config.scenarios[0]?.id;
    const toneId = definition.config.tones[0]?.id;
    const goalId = definition.config.goals[0]?.id;
    if (!scenarioId || !toneId || !goalId) return;
    const matrix = [
      ...definition.config.matrix,
      {
        scenario_id: scenarioId,
        tone_id: toneId,
        goal_id: goalId,
        variants: [{ variant_id: createId(), text: '' }],
      },
    ];
    setDefinition({ ...definition, config: { ...definition.config, matrix } });
  };

  const addVariant = (matrixIndex: number) => {
    if (!definition?.config) return;
    const matrix = [...definition.config.matrix];
    const variants = [...matrix[matrixIndex].variants, { variant_id: createId(), text: '' }];
    matrix[matrixIndex] = { ...matrix[matrixIndex], variants };
    setDefinition({ ...definition, config: { ...definition.config, matrix } });
  };

  const removeVariant = (matrixIndex: number, variantIndex: number) => {
    if (!definition?.config) return;
    const matrix = [...definition.config.matrix];
    const variants = matrix[matrixIndex].variants.filter((_, idx) => idx !== variantIndex);
    matrix[matrixIndex] = { ...matrix[matrixIndex], variants };
    setDefinition({ ...definition, config: { ...definition.config, matrix } });
  };

  if (loading) return <div className="p-8">Загрузка...</div>;
  if (error && !definition) return <div className="p-8 text-red-500">Ошибка: {error}</div>;
  if (!definition) return <div className="p-8">Интерактив не найден</div>;

  return (
    <div className="p-8">
      <div className="mb-6">
        <Link href="/interactive/boundaries" className="text-blue-600">← Назад к списку</Link>
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
            <h2 className="text-xl font-bold">Превью скриптов</h2>
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
              <div>
                <h4 className="font-semibold mb-2">Сценарии</h4>
                <ul className="text-sm text-gray-700 list-disc list-inside">
                  {previewDefinition.config.scenarios.map((scenario) => (
                    <li key={scenario.id}>{scenario.name}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Матрица</h4>
                <div className="space-y-3 text-sm">
                  {previewDefinition.config.matrix.map((item, idx) => (
                    <div key={idx} className="rounded border p-3">
                      <div className="font-medium">
                        {previewDefinition.config.scenarios.find((s) => s.id === item.scenario_id)?.name || item.scenario_id} ·{' '}
                        {previewDefinition.config.tones.find((t) => t.id === item.tone_id)?.name || item.tone_id} ·{' '}
                        {previewDefinition.config.goals.find((g) => g.id === item.goal_id)?.name || item.goal_id}
                      </div>
                      <ul className="mt-2 list-disc list-inside text-gray-600">
                        {item.variants.map((variant) => (
                          <li key={variant.variant_id}>{variant.text}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Блок безопасности</h4>
                <p className="text-sm text-gray-700 whitespace-pre-line">{previewDefinition.config.safety_block.text}</p>
              </div>
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
            placeholder="boundaries, relationships, etc."
          />
        </div>

        {definition.config && (
          <>
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xl font-bold">Сценарии</h2>
                <button onClick={addScenario} className="text-sm text-blue-600">Добавить</button>
              </div>
              <div className="space-y-3">
                {definition.config.scenarios.map((scenario, index) => (
                  <div key={scenario.id} className="rounded border p-3">
                    <div className="grid gap-3 md:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium mb-1">Название</label>
                        <input
                          type="text"
                          value={scenario.name}
                          onChange={(event) => updateScenario(index, 'name', event.target.value)}
                          className="w-full px-3 py-2 border rounded"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Описание</label>
                        <input
                          type="text"
                          value={scenario.description || ''}
                          onChange={(event) => updateScenario(index, 'description', event.target.value)}
                          className="w-full px-3 py-2 border rounded"
                        />
                      </div>
                    </div>
                    <label className="mt-3 flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={Boolean(scenario.is_unsafe)}
                        onChange={(event) => updateScenario(index, 'is_unsafe', event.target.checked)}
                      />
                      Сценарий требует блока безопасности
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-xl font-bold">Тон</h2>
                  <button onClick={addTone} className="text-sm text-blue-600">Добавить</button>
                </div>
                <div className="space-y-2">
                  {definition.config.tones.map((tone, index) => (
                    <input
                      key={tone.id}
                      type="text"
                      value={tone.name}
                      onChange={(event) => updateTone(index, event.target.value)}
                      className="w-full px-3 py-2 border rounded"
                    />
                  ))}
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-xl font-bold">Цели</h2>
                  <button onClick={addGoal} className="text-sm text-blue-600">Добавить</button>
                </div>
                <div className="space-y-2">
                  {definition.config.goals.map((goal, index) => (
                    <input
                      key={goal.id}
                      type="text"
                      value={goal.name}
                      onChange={(event) => updateGoal(index, event.target.value)}
                      className="w-full px-3 py-2 border rounded"
                    />
                  ))}
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xl font-bold">Матрица вариантов</h2>
                <button onClick={addMatrixItem} className="text-sm text-blue-600">Добавить комбинацию</button>
              </div>
              <div className="space-y-4">
                {definition.config.matrix.map((item, matrixIndex) => (
                  <div key={`${item.scenario_id}-${item.tone_id}-${item.goal_id}-${matrixIndex}`} className="rounded border p-4">
                    <div className="grid gap-3 md:grid-cols-3 mb-3">
                      <div>
                        <label className="block text-sm font-medium mb-1">Сценарий</label>
                        <select
                          value={item.scenario_id}
                          onChange={(event) => updateMatrixItem(matrixIndex, 'scenario_id', event.target.value)}
                          className="w-full px-3 py-2 border rounded"
                        >
                          {definition.config.scenarios.map((scenario) => (
                            <option key={scenario.id} value={scenario.id}>{scenario.name || scenario.id}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Тон</label>
                        <select
                          value={item.tone_id}
                          onChange={(event) => updateMatrixItem(matrixIndex, 'tone_id', event.target.value)}
                          className="w-full px-3 py-2 border rounded"
                        >
                          {definition.config.tones.map((tone) => (
                            <option key={tone.id} value={tone.id}>{tone.name || tone.id}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Цель</label>
                        <select
                          value={item.goal_id}
                          onChange={(event) => updateMatrixItem(matrixIndex, 'goal_id', event.target.value)}
                          className="w-full px-3 py-2 border rounded"
                        >
                          {definition.config.goals.map((goal) => (
                            <option key={goal.id} value={goal.id}>{goal.name || goal.id}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {item.variants.map((variant, variantIndex) => (
                        <div key={variant.variant_id} className="rounded border p-3">
                          <div className="flex items-center justify-between">
                            <label className="text-sm font-medium">Variant ID</label>
                            <button
                              type="button"
                              onClick={() => removeVariant(matrixIndex, variantIndex)}
                              className="text-xs text-red-500"
                            >
                              Удалить
                            </button>
                          </div>
                          <input
                            type="text"
                            value={variant.variant_id}
                            onChange={(event) => updateVariant(matrixIndex, variantIndex, 'variant_id', event.target.value)}
                            className="w-full px-3 py-2 border rounded mt-1"
                          />
                          <label className="block text-sm font-medium mt-3 mb-1">Текст</label>
                          <textarea
                            value={variant.text}
                            onChange={(event) => updateVariant(matrixIndex, variantIndex, 'text', event.target.value)}
                            className="w-full px-3 py-2 border rounded"
                            rows={2}
                          />
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => addVariant(matrixIndex)}
                        className="text-sm text-blue-600"
                      >
                        Добавить вариант
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold mb-3">Блок безопасности</h2>
              <textarea
                value={definition.config.safety_block.text}
                onChange={(event) => setDefinition({
                  ...definition,
                  config: { ...definition.config, safety_block: { text: event.target.value } },
                })}
                className="w-full px-3 py-2 border rounded"
                rows={3}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
