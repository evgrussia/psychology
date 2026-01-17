"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { AdminAuthGuard } from '@/components/admin-auth-guard';

type RangePreset = 'today' | '7d' | '30d' | 'custom';

interface FunnelResponse {
  range: { preset: RangePreset; from: string; to: string; label: string };
  steps: { event?: string; step?: string; count: number }[];
  conversion: { from: string; to: string; rate: number | null }[];
}

interface NoShowResponse {
  range: { preset: RangePreset; from: string; to: string; label: string };
  totalCount: number;
  noShowCount: number;
  noShowRate: number | null;
}

const rangeOptions: { value: RangePreset; label: string }[] = [
  { value: 'today', label: 'Сегодня' },
  { value: '7d', label: '7 дней' },
  { value: '30d', label: '30 дней' },
  { value: 'custom', label: 'Выбрать' },
];

const bookingLabels: Record<string, string> = {
  booking_start: 'Старт записи',
  booking_slot_selected: 'Выбран слот',
  booking_paid: 'Оплата',
  booking_confirmed: 'Подтверждение',
};

const telegramLabels: Record<string, string> = {
  cta_tg_click: 'Клик на CTA',
  tg_subscribe_confirmed: 'Подписка подтверждена',
  tg_onboarding_completed: 'Онбординг завершён',
};

const interactiveLabels: Record<string, string> = {
  start: 'Старт интерактивов',
  complete: 'Завершения',
  cta_or_booking: 'CTA или запись',
};

export default function AnalyticsPage() {
  const [range, setRange] = useState<RangePreset>('7d');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [topic, setTopic] = useState('');
  const [serviceSlug, setServiceSlug] = useState('');
  const [tgFlow, setTgFlow] = useState('');
  const [booking, setBooking] = useState<FunnelResponse | null>(null);
  const [telegram, setTelegram] = useState<FunnelResponse | null>(null);
  const [interactive, setInteractive] = useState<FunnelResponse | null>(null);
  const [noShow, setNoShow] = useState<NoShowResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const query = useMemo(() => {
    const params = new URLSearchParams();
    params.set('range', range);
    if (range === 'custom') {
      if (customFrom) params.set('from', customFrom);
      if (customTo) params.set('to', customTo);
    }
    if (topic.trim()) params.set('topic', topic.trim());
    if (serviceSlug.trim()) params.set('service_slug', serviceSlug.trim());
    if (tgFlow.trim()) params.set('tg_flow', tgFlow.trim());
    return params.toString();
  }, [range, customFrom, customTo, topic, serviceSlug, tgFlow]);

  useEffect(() => {
    if (range === 'custom' && (!customFrom || !customTo)) {
      return;
    }

    let active = true;
    setLoading(true);
    setError(null);

    const fetchJson = async <T,>(url: string): Promise<T> => {
      const res = await fetch(url, { credentials: 'include' });
      if (!res.ok) {
        throw new Error('Failed to load analytics');
      }
      return (await res.json()) as T;
    };

    Promise.all([
      fetchJson<FunnelResponse>(`/api/admin/analytics/funnels/booking?${query}`),
      fetchJson<FunnelResponse>(`/api/admin/analytics/funnels/telegram?${query}`),
      fetchJson<FunnelResponse>(`/api/admin/analytics/funnels/interactive?${query}`),
      fetchJson<NoShowResponse>(`/api/admin/analytics/no-show?${query}`),
    ])
      .then(([bookingData, telegramData, interactiveData, noShowData]) => {
        if (!active) return;
        setBooking(bookingData);
        setTelegram(telegramData);
        setInteractive(interactiveData);
        setNoShow(noShowData);
      })
      .catch((err) => {
        console.error(err);
        if (!active) return;
        setError('Не удалось загрузить аналитику.');
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
            <h1 className="text-2xl font-semibold">Аналитика</h1>
            <p className="text-sm text-muted-foreground">
              Воронки booking, Telegram и интерактивов на основе агрегатов.
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

        <div className="grid gap-3 lg:grid-cols-3">
          <input
            type="text"
            placeholder="Topic (например anxiety)"
            value={topic}
            onChange={(event) => setTopic(event.target.value)}
            className="rounded-md border px-3 py-2 text-sm"
          />
          <input
            type="text"
            placeholder="service_slug (например primary_consultation)"
            value={serviceSlug}
            onChange={(event) => setServiceSlug(event.target.value)}
            className="rounded-md border px-3 py-2 text-sm"
          />
          <input
            type="text"
            placeholder="tg_flow (например plan_7d)"
            value={tgFlow}
            onChange={(event) => setTgFlow(event.target.value)}
            className="rounded-md border px-3 py-2 text-sm"
          />
        </div>

        {loading && <div className="text-sm text-muted-foreground">Загружаем аналитику...</div>}
        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
            {error}
          </div>
        )}

        {booking && telegram && interactive && noShow && (
          <div className="space-y-6">
            <section className="grid gap-4 lg:grid-cols-3">
              <div className="rounded-lg border p-4">
                <h2 className="text-sm font-semibold text-muted-foreground">Booking funnel</h2>
                <div className="mt-3 space-y-2 text-sm">
                  {booking.steps.map((step) => (
                    <div key={step.event} className="flex items-center justify-between">
                      <span>{bookingLabels[step.event ?? ''] || step.event}</span>
                      <span className="font-medium">{step.count}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 space-y-1 text-xs text-muted-foreground">
                  {booking.conversion.map((item) => (
                    <div key={`${item.from}-${item.to}`}>
                      {bookingLabels[item.from] || item.from} → {bookingLabels[item.to] || item.to}:{' '}
                      {item.rate === null ? '—' : `${Math.round(item.rate * 100)}%`}
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border p-4">
                <h2 className="text-sm font-semibold text-muted-foreground">Telegram funnel</h2>
                <div className="mt-3 space-y-2 text-sm">
                  {telegram.steps.map((step) => (
                    <div key={step.event} className="flex items-center justify-between">
                      <span>{telegramLabels[step.event ?? ''] || step.event}</span>
                      <span className="font-medium">{step.count}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 space-y-1 text-xs text-muted-foreground">
                  {telegram.conversion.map((item) => (
                    <div key={`${item.from}-${item.to}`}>
                      {telegramLabels[item.from] || item.from} → {telegramLabels[item.to] || item.to}:{' '}
                      {item.rate === null ? '—' : `${Math.round(item.rate * 100)}%`}
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border p-4">
                <h2 className="text-sm font-semibold text-muted-foreground">Interactive funnel</h2>
                <div className="mt-3 space-y-2 text-sm">
                  {interactive.steps.map((step) => (
                    <div key={step.step} className="flex items-center justify-between">
                      <span>{interactiveLabels[step.step ?? ''] || step.step}</span>
                      <span className="font-medium">{step.count}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 space-y-1 text-xs text-muted-foreground">
                  {interactive.conversion.map((item) => (
                    <div key={`${item.from}-${item.to}`}>
                      {interactiveLabels[item.from] || item.from} → {interactiveLabels[item.to] || item.to}:{' '}
                      {item.rate === null ? '—' : `${Math.round(item.rate * 100)}%`}
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="rounded-lg border p-4">
              <h2 className="text-sm font-semibold text-muted-foreground">No-show</h2>
              <div className="mt-3 grid gap-2 text-sm md:grid-cols-3">
                <div className="flex items-center justify-between">
                  <span>Всего исходов</span>
                  <span className="font-medium">{noShow.totalCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>No-show</span>
                  <span className="font-medium">{noShow.noShowCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Rate</span>
                  <span className="font-medium">
                    {noShow.noShowRate === null ? '—' : `${Math.round(noShow.noShowRate * 100)}%`}
                  </span>
                </div>
              </div>
            </section>
          </div>
        )}
      </div>
    </AdminAuthGuard>
  );
}
