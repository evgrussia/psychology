'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { AdminAuthGuard } from '@/components/admin-auth-guard';
import {
  Alert,
  AlertDescription,
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@psychology/design-system';

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

interface ModerationMetrics {
  range: {
    preset: string;
    from: string;
    to: string;
    label: string;
  };
  queue: {
    pendingCount: number;
    flaggedCount: number;
    overdueCount: number;
    crisisOverdueCount: number;
  };
  sla: {
    averageDecisionHours: number | null;
    averageAnswerHours: number | null;
  };
  alerts: Array<{
    type: 'queue_overflow' | 'crisis_overdue' | 'slow_moderation';
    message: string;
  }>;
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
  pending: 'border-warning/30 bg-warning/10 text-warning',
  flagged: 'border-destructive/30 bg-destructive/10 text-destructive',
  approved: 'border-success/30 bg-success/10 text-success',
  answered: 'border-info/30 bg-info/10 text-info',
  rejected: 'border-muted text-muted-foreground bg-muted/40',
};

export default function ModerationPage() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<ModerationItem[]>([]);
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});
  const [metrics, setMetrics] = useState<ModerationMetrics | null>(null);
  const [metricsLoading, setMetricsLoading] = useState(true);
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

  const metricsQuery = useMemo(() => {
    const params = new URLSearchParams();
    if (filters.from) params.set('from', filters.from);
    if (filters.to) params.set('to', filters.to);
    if (!filters.from && !filters.to) {
      params.set('range', '30d');
    }
    return params.toString();
  }, [filters.from, filters.to]);

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

  const fetchMetrics = useCallback(async () => {
    setMetricsLoading(true);
    try {
      const response = await fetch(`/api/admin/moderation/metrics?${metricsQuery}`, {
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to load moderation metrics');
      }
      const data = (await response.json()) as ModerationMetrics;
      setMetrics(data);
    } catch (error) {
      console.error(error);
      setMetrics(null);
    } finally {
      setMetricsLoading(false);
    }
  }, [metricsQuery]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

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

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {metricsLoading ? (
            <Card>
              <CardContent className="p-4 text-sm text-muted-foreground">
                Загружаем SLA-метрики...
              </CardContent>
            </Card>
          ) : metrics ? (
            <>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs uppercase text-muted-foreground">Очередь</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1 text-sm">
                  <div className="flex items-center justify-between">
                    <span>Pending</span>
                    <span className="font-medium">{metrics.queue.pendingCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Flagged</span>
                    <span className="font-medium">{metrics.queue.flaggedCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Overdue 24h</span>
                    <span className="font-medium">{metrics.queue.overdueCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Кризис &gt; 4h</span>
                    <span className="font-medium">{metrics.queue.crisisOverdueCount}</span>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs uppercase text-muted-foreground">SLA</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1 text-sm">
                  <div className="flex items-center justify-between">
                    <span>До решения</span>
                    <span className="font-medium">
                      {metrics.sla.averageDecisionHours === null
                        ? '—'
                        : `${metrics.sla.averageDecisionHours.toFixed(1)} ч`}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>До ответа</span>
                    <span className="font-medium">
                      {metrics.sla.averageAnswerHours === null
                        ? '—'
                        : `${metrics.sla.averageAnswerHours.toFixed(1)} ч`}
                    </span>
                  </div>
                </CardContent>
              </Card>
              <Card className="md:col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs uppercase text-muted-foreground">Alerts</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {metrics.alerts.length === 0 ? (
                    <div className="text-muted-foreground">Нет критичных сигналов.</div>
                  ) : (
                    metrics.alerts.map((alert) => (
                      <Alert key={alert.type} variant="destructive">
                        <AlertDescription>{alert.message}</AlertDescription>
                      </Alert>
                    ))
                  )}
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="p-4 text-sm text-muted-foreground">
                Метрики недоступны.
              </CardContent>
            </Card>
          )}
        </div>

        <Card>
          <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground">Тип</label>
              <Select
                value={filters.type}
                onValueChange={(value) => setFilters((prev) => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Тип" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="anonymous_question">Анонимные вопросы</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground">Статус</label>
              <Select
                value={filters.status || 'all'}
                onValueChange={(value) =>
                  setFilters((prev) => ({ ...prev, status: value === 'all' ? '' : value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Все" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все</SelectItem>
                  {(Object.keys(statusLabels) as UgcStatus[]).map((status) => (
                    <SelectItem key={status} value={status}>
                      {statusLabels[status]} ({statusCounts[status] ?? 0})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground">Триггер</label>
              <Select
                value={filters.trigger || 'all'}
                onValueChange={(value) =>
                  setFilters((prev) => ({ ...prev, trigger: value === 'all' ? '' : value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Любой" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Любой</SelectItem>
                  {Object.entries(triggerLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground">Дата с</label>
              <Input
                type="date"
                value={filters.from}
                onChange={(event) => setFilters((prev) => ({ ...prev, from: event.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground">Дата по</label>
              <Input
                type="date"
                value={filters.to}
                onChange={(event) => setFilters((prev) => ({ ...prev, to: event.target.value }))}
              />
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <Card className="border-dashed">
            <CardContent className="py-10 text-center text-sm text-muted-foreground">
              Загружаем очередь модерации...
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="space-y-3 md:hidden">
              {items.map((item) => {
                const submittedAt = new Date(item.submittedAt);
                const ageHours = Math.floor((Date.now() - submittedAt.getTime()) / 36e5);
                return (
                  <Card key={item.id}>
                    <CardContent className="space-y-3 text-sm">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-medium">Анонимный вопрос</div>
                          <div className="text-xs text-muted-foreground">{item.id}</div>
                        </div>
                        <Badge variant="outline" className={statusBadgeStyles[item.status]}>
                          {statusLabels[item.status]}
                        </Badge>
                      </div>
                      <div className="space-y-1 text-xs text-muted-foreground">
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
                      <Button asChild variant="link" className="px-0">
                        <Link href={`/moderation/questions/${item.id}`}>Открыть</Link>
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
              {items.length === 0 && (
                <Card className="border-dashed">
                  <CardContent className="py-8 text-center text-sm text-muted-foreground">
                    В очереди нет вопросов.
                  </CardContent>
                </Card>
              )}
            </div>

            <Card className="hidden md:block">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40 text-xs uppercase text-muted-foreground">
                      <TableHead>Вопрос</TableHead>
                      <TableHead>Статус</TableHead>
                      <TableHead>Триггеры</TableHead>
                      <TableHead>SLA</TableHead>
                      <TableHead>Модератор</TableHead>
                      <TableHead>Действие</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => {
                      const submittedAt = new Date(item.submittedAt);
                      const ageHours = Math.floor((Date.now() - submittedAt.getTime()) / 36e5);
                      return (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div className="font-medium">Анонимный вопрос</div>
                            <div className="text-xs text-muted-foreground">{item.id}</div>
                            <div className="text-xs text-muted-foreground">
                              {submittedAt.toLocaleString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={statusBadgeStyles[item.status]}>
                              {statusLabels[item.status]}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {item.triggerFlags.length > 0
                              ? item.triggerFlags.map((flag) => triggerLabels[flag] ?? flag).join(', ')
                              : '—'}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {ageHours} ч
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {item.lastAction?.moderator?.displayName ||
                              item.lastAction?.moderator?.email ||
                              '—'}
                          </TableCell>
                          <TableCell>
                            <Button asChild variant="link" className="px-0">
                              <Link href={`/moderation/questions/${item.id}`}>Открыть</Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {items.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="py-6 text-center text-sm text-muted-foreground">
                          В очереди нет вопросов.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </AdminAuthGuard>
  );
}
