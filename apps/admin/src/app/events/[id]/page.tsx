'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Textarea,
} from '@psychology/design-system';

type EventFormat = 'online' | 'offline' | 'hybrid';
type EventStatus = 'draft' | 'published' | 'archived';

interface EventModel {
  id: string;
  slug: string;
  title: string;
  description_markdown: string;
  starts_at: string;
  ends_at: string | null;
  format: EventFormat;
  location_text: string | null;
  status: EventStatus;
  capacity: number | null;
  registration_open: boolean;
  published_at: string | null;
}

interface RegistrationModel {
  id: string;
  preferred_contact: string;
  submitted_at: string;
  consent_personal_data: boolean;
  consent_communications: boolean;
}

export default function EditEventPage() {
  const params = useParams();
  const id = params.id as string;
  const { user } = useAdminAuth();
  const canEdit = Boolean(user?.roles.includes('owner'));

  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [publishing, setPublishing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [event, setEvent] = React.useState<EventModel | null>(null);
  const [registrations, setRegistrations] = React.useState<RegistrationModel[]>([]);
  const [registrationsLoading, setRegistrationsLoading] = React.useState(false);

  React.useEffect(() => {
    void load();
    void loadRegistrations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/events/${id}`, { credentials: 'include' });
      if (!response.ok) throw new Error('Не удалось загрузить мероприятие');
      const data = await response.json();
      setEvent(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadRegistrations = async () => {
    setRegistrationsLoading(true);
    try {
      const response = await fetch(`/api/admin/events/${id}/registrations`, { credentials: 'include' });
      if (!response.ok) throw new Error('Не удалось загрузить регистрации');
      const data = await response.json();
      setRegistrations(data);
    } catch {
      // silently ignore (registrations can be empty)
    } finally {
      setRegistrationsLoading(false);
    }
  };

  const save = async () => {
    if (!event) return;
    if (!canEdit) {
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/events/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          slug: event.slug,
          title: event.title,
          description_markdown: event.description_markdown,
          starts_at: event.starts_at,
          ends_at: event.ends_at,
          format: event.format,
          location_text: event.location_text,
          status: event.status,
          capacity: event.capacity,
          registration_open: event.registration_open,
        }),
      });
      if (!response.ok) {
        const err = await response.json().catch(() => null);
        throw new Error(err?.message || 'Не удалось сохранить');
      }
      alert('Сохранено');
      await load();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const publish = async () => {
    if (!canEdit) {
      return;
    }
    setPublishing(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/events/${id}/publish`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!response.ok) {
        const err = await response.json().catch(() => null);
        throw new Error(err?.message || 'Не удалось опубликовать');
      }
      alert('Опубликовано');
      await load();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setPublishing(false);
    }
  };

  return (
    <AdminAuthGuard allowedRoles={['owner', 'editor']}>
      {loading ? (
        <Card>
          <CardContent className="p-8 text-sm text-muted-foreground">Загрузка...</CardContent>
        </Card>
      ) : error && !event ? (
        <Alert variant="destructive">
          <AlertDescription>Ошибка: {error}</AlertDescription>
        </Alert>
      ) : !event ? (
        <Card>
          <CardContent className="p-8 text-sm text-muted-foreground">Мероприятие не найдено</CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <div>
            <Button asChild variant="link" className="px-0">
              <Link href="/events">← Назад к списку</Link>
            </Button>
            <h1 className="text-2xl font-semibold text-foreground mt-4">Редактирование мероприятия</h1>
            {error && (
              <Alert variant="destructive" className="mt-2">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            <Button onClick={() => void save()} disabled={!canEdit || saving}>
              {saving ? 'Сохранение...' : 'Сохранить'}
            </Button>
            {canEdit && event.status !== 'published' && (
              <Button onClick={() => void publish()} disabled={publishing} variant="outline">
                {publishing ? 'Публикация...' : 'Опубликовать'}
              </Button>
            )}
            <Button asChild variant="secondary">
              <a href={`/events/${event.slug}`} target="_blank" rel="noreferrer">
                Публичная страница
              </a>
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
                  <Input
                    value={event.slug}
                    onChange={(e) => setEvent({ ...event, slug: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Название</Label>
                  <Input
                    value={event.title}
                    onChange={(e) => setEvent({ ...event, title: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Описание (Markdown)</Label>
                <Textarea
                  value={event.description_markdown}
                  onChange={(e) => setEvent({ ...event, description_markdown: e.target.value })}
                  rows={10}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Начало (ISO)</Label>
                  <Input
                    value={event.starts_at}
                    onChange={(e) => setEvent({ ...event, starts_at: e.target.value })}
                    className="font-mono text-xs"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Окончание (ISO)</Label>
                  <Input
                    value={event.ends_at || ''}
                    onChange={(e) => setEvent({ ...event, ends_at: e.target.value || null })}
                    className="font-mono text-xs"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-4">
                <div className="space-y-2">
                  <Label>Формат</Label>
                  <Select
                    value={event.format}
                    onValueChange={(value) => setEvent({ ...event, format: value as EventFormat })}
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
                  <Label>Локация</Label>
                  <Input
                    value={event.location_text || ''}
                    onChange={(e) => setEvent({ ...event, location_text: e.target.value || null })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Статус</Label>
                  <Select
                    value={event.status}
                    onValueChange={(value) => setEvent({ ...event, status: value as EventStatus })}
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
                  <Label>Вместимость</Label>
                  <Input
                    type="number"
                    min={0}
                    value={event.capacity ?? ''}
                    onChange={(e) =>
                      setEvent({ ...event, capacity: e.target.value === '' ? null : Number(e.target.value) })
                    }
                  />
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={event.registration_open}
                      onCheckedChange={(checked) =>
                        setEvent({ ...event, registration_open: Boolean(checked) })
                      }
                    />
                    Регистрация открыта
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Регистрации</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Button onClick={() => void loadRegistrations()} variant="link" className="px-0">
                  Обновить
                </Button>
              </div>
              {registrationsLoading ? (
                <div className="text-sm text-muted-foreground">Загрузка...</div>
              ) : registrations.length === 0 ? (
                <div className="text-sm text-muted-foreground">Пока нет регистраций</div>
              ) : (
                <div className="overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/40 text-xs uppercase text-muted-foreground">
                        <TableHead>ID</TableHead>
                        <TableHead>Контакт</TableHead>
                        <TableHead>Дата</TableHead>
                        <TableHead>Согласия</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {registrations.map((r) => (
                        <TableRow key={r.id}>
                          <TableCell className="text-xs font-mono">{r.id}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{r.preferred_contact}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(r.submitted_at).toLocaleString('ru-RU')}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            PD: {r.consent_personal_data ? 'yes' : 'no'}, COM: {r.consent_communications ? 'yes' : 'no'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </AdminAuthGuard>
  );
}

