'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AdminAuthGuard } from '@/components/admin-auth-guard';

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
          <h1 className="text-2xl font-semibold">Интерактивы</h1>
          <p className="text-sm text-muted-foreground">
            Тексты и параметры интерактивов (квизы, навигатор, термометр, подготовка, границы, ритуалы).
          </p>
        </div>

        <div className="flex flex-wrap gap-2 text-sm">
          <Link href="/interactive/quizzes" className="rounded-md border px-3 py-1">
            Квизы
          </Link>
          <Link href="/interactive/navigator" className="rounded-md border px-3 py-1">
            Навигатор
          </Link>
          <Link href="/interactive/thermometer" className="rounded-md border px-3 py-1">
            Термометр ресурса
          </Link>
          <Link href="/interactive/prep" className="rounded-md border px-3 py-1">
            Подготовка к первой встрече
          </Link>
          <Link href="/interactive/boundaries" className="rounded-md border px-3 py-1">
            Скрипты границ
          </Link>
          <Link href="/interactive/rituals" className="rounded-md border px-3 py-1">
            Мини-ритуалы
          </Link>
        </div>

        <div className="rounded-lg border bg-white">
          <div className="border-b px-4 py-3 text-sm text-muted-foreground">
            Статистика за 30 дней
          </div>
          {loading && <div className="p-4 text-sm">Загрузка...</div>}
          {error && <div className="p-4 text-sm text-red-500">{error}</div>}
          {overview && (
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Интерактив</th>
                  <th className="px-4 py-3 text-left font-medium">Тип</th>
                  <th className="px-4 py-3 text-left font-medium">Статус</th>
                  <th className="px-4 py-3 text-left font-medium">Стартов</th>
                  <th className="px-4 py-3 text-left font-medium">Завершений</th>
                  <th className="px-4 py-3 text-left font-medium">Completion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {overview.items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-3">
                      <div className="font-medium">{item.title}</div>
                      <div className="text-xs text-muted-foreground">{item.slug}</div>
                    </td>
                    <td className="px-4 py-3">{item.type}</td>
                    <td className="px-4 py-3">{item.status}</td>
                    <td className="px-4 py-3">{item.starts}</td>
                    <td className="px-4 py-3">{item.completes}</td>
                    <td className="px-4 py-3">
                      {item.completionRate !== null ? `${item.completionRate}%` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AdminAuthGuard>
  );
}
