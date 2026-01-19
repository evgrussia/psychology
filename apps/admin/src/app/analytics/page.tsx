"use client";

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { AdminAuthGuard } from '@/components/admin-auth-guard';

type RangePreset = 'today' | '7d' | '30d' | '90d' | 'custom';

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
  { value: '90d', label: '90 дней' },
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
  const [compareEnabled, setCompareEnabled] = useState(false);
  const [booking, setBooking] = useState<FunnelResponse | null>(null);
  const [telegram, setTelegram] = useState<FunnelResponse | null>(null);
  const [interactive, setInteractive] = useState<FunnelResponse | null>(null);
  const [noShow, setNoShow] = useState<NoShowResponse | null>(null);
  const [bookingCompare, setBookingCompare] = useState<FunnelResponse | null>(null);
  const [telegramCompare, setTelegramCompare] = useState<FunnelResponse | null>(null);
  const [interactiveCompare, setInteractiveCompare] = useState<FunnelResponse | null>(null);
  const [noShowCompare, setNoShowCompare] = useState<NoShowResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const buildQuery = useCallback((
    rangeValue: RangePreset,
    fromValue?: string,
    toValue?: string,
  ) => {
    const params = new URLSearchParams();
    params.set('range', rangeValue);
    if (rangeValue === 'custom') {
      if (fromValue) params.set('from', fromValue);
      if (toValue) params.set('to', toValue);
    }
    if (topic.trim()) params.set('topic', topic.trim());
    if (serviceSlug.trim()) params.set('service_slug', serviceSlug.trim());
    if (tgFlow.trim()) params.set('tg_flow', tgFlow.trim());
    return params.toString();
  }, [topic, serviceSlug, tgFlow]);

  const resolveRangeDates = useCallback(() => {
    const today = new Date();
    const formatDate = (date: Date) => date.toISOString().slice(0, 10);
    if (range === 'custom' && customFrom && customTo) {
      return { from: customFrom, to: customTo };
    }
    if (range === 'today') {
      const date = formatDate(today);
      return { from: date, to: date };
    }
    const days = range === '90d' ? 90 : range === '30d' ? 30 : 7;
    const fromDate = new Date(today.getTime() - (days - 1) * 24 * 60 * 60 * 1000);
    return { from: formatDate(fromDate), to: formatDate(today) };
  }, [range, customFrom, customTo]);

  const query = useMemo(() => {
    if (range === 'custom' && (!customFrom || !customTo)) {
      return '';
    }
    const dates = resolveRangeDates();
    return buildQuery(range, dates.from, dates.to);
  }, [range, customFrom, customTo, buildQuery, resolveRangeDates]);

  const compareQuery = useMemo(() => {
    if (!compareEnabled) return null;
    const dates = resolveRangeDates();
    if (!dates.from || !dates.to) return null;
    const currentFrom = new Date(dates.from);
    const currentTo = new Date(dates.to);
    const duration = currentTo.getTime() - currentFrom.getTime();
    const prevTo = new Date(currentFrom.getTime() - 24 * 60 * 60 * 1000);
    const prevFrom = new Date(prevTo.getTime() - duration);
    const formatDate = (date: Date) => date.toISOString().slice(0, 10);
    return buildQuery('custom', formatDate(prevFrom), formatDate(prevTo));
  }, [compareEnabled, buildQuery, resolveRangeDates]);

  useEffect(() => {
    if (!query) return;

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

    const requests = [
      fetchJson<FunnelResponse>(`/api/admin/analytics/funnels/booking?${query}`),
      fetchJson<FunnelResponse>(`/api/admin/analytics/funnels/telegram?${query}`),
      fetchJson<FunnelResponse>(`/api/admin/analytics/funnels/interactive?${query}`),
      fetchJson<NoShowResponse>(`/api/admin/analytics/no-show?${query}`),
    ];

    if (compareEnabled && compareQuery) {
      requests.push(
        fetchJson<FunnelResponse>(`/api/admin/analytics/funnels/booking?${compareQuery}`),
        fetchJson<FunnelResponse>(`/api/admin/analytics/funnels/telegram?${compareQuery}`),
        fetchJson<FunnelResponse>(`/api/admin/analytics/funnels/interactive?${compareQuery}`),
        fetchJson<NoShowResponse>(`/api/admin/analytics/no-show?${compareQuery}`),
      );
    }

    Promise.all(requests)
      .then((results) => {
        if (!active) return;
        const [bookingData, telegramData, interactiveData, noShowData, bookingPrev, telegramPrev, interactivePrev, noShowPrev] = results;
        setBooking(bookingData as FunnelResponse);
        setTelegram(telegramData as FunnelResponse);
        setInteractive(interactiveData as FunnelResponse);
        setNoShow(noShowData as NoShowResponse);
        if (compareEnabled && compareQuery) {
          setBookingCompare((bookingPrev as FunnelResponse) ?? null);
          setTelegramCompare((telegramPrev as FunnelResponse) ?? null);
          setInteractiveCompare((interactivePrev as FunnelResponse) ?? null);
          setNoShowCompare((noShowPrev as NoShowResponse) ?? null);
        } else {
          setBookingCompare(null);
          setTelegramCompare(null);
          setInteractiveCompare(null);
          setNoShowCompare(null);
        }
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
  }, [query, compareEnabled, compareQuery]);

  const escapeCsv = (value: string) => {
    const escaped = value.replace(/"/g, '""');
    if (escaped.includes(',') || escaped.includes('\n') || escaped.includes('"')) {
      return `"${escaped}"`;
    }
    return escaped;
  };

  const downloadCsv = (filename: string, rows: string[][]) => {
    const csv = rows.map((row) => row.map(escapeCsv).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const exportFunnel = (
    filename: string,
    funnel: FunnelResponse,
    compare: FunnelResponse | null,
    labels: Record<string, string>,
    key: 'event' | 'step',
  ) => {
    const compareMap = new Map(
      (compare?.steps ?? []).map((step) => [String(step[key]), step.count]),
    );
    const rows: string[][] = [
      ['kind', 'label', 'current', 'previous', 'delta'],
      ...funnel.steps.map((step) => {
        const label = labels[step[key] ?? ''] || step[key] || '';
        const prev = compareMap.get(String(step[key]));
        const delta = prev !== undefined ? step.count - prev : '';
        return ['step', String(label), String(step.count), prev !== undefined ? String(prev) : '', String(delta)];
      }),
      ...funnel.conversion.map((item) => {
        const label = `${labels[item.from] || item.from}→${labels[item.to] || item.to}`;
        const rate = item.rate === null ? '' : String(Math.round(item.rate * 100));
        return ['conversion', label, rate, '', ''];
      }),
    ];
    downloadCsv(filename, rows);
  };

  return (
    <AdminAuthGuard allowedRoles={['owner']}>
      <div className="space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Аналитика</h1>
            <p className="text-sm text-muted-foreground">
              Воронки booking, Telegram и интерактивов на основе агрегатов.
            </p>
            <Link href="/analytics/interactive" className="text-xs text-primary underline">
              Детальная аналитика интерактивов →
            </Link>
            <div>
              <Link href="/analytics/experiments" className="text-xs text-primary underline">
                Эксперименты (A/B) →
              </Link>
            </div>
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
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <input
                type="checkbox"
                checked={compareEnabled}
                onChange={(event) => setCompareEnabled(event.target.checked)}
              />
              Сравнить с предыдущим периодом
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
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-sm font-semibold text-muted-foreground">Booking funnel</h2>
                  <button
                    className="text-xs text-primary underline"
                    onClick={() => booking && exportFunnel('booking-funnel.csv', booking, bookingCompare, bookingLabels, 'event')}
                  >
                    Экспорт CSV
                  </button>
                </div>
                <div className="mt-3 space-y-2 text-sm">
                  {booking.steps.map((step) => (
                    <div key={step.event} className="flex items-center justify-between">
                      <span>{bookingLabels[step.event ?? ''] || step.event}</span>
                      <span className="font-medium">
                        {step.count}
                        {compareEnabled && bookingCompare && (
                          <span className="ml-2 text-xs text-muted-foreground">
                            {(() => {
                              const prev = bookingCompare.steps.find((item) => item.event === step.event)?.count;
                              if (prev === undefined) return null;
                              const delta = step.count - prev;
                              return `(${prev} ${delta >= 0 ? '+' : ''}${delta})`;
                            })()}
                          </span>
                        )}
                      </span>
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
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-sm font-semibold text-muted-foreground">Telegram funnel</h2>
                  <button
                    className="text-xs text-primary underline"
                    onClick={() => telegram && exportFunnel('telegram-funnel.csv', telegram, telegramCompare, telegramLabels, 'event')}
                  >
                    Экспорт CSV
                  </button>
                </div>
                <div className="mt-3 space-y-2 text-sm">
                  {telegram.steps.map((step) => (
                    <div key={step.event} className="flex items-center justify-between">
                      <span>{telegramLabels[step.event ?? ''] || step.event}</span>
                      <span className="font-medium">
                        {step.count}
                        {compareEnabled && telegramCompare && (
                          <span className="ml-2 text-xs text-muted-foreground">
                            {(() => {
                              const prev = telegramCompare.steps.find((item) => item.event === step.event)?.count;
                              if (prev === undefined) return null;
                              const delta = step.count - prev;
                              return `(${prev} ${delta >= 0 ? '+' : ''}${delta})`;
                            })()}
                          </span>
                        )}
                      </span>
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
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-sm font-semibold text-muted-foreground">Interactive funnel</h2>
                  <button
                    className="text-xs text-primary underline"
                    onClick={() => interactive && exportFunnel('interactive-funnel.csv', interactive, interactiveCompare, interactiveLabels, 'step')}
                  >
                    Экспорт CSV
                  </button>
                </div>
                <div className="mt-3 space-y-2 text-sm">
                  {interactive.steps.map((step) => (
                    <div key={step.step} className="flex items-center justify-between">
                      <span>{interactiveLabels[step.step ?? ''] || step.step}</span>
                      <span className="font-medium">
                        {step.count}
                        {compareEnabled && interactiveCompare && (
                          <span className="ml-2 text-xs text-muted-foreground">
                            {(() => {
                              const prev = interactiveCompare.steps.find((item) => item.step === step.step)?.count;
                              if (prev === undefined) return null;
                              const delta = step.count - prev;
                              return `(${prev} ${delta >= 0 ? '+' : ''}${delta})`;
                            })()}
                          </span>
                        )}
                      </span>
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
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-sm font-semibold text-muted-foreground">No-show</h2>
                <button
                  className="text-xs text-primary underline"
                  onClick={() => {
                    if (!noShow) return;
                    const prev = noShowCompare;
                    const rows = [
                      ['metric', 'current', 'previous', 'delta'],
                      [
                        'totalCount',
                        String(noShow.totalCount),
                        prev ? String(prev.totalCount) : '',
                        prev ? String(noShow.totalCount - prev.totalCount) : '',
                      ],
                      [
                        'noShowCount',
                        String(noShow.noShowCount),
                        prev ? String(prev.noShowCount) : '',
                        prev ? String(noShow.noShowCount - prev.noShowCount) : '',
                      ],
                      [
                        'noShowRate',
                        noShow.noShowRate === null ? '' : String(Math.round(noShow.noShowRate * 100)),
                        prev && prev.noShowRate !== null ? String(Math.round(prev.noShowRate * 100)) : '',
                        '',
                      ],
                    ];
                    downloadCsv('no-show.csv', rows);
                  }}
                >
                  Экспорт CSV
                </button>
              </div>
              <div className="mt-3 grid gap-2 text-sm md:grid-cols-3">
                <div className="flex items-center justify-between">
                  <span>Всего исходов</span>
                  <span className="font-medium">
                    {noShow.totalCount}
                    {compareEnabled && noShowCompare && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        ({noShowCompare.totalCount} {noShow.totalCount - noShowCompare.totalCount >= 0 ? '+' : ''}
                        {noShow.totalCount - noShowCompare.totalCount})
                      </span>
                    )}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>No-show</span>
                  <span className="font-medium">
                    {noShow.noShowCount}
                    {compareEnabled && noShowCompare && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        ({noShowCompare.noShowCount} {noShow.noShowCount - noShowCompare.noShowCount >= 0 ? '+' : ''}
                        {noShow.noShowCount - noShowCompare.noShowCount})
                      </span>
                    )}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Rate</span>
                  <span className="font-medium">
                    {noShow.noShowRate === null ? '—' : `${Math.round(noShow.noShowRate * 100)}%`}
                    {compareEnabled && noShowCompare && noShowCompare.noShowRate !== null && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        ({Math.round(noShowCompare.noShowRate * 100)}%)
                      </span>
                    )}
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
