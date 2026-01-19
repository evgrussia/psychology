'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AdminAuthGuard } from '@/components/admin-auth-guard';
import MarkdownEditor from '@/components/MarkdownEditor';

export default function NewTemplatePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    channel: 'email',
    category: 'booking',
    language: 'ru',
    subject: '',
    body_markdown: '',
  });

  const handleSubmit = async () => {
    setSaving(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: form.name.trim(),
          channel: form.channel,
          category: form.category,
          language: form.language.trim() || 'ru',
          subject: form.subject.trim() || null,
          body_markdown: form.body_markdown,
        }),
      });
      if (!response.ok) {
        const err = await response.json().catch(() => null);
        throw new Error(err?.message || 'Не удалось создать шаблон');
      }
      const data = await response.json();
      router.push(`/templates/${data.id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminAuthGuard allowedRoles={['owner', 'assistant']}>
      <div className="space-y-6">
        <div>
          <Link href="/templates" className="text-primary">
            ← Назад к списку
          </Link>
          <h1 className="mt-3 text-2xl font-semibold">Новый шаблон</h1>
          {error && <div className="mt-2 text-sm text-red-500">{error}</div>}
        </div>

        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <div className="space-y-4 rounded-lg border bg-white p-4">
            <div>
              <label className="text-sm text-muted-foreground">Название</label>
              <input
                value={form.name}
                onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                className="mt-2 w-full rounded-md border px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Канал</label>
              <select
                value={form.channel}
                onChange={(event) => setForm((prev) => ({ ...prev, channel: event.target.value }))}
                className="mt-2 w-full rounded-md border px-3 py-2 text-sm"
              >
                <option value="email">Email</option>
                <option value="telegram">Telegram</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Категория</label>
              <select
                value={form.category}
                onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value }))}
                className="mt-2 w-full rounded-md border px-3 py-2 text-sm"
              >
                <option value="booking">Запись</option>
                <option value="waitlist">Лист ожидания</option>
                <option value="event">Мероприятия</option>
                <option value="moderation">Модерация</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Язык</label>
              <input
                value={form.language}
                onChange={(event) => setForm((prev) => ({ ...prev, language: event.target.value }))}
                className="mt-2 w-full rounded-md border px-3 py-2 text-sm"
              />
            </div>
            {form.channel === 'email' && (
              <div>
                <label className="text-sm text-muted-foreground">Тема письма</label>
                <input
                  value={form.subject}
                  onChange={(event) => setForm((prev) => ({ ...prev, subject: event.target.value }))}
                  className="mt-2 w-full rounded-md border px-3 py-2 text-sm"
                />
              </div>
            )}
            <button
              type="button"
              className="rounded-md bg-primary px-4 py-2 text-sm text-white disabled:opacity-50"
              onClick={handleSubmit}
              disabled={saving || !form.name.trim() || !form.body_markdown.trim()}
            >
              {saving ? 'Создаем...' : 'Создать шаблон'}
            </button>
          </div>

          <div className="rounded-lg border bg-white p-4">
            <label className="text-sm text-muted-foreground">Тело сообщения (Markdown)</label>
            <div className="mt-3">
              <MarkdownEditor
                value={form.body_markdown}
                onChange={(value) => setForm((prev) => ({ ...prev, body_markdown: value }))}
                showPreview={true}
                height="500px"
              />
            </div>
          </div>
        </div>
      </div>
    </AdminAuthGuard>
  );
}
