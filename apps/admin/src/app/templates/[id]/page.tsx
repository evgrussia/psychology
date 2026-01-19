'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { AdminAuthGuard } from '@/components/admin-auth-guard';
import MarkdownEditor from '@/components/MarkdownEditor';

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
        <div className="text-sm text-muted-foreground">Загрузка...</div>
      </AdminAuthGuard>
    );
  }

  if (error || !template) {
    return (
      <AdminAuthGuard allowedRoles={['owner', 'assistant']}>
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {error || 'Шаблон не найден'}
        </div>
      </AdminAuthGuard>
    );
  }

  return (
    <AdminAuthGuard allowedRoles={['owner', 'assistant']}>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <Link href="/templates" className="text-primary">
              ← Назад к списку
            </Link>
            <h1 className="mt-2 text-2xl font-semibold">{template.name}</h1>
            <div className="text-sm text-muted-foreground">
              {template.category} · {template.channel} · {template.language}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              className="rounded-md border px-3 py-2 text-sm"
              onClick={() => handleActivate(selectedVersionId)}
              disabled={activating || !selectedVersionId}
            >
              Активировать выбранную
            </button>
            {template.active_version_id && (
              <button
                className="rounded-md border px-3 py-2 text-sm"
                onClick={() => handleActivate(null)}
                disabled={activating}
              >
                Деактивировать
              </button>
            )}
          </div>
        </div>

        {activeVersion && (
          <div className="rounded-lg border bg-white p-4 text-sm">
            Активная версия: v{activeVersion.version} · {new Date(activeVersion.created_at).toLocaleString('ru-RU')}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <div className="space-y-4 rounded-lg border bg-white p-4">
            <div>
              <label className="text-sm text-muted-foreground">Версии</label>
              <select
                value={selectedVersionId ?? ''}
                onChange={(event) => {
                  const versionId = event.target.value;
                  setSelectedVersionId(versionId);
                  const version = template.versions.find((item) => item.id === versionId);
                  if (version) {
                    setSubject(version.subject || '');
                    setBodyMarkdown(version.body_markdown);
                  }
                }}
                className="mt-2 w-full rounded-md border px-3 py-2 text-sm"
              >
                {template.versions.map((version) => (
                  <option key={version.id} value={version.id}>
                    v{version.version} · {new Date(version.created_at).toLocaleString('ru-RU')}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              {template.versions.map((version) => (
                <div key={version.id} className="flex items-center justify-between rounded-md border px-3 py-2 text-xs">
                  <span>v{version.version}</span>
                  <button className="text-primary" onClick={() => handleRollback(version.id)}>
                    Откатить
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4 rounded-lg border bg-white p-4">
            {template.channel === 'email' && (
              <div>
                <label className="text-sm text-muted-foreground">Тема письма</label>
                <input
                  className="mt-2 w-full rounded-md border px-3 py-2 text-sm"
                  value={subject}
                  onChange={(event) => setSubject(event.target.value)}
                />
              </div>
            )}
            <div>
              <label className="text-sm text-muted-foreground">Тело сообщения</label>
              <div className="mt-3">
                <MarkdownEditor
                  value={bodyMarkdown}
                  onChange={(value) => setBodyMarkdown(value)}
                  showPreview={true}
                  height="420px"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                className="rounded-md bg-primary px-4 py-2 text-sm text-white disabled:opacity-50"
                onClick={handleSaveVersion}
                disabled={saving || !bodyMarkdown.trim()}
              >
                {saving ? 'Сохраняем...' : 'Сохранить новую версию'}
              </button>
              <button
                className="rounded-md border px-4 py-2 text-sm"
                onClick={handlePreview}
                disabled={previewLoading}
              >
                {previewLoading ? 'Превью...' : 'Превью'}
              </button>
            </div>
          </div>
        </div>

        {previewError && <div className="text-sm text-red-500">{previewError}</div>}
        {preview && (
          <div className="rounded-lg border bg-white p-4 space-y-3 text-sm">
            {preview.subject && (
              <div>
                <div className="text-xs text-muted-foreground">Тема</div>
                <div className="font-medium">{preview.subject}</div>
              </div>
            )}
            <div>
              <div className="text-xs text-muted-foreground">Сообщение</div>
              <div className="whitespace-pre-line">{preview.body}</div>
            </div>
          </div>
        )}
      </div>
    </AdminAuthGuard>
  );
}
