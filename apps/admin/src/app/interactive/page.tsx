'use client';

import React, { useEffect, useState } from 'react';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@psychology/design-system';

interface InteractiveOverviewResponse {
  range: { from: string; to: string; label: string };
  items: {
    id: string;
    type: string;
    slug: string;
    title: string;
    status: string;
    publishedAt: string | null;
    starts: number;
    completes: number;
    completionRate: number | null;
  }[];
}

export default function InteractivePage() {
  const [overview, setOverview] = useState<InteractiveOverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch('/api/admin/interactive/overview', { credentials: 'include' })
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed to load interactive overview');
        }
        return res.json();
      })
      .then((data) => {
        setOverview(data);
      })
      .catch((err) => {
        console.error(err);
        setError('Не удалось загрузить статистику.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <AdminAuthGuard allowedRoles={['owner', 'assistant', 'editor']}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Интерактивы</h1>
          <p className="text-sm text-muted-foreground">
            Тексты и параметры интерактивов (квизы, навигатор, термометр, подготовка, границы, ритуалы).
          </p>
        </div>

        <div className="flex flex-wrap gap-2 text-sm">
          <Button asChild variant="outline" size="sm">
            <Link href="/interactive/quizzes">Квизы</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/interactive/navigator">Навигатор</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/interactive/thermometer">Термометр ресурса</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/interactive/prep">Подготовка к первой встрече</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/interactive/boundaries">Скрипты границ</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/interactive/rituals">Мини-ритуалы</Link>
          </Button>
        </div>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Статистика за 30 дней</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading && <div className="p-4 text-sm text-muted-foreground">Загрузка...</div>}
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {overview && (
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40 text-xs uppercase text-muted-foreground">
                    <TableHead>Интерактив</TableHead>
                    <TableHead>Тип</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead>Стартов</TableHead>
                    <TableHead>Завершений</TableHead>
                    <TableHead>Completion</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {overview.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="font-medium">{item.title}</div>
                        <div className="text-xs text-muted-foreground">{item.slug}</div>
                      </TableCell>
                      <TableCell>{item.type}</TableCell>
                      <TableCell>{item.status}</TableCell>
                      <TableCell>{item.starts}</TableCell>
                      <TableCell>{item.completes}</TableCell>
                      <TableCell>
                        {item.completionRate !== null ? `${item.completionRate}%` : '—'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminAuthGuard>
  );
}
