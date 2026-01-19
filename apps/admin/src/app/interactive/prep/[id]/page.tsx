'use client';

import { useEffect, useMemo, useState } from 'react';
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
  Textarea,
} from '@psychology/design-system';

type InteractiveStatus = 'draft' | 'published' | 'archived';

interface PrepDefinition {
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

export default function EditPrepPage() {
  const params = useParams();
  const id = params.id as string;
  const { user } = useAdminAuth();
  const canEdit = Boolean(user?.roles.some((role) => role === 'owner' || role === 'editor'));

  const [definition, setDefinition] = useState<PrepDefinition | null>(null);
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
        throw new Error('Failed to fetch prep');
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
        throw new Error(err?.message || 'Failed to save prep');
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
        throw new Error(err?.message || 'Failed to publish prep');
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
        <Card>
          <CardContent className="p-8 text-sm text-muted-foreground">Загрузка...</CardContent>
        </Card>
      ) : error && !definition ? (
        <Alert variant="destructive">
          <AlertDescription>Ошибка: {error}</AlertDescription>
        </Alert>
      ) : !definition ? (
        <Card>
          <CardContent className="p-8 text-sm text-muted-foreground">Мастер не найден</CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <div>
            <Button asChild variant="link" className="px-0">
              <Link href="/interactive/prep">← Назад к списку</Link>
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
          </div>

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
                  onChange={(e) => setDefinition({ ...definition, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Тема (topicCode)</Label>
                <Input
                  type="text"
                  value={definition.topicCode || ''}
                  onChange={(e) => setDefinition({ ...definition, topicCode: e.target.value || null })}
                  placeholder="anxiety, burnout, ..."
                />
              </div>

              <div className="space-y-2">
                <Label>Config (JSON)</Label>
                <Textarea
                  value={configText}
                  onChange={(e) => setConfigText(e.target.value)}
                  className="min-h-[420px] font-mono text-xs"
                />
                {!parsedConfig && (
                  <div className="text-sm text-destructive">
                    JSON некорректен — сохранение невозможно.
                  </div>
                )}
                <div className="text-xs text-muted-foreground">
                  Подсказка: config должен содержать `steps` и `result` (result.checklist обязателен).
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </AdminAuthGuard>
  );
}

