'use client';

import { useRouter } from 'next/navigation';
import React from 'react';
import Link from 'next/link';
import { AdminAuthGuard } from '@/components/admin-auth-guard';
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

type ServiceFormat = 'online' | 'offline' | 'hybrid';
type ServiceStatus = 'draft' | 'published' | 'archived';

export default function CreateServicePage() {
  const router = useRouter();
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [form, setForm] = React.useState({
    slug: '',
    title: '',
    descriptionMarkdown: '',
    format: 'online' as ServiceFormat,
    offlineAddress: '',
    durationMinutes: 50,
    priceAmount: 0,
    depositAmount: '',
    cancelFreeHours: '',
    cancelPartialHours: '',
    rescheduleMinHours: '',
    rescheduleMaxCount: '',
    status: 'draft' as ServiceStatus,
    topicCode: '',
  });

  const handleSubmit = async () => {
    setSaving(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          slug: form.slug.trim(),
          title: form.title.trim(),
          descriptionMarkdown: form.descriptionMarkdown,
          format: form.format,
          offlineAddress: form.format === 'offline' ? (form.offlineAddress.trim() || null) : null,
          durationMinutes: Number(form.durationMinutes),
          priceAmount: Number(form.priceAmount),
          depositAmount: form.depositAmount === '' ? null : Number(form.depositAmount),
          cancelFreeHours: form.cancelFreeHours === '' ? null : Number(form.cancelFreeHours),
          cancelPartialHours: form.cancelPartialHours === '' ? null : Number(form.cancelPartialHours),
          rescheduleMinHours: form.rescheduleMinHours === '' ? null : Number(form.rescheduleMinHours),
          rescheduleMaxCount: form.rescheduleMaxCount === '' ? null : Number(form.rescheduleMaxCount),
          status: form.status,
          topicCode: form.topicCode.trim() || null,
        }),
      });
      if (!response.ok) {
        const err = await response.json().catch(() => null);
        throw new Error(err?.message || 'Не удалось создать услугу');
      }
      router.push('/services');
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
            <Link href="/services">← Назад к списку</Link>
          </Button>
          <h1 className="text-2xl font-semibold text-foreground mt-4">Создать услугу</h1>
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
                  placeholder="primary_consultation"
                />
              </div>
              <div className="space-y-2">
                <Label>Название</Label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                  placeholder="Первичная консультация"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Описание (Markdown)</Label>
              <Textarea
                value={form.descriptionMarkdown}
                onChange={(e) => setForm((p) => ({ ...p, descriptionMarkdown: e.target.value }))}
                rows={8}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Формат</Label>
                <Select
                  value={form.format}
                  onValueChange={(value) => setForm((p) => ({ ...p, format: value as ServiceFormat }))}
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
              <div className="space-y-2">
                <Label>Длительность (мин)</Label>
                <Input
                  type="number"
                  min={10}
                  value={form.durationMinutes}
                  onChange={(e) => setForm((p) => ({ ...p, durationMinutes: Number(e.target.value) }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Статус</Label>
                <Select
                  value={form.status}
                  onValueChange={(value) => setForm((p) => ({ ...p, status: value as ServiceStatus }))}
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

            {form.format === 'offline' && (
              <div className="space-y-2">
                <Label>Адрес (для офлайн)</Label>
                <Input
                  value={form.offlineAddress}
                  onChange={(e) => setForm((p) => ({ ...p, offlineAddress: e.target.value }))}
                />
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Цена (₽)</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.priceAmount}
                  onChange={(e) => setForm((p) => ({ ...p, priceAmount: Number(e.target.value) }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Депозит (₽, опционально)</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.depositAmount}
                  onChange={(e) => setForm((p) => ({ ...p, depositAmount: e.target.value }))}
                  placeholder="например 1000"
                />
              </div>
              <div className="space-y-2">
                <Label>Тема (topicCode)</Label>
                <Input
                  value={form.topicCode}
                  onChange={(e) => setForm((p) => ({ ...p, topicCode: e.target.value }))}
                  placeholder="anxiety"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
              <div className="space-y-2">
                <Label>Отмена без штрафа (ч)</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.cancelFreeHours}
                  onChange={(e) => setForm((p) => ({ ...p, cancelFreeHours: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Отмена с частичным штрафом (ч)</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.cancelPartialHours}
                  onChange={(e) => setForm((p) => ({ ...p, cancelPartialHours: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Перенос минимум (ч)</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.rescheduleMinHours}
                  onChange={(e) => setForm((p) => ({ ...p, rescheduleMinHours: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Перенос максимум (раз)</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.rescheduleMaxCount}
                  onChange={(e) => setForm((p) => ({ ...p, rescheduleMaxCount: e.target.value }))}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button onClick={handleSubmit} disabled={saving}>
                {saving ? 'Создаём...' : 'Создать'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminAuthGuard>
  );
}

