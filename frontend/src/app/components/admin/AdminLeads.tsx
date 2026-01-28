/**
 * Список лидов с фильтрами по статусу, источнику, датам.
 */

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Users } from 'lucide-react';
import * as adminApi from '@/api/endpoints/admin';
import type { AdminLead } from '@/api/types/admin';
import { Card, CardContent, CardHeader } from '@/app/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Button } from '@/app/components/ui/button';

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

export default function AdminLeads() {
  const [data, setData] = useState<AdminLead[]>([]);
  const [pagination, setPagination] = useState<{ page: number; total_pages: number; has_previous: boolean; has_next: boolean } | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const load = (overridePage?: number) => {
    const p = overridePage ?? page;
    setLoading(true);
    adminApi
      .getAdminLeads({
        page: p,
        per_page: 20,
        ...(statusFilter && { status: statusFilter }),
        ...(sourceFilter && { source: sourceFilter }),
        ...(dateFrom && { date_from: dateFrom }),
        ...(dateTo && { date_to: dateTo }),
      })
      .then((res) => {
        setData(res.data ?? []);
        setPagination(res.pagination);
      })
      .catch(() => {
        setData([]);
        toast.error('Не удалось загрузить лидов');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [page]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <Select value={statusFilter || 'all'} onValueChange={(v) => setStatusFilter(v === 'all' ? '' : v)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Статус" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все статусы</SelectItem>
            <SelectItem value="new">Новый</SelectItem>
            <SelectItem value="engaged">В работе</SelectItem>
            <SelectItem value="booked_confirmed">Запись подтверждена</SelectItem>
            <SelectItem value="inactive">Неактивный</SelectItem>
          </SelectContent>
        </Select>
        <input
          type="text"
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm w-40"
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value)}
          placeholder="Источник"
        />
        <input
          type="date"
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
        />
        <input
          type="date"
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
        />
        <Button variant="outline" size="sm" onClick={() => { setPage(1); load(1); }}>
          Применить
        </Button>
      </div>

      <Card className="border-gray-100">
        <CardHeader>
          <h3 className="font-semibold text-[#2D3748] flex items-center gap-2">
            <Users className="w-5 h-5" />
            Лиды
          </h3>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-[#718096] py-8 text-center">Загрузка…</p>
          ) : data.length === 0 ? (
            <p className="text-[#718096] py-8 text-center">Нет лидов</p>
          ) : (
            <div className="space-y-3">
              {data.map((lead) => (
                <div
                  key={lead.id}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-gray-100 p-4"
                >
                  <div>
                    <p className="font-medium text-[#2D3748]">
                      ID: {lead.id} · {lead.status}
                    </p>
                    <p className="text-sm text-[#718096]">
                      {formatDate(lead.created_at)} · источник: {JSON.stringify(lead.source ?? '—')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
          {pagination && pagination.total_pages > 1 && (
            <div className="mt-4 flex justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={!pagination.has_previous}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Назад
              </Button>
              <span className="flex items-center px-2 text-sm text-[#718096]">
                {pagination.page} / {pagination.total_pages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={!pagination.has_next}
                onClick={() => setPage((p) => p + 1)}
              >
                Вперёд
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
