/* eslint-disable react/no-unescaped-entities */
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

interface ServiceListItem {
  id: string;
  slug: string;
  title: string;
  format: 'online' | 'offline' | 'hybrid';
  durationMinutes: number;
  priceAmount: number;
  depositAmount: number | null;
  status: 'draft' | 'published' | 'archived';
  topicCode: string | null;
  updatedAt: string;
}

const statusBadgeClasses: Record<ServiceListItem['status'], string> = {
  published: 'border-success/30 bg-success/10 text-success',
  draft: 'border-warning/30 bg-warning/10 text-warning',
  archived: 'border-muted text-muted-foreground bg-muted/40',
};

export default function ServicesPage() {
  const { user } = useAdminAuth();
  const canEdit = Boolean(user?.roles.includes('owner'));
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<ServiceListItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/services', { credentials: 'include' });
      if (!response.ok) {
        throw new Error('Не удалось загрузить услуги');
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
    <AdminAuthGuard allowedRoles={['owner', 'assistant']}>
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
              <h1 className="text-2xl font-semibold text-foreground">Услуги</h1>
              <p className="text-sm text-muted-foreground">Каталог услуг, цены и правила бронирования.</p>
            </div>
            {canEdit && (
              <Button asChild>
                <Link href="/services/new">Создать услугу</Link>
              </Button>
            )}
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40 text-xs uppercase text-muted-foreground">
                    <TableHead>Название</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Формат</TableHead>
                    <TableHead>Длительность</TableHead>
                    <TableHead>Цена</TableHead>
                    <TableHead>Депозит</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead>Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((service) => (
                    <TableRow key={service.id}>
                      <TableCell className="font-medium">{service.title}</TableCell>
                      <TableCell className="text-muted-foreground">{service.slug}</TableCell>
                      <TableCell className="text-muted-foreground">{service.format}</TableCell>
                      <TableCell className="text-muted-foreground">{service.durationMinutes} мин</TableCell>
                      <TableCell className="text-muted-foreground">{service.priceAmount} ₽</TableCell>
                      <TableCell className="text-muted-foreground">
                        {service.depositAmount === null ? '—' : `${service.depositAmount} ₽`}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={statusBadgeClasses[service.status]}>
                          {service.status === 'published' ? 'Опубликовано' : service.status === 'draft' ? 'Черновик' : 'Архив'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button asChild variant="link" className="px-0">
                          <Link href={`/services/${service.id}`}>Редактировать</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {items.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="px-6 py-4 text-center text-sm text-muted-foreground">
                        Услуг пока нет
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
