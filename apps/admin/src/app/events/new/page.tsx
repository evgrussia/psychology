'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AdminAuthGuard } from '@/components/admin-auth-guard';
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

type EventFormat = 'online' | 'offline' | 'hybrid';
type EventStatus = 'draft' | 'published' | 'archived';

export default function CreateEventPage() {
  const router = useRouter();
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [form, setForm] = React.useState({
    slug: '',
    title: '',
    description_markdown: '',
    starts_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    ends_at: '',
    format: 'online' as EventFormat,
    location_text: '',
    status: 'draft' as EventStatus,
    capacity: '',
    registration_open: true,
  });

  const submit = async () => {
    setSaving(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          slug: form.slug.trim(),
          title: form.title.trim(),
          description_markdown: form.description_markdown,
          starts_at: form.starts_at,
          ends_at: form.ends_at.trim() ? form.ends_at : null,
          format: form.format,
          location_text: form.location_text.trim() || null,
          status: form.status,
          capacity: form.capacity === '' ? null : Number(form.capacity),
          registration_open: form.registration_open,
        }),
      });
      if (!response.ok) {
        const err = await response.json().catch(() => null);
        throw new Error(err?.message || 'Не удалось создать мероприятие');
      }
      router.push('/events');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminAuthGuard allowedRoles={['owner']}>
      <div className="space-y-6">
        <div>
          <Button asChild variant="link" className="px-0">
            <Link href="/events">← Назад к списку</Link>
          </Button>
          <h1 className="text-2xl font-semibold text-foreground mt-4">Создать мероприятие</h1>
          {error && (
            <Alert variant="destructive" className="mt-2">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Параметры</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Slug</Label>
                <Input
                  value={form.slug}
                  onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
                  placeholder="webinar-anxiety"
                />
              </div>
              <div className="space-y-2">
                <Label>Название</Label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Описание (Markdown)</Label>
              <Textarea
                value={form.description_markdown}
                onChange={(e) => setForm((p) => ({ ...p, description_markdown: e.target.value }))}
                rows={10}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Начало (ISO)</Label>
                <Input
                  value={form.starts_at}
                  onChange={(e) => setForm((p) => ({ ...p, starts_at: e.target.value }))}
                  className="font-mono text-xs"
                />
              </div>
              <div className="space-y-2">
                <Label>Окончание (ISO, опционально)</Label>
                <Input
                  value={form.ends_at}
                  onChange={(e) => setForm((p) => ({ ...p, ends_at: e.target.value }))}
                  className="font-mono text-xs"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
              <div className="space-y-2">
                <Label>Формат</Label>
                <Select
                  value={form.format}
                  onValueChange={(value) => setForm((p) => ({ ...p, format: value as EventFormat }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="online">online</SelectItem>
                    <SelectItem value="offline">offline</SelectItem>
                    <SelectItem value="hybrid">hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label>Локация (опционально)</Label>
                <Input
                  value={form.location_text}
                  onChange={(e) => setForm((p) => ({ ...p, location_text: e.target.value }))}
                  placeholder="Zoom / Москва, ... "
                />
              </div>
              <div className="space-y-2">
                <Label>Статус</Label>
                <Select
                  value={form.status}
                  onValueChange={(value) => setForm((p) => ({ ...p, status: value as EventStatus }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">draft</SelectItem>
                    <SelectItem value="published">published</SelectItem>
                    <SelectItem value="archived">archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Вместимость (опционально)</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.capacity}
                  onChange={(e) => setForm((p) => ({ ...p, capacity: e.target.value }))}
                  placeholder="например 30"
                />
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={form.registration_open}
                    onCheckedChange={(checked) => setForm((p) => ({ ...p, registration_open: Boolean(checked) }))}
                  />
                  Регистрация открыта
                </label>
              </div>
            </div>

            <Button onClick={() => void submit()} disabled={saving}>
              {saving ? 'Создаём...' : 'Создать'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </AdminAuthGuard>
  );
}

