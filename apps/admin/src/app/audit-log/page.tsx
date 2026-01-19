'use client';

import React, { useCallback, useEffect, useState } from 'react';
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
  Label,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@psychology/design-system';

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

  if (loading && entries.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-sm text-muted-foreground">Загрузка...</CardContent>
      </Card>
    );
  }
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>Ошибка: {error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Журнал аудита</h1>
        <p className="text-sm text-muted-foreground">
          История изменений и операций в системе.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Фильтры</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          <div className="space-y-2">
            <Label>Actor User ID</Label>
            <Input
              value={filters.actorUserId}
              onChange={(event) => setFilters({ ...filters, actorUserId: event.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Action</Label>
            <Input
              value={filters.action}
              onChange={(event) => setFilters({ ...filters, action: event.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Entity Type</Label>
            <Input
              value={filters.entityType}
              onChange={(event) => setFilters({ ...filters, entityType: event.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Entity ID</Label>
            <Input
              value={filters.entityId}
              onChange={(event) => setFilters({ ...filters, entityId: event.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>From</Label>
            <Input
              type="date"
              value={filters.fromDate}
              onChange={(event) => setFilters({ ...filters, fromDate: event.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>To</Label>
            <Input
              type="date"
              value={filters.toDate}
              onChange={(event) => setFilters({ ...filters, toDate: event.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2">
        <Button asChild variant="outline">
          <a href={`/api/admin/audit-log/export?format=csv&${exportQuery()}`}>Экспорт CSV</a>
        </Button>
        <Button asChild variant="outline">
          <a href={`/api/admin/audit-log/export?format=json&${exportQuery()}`}>Экспорт JSON</a>
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 text-xs uppercase text-muted-foreground">
                <TableHead>Дата</TableHead>
                <TableHead>Пользователь</TableHead>
                <TableHead>Действие</TableHead>
                <TableHead>Сущность</TableHead>
                <TableHead>IP / UA</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(entry.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm font-medium text-foreground">{entry.actorUserId || 'Система'}</div>
                    <div className="text-sm text-muted-foreground">{entry.actorRole}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{entry.action}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {entry.entityType} ({entry.entityId || '-'})
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    <div className="truncate max-w-xs" title={entry.ipAddress || ''}>{entry.ipAddress}</div>
                    <div className="truncate max-w-xs text-xs" title={entry.userAgent || ''}>{entry.userAgent}</div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {pagination && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-muted-foreground">
            Показано {entries.length} из {pagination.total} записей
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setPage(pagination.page - 1)}
              disabled={pagination.page <= 1}
            >
              Назад
            </Button>
            <Button
              variant="outline"
              onClick={() => setPage(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
            >
              Вперед
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
