'use client';

import { DragEvent, useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

interface LeadListItem {
  id: string;
  status: string;
  source: string;
  topicCode: string | null;
  createdAt: string;
  updatedAt: string;
  displayName: string | null;
  hasContact: boolean;
  lastEvent: {
    eventName: string;
    occurredAt: string;
  } | null;
}

interface LeadListResponse {
  items: LeadListItem[];
  statusCounts: Record<string, number>;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

const STATUS_ORDER = [
  { value: 'new', label: 'Новые' },
  { value: 'engaged', label: 'Вовлеченные' },
  { value: 'booking_started', label: 'Начали запись' },
  { value: 'booked_confirmed', label: 'Подтверждены' },
  { value: 'paid', label: 'Оплачено' },
  { value: 'completed_session', label: 'Сессия завершена' },
  { value: 'follow_up_needed', label: 'Нужен follow-up' },
  { value: 'inactive', label: 'Неактивны' },
];

export default function LeadsPage() {
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'kanban' | 'table'>('kanban');
  const [leads, setLeads] = useState<LeadListItem[]>([]);
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});
  const [filters, setFilters] = useState({
    status: '',
    source: '',
    topic: '',
    hasContact: '',
    search: '',
    from: '',
    to: '',
  });

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filters.status) params.set('status', filters.status);
    if (filters.source) params.set('source', filters.source);
    if (filters.topic) params.set('topic', filters.topic);
    if (filters.hasContact) params.set('hasContact', filters.hasContact);
    if (filters.search) params.set('search', filters.search);
    if (filters.from) params.set('from', filters.from);
    if (filters.to) params.set('to', filters.to);

    try {
      const response = await fetch(`/api/admin/leads?${params.toString()}`, {
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to load leads');
      }
      const data = (await response.json()) as LeadListResponse;
      setLeads(data.items);
      setStatusCounts(data.statusCounts ?? {});
    } catch (error) {
      console.error(error);
      setLeads([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const leadsByStatus = useMemo(() => {
    return STATUS_ORDER.reduce<Record<string, LeadListItem[]>>((acc, status) => {
      acc[status.value] = leads.filter((lead) => lead.status === status.value);
      return acc;
    }, {});
  }, [leads]);

  const updateLeadStatus = useCallback(async (leadId: string, status: string) => {
    const target = leads.find((item) => item.id === leadId);
    if (!target || target.status === status) return;

    try {
      const response = await fetch(`/api/admin/leads/${leadId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status }),
      });
      if (!response.ok) {
        throw new Error('Failed to update lead status');
      }

      setLeads((prev) =>
        prev.map((item) => (item.id === leadId ? { ...item, status } : item)),
      );
      setStatusCounts((prev) => ({
        ...prev,
        [target.status]: Math.max(0, (prev[target.status] ?? 0) - 1),
        [status]: (prev[status] ?? 0) + 1,
      }));
    } catch (error) {
      console.error(error);
    }
  }, [leads]);

  const handleDrop = useCallback((status: string) => async (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const leadId = event.dataTransfer.getData('leadId');
    if (leadId) {
      await updateLeadStatus(leadId, status);
    }
  }, [updateLeadStatus]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">CRM-лиды</h1>
          <p className="text-sm text-muted-foreground">Воронка лидов и таймлайн событий.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setView('kanban')}
            className={`rounded-md border px-3 py-1 text-sm ${view === 'kanban' ? 'bg-primary text-primary-foreground' : 'bg-background'}`}
          >
            Канбан
          </button>
          <button
            type="button"
            onClick={() => setView('table')}
            className={`rounded-md border px-3 py-1 text-sm ${view === 'table' ? 'bg-primary text-primary-foreground' : 'bg-background'}`}
          >
            Таблица
          </button>
        </div>
      </div>

      <div className="grid gap-3 rounded-lg border p-4 md:grid-cols-3 xl:grid-cols-6">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">Статус</label>
          <select
            value={filters.status}
            onChange={(event) => setFilters((prev) => ({ ...prev, status: event.target.value }))}
            className="rounded-md border bg-background px-2 py-1 text-sm"
          >
            <option value="">Все</option>
            {STATUS_ORDER.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">Источник</label>
          <select
            value={filters.source}
            onChange={(event) => setFilters((prev) => ({ ...prev, source: event.target.value }))}
            className="rounded-md border bg-background px-2 py-1 text-sm"
          >
            <option value="">Все</option>
            <option value="quiz">Квиз</option>
            <option value="telegram">Telegram</option>
            <option value="waitlist">Лист ожидания</option>
            <option value="question">Вопрос</option>
            <option value="booking">Запись</option>
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">Тема</label>
          <input
            type="text"
            value={filters.topic}
            onChange={(event) => setFilters((prev) => ({ ...prev, topic: event.target.value }))}
            className="rounded-md border bg-background px-2 py-1 text-sm"
            placeholder="anxiety, burnout..."
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">Контакт</label>
          <select
            value={filters.hasContact}
            onChange={(event) => setFilters((prev) => ({ ...prev, hasContact: event.target.value }))}
            className="rounded-md border bg-background px-2 py-1 text-sm"
          >
            <option value="">Любой</option>
            <option value="true">Есть контакт</option>
            <option value="false">Нет контакта</option>
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
        <div className="flex flex-col gap-1 md:col-span-3 xl:col-span-6">
          <label className="text-xs text-muted-foreground">Поиск</label>
          <input
            type="search"
            value={filters.search}
            onChange={(event) => setFilters((prev) => ({ ...prev, search: event.target.value }))}
            className="rounded-md border bg-background px-2 py-1 text-sm"
            placeholder="lead_id, email, телефон"
          />
        </div>
      </div>

      {loading ? (
        <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          Загружаем лиды...
        </div>
      ) : view === 'table' ? (
        <div className="overflow-hidden rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left">Лид</th>
                <th className="px-4 py-3 text-left">Источник</th>
                <th className="px-4 py-3 text-left">Тема</th>
                <th className="px-4 py-3 text-left">Статус</th>
                <th className="px-4 py-3 text-left">Последнее событие</th>
                <th className="px-4 py-3 text-left">Создан</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id} className="border-t">
                  <td className="px-4 py-3">
                    <Link href={`/leads/${lead.id}`} className="font-medium text-primary">
                      {lead.displayName || 'Гость'}
                    </Link>
                    <div className="text-xs text-muted-foreground">{lead.id}</div>
                  </td>
                  <td className="px-4 py-3">{lead.source}</td>
                  <td className="px-4 py-3">{lead.topicCode || '—'}</td>
                  <td className="px-4 py-3">
                    <select
                      value={lead.status}
                      onChange={(event) => updateLeadStatus(lead.id, event.target.value)}
                      className="rounded-md border bg-background px-2 py-1 text-xs"
                    >
                      {STATUS_ORDER.map((status) => (
                        <option key={status.value} value={status.value}>
                          {status.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {lead.lastEvent ? (
                      <>
                        <div>{lead.lastEvent.eventName}</div>
                        <div>{new Date(lead.lastEvent.occurredAt).toLocaleString()}</div>
                      </>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {new Date(lead.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {leads.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-sm text-muted-foreground">
                    Лидов пока нет
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid gap-4 overflow-auto xl:grid-cols-4">
          {STATUS_ORDER.map((status) => (
            <div
              key={status.value}
              onDragOver={(event) => event.preventDefault()}
              onDrop={handleDrop(status.value)}
              className="min-w-[240px] rounded-lg border bg-background"
            >
              <div className="flex items-center justify-between border-b px-4 py-3">
                <div className="text-sm font-medium">{status.label}</div>
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                  {statusCounts[status.value] ?? 0}
                </span>
              </div>
              <div className="flex flex-col gap-3 p-3">
                {leadsByStatus[status.value]?.map((lead) => (
                  <div
                    key={lead.id}
                    draggable
                    onDragStart={(event) => event.dataTransfer.setData('leadId', lead.id)}
                    className="rounded-md border bg-card p-3 text-sm shadow-sm"
                  >
                    <Link href={`/leads/${lead.id}`} className="font-medium text-primary">
                      {lead.displayName || 'Гость'}
                    </Link>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {lead.source} · {lead.topicCode || 'без темы'}
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground">
                      {lead.lastEvent ? (
                        <>
                          <div>{lead.lastEvent.eventName}</div>
                          <div>{new Date(lead.lastEvent.occurredAt).toLocaleString()}</div>
                        </>
                      ) : (
                        'Нет событий'
                      )}
                    </div>
                  </div>
                ))}
                {leadsByStatus[status.value]?.length === 0 && (
                  <div className="rounded-md border border-dashed p-3 text-center text-xs text-muted-foreground">
                    Перетащите лид сюда
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
