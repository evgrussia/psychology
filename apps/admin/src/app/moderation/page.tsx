'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { AdminAuthGuard } from '@/components/admin-auth-guard';

type UgcStatus = 'pending' | 'flagged' | 'approved' | 'answered' | 'rejected';
type UgcType = 'anonymous_question';

interface ModerationItem {
  id: string;
  type: UgcType;
  status: UgcStatus;
  submittedAt: string;
  answeredAt: string | null;
  triggerFlags: string[];
  hasContact: boolean;
  lastAction: {
    action: string;
    reasonCategory: string | null;
    createdAt: string;
    moderator: { id: string; email: string | null; displayName: string | null } | null;
  } | null;
}

interface ModerationListResponse {
  items: ModerationItem[];
  statusCounts: Record<string, number>;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

const statusLabels: Record<UgcStatus, string> = {
  pending: 'На модерации',
  flagged: 'Флаги',
  approved: 'Одобрен',
  answered: 'Отвечен',
  rejected: 'Отклонен',
};

const triggerLabels: Record<string, string> = {
  crisis: 'Кризис',
  pii: 'PII',
  medical: 'Медицинский',
  spam: 'Спам',
};

const statusBadgeStyles: Record<UgcStatus, string> = {
  pending: 'border-amber-200 bg-amber-50 text-amber-700',
  flagged: 'border-red-200 bg-red-50 text-red-700',
  approved: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  answered: 'border-blue-200 bg-blue-50 text-blue-700',
  rejected: 'border-slate-200 bg-slate-50 text-slate-700',
};

export default function ModerationPage() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<ModerationItem[]>([]);
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});
  const [filters, setFilters] = useState({
    type: 'anonymous_question',
    status: '',
    trigger: '',
    from: '',
    to: '',
  });

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (filters.type) params.set('type', filters.type);
    if (filters.status) params.set('status', filters.status);
    if (filters.trigger) params.set('trigger', filters.trigger);
    if (filters.from) params.set('from', filters.from);
    if (filters.to) params.set('to', filters.to);
    return params.toString();
  }, [filters]);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/moderation/items?${queryString}`, {
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to load moderation queue');
      }
      const data = (await response.json()) as ModerationListResponse;
      setItems(data.items);
      setStatusCounts(data.statusCounts ?? {});
    } catch (error) {
      console.error(error);
      setItems([]);
      setStatusCounts({});
    } finally {
      setLoading(false);
    }
  }, [queryString]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  return (
    <AdminAuthGuard allowedRoles={['owner', 'assistant']}>
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Модерация UGC</h1>
            <p className="text-sm text-muted-foreground">
              Очередь анонимных вопросов с приоритетом для кризисных кейсов.
            </p>
          </div>
        </div>

        <div className="grid gap-3 rounded-lg border p-4 md:grid-cols-2 xl:grid-cols-5">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground">Тип</label>
            <select
              value={filters.type}
              onChange={(event) => setFilters((prev) => ({ ...prev, type: event.target.value }))}
              className="rounded-md border bg-background px-2 py-1 text-sm"
            >
              <option value="anonymous_question">Анонимные вопросы</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground">Статус</label>
            <select
              value={filters.status}
              onChange={(event) => setFilters((prev) => ({ ...prev, status: event.target.value }))}
              className="rounded-md border bg-background px-2 py-1 text-sm"
            >
              <option value="">Все</option>
              {(Object.keys(statusLabels) as UgcStatus[]).map((status) => (
                <option key={status} value={status}>
                  {statusLabels[status]} ({statusCounts[status] ?? 0})
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground">Триггер</label>
            <select
              value={filters.trigger}
              onChange={(event) => setFilters((prev) => ({ ...prev, trigger: event.target.value }))}
              className="rounded-md border bg-background px-2 py-1 text-sm"
            >
              <option value="">Любой</option>
              {Object.entries(triggerLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground">Дата с</label>
            <input
              type="date"
              value={filters.from}
              onChange={(event) => setFilters((prev) => ({ ...prev, from: event.target.value }))}
              className="rounded-md border bg-background px-2 py-1 text-sm"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground">Дата по</label>
            <input
              type="date"
              value={filters.to}
              onChange={(event) => setFilters((prev) => ({ ...prev, to: event.target.value }))}
              className="rounded-md border bg-background px-2 py-1 text-sm"
            />
          </div>
        </div>

        {loading ? (
          <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
            Загружаем очередь модерации...
          </div>
        ) : (
          <>
            <div className="space-y-3 md:hidden">
              {items.map((item) => {
                const submittedAt = new Date(item.submittedAt);
                const ageHours = Math.floor((Date.now() - submittedAt.getTime()) / 36e5);
                return (
                  <div key={item.id} className="rounded-lg border p-4 text-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-medium">Анонимный вопрос</div>
                        <div className="text-xs text-muted-foreground">{item.id}</div>
                      </div>
                      <span
                        className={`inline-flex items-center rounded-full border px-2 py-1 text-xs font-medium ${statusBadgeStyles[item.status]}`}
                      >
                        {statusLabels[item.status]}
                      </span>
                    </div>
                    <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                      <div>Дата: {submittedAt.toLocaleString()}</div>
                      <div>
                        Триггеры:{' '}
                        {item.triggerFlags.length > 0
                          ? item.triggerFlags.map((flag) => triggerLabels[flag] ?? flag).join(', ')
                          : '—'}
                      </div>
                      <div>SLA: {ageHours} ч</div>
                      <div>
                        Модератор:{' '}
                        {item.lastAction?.moderator?.displayName ||
                          item.lastAction?.moderator?.email ||
                          '—'}
                      </div>
                    </div>
                    <Link
                      href={`/moderation/questions/${item.id}`}
                      className="mt-3 inline-flex text-sm font-medium text-primary"
                    >
                      Открыть
                    </Link>
                  </div>
                );
              })}
              {items.length === 0 && (
                <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                  В очереди нет вопросов.
                </div>
              )}
            </div>

            <div className="hidden overflow-hidden rounded-lg border md:block">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 text-left">Вопрос</th>
                    <th className="px-4 py-3 text-left">Статус</th>
                    <th className="px-4 py-3 text-left">Триггеры</th>
                    <th className="px-4 py-3 text-left">SLA</th>
                    <th className="px-4 py-3 text-left">Модератор</th>
                    <th className="px-4 py-3 text-left">Действие</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => {
                    const submittedAt = new Date(item.submittedAt);
                    const ageHours = Math.floor((Date.now() - submittedAt.getTime()) / 36e5);
                    return (
                      <tr key={item.id} className="border-t">
                        <td className="px-4 py-3">
                          <div className="font-medium">Анонимный вопрос</div>
                          <div className="text-xs text-muted-foreground">{item.id}</div>
                          <div className="text-xs text-muted-foreground">
                            {submittedAt.toLocaleString()}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center rounded-full border px-2 py-1 text-xs font-medium ${statusBadgeStyles[item.status]}`}
                          >
                            {statusLabels[item.status]}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">
                          {item.triggerFlags.length > 0
                            ? item.triggerFlags.map((flag) => triggerLabels[flag] ?? flag).join(', ')
                            : '—'}
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">
                          {ageHours} ч
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">
                          {item.lastAction?.moderator?.displayName ||
                            item.lastAction?.moderator?.email ||
                            '—'}
                        </td>
                        <td className="px-4 py-3">
                          <Link
                            href={`/moderation/questions/${item.id}`}
                            className="text-sm font-medium text-primary"
                          >
                            Открыть
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                  {items.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-6 text-center text-sm text-muted-foreground">
                        В очереди нет вопросов.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </AdminAuthGuard>
  );
}
