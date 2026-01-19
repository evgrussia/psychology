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
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from '@psychology/design-system';

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
  const { user } = useAdminAuth();
  const canEdit = Boolean(user?.roles.some((role) => role === 'owner' || role === 'editor'));

  const [definition, setDefinition] = useState<RitualDefinition | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [archiving, setArchiving] = useState(false);
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

  const handleArchive = async () => {
    if (!definition) return;
    if (!canEdit) {
      return;
    }
    if (!window.confirm('Архивировать ритуал? Он исчезнет из публичного каталога.')) {
      return;
    }
    setArchiving(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/interactive/rituals/${id}/archive`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Не удалось архивировать');
      }
      await fetchDefinition();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setArchiving(false);
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
          <CardContent className="p-8 text-sm text-muted-foreground">Ритуал не найден</CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="space-y-2">
            <Button asChild variant="link" className="px-0">
              <Link href="/interactive/rituals">← Назад к списку</Link>
            </Button>
            <h1 className="text-2xl font-semibold text-foreground">Редактирование: {definition.title}</h1>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              onClick={handleSave}
              disabled={!canEdit || saving}
            >
              {saving ? 'Сохранение...' : 'Сохранить'}
            </Button>
            {canEdit && definition.status !== 'published' && definition.status !== 'archived' && (
              <Button
                onClick={handlePublish}
                disabled={publishing}
                variant="secondary"
              >
                {publishing ? 'Публикация...' : 'Опубликовать'}
              </Button>
            )}
            {canEdit && definition.status !== 'archived' && (
              <Button
                onClick={handleArchive}
                disabled={archiving}
                variant="destructive"
              >
                {archiving ? 'Архивирование...' : 'Архивировать'}
              </Button>
            )}
            <Button
              onClick={() => setShowPreview(!showPreview)}
              variant="outline"
            >
              {showPreview ? 'Скрыть превью' : 'Показать превью'}
            </Button>
          </div>

          {showPreview && (
            <Card>
              <CardHeader className="flex flex-wrap items-center justify-between gap-3">
                <CardTitle className="text-lg">Превью ритуала</CardTitle>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Версия:</span>
                  <Select
                    value={previewVersion}
                    onValueChange={(value) => setPreviewVersion(value as 'draft' | 'published')}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Черновик</SelectItem>
                      <SelectItem value="published">Опубликовано</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {previewLoading && <div className="text-sm text-muted-foreground">Загрузка превью...</div>}
                {previewError && (
                  <Alert variant="destructive">
                    <AlertDescription>{previewError}</AlertDescription>
                  </Alert>
                )}
                {previewDefinition?.config && (
                  <Card className="border-dashed">
                    <CardContent className="space-y-4">
                      <h3 className="text-lg font-semibold text-foreground">{previewDefinition.title}</h3>
                      <p className="text-sm text-muted-foreground whitespace-pre-line">{previewDefinition.config.why}</p>
                      <div>
                        <h4 className="font-semibold text-foreground mb-2">Шаги</h4>
                        <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-2">
                          {previewDefinition.config.steps.map((step) => (
                            <li key={step.id}>
                              <div className="font-medium text-foreground">{step.title}</div>
                              <div className="whitespace-pre-line text-muted-foreground">{step.content}</div>
                            </li>
                          ))}
                        </ol>
                      </div>
                      {previewDefinition.config.audioMediaAssetId && (
                        <div className="text-sm text-muted-foreground">
                          Аудио: {previewDefinition.config.audioMediaAssetId}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="ritual-title">Название</Label>
                <Input
                  id="ritual-title"
                  type="text"
                  value={definition.title}
                  onChange={(event) => setDefinition({ ...definition, title: event.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ritual-topic">Тема (код)</Label>
                <Input
                  id="ritual-topic"
                  type="text"
                  value={definition.topicCode || ''}
                  onChange={(event) => setDefinition({ ...definition, topicCode: event.target.value || null })}
                  placeholder="anxiety, stress, etc."
                />
              </div>

              {definition.config && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="ritual-why">Зачем</Label>
                    <Textarea
                      id="ritual-why"
                      value={definition.config.why}
                      onChange={(event) => setDefinition({
                        ...definition,
                        config: { ...definition.config, why: event.target.value },
                      })}
                      rows={3}
                    />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="ritual-duration">Общая длительность (сек)</Label>
                      <Input
                        id="ritual-duration"
                        type="number"
                        value={definition.config.totalDurationSeconds ?? ''}
                        onChange={(event) => setDefinition({
                          ...definition,
                          config: {
                            ...definition.config,
                            totalDurationSeconds: event.target.value ? Number(event.target.value) : undefined,
                          },
                        })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ritual-audio">ID аудио (MediaAsset)</Label>
                      <Input
                        id="ritual-audio"
                        type="text"
                        value={definition.config.audioMediaAssetId || ''}
                        onChange={(event) => setDefinition({
                          ...definition,
                          config: {
                            ...definition.config,
                            audioMediaAssetId: event.target.value || undefined,
                          },
                        })}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-semibold text-foreground">Шаги</h2>
                      <Button onClick={addStep} variant="outline" size="sm">
                        Добавить шаг
                      </Button>
                    </div>
                    <div className="space-y-4">
                      {definition.config.steps.map((step, index) => (
                        <Card key={step.id}>
                          <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">Шаг {index + 1}</span>
                              <Button
                                type="button"
                                onClick={() => removeStep(index)}
                                variant="ghost"
                                size="sm"
                              >
                                Удалить
                              </Button>
                            </div>
                            <div className="grid gap-3 md:grid-cols-2">
                              <div className="space-y-2">
                                <Label htmlFor={`step-title-${step.id}`}>Заголовок</Label>
                                <Input
                                  id={`step-title-${step.id}`}
                                  type="text"
                                  value={step.title}
                                  onChange={(event) => updateStep(index, 'title', event.target.value)}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor={`step-duration-${step.id}`}>Длительность (сек)</Label>
                                <Input
                                  id={`step-duration-${step.id}`}
                                  type="number"
                                  value={step.durationSeconds ?? ''}
                                  onChange={(event) => updateStep(
                                    index,
                                    'durationSeconds',
                                    event.target.value ? Number(event.target.value) : undefined,
                                  )}
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`step-content-${step.id}`}>Инструкция</Label>
                              <Textarea
                                id={`step-content-${step.id}`}
                                value={step.content}
                                onChange={(event) => updateStep(index, 'content', event.target.value)}
                                rows={3}
                              />
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
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
