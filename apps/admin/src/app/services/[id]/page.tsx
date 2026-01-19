'use client';

import { useParams, useRouter } from 'next/navigation';
import React from 'react';
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

type ServiceFormat = 'online' | 'offline' | 'hybrid';
type ServiceStatus = 'draft' | 'published' | 'archived';

interface ServiceModel {
  id: string;
  slug: string;
  title: string;
  descriptionMarkdown: string;
  format: ServiceFormat;
  offlineAddress: string | null;
  durationMinutes: number;
  priceAmount: number;
  depositAmount: number | null;
  cancelFreeHours: number | null;
  cancelPartialHours: number | null;
  rescheduleMinHours: number | null;
  rescheduleMaxCount: number | null;
  status: ServiceStatus;
  topicCode: string | null;
}

export default function EditServicePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { user } = useAdminAuth();
  const canEdit = Boolean(user?.roles.includes('owner'));

  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [publishing, setPublishing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [service, setService] = React.useState<ServiceModel | null>(null);

  React.useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/services/${id}`, { credentials: 'include' });
      if (!response.ok) throw new Error('Не удалось загрузить услугу');
      const data = await response.json();
      setService(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!service) return;
    if (!canEdit) {
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/services/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          slug: service.slug,
          title: service.title,
          descriptionMarkdown: service.descriptionMarkdown,
          format: service.format,
          offlineAddress: service.format === 'offline' ? (service.offlineAddress || null) : null,
          durationMinutes: service.durationMinutes,
          priceAmount: service.priceAmount,
          depositAmount: service.depositAmount,
          cancelFreeHours: service.cancelFreeHours,
          cancelPartialHours: service.cancelPartialHours,
          rescheduleMinHours: service.rescheduleMinHours,
          rescheduleMaxCount: service.rescheduleMaxCount,
          status: service.status,
          topicCode: service.topicCode,
        }),
      });
      if (!response.ok) {
        const err = await response.json().catch(() => null);
        throw new Error(err?.message || 'Не удалось сохранить услугу');
      }
      alert('Сохранено');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!canEdit) {
      return;
    }
    setPublishing(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/services/${id}/publish`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!response.ok) {
        const err = await response.json().catch(() => null);
        throw new Error(err?.message || 'Не удалось опубликовать услугу');
      }
      await load();
      alert('Опубликовано');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setPublishing(false);
    }
  };

  return (
    <AdminAuthGuard allowedRoles={['owner', 'assistant']}>
      {loading ? (
        <Card>
          <CardContent className="p-8 text-sm text-muted-foreground">Загрузка...</CardContent>
        </Card>
      ) : error && !service ? (
        <Alert variant="destructive">
          <AlertDescription>Ошибка: {error}</AlertDescription>
        </Alert>
      ) : !service ? (
        <Card>
          <CardContent className="p-8 text-sm text-muted-foreground">Услуга не найдена</CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <div>
            <Button asChild variant="link" className="px-0">
              <Link href="/services">← Назад к списку</Link>
            </Button>
            <h1 className="text-2xl font-semibold text-foreground mt-4">Редактирование услуги</h1>
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
            {canEdit && service.status !== 'published' && (
              <Button onClick={handlePublish} disabled={publishing} variant="outline">
                {publishing ? 'Публикация...' : 'Опубликовать'}
              </Button>
            )}
            <Button onClick={() => router.push(`/services/${service.id}`)} variant="secondary">
              Обновить
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Параметры</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Slug</Label>
                  <Input value={service.slug} onChange={(e) => setService({ ...service, slug: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Название</Label>
                  <Input value={service.title} onChange={(e) => setService({ ...service, title: e.target.value })} />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Описание (Markdown)</Label>
                <Textarea
                  value={service.descriptionMarkdown}
                  onChange={(e) => setService({ ...service, descriptionMarkdown: e.target.value })}
                  rows={8}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Формат</Label>
                  <Select
                    value={service.format}
                    onValueChange={(value) => setService({ ...service, format: value as ServiceFormat })}
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
                    value={service.durationMinutes}
                    onChange={(e) => setService({ ...service, durationMinutes: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Статус</Label>
                  <Select
                    value={service.status}
                    onValueChange={(value) => setService({ ...service, status: value as ServiceStatus })}
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

              {service.format === 'offline' && (
                <div className="space-y-2">
                  <Label>Адрес (офлайн)</Label>
                  <Input
                    value={service.offlineAddress || ''}
                    onChange={(e) => setService({ ...service, offlineAddress: e.target.value })}
                  />
                </div>
              )}

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Цена (₽)</Label>
                  <Input
                    type="number"
                    min={0}
                    value={service.priceAmount}
                    onChange={(e) => setService({ ...service, priceAmount: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Депозит (₽)</Label>
                  <Input
                    type="number"
                    min={0}
                    value={service.depositAmount ?? ''}
                    onChange={(e) =>
                      setService({ ...service, depositAmount: e.target.value === '' ? null : Number(e.target.value) })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Тема (topicCode)</Label>
                  <Input
                    value={service.topicCode || ''}
                    onChange={(e) => setService({ ...service, topicCode: e.target.value || null })}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-4">
                <div className="space-y-2">
                  <Label>Отмена без штрафа (ч)</Label>
                  <Input
                    type="number"
                    min={0}
                    value={service.cancelFreeHours ?? ''}
                    onChange={(e) =>
                      setService({ ...service, cancelFreeHours: e.target.value === '' ? null : Number(e.target.value) })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Отмена с частичным штрафом (ч)</Label>
                  <Input
                    type="number"
                    min={0}
                    value={service.cancelPartialHours ?? ''}
                    onChange={(e) =>
                      setService({ ...service, cancelPartialHours: e.target.value === '' ? null : Number(e.target.value) })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Перенос минимум (ч)</Label>
                  <Input
                    type="number"
                    min={0}
                    value={service.rescheduleMinHours ?? ''}
                    onChange={(e) =>
                      setService({ ...service, rescheduleMinHours: e.target.value === '' ? null : Number(e.target.value) })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Перенос максимум (раз)</Label>
                  <Input
                    type="number"
                    min={0}
                    value={service.rescheduleMaxCount ?? ''}
                    onChange={(e) =>
                      setService({ ...service, rescheduleMaxCount: e.target.value === '' ? null : Number(e.target.value) })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </AdminAuthGuard>
  );
}

