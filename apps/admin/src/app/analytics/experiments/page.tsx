"use client";

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { AdminAuthGuard } from '@/components/admin-auth-guard';

type RangePreset = 'today' | '7d' | '30d' | 'custom';

interface ExperimentVariantStats {
  key: string;
  label: string;
  exposures: number;
  conversions: number;
  conversion_rate: number | null;
}

interface ExperimentResult {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'archived' | 'draft';
  surface: string;
  primary_metric_event: string;
  guardrail_events: string[];
  variants: ExperimentVariantStats[];
}

interface ExperimentResultsResponse {
  range: { preset: RangePreset; from: string; to: string; label: string };
  experiments: ExperimentResult[];
}

const rangeOptions: { value: RangePreset; label: string }[] = [
  { value: 'today', label: 'Сегодня' },
  { value: '7d', label: '7 дней' },
  { value: '30d', label: '30 дней' },
  { value: 'custom', label: 'Выбрать' },
];

export default function ExperimentsAnalyticsPage() {
  const [range, setRange] = useState<RangePreset>('7d');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [data, setData] = useState<ExperimentResultsResponse | null>(null);
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

    fetch(`/api/admin/analytics/experiments?${query}`, { credentials: 'include' })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load experiments');
        return res.json() as Promise<ExperimentResultsResponse>;
      })
      .then((payload) => {
        if (!active) return;
        setData(payload);
      })
      .catch((err) => {
        console.error(err);
        if (!active) return;
        setError('Не удалось загрузить эксперименты.');
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
            <h1 className="text-2xl font-semibold">A/B эксперименты</h1>
            <p className="text-sm text-muted-foreground">
              Экспозиции и конверсии по активным экспериментам.
            </p>
            <Link href="/analytics" className="text-xs text-primary underline">
              ← Вернуться к воронкам
            </Link>
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

        {loading && <div className="text-sm text-muted-foreground">Загружаем эксперименты...</div>}
        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
            {error}
          </div>
        )}

        {data && (
          <div className="space-y-4">
            {data.experiments.map((experiment) => (
              <section key={experiment.id} className="rounded-lg border p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold">{experiment.name}</div>
                    <div className="text-xs text-muted-foreground">{experiment.id}</div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {experiment.surface} · {experiment.status}
                  </div>
                </div>
                <div className="mt-3 text-xs text-muted-foreground">
                  Primary: {experiment.primary_metric_event}
                </div>
                {experiment.guardrail_events.length > 0 && (
                  <div className="mt-1 text-xs text-muted-foreground">
                    Guardrails: {experiment.guardrail_events.join(', ')}
                  </div>
                )}
                <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {experiment.variants.map((variant) => (
                    <div key={`${experiment.id}-${variant.key}`} className="rounded-md border p-3 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{variant.label}</span>
                        <span className="text-xs text-muted-foreground">{variant.key}</span>
                      </div>
                      <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                        <div className="flex items-center justify-between">
                          <span>Экспозиции</span>
                          <span className="font-medium text-foreground">{variant.exposures}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Конверсии</span>
                          <span className="font-medium text-foreground">{variant.conversions}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>CR</span>
                          <span className="font-medium text-foreground">
                            {variant.conversion_rate === null
                              ? '—'
                              : `${Math.round(variant.conversion_rate * 100)}%`}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </AdminAuthGuard>
  );
}
