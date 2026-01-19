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
  CardHeader,
  CardTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@psychology/design-system';

interface RitualDefinition {
  id: string;
  slug: string;
  title: string;
  topicCode: string | null;
  status: 'draft' | 'published' | 'archived';
  publishedAt: string | null;
}

const statusBadgeClasses: Record<RitualDefinition['status'], string> = {
  published: 'border-success/30 bg-success/10 text-success',
  draft: 'border-warning/30 bg-warning/10 text-warning',
  archived: 'border-muted text-muted-foreground bg-muted/40',
};

export default function RitualsListPage() {
  const { user } = useAdminAuth();
  const canEdit = Boolean(user?.roles.some((role) => role === 'owner' || role === 'editor'));
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<RitualDefinition[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDefinitions();
  }, []);

  const fetchDefinitions = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/interactive/definitions?type=ritual', {
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Не удалось загрузить ритуалы');
      }
      const data = await response.json();
      setItems(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!canEdit) return;
    const title = window.prompt('Название ритуала');
    if (!title) return;
    const slug = window.prompt('Slug ритуала (латиница, без пробелов)');
    if (!slug) return;

    try {
      const response = await fetch('/api/admin/interactive/rituals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          slug: slug.trim(),
          title: title.trim(),
          config: {
            why: 'Добавьте краткое описание ритуала.',
            totalDurationSeconds: 180,
            steps: [
              {
                id: `step_${Date.now()}`,
                title: 'Шаг 1',
                content: 'Опишите первый шаг ритуала.',
                durationSeconds: 60,
              },
            ],
          },
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Не удалось создать ритуал');
      }

      const data = await response.json();
      window.location.href = `/interactive/rituals/${data.id}`;
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <AdminAuthGuard allowedRoles={['owner', 'assistant', 'editor']}>
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
              <h1 className="text-2xl font-semibold text-foreground">Мини-ритуалы</h1>
              <p className="text-sm text-muted-foreground">
                Управление библиотекой ритуалов и публикациями.
              </p>
            </div>
            {canEdit && (
              <Button onClick={handleCreate}>
                Создать ритуал
              </Button>
            )}
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Список ритуалов</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40 text-xs uppercase text-muted-foreground">
                    <TableHead>Название</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Тема</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead>Опубликовано</TableHead>
                    <TableHead>Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.title}</TableCell>
                      <TableCell className="text-muted-foreground">{item.slug}</TableCell>
                      <TableCell className="text-muted-foreground">{item.topicCode || '—'}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={statusBadgeClasses[item.status]}>
                          {item.status === 'published' ? 'Опубликовано' :
                           item.status === 'draft' ? 'Черновик' : 'Архив'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {item.publishedAt ? new Date(item.publishedAt).toLocaleDateString('ru-RU') : '—'}
                      </TableCell>
                      <TableCell>
                        <Button asChild variant="link" className="px-0">
                          <Link href={`/interactive/rituals/${item.id}`}>Редактировать</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {items.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="py-6 text-center text-sm text-muted-foreground">
                        Ритуалы пока не созданы
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
