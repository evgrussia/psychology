"use client";

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { AdminAuthGuard } from '@/components/admin-auth-guard';

interface DashboardResponse {
  moderation: {
    pendingCount: number;
    flaggedCount: number;
    alert: { type: string; message: string } | null;
  };
  meetings: {
    upcoming: { id: string; startAt: string; serviceTitle: string; format: string }[];
  };
}

interface ModerationItem {
  id: string;
  status: string;
  submittedAt: string;
  triggerFlags: string[];
}

interface ModerationListResponse {
  items: ModerationItem[];
}

const triggerLabels: Record<string, string> = {
  crisis: 'Кризис',
  pii: 'PII',
  medical: 'Медицинский',
  spam: 'Спам',
};

export default function NotificationsPage() {
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [flagged, setFlagged] = useState<ModerationItem[]>([]);
  const [pending, setPending] = useState<ModerationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [dashboardRes, flaggedRes, pendingRes] = await Promise.all([
        fetch('/api/admin/dashboard?range=today', { credentials: 'include' }),
        fetch('/api/admin/moderation/items?status=flagged&pageSize=5', { credentials: 'include' }),
        fetch('/api/admin/moderation/items?status=pending&pageSize=5', { credentials: 'include' }),
      ]);

      if (!dashboardRes.ok) throw new Error('Не удалось загрузить дашборд.');
      if (!flaggedRes.ok || !pendingRes.ok) throw new Error('Не удалось загрузить очередь.');

      const dashboardData = (await dashboardRes.json()) as DashboardResponse;
      const flaggedData = (await flaggedRes.json()) as ModerationListResponse;
      const pendingData = (await pendingRes.json()) as ModerationListResponse;

      setDashboard(dashboardData);
      setFlagged(flaggedData.items ?? []);
      setPending(pendingData.items ?? []);
    } catch (err) {
      console.error(err);
      setError('Не удалось обновить уведомления.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const upcomingMeetings = useMemo(() => dashboard?.meetings.upcoming ?? [], [dashboard]);
  const moderationSummary = useMemo(
    () => ({
      pending: dashboard?.moderation.pendingCount ?? 0,
      flagged: dashboard?.moderation.flaggedCount ?? 0,
      alert: dashboard?.moderation.alert,
    }),
    [dashboard],
  );

  return (
    <AdminAuthGuard allowedRoles={['owner', 'assistant']}>
      <div className="space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">Уведомления</h1>
            <p className="text-sm text-muted-foreground">
              Новые записи и вопросы, требующие внимания.
            </p>
          </div>
          <button
            type="button"
            onClick={fetchData}
            className="rounded-md border px-3 py-1 text-sm"
          >
            Обновить
          </button>
        </div>

        {loading && <div className="text-sm text-muted-foreground">Загружаем уведомления...</div>}
        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
            {error}
          </div>
        )}

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border p-4">
            <div className="text-xs uppercase text-muted-foreground">Новые вопросы</div>
            <div className="mt-2 text-2xl font-semibold">{moderationSummary.pending}</div>
            <Link href="/moderation" className="mt-3 inline-flex text-xs font-medium text-primary">
              Перейти к очереди
            </Link>
          </div>
          <div className="rounded-lg border p-4">
            <div className="text-xs uppercase text-muted-foreground">Флаги</div>
            <div className="mt-2 text-2xl font-semibold">{moderationSummary.flagged}</div>
            <Link href="/moderation?status=flagged" className="mt-3 inline-flex text-xs font-medium text-primary">
              Смотреть флаги
            </Link>
          </div>
          <div className="rounded-lg border p-4">
            <div className="text-xs uppercase text-muted-foreground">Ближайшие встречи</div>
            <div className="mt-2 text-2xl font-semibold">{upcomingMeetings.length}</div>
            <Link
              href="/schedule"
              className="mt-3 hidden text-xs font-medium text-primary md:inline-flex"
            >
              Открыть расписание
            </Link>
            <div className="mt-3 text-xs text-muted-foreground md:hidden">
              Расписание доступно на десктопе.
            </div>
          </div>
        </section>

        {moderationSummary.alert && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
            {moderationSummary.alert.message}
          </div>
        )}

        <section className="grid gap-6 md:grid-cols-2">
          <div className="space-y-3">
            <div className="text-sm font-semibold">Флаги (приоритет)</div>
            {flagged.length === 0 ? (
              <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
                Кризисных/флаговых вопросов нет.
              </div>
            ) : (
              flagged.map((item) => {
                const submittedAt = new Date(item.submittedAt);
                const ageHours = Math.floor((Date.now() - submittedAt.getTime()) / 36e5);
                return (
                  <div key={item.id} className="rounded-lg border p-4 text-sm">
                    <div className="font-medium">Анонимный вопрос</div>
                    <div className="mt-1 text-xs text-muted-foreground">{item.id}</div>
                    <div className="mt-2 text-xs text-muted-foreground">
                      Триггеры:{' '}
                      {item.triggerFlags.length > 0
                        ? item.triggerFlags.map((flag) => triggerLabels[flag] ?? flag).join(', ')
                        : '—'}
                    </div>
                    <div className="text-xs text-muted-foreground">SLA: {ageHours} ч</div>
                    <Link
                      href={`/moderation/questions/${item.id}`}
                      className="mt-2 inline-flex text-xs font-medium text-primary"
                    >
                      Открыть
                    </Link>
                  </div>
                );
              })
            )}
          </div>

          <div className="space-y-3">
            <div className="text-sm font-semibold">Новые вопросы</div>
            {pending.length === 0 ? (
              <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
                Новых вопросов нет.
              </div>
            ) : (
              pending.map((item) => {
                const submittedAt = new Date(item.submittedAt);
                const ageHours = Math.floor((Date.now() - submittedAt.getTime()) / 36e5);
                return (
                  <div key={item.id} className="rounded-lg border p-4 text-sm">
                    <div className="font-medium">Анонимный вопрос</div>
                    <div className="mt-1 text-xs text-muted-foreground">{item.id}</div>
                    <div className="mt-2 text-xs text-muted-foreground">
                      Дата: {submittedAt.toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">SLA: {ageHours} ч</div>
                    <Link
                      href={`/moderation/questions/${item.id}`}
                      className="mt-2 inline-flex text-xs font-medium text-primary"
                    >
                      Открыть
                    </Link>
                  </div>
                );
              })
            )}
          </div>
        </section>

        <section className="space-y-3">
          <div className="text-sm font-semibold">Ближайшие встречи</div>
          {upcomingMeetings.length === 0 ? (
            <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
              Предстоящих встреч нет.
            </div>
          ) : (
            <div className="rounded-lg border">
              <div className="divide-y text-sm">
                {upcomingMeetings.map((meeting) => (
                  <div key={meeting.id} className="flex flex-col gap-1 p-4">
                    <div className="font-medium">{meeting.serviceTitle}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(meeting.startAt).toLocaleString('ru-RU')} · {meeting.format}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </AdminAuthGuard>
  );
}
