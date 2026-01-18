"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { AdminAuthGuard } from '@/components/admin-auth-guard';

type RangePreset = 'today' | '7d' | '30d' | 'custom';

interface FunnelResponse {
  range: { preset: RangePreset; from: string; to: string; label: string };
  steps: { step?: string; count: number }[];
  conversion: { from: string; to: string; rate: number | null }[];
}

interface InteractiveDetailsResponse {
  range: { preset: RangePreset; from: string; to: string; label: string };
  quizzes: {
    quiz_slug: string;
    starts: number;
    completes: number;
    completion_rate: number | null;
    questions: { question_index: number; count: number }[];
    abandonments: { abandoned_at_question: number; count: number }[];
  }[];
  navigators: {
    navigator_slug: string;
    steps: {
      step_index: number;
      total: number;
      choices: { choice_id: string; count: number; rate: number | null }[];
    }[];
  }[];
}

const rangeOptions: { value: RangePreset; label: string }[] = [
  { value: 'today', label: 'Сегодня' },
  { value: '7d', label: '7 дней' },
  { value: '30d', label: '30 дней' },
  { value: 'custom', label: 'Выбрать' },
];

const interactiveLabels: Record<string, string> = {
  start: 'Старт интерактивов',
  complete: 'Завершения',
  cta_or_booking: 'CTA или запись',
};

export default function InteractiveAnalyticsPage() {
  const [range, setRange] = useState<RangePreset>('7d');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [topic, setTopic] = useState('');
  const [funnel, setFunnel] = useState<FunnelResponse | null>(null);
  const [details, setDetails] = useState<InteractiveDetailsResponse | null>(null);
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
    return params.toString();
  }, [range, customFrom, customTo, topic]);

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
      fetchJson<FunnelResponse>(`/api/admin/analytics/funnels/interactive?${query}`),
      fetchJson<InteractiveDetailsResponse>(`/api/admin/analytics/interactive?${query}`),
    ])
      .then(([funnelData, detailsData]) => {
        if (!active) return;
        setFunnel(funnelData);
        setDetails(detailsData);
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
            <h1 className="text-2xl font-semibold">Аналитика интерактивов</h1>
            <p className="text-sm text-muted-foreground">
              Воронка и детальная статистика по вопросам/шагам без PII.
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

        <div className="grid gap-3 lg:grid-cols-2">
          <input
            type="text"
            placeholder="Topic (например anxiety)"
            value={topic}
            onChange={(event) => setTopic(event.target.value)}
            className="rounded-md border px-3 py-2 text-sm"
          />
        </div>

        {loading && <div className="text-sm text-muted-foreground">Загружаем аналитику...</div>}
        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
            {error}
          </div>
        )}

        {funnel && details && (
          <div className="space-y-6">
            <section className="rounded-lg border p-4">
              <h2 className="text-sm font-semibold text-muted-foreground">Funnel</h2>
              <div className="mt-3 space-y-2 text-sm">
                {funnel.steps.map((step) => (
                  <div key={step.step} className="flex items-center justify-between">
                    <span>{interactiveLabels[step.step ?? ''] || step.step}</span>
                    <span className="font-medium">{step.count}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 space-y-1 text-xs text-muted-foreground">
                {funnel.conversion.map((item) => (
                  <div key={`${item.from}-${item.to}`}>
                    {interactiveLabels[item.from] || item.from} → {interactiveLabels[item.to] || item.to}:{' '}
                    {item.rate === null ? '—' : `${Math.round(item.rate * 100)}%`}
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-lg border p-4">
              <h2 className="text-sm font-semibold text-muted-foreground">Квизы</h2>
              {details.quizzes.length === 0 ? (
                <div className="mt-3 text-sm text-muted-foreground">Нет данных за период.</div>
              ) : (
                <div className="mt-4 space-y-4">
                  {details.quizzes.map((quiz) => (
                    <div key={quiz.quiz_slug} className="rounded-md border p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="text-sm font-semibold">{quiz.quiz_slug}</div>
                        <div className="text-xs text-muted-foreground">
                          Completion: {quiz.completion_rate === null ? '—' : `${Math.round(quiz.completion_rate * 100)}%`}
                        </div>
                      </div>
                      <div className="mt-2 grid gap-2 text-sm md:grid-cols-3">
                        <div className="flex items-center justify-between">
                          <span>Start</span>
                          <span className="font-medium">{quiz.starts}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Complete</span>
                          <span className="font-medium">{quiz.completes}</span>
                        </div>
                      </div>

                      <div className="mt-4 grid gap-4 lg:grid-cols-2">
                        <div>
                          <div className="text-xs font-medium text-muted-foreground">Воронка по вопросам</div>
                          <div className="mt-2 space-y-1 text-sm">
                            {quiz.questions.length === 0 ? (
                              <div className="text-muted-foreground">Нет данных</div>
                            ) : (
                              quiz.questions.map((question) => (
                                <div key={`q-${question.question_index}`} className="flex items-center justify-between">
                                  <span>Вопрос {question.question_index}</span>
                                  <span className="font-medium">{question.count}</span>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs font-medium text-muted-foreground">Отказы на вопросе</div>
                          <div className="mt-2 space-y-1 text-sm">
                            {quiz.abandonments.length === 0 ? (
                              <div className="text-muted-foreground">Нет данных</div>
                            ) : (
                              quiz.abandonments.map((abandoned) => (
                                <div key={`a-${abandoned.abandoned_at_question}`} className="flex items-center justify-between">
                                  <span>Вопрос {abandoned.abandoned_at_question}</span>
                                  <span className="font-medium">{abandoned.count}</span>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="rounded-lg border p-4">
              <h2 className="text-sm font-semibold text-muted-foreground">Навигаторы</h2>
              {details.navigators.length === 0 ? (
                <div className="mt-3 text-sm text-muted-foreground">Нет данных за период.</div>
              ) : (
                <div className="mt-4 space-y-4">
                  {details.navigators.map((navigator) => (
                    <div key={navigator.navigator_slug} className="rounded-md border p-4">
                      <div className="text-sm font-semibold">{navigator.navigator_slug}</div>
                      <div className="mt-3 space-y-3">
                        {navigator.steps.map((step) => (
                          <div key={`${navigator.navigator_slug}-${step.step_index}`} className="rounded-md border px-3 py-2">
                            <div className="flex items-center justify-between text-sm">
                              <span>Шаг {step.step_index}</span>
                              <span className="text-xs text-muted-foreground">Всего: {step.total}</span>
                            </div>
                            <div className="mt-2 space-y-1 text-sm">
                              {step.choices.map((choice) => (
                                <div key={choice.choice_id} className="flex items-center justify-between">
                                  <span>{choice.choice_id}</span>
                                  <span className="font-medium">
                                    {choice.count} {choice.rate === null ? '' : `(${Math.round(choice.rate * 100)}%)`}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </AdminAuthGuard>
  );
}
