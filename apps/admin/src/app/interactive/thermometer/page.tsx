'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AdminAuthGuard } from '@/components/admin-auth-guard';
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

interface InteractiveDefinition {
  id: string;
  slug: string;
  title: string;
  topicCode: string | null;
  status: 'draft' | 'published' | 'archived';
  publishedAt: string | null;
}

const statusBadgeClasses: Record<InteractiveDefinition['status'], string> = {
  published: 'border-success/30 bg-success/10 text-success',
  draft: 'border-warning/30 bg-warning/10 text-warning',
  archived: 'border-muted text-muted-foreground bg-muted/40',
};

export default function ThermometerListPage() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<InteractiveDefinition[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDefinitions();
  }, []);

  const fetchDefinitions = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/interactive/definitions?type=thermometer', {
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Не удалось загрузить термометры');
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
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Термометр ресурса</h1>
            <p className="text-sm text-muted-foreground">Конфигурации THERMOMETER (шкалы, пороги, тексты результатов).</p>
          </div>

          <Card>
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
                          {item.status === 'published' ? 'Опубликовано' : item.status === 'draft' ? 'Черновик' : 'Архив'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {item.publishedAt ? new Date(item.publishedAt).toLocaleDateString('ru-RU') : '—'}
                      </TableCell>
                      <TableCell>
                        <Button asChild variant="link" className="px-0">
                          <Link href={`/interactive/thermometer/${item.id}`}>Редактировать</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {items.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="px-6 py-4 text-center text-sm text-muted-foreground">
                        Термометры пока не созданы
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

