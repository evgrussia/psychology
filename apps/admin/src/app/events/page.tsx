'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AdminAuthGuard } from '@/components/admin-auth-guard';
import { useAdminAuth } from '@/components/admin-auth-context';
import {
  Alert,
  AlertDescription,
  Badge,
  Button,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@psychology/design-system';

interface EventListItem {
  id: string;
  slug: string;
  title: string;
  status: 'draft' | 'published' | 'archived';
  starts_at: string;
  ends_at: string | null;
  format: 'online' | 'offline' | 'hybrid';
  location_text: string | null;
  capacity: number | null;
  registration_open: boolean;
  published_at: string | null;
}

const statusBadgeClasses: Record<EventListItem['status'], string> = {
  published: 'border-success/30 bg-success/10 text-success',
  draft: 'border-warning/30 bg-warning/10 text-warning',
  archived: 'border-muted text-muted-foreground bg-muted/40',
};

export default function EventsPage() {
  const { user } = useAdminAuth();
  const canEdit = Boolean(user?.roles.includes('owner'));
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<EventListItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/events', { credentials: 'include' });
      if (!response.ok) {
        throw new Error('Не удалось загрузить мероприятия');
      }
      const data = await response.json();
      setItems(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminAuthGuard allowedRoles={['owner', 'editor']}>
      {loading ? (
        <Card>
          <CardContent className="p-8 text-sm text-muted-foreground">Загрузка...</CardContent>
        </Card>
      ) : error ? (
        <Alert variant="destructive">
          <AlertDescription>Ошибка: {error}</AlertDescription>
        </Alert>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Мероприятия</h1>
              <p className="text-sm text-muted-foreground">Создание, публикация и просмотр регистраций.</p>
            </div>
            {canEdit && (
              <Button asChild>
                <Link href="/events/new">Создать мероприятие</Link>
              </Button>
            )}
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40 text-xs uppercase text-muted-foreground">
                    <TableHead>Название</TableHead>
                    <TableHead>Дата</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead>Регистрация</TableHead>
                    <TableHead>Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell className="font-medium">{event.title}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(event.starts_at).toLocaleString('ru-RU')}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={statusBadgeClasses[event.status]}>
                          {event.status === 'published' ? 'Опубликовано' : event.status === 'draft' ? 'Черновик' : 'Архив'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {event.registration_open ? 'открыта' : 'закрыта'}
                        {event.capacity !== null ? ` · cap=${event.capacity}` : ''}
                      </TableCell>
                      <TableCell>
                        <Button asChild variant="link" className="px-0">
                          <Link href={`/events/${event.id}`}>Редактировать</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {items.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="px-6 py-4 text-center text-sm text-muted-foreground">
                        Мероприятий пока нет
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}
    </AdminAuthGuard>
  );
}
