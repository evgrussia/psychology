'use client';

import React, { useCallback, useEffect, useState } from 'react';

interface AuditLogEntry {
  id: string;
  actorUserId: string | null;
  actorRole: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  oldValue: any;
  newValue: any;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}

interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export default function AuditLogPage() {
  const [entries, setEntries] = useState<AuditLogEntry[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    actorUserId: '',
    action: '',
    entityType: '',
    entityId: '',
    fromDate: '',
    toDate: '',
  });

  const fetchAuditLogs = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      if (filters.actorUserId) params.set('actorUserId', filters.actorUserId);
      if (filters.action) params.set('action', filters.action);
      if (filters.entityType) params.set('entityType', filters.entityType);
      if (filters.entityId) params.set('entityId', filters.entityId);
      if (filters.fromDate) params.set('fromDate', filters.fromDate);
      if (filters.toDate) params.set('toDate', filters.toDate);

      const response = await fetch(`/api/admin/audit-log?${params.toString()}`, {
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to fetch audit logs');
      }
      const data = await response.json();
      setEntries(data.items);
      setPagination(data.pagination);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchAuditLogs(page);
  }, [page, fetchAuditLogs]);

  useEffect(() => {
    setPage(1);
  }, [filters]);

  const exportQuery = () => {
    const params = new URLSearchParams();
    if (filters.actorUserId) params.set('actorUserId', filters.actorUserId);
    if (filters.action) params.set('action', filters.action);
    if (filters.entityType) params.set('entityType', filters.entityType);
    if (filters.entityId) params.set('entityId', filters.entityId);
    if (filters.fromDate) params.set('fromDate', filters.fromDate);
    if (filters.toDate) params.set('toDate', filters.toDate);
    return params.toString();
  };

  if (loading && entries.length === 0) return <div className="p-8">Загрузка...</div>;
  if (error) return <div className="p-8 text-red-500">Ошибка: {error}</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Журнал аудита</h1>

      <div className="mb-6 grid gap-3 md:grid-cols-3">
        <label className="text-sm text-muted-foreground">
          Actor User ID
          <input
            className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
            value={filters.actorUserId}
            onChange={(event) => setFilters({ ...filters, actorUserId: event.target.value })}
          />
        </label>
        <label className="text-sm text-muted-foreground">
          Action
          <input
            className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
            value={filters.action}
            onChange={(event) => setFilters({ ...filters, action: event.target.value })}
          />
        </label>
        <label className="text-sm text-muted-foreground">
          Entity Type
          <input
            className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
            value={filters.entityType}
            onChange={(event) => setFilters({ ...filters, entityType: event.target.value })}
          />
        </label>
        <label className="text-sm text-muted-foreground">
          Entity ID
          <input
            className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
            value={filters.entityId}
            onChange={(event) => setFilters({ ...filters, entityId: event.target.value })}
          />
        </label>
        <label className="text-sm text-muted-foreground">
          From
          <input
            type="date"
            className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
            value={filters.fromDate}
            onChange={(event) => setFilters({ ...filters, fromDate: event.target.value })}
          />
        </label>
        <label className="text-sm text-muted-foreground">
          To
          <input
            type="date"
            className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
            value={filters.toDate}
            onChange={(event) => setFilters({ ...filters, toDate: event.target.value })}
          />
        </label>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <a
          className="rounded-md border px-3 py-2 text-sm"
          href={`/api/admin/audit-log/export?format=csv&${exportQuery()}`}
        >
          Экспорт CSV
        </a>
        <a
          className="rounded-md border px-3 py-2 text-sm"
          href={`/api/admin/audit-log/export?format=json&${exportQuery()}`}
        >
          Экспорт JSON
        </a>
      </div>
      
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Дата</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Пользователь</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Действие</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Сущность</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP / UA</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {entries.map((entry) => (
              <tr key={entry.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(entry.createdAt).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{entry.actorUserId || 'Система'}</div>
                  <div className="text-sm text-gray-500">{entry.actorRole}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                    {entry.action}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {entry.entityType} ({entry.entityId || '-'})
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  <div className="truncate max-w-xs" title={entry.ipAddress || ''}>{entry.ipAddress}</div>
                  <div className="truncate max-w-xs text-xs" title={entry.userAgent || ''}>{entry.userAgent}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pagination && (
        <div className="mt-4 flex justify-between items-center">
          <div className="text-sm text-gray-700">
            Показано {entries.length} из {pagination.total} записей
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setPage(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="px-4 py-2 border rounded-md disabled:opacity-50"
            >
              Назад
            </button>
            <button
              onClick={() => setPage(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="px-4 py-2 border rounded-md disabled:opacity-50"
            >
              Вперед
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
