"use client";

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { AdminAuthGuard } from '@/components/admin-auth-guard';

type RangePreset = 'today' | '7d' | '30d' | 'custom';

interface DashboardResponse {
  range: { preset: RangePreset; from: string; to: string; label: string };
  bookingFunnel: {
    steps: { event: string; count: number }[];
    conversion: { from: string; to: string; rate: number | null }[];
  };
  telegram: {
    newSubscriptions: number;
    activeUsers: number;
    stoppedCount: number;
    startedCount: number;
    stopRate: number | null;
  };
  interactive: {
    items: {
      id: string;
      title: string;
      type: string;
      starts: number;
      completions: number;
      completionRate: number | null;
    }[];
  };
  meetings: {
    upcoming: { id: string; startAt: string; serviceTitle: string; format: string }[];
    completedCount: number;
    noShowCount: number;
    outcomeCount: number;
    noShowRate: number | null;
  };
  moderation: {
    pendingCount: number;
    flaggedCount: number;
    averageModerationHours: number | null;
    alert: { type: string; message: string } | null;
  };
  revenue: {
    gmv: number;
    currency: string;
    aov: number | null;
    previousGmv: number;
    changePct: number | null;
  };
}

const rangeOptions: { value: RangePreset; label: string }[] = [
  { value: 'today', label: 'Сегодня' },
  { value: '7d', label: '7 дней' },
  { value: '30d', label: '30 дней' },
  { value: 'custom', label: 'Выбрать' },
];

const funnelLabels: Record<string, string> = {
  booking_start: 'Старт записи',
  booking_slot_selected: 'Выбран слот',
  booking_paid: 'Оплата',
  booking_confirmed: 'Подтверждение',
};

export default function Page() {
  const [range, setRange] = useState<RangePreset>('7d');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const query = useMemo(() => {
    const params = new URLSearchParams();
    params.set('range', range);
    if (range === 'custom') {
      if (customFrom) params.set('from', customFrom);
      if (customTo) params.set('to', customTo);
    }
    return params.toString();
  }, [range, customFrom, customTo]);

  useEffect(() => {
    if (range === 'custom' && (!customFrom || !customTo)) {
      return;
    }

    let active = true;
    setLoading(true);
    setError(null);

    fetch(`/api/admin/dashboard?${query}`, { credentials: 'include' })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error('Не удалось загрузить дашборд.');
        }
        return (await res.json()) as DashboardResponse;
      })
      .then((payload) => {
        if (!active) return;
        setData(payload);
      })
      .catch((err) => {
        console.error(err);
        if (!active) return;
        setError('Не удалось загрузить данные.');
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [query, range, customFrom, customTo]);

  return (
    <AdminAuthGuard allowedRoles={['owner', 'assistant']}>
      <div className="space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Дашборд</h1>
            <p className="text-sm text-muted-foreground">
              Ключевые метрики и быстрый доступ к разделам админки.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <label className="text-sm text-muted-foreground">
              Период
              <select
                value={range}
                onChange={(event) => setRange(event.target.value as RangePreset)}
                className="ml-2 rounded-md border px-2 py-1 text-sm text-foreground"
              >
                {rangeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            {range === 'custom' && (
              <div className="flex items-center gap-2 text-sm">
                <input
                  type="date"
                  value={customFrom}
                  onChange={(event) => setCustomFrom(event.target.value)}
                  className="rounded-md border px-2 py-1"
                />
                <span className="text-muted-foreground">—</span>
                <input
                  type="date"
                  value={customTo}
                  onChange={(event) => setCustomTo(event.target.value)}
                  className="rounded-md border px-2 py-1"
                />
              </div>
            )}
          </div>
        </div>

        {loading && <div className="text-sm text-muted-foreground">Загружаем метрики...</div>}
        {error && <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">{error}</div>}

        {data && (
          <div className="space-y-6">
            <section className="grid gap-4 lg:grid-cols-3">
              <div className="rounded-lg border p-4">
                <h2 className="text-sm font-semibold text-muted-foreground">Воронка записи</h2>
                <div className="mt-3 space-y-2 text-sm">
                  {data.bookingFunnel.steps.map((step) => (
                    <div key={step.event} className="flex items-center justify-between">
                      <span>{funnelLabels[step.event] || step.event}</span>
                      <span className="font-medium">{step.count}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 space-y-1 text-xs text-muted-foreground">
                  {data.bookingFunnel.conversion.map((item) => (
                    <div key={`${item.from}-${item.to}`}>
                      {funnelLabels[item.from] || item.from} → {funnelLabels[item.to] || item.to}:{' '}
                      {item.rate === null ? '—' : `${Math.round(item.rate * 100)}%`}
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border p-4">
                <h2 className="text-sm font-semibold text-muted-foreground">Telegram</h2>
                <div className="mt-3 space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span>Новые подписки</span>
                    <span className="font-medium">{data.telegram.newSubscriptions}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Активные пользователи</span>
                    <span className="font-medium">{data.telegram.activeUsers}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Stop rate</span>
                    <span className="font-medium">
                      {data.telegram.stopRate === null
                        ? '—'
                        : `${Math.round(data.telegram.stopRate * 100)}%`}
                    </span>
                  </div>
                </div>
                <p className="mt-3 text-xs text-muted-foreground">
                  Стартов: {data.telegram.startedCount} · Остановок: {data.telegram.stoppedCount}
                </p>
              </div>

              <div className="rounded-lg border p-4">
                <h2 className="text-sm font-semibold text-muted-foreground">Выручка</h2>
                <div className="mt-3 space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span>GMV</span>
                    <span className="font-medium">
                      {data.revenue.gmv.toLocaleString('ru-RU')} {data.revenue.currency}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>AOV</span>
                    <span className="font-medium">
                      {data.revenue.aov === null
                        ? '—'
                        : `${Math.round(data.revenue.aov).toLocaleString('ru-RU')} ${data.revenue.currency}`}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Изменение</span>
                    <span className="font-medium">
                      {data.revenue.changePct === null
                        ? '—'
                        : `${Math.round(data.revenue.changePct * 100)}%`}
                    </span>
                  </div>
                </div>
              </div>
            </section>

            <section className="grid gap-4 lg:grid-cols-3">
              <div className="rounded-lg border p-4">
                <h2 className="text-sm font-semibold text-muted-foreground">Интерактивы (top)</h2>
                <div className="mt-3 space-y-2 text-sm">
                  {data.interactive.items.length === 0 && (
                    <div className="text-xs text-muted-foreground">Нет данных за период.</div>
                  )}
                  {data.interactive.items.map((item) => (
                    <div key={item.id} className="space-y-1">
                      <div className="flex items-center justify-between font-medium">
                        <span>{item.title}</span>
                        <span>{item.starts}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Completion: {item.completionRate === null ? '—' : `${Math.round(item.completionRate * 100)}%`}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border p-4">
                <h2 className="text-sm font-semibold text-muted-foreground">Встречи</h2>
                <div className="mt-3 space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span>Завершено</span>
                    <span className="font-medium">{data.meetings.completedCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>No-show rate</span>
                    <span className="font-medium">
                      {data.meetings.noShowRate === null
                        ? '—'
                        : `${Math.round(data.meetings.noShowRate * 100)}%`}
                    </span>
                  </div>
                </div>
                <div className="mt-4 space-y-2 text-xs text-muted-foreground">
                  {data.meetings.upcoming.length === 0 && <div>Нет предстоящих встреч.</div>}
                  {data.meetings.upcoming.map((appointment) => (
                    <div key={appointment.id} className="flex items-center justify-between">
                      <span>{new Date(appointment.startAt).toLocaleString('ru-RU')}</span>
                      <span>{appointment.serviceTitle}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border p-4">
                <h2 className="text-sm font-semibold text-muted-foreground">Модерация</h2>
                <div className="mt-3 space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span>В очереди</span>
                    <span className="font-medium">{data.moderation.pendingCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Flagged</span>
                    <span className="font-medium">{data.moderation.flaggedCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Среднее время</span>
                    <span className="font-medium">
                      {data.moderation.averageModerationHours === null
                        ? '—'
                        : `${data.moderation.averageModerationHours.toFixed(1)} ч`}
                    </span>
                  </div>
                </div>
                {data.moderation.alert && (
                  <div className="mt-3 rounded-md border border-destructive/30 bg-destructive/5 p-2 text-xs text-destructive">
                    {data.moderation.alert.message}
                  </div>
                )}
              </div>
            </section>

            <section className="rounded-lg border p-4">
              <h2 className="text-sm font-semibold text-muted-foreground">Быстрые переходы</h2>
              <div className="mt-3 flex flex-wrap gap-2 text-sm">
                <Link href="/schedule" className="rounded-md border px-3 py-1">
                  Расписание
                </Link>
                <Link href="/content" className="rounded-md border px-3 py-1">
                  Контент
                </Link>
                <Link href="/moderation" className="rounded-md border px-3 py-1">
                  Модерация
                </Link>
                <Link href="/leads" className="rounded-md border px-3 py-1">
                  CRM-лиды
                </Link>
                <Link href="/analytics" className="rounded-md border px-3 py-1">
                  Аналитика
                </Link>
              </div>
            </section>
          </div>
        )}
      </div>
    </AdminAuthGuard>
  );
}
