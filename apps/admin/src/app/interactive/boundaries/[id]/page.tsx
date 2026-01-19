'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { AdminAuthGuard } from '@/components/admin-auth-guard';
import { useAdminAuth } from '@/components/admin-auth-context';
import {
  Alert,
  AlertDescription,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Checkbox,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from '@psychology/design-system';

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
  const { user } = useAdminAuth();
  const canEdit = Boolean(user?.roles.some((role) => role === 'owner' || role === 'editor'));

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
    if (!canEdit) {
      return;
    }
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
    if (!canEdit) {
      return;
    }
    if (!definition?.config) return;
    const scenarios = [...definition.config.scenarios, { id: createId(), name: '', description: '', is_unsafe: false }];
    setDefinition({ ...definition, config: { ...definition.config, scenarios } });
  };

  const addTone = () => {
    if (!canEdit) {
      return;
    }
    if (!definition?.config) return;
    const tones = [...definition.config.tones, { id: createId(), name: '' }];
    setDefinition({ ...definition, config: { ...definition.config, tones } });
  };

  const addGoal = () => {
    if (!canEdit) {
      return;
    }
    if (!definition?.config) return;
    const goals = [...definition.config.goals, { id: createId(), name: '' }];
    setDefinition({ ...definition, config: { ...definition.config, goals } });
  };

  const addMatrixItem = () => {
    if (!canEdit) {
      return;
    }
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
    if (!canEdit) {
      return;
    }
    if (!definition?.config) return;
    const matrix = [...definition.config.matrix];
    const variants = [...matrix[matrixIndex].variants, { variant_id: createId(), text: '' }];
    matrix[matrixIndex] = { ...matrix[matrixIndex], variants };
    setDefinition({ ...definition, config: { ...definition.config, matrix } });
  };

  const removeVariant = (matrixIndex: number, variantIndex: number) => {
    if (!canEdit) {
      return;
    }
    if (!definition?.config) return;
    const matrix = [...definition.config.matrix];
    const variants = matrix[matrixIndex].variants.filter((_, idx) => idx !== variantIndex);
    matrix[matrixIndex] = { ...matrix[matrixIndex], variants };
    setDefinition({ ...definition, config: { ...definition.config, matrix } });
  };

  return (
    <AdminAuthGuard allowedRoles={['owner', 'assistant', 'editor']}>
      {loading ? (
        <Card>
          <CardContent className="p-8 text-sm text-muted-foreground">Загрузка...</CardContent>
        </Card>
      ) : error && !definition ? (
        <Alert variant="destructive">
          <AlertDescription>Ошибка: {error}</AlertDescription>
        </Alert>
      ) : !definition ? (
        <Card>
          <CardContent className="p-8 text-sm text-muted-foreground">Интерактив не найден</CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <div>
            <Button asChild variant="link" className="px-0">
              <Link href="/interactive/boundaries">← Назад к списку</Link>
            </Button>
            <h1 className="text-2xl font-semibold text-foreground mt-4">Редактирование: {definition.title}</h1>
            {error && (
              <Alert variant="destructive" className="mt-2">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            <Button onClick={handleSave} disabled={!canEdit || saving}>
              {saving ? 'Сохранение...' : 'Сохранить'}
            </Button>
            {canEdit && definition.status !== 'published' && (
              <Button onClick={handlePublish} disabled={publishing} variant="outline">
                {publishing ? 'Публикация...' : 'Опубликовать'}
              </Button>
            )}
            <Button onClick={() => setShowPreview(!showPreview)} variant="secondary">
              {showPreview ? 'Скрыть превью' : 'Показать превью'}
            </Button>
          </div>

          {showPreview && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Превью скриптов</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Версия:</span>
                    <Select
                      value={previewVersion}
                      onValueChange={(value) => setPreviewVersion(value as 'draft' | 'published')}
                    >
                      <SelectTrigger className="w-44">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Черновик</SelectItem>
                        <SelectItem value="published">Опубликовано</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {previewLoading && <div className="text-sm text-muted-foreground">Загрузка превью...</div>}
                {previewError && (
                  <Alert variant="destructive">
                    <AlertDescription>{previewError}</AlertDescription>
                  </Alert>
                )}
                {previewDefinition?.config && (
                  <Card>
                    <CardContent className="space-y-4">
                      <h3 className="text-lg font-semibold text-foreground">{previewDefinition.title}</h3>
                      <div>
                        <h4 className="font-semibold mb-2">Сценарии</h4>
                        <ul className="text-sm text-muted-foreground list-disc list-inside">
                          {previewDefinition.config.scenarios.map((scenario) => (
                            <li key={scenario.id}>{scenario.name}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Матрица</h4>
                        <div className="space-y-3 text-sm">
                          {previewDefinition.config.matrix.map((item, idx) => (
                            <div key={idx} className="rounded border border-border p-3">
                              <div className="font-medium text-foreground">
                                {previewDefinition.config.scenarios.find((s) => s.id === item.scenario_id)?.name || item.scenario_id} ·{' '}
                                {previewDefinition.config.tones.find((t) => t.id === item.tone_id)?.name || item.tone_id} ·{' '}
                                {previewDefinition.config.goals.find((g) => g.id === item.goal_id)?.name || item.goal_id}
                              </div>
                              <ul className="mt-2 list-disc list-inside text-muted-foreground">
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
                        <p className="text-sm text-muted-foreground whitespace-pre-line">
                          {previewDefinition.config.safety_block.text}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Параметры</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Название</Label>
                <Input
                  type="text"
                  value={definition.title}
                  onChange={(event) => setDefinition({ ...definition, title: event.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Тема (код)</Label>
                <Input
                  type="text"
                  value={definition.topicCode || ''}
                  onChange={(event) => setDefinition({ ...definition, topicCode: event.target.value || null })}
                  placeholder="boundaries, relationships, etc."
                />
              </div>

              {definition.config && (
                <>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-semibold text-foreground">Сценарии</h2>
                      <Button onClick={addScenario} disabled={!canEdit} variant="link" size="sm" className="px-0">
                        Добавить
                      </Button>
                    </div>
                    <div className="space-y-3">
                      {definition.config.scenarios.map((scenario, index) => (
                        <div key={scenario.id} className="rounded border border-border p-3">
                          <div className="grid gap-3 md:grid-cols-2">
                            <div className="space-y-2">
                              <Label>Название</Label>
                              <Input
                                type="text"
                                value={scenario.name}
                                onChange={(event) => updateScenario(index, 'name', event.target.value)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Описание</Label>
                              <Input
                                type="text"
                                value={scenario.description || ''}
                                onChange={(event) => updateScenario(index, 'description', event.target.value)}
                              />
                            </div>
                          </div>
                          <label className="mt-3 flex items-center gap-2 text-sm">
                            <Checkbox
                              checked={Boolean(scenario.is_unsafe)}
                              onCheckedChange={(checked) => updateScenario(index, 'is_unsafe', Boolean(checked))}
                            />
                            Сценарий требует блока безопасности
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-foreground">Тон</h2>
                        <Button onClick={addTone} disabled={!canEdit} variant="link" size="sm" className="px-0">
                          Добавить
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {definition.config.tones.map((tone, index) => (
                          <Input
                            key={tone.id}
                            type="text"
                            value={tone.name}
                            onChange={(event) => updateTone(index, event.target.value)}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-foreground">Цели</h2>
                        <Button onClick={addGoal} disabled={!canEdit} variant="link" size="sm" className="px-0">
                          Добавить
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {definition.config.goals.map((goal, index) => (
                          <Input
                            key={goal.id}
                            type="text"
                            value={goal.name}
                            onChange={(event) => updateGoal(index, event.target.value)}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-semibold text-foreground">Матрица вариантов</h2>
                      <Button onClick={addMatrixItem} disabled={!canEdit} variant="link" size="sm" className="px-0">
                        Добавить комбинацию
                      </Button>
                    </div>
                    <div className="space-y-4">
                      {definition.config.matrix.map((item, matrixIndex) => (
                        <div key={`${item.scenario_id}-${item.tone_id}-${item.goal_id}-${matrixIndex}`} className="rounded border border-border p-4">
                          <div className="grid gap-3 md:grid-cols-3">
                            <div className="space-y-2">
                              <Label>Сценарий</Label>
                              <Select
                                value={item.scenario_id}
                                onValueChange={(value) => updateMatrixItem(matrixIndex, 'scenario_id', value)}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {definition.config.scenarios.map((scenario) => (
                                    <SelectItem key={scenario.id} value={scenario.id}>
                                      {scenario.name || scenario.id}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label>Тон</Label>
                              <Select
                                value={item.tone_id}
                                onValueChange={(value) => updateMatrixItem(matrixIndex, 'tone_id', value)}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {definition.config.tones.map((tone) => (
                                    <SelectItem key={tone.id} value={tone.id}>
                                      {tone.name || tone.id}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label>Цель</Label>
                              <Select
                                value={item.goal_id}
                                onValueChange={(value) => updateMatrixItem(matrixIndex, 'goal_id', value)}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {definition.config.goals.map((goal) => (
                                    <SelectItem key={goal.id} value={goal.id}>
                                      {goal.name || goal.id}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div className="space-y-3 mt-3">
                            {item.variants.map((variant, variantIndex) => (
                              <div key={variant.variant_id} className="rounded border border-border p-3">
                                <div className="flex items-center justify-between">
                                  <Label>Variant ID</Label>
                                  <Button
                                    type="button"
                                    onClick={() => removeVariant(matrixIndex, variantIndex)}
                                    disabled={!canEdit}
                                    variant="link"
                                    size="sm"
                                    className="px-0 text-destructive"
                                  >
                                    Удалить
                                  </Button>
                                </div>
                                <Input
                                  type="text"
                                  value={variant.variant_id}
                                  onChange={(event) => updateVariant(matrixIndex, variantIndex, 'variant_id', event.target.value)}
                                  className="mt-1"
                                />
                                <Label className="mt-3">Текст</Label>
                                <Textarea
                                  value={variant.text}
                                  onChange={(event) => updateVariant(matrixIndex, variantIndex, 'text', event.target.value)}
                                  rows={2}
                                />
                              </div>
                            ))}
                            <Button
                              type="button"
                              onClick={() => addVariant(matrixIndex)}
                              disabled={!canEdit}
                              variant="link"
                              size="sm"
                              className="px-0"
                            >
                              Добавить вариант
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h2 className="text-lg font-semibold text-foreground">Блок безопасности</h2>
                    <Textarea
                      value={definition.config.safety_block.text}
                      onChange={(event) =>
                        setDefinition({
                          ...definition,
                          config: { ...definition.config, safety_block: { text: event.target.value } },
                        })
                      }
                      rows={3}
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </AdminAuthGuard>
  );
}
