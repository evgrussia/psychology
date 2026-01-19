'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AdminAuthGuard } from '@/components/admin-auth-guard';
import MarkdownEditor from '@/components/MarkdownEditor';
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
} from '@psychology/design-system';

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
          <Button asChild variant="link" className="px-0">
            <Link href="/templates">← Назад к списку</Link>
          </Button>
          <h1 className="mt-3 text-2xl font-semibold text-foreground">Новый шаблон</h1>
          {error && (
            <Alert variant="destructive" className="mt-2">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Параметры</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Название</Label>
                <Input
                  value={form.name}
                  onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Канал</Label>
                <Select
                  value={form.channel}
                  onValueChange={(value) => setForm((prev) => ({ ...prev, channel: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="telegram">Telegram</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Категория</Label>
                <Select
                  value={form.category}
                  onValueChange={(value) => setForm((prev) => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="booking">Запись</SelectItem>
                    <SelectItem value="waitlist">Лист ожидания</SelectItem>
                    <SelectItem value="event">Мероприятия</SelectItem>
                    <SelectItem value="moderation">Модерация</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Язык</Label>
                <Input
                  value={form.language}
                  onChange={(event) => setForm((prev) => ({ ...prev, language: event.target.value }))}
                />
              </div>
              {form.channel === 'email' && (
                <div className="space-y-2">
                  <Label>Тема письма</Label>
                  <Input
                    value={form.subject}
                    onChange={(event) => setForm((prev) => ({ ...prev, subject: event.target.value }))}
                  />
                </div>
              )}
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={saving || !form.name.trim() || !form.body_markdown.trim()}
              >
                {saving ? 'Создаем...' : 'Создать шаблон'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Тело сообщения (Markdown)</CardTitle>
            </CardHeader>
            <CardContent>
              <MarkdownEditor
                value={form.body_markdown}
                onChange={(value) => setForm((prev) => ({ ...prev, body_markdown: value }))}
                showPreview={true}
                height="500px"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminAuthGuard>
  );
}
