'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { AdminAuthGuard } from '@/components/admin-auth-guard';
import MarkdownEditor from '@/components/MarkdownEditor';
import {
  Alert,
  AlertDescription,
  Badge,
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
} from '@psychology/design-system';

interface TemplateVersion {
  id: string;
  version: number;
  subject?: string | null;
  body_markdown: string;
  updated_by_user_id: string;
  created_at: string;
}

interface TemplateDetail {
  id: string;
  channel: string;
  category: string;
  name: string;
  status: string;
  language: string;
  active_version_id?: string | null;
  activated_at?: string | null;
  versions: TemplateVersion[];
}

export default function TemplateEditorPage() {
  const params = useParams();
  const id = params.id as string;

  const [template, setTemplate] = useState<TemplateDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);
  const [subject, setSubject] = useState('');
  const [bodyMarkdown, setBodyMarkdown] = useState('');
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState<{ subject: string | null; body: string } | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [activating, setActivating] = useState(false);

  const activeVersion = useMemo(
    () => template?.versions.find((version) => version.id === template.active_version_id) ?? null,
    [template],
  );

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/admin/templates/${id}`, { credentials: 'include' });
        if (!res.ok) {
          throw new Error('Не удалось загрузить шаблон');
        }
        const data = (await res.json()) as TemplateDetail;
        setTemplate(data);
        const initialVersion =
          data.versions.find((version) => version.id === data.active_version_id) || data.versions[0];
        if (initialVersion) {
          setSelectedVersionId(initialVersion.id);
          setSubject(initialVersion.subject || '');
          setBodyMarkdown(initialVersion.body_markdown || '');
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      void load();
    }
  }, [id]);

  const handleSaveVersion = async () => {
    if (!template) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/templates/${template.id}/versions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          subject: template.channel === 'email' ? subject.trim() : null,
          body_markdown: bodyMarkdown,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.message || 'Не удалось сохранить версию');
      }
      const updated = await res.json();
      await refreshTemplate(updated.id);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const refreshTemplate = async (newVersionId?: string) => {
    const res = await fetch(`/api/admin/templates/${id}`, { credentials: 'include' });
    const data = (await res.json()) as TemplateDetail;
    setTemplate(data);
    if (newVersionId) {
      setSelectedVersionId(newVersionId);
    }
  };

  const handlePreview = async () => {
    if (!template) return;
    setPreviewLoading(true);
    setPreviewError(null);
    try {
      const res = await fetch(`/api/admin/templates/${template.id}/preview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          subject: template.channel === 'email' ? subject : null,
          body_markdown: bodyMarkdown,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.message || 'Не удалось сформировать превью');
      }
      const data = await res.json();
      setPreview({ subject: data.rendered_subject, body: data.rendered_body });
    } catch (err: any) {
      setPreviewError(err.message);
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleActivate = async (versionId: string | null) => {
    if (!template) return;
    setActivating(true);
    try {
      const res = await fetch(`/api/admin/templates/${template.id}/activate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ version_id: versionId }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.message || 'Не удалось обновить статус');
      }
      const data = (await res.json()) as TemplateDetail;
      setTemplate(data);
    } catch (err) {
      console.error(err);
    } finally {
      setActivating(false);
    }
  };

  const handleRollback = async (versionId: string) => {
    if (!template) return;
    const res = await fetch(`/api/admin/templates/${template.id}/rollback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ version_id: versionId }),
    });
    if (res.ok) {
      const version = await res.json();
      await refreshTemplate(version.id);
    }
  };

  if (loading) {
    return (
      <AdminAuthGuard allowedRoles={['owner', 'assistant']}>
        <Card>
          <CardContent className="p-4 text-sm text-muted-foreground">Загрузка...</CardContent>
        </Card>
      </AdminAuthGuard>
    );
  }

  if (error || !template) {
    return (
      <AdminAuthGuard allowedRoles={['owner', 'assistant']}>
        <Alert variant="destructive">
          <AlertDescription>{error || 'Шаблон не найден'}</AlertDescription>
        </Alert>
      </AdminAuthGuard>
    );
  }

  return (
    <AdminAuthGuard allowedRoles={['owner', 'assistant']}>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <Button asChild variant="link" className="px-0">
              <Link href="/templates">← Назад к списку</Link>
            </Button>
            <h1 className="mt-2 text-2xl font-semibold text-foreground">{template.name}</h1>
            <div className="text-sm text-muted-foreground">
              {template.category} · {template.channel} · {template.language}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => handleActivate(selectedVersionId)}
              disabled={activating || !selectedVersionId}
            >
              Активировать выбранную
            </Button>
            {template.active_version_id && (
              <Button
                variant="outline"
                onClick={() => handleActivate(null)}
                disabled={activating}
              >
                Деактивировать
              </Button>
            )}
          </div>
        </div>

        {activeVersion && (
          <Card>
            <CardContent className="p-4 text-sm text-muted-foreground">
              Активная версия: v{activeVersion.version} · {new Date(activeVersion.created_at).toLocaleString('ru-RU')}
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Версии</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Версия</Label>
                <Select
                  value={selectedVersionId ?? ''}
                  onValueChange={(value) => {
                    const versionId = value;
                    setSelectedVersionId(versionId);
                    const version = template.versions.find((item) => item.id === versionId);
                    if (version) {
                      setSubject(version.subject || '');
                      setBodyMarkdown(version.body_markdown);
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {template.versions.map((version) => (
                      <SelectItem key={version.id} value={version.id}>
                        v{version.version} · {new Date(version.created_at).toLocaleString('ru-RU')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                {template.versions.map((version) => (
                  <div key={version.id} className="flex items-center justify-between rounded-md border px-3 py-2 text-xs">
                    <span>v{version.version}</span>
                    <Button variant="link" size="sm" className="px-0" onClick={() => handleRollback(version.id)}>
                      Откатить
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Контент</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {template.channel === 'email' && (
                <div className="space-y-2">
                  <Label>Тема письма</Label>
                  <Input
                    value={subject}
                    onChange={(event) => setSubject(event.target.value)}
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label>Тело сообщения</Label>
                <MarkdownEditor
                  value={bodyMarkdown}
                  onChange={(value) => setBodyMarkdown(value)}
                  showPreview={true}
                  height="420px"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={handleSaveVersion}
                  disabled={saving || !bodyMarkdown.trim()}
                >
                  {saving ? 'Сохраняем...' : 'Сохранить новую версию'}
                </Button>
                <Button
                  variant="outline"
                  onClick={handlePreview}
                  disabled={previewLoading}
                >
                  {previewLoading ? 'Превью...' : 'Превью'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {previewError && (
          <Alert variant="destructive">
            <AlertDescription>{previewError}</AlertDescription>
          </Alert>
        )}
        {preview && (
          <Card>
            <CardContent className="space-y-3 text-sm">
              {preview.subject && (
                <div>
                  <div className="text-xs text-muted-foreground">Тема</div>
                  <div className="font-medium text-foreground">{preview.subject}</div>
                </div>
              )}
              <div>
                <div className="text-xs text-muted-foreground">Сообщение</div>
                <div className="whitespace-pre-line text-foreground">{preview.body}</div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminAuthGuard>
  );
}
