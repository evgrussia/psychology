/**
 * Список встреч (бронирований) + фильтры по дате/статусу + форма «Исход встречи».
 */

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Calendar } from 'lucide-react';
import * as adminApi from '@/api/endpoints/admin';
import type { AdminAppointment, AppointmentOutcome } from '@/api/types/admin';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader } from '@/app/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog';

function formatSlot(slot: { start_at: string; end_at: string }): string {
  const start = new Date(slot.start_at);
  return start.toLocaleString('ru-RU', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function AdminAppointments() {
  const [data, setData] = useState<AdminAppointment[]>([]);
  const [pagination, setPagination] = useState<{ page: number; total_pages: number; has_previous: boolean; has_next: boolean } | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const [outcomeModal, setOutcomeModal] = useState<{ appointment: AdminAppointment } | null>(null);
  const [outcome, setOutcome] = useState<AppointmentOutcome>('attended');
  const [submitting, setSubmitting] = useState(false);

  const load = (overridePage?: number) => {
    const p = overridePage ?? page;
    setLoading(true);
    adminApi
      .getAdminAppointments({
        page: p,
        per_page: 20,
        ...(statusFilter && { status: statusFilter }),
        ...(dateFrom && { date_from: dateFrom }),
        ...(dateTo && { date_to: dateTo }),
      })
      .then((res) => {
        setData(res.data ?? []);
        setPagination(res.pagination);
      })
      .catch(() => {
        setData([]);
        toast.error('Не удалось загрузить встречи');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [page]);

  const handleRecordOutcome = () => {
    if (!outcomeModal) return;
    setSubmitting(true);
    adminApi
      .recordAppointmentOutcome(outcomeModal.appointment.id, outcome)
      .then(() => {
        toast.success('Исход встречи записан');
        setOutcomeModal(null);
        load();
      })
      .catch((err: { message?: string }) => {
        toast.error(err?.message ?? 'Ошибка при записи исхода');
      })
      .finally(() => setSubmitting(false));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <Select value={statusFilter || 'all'} onValueChange={(v) => setStatusFilter(v === 'all' ? '' : v)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Статус" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все статусы</SelectItem>
            <SelectItem value="confirmed">Подтверждено</SelectItem>
            <SelectItem value="completed">Завершено</SelectItem>
            <SelectItem value="canceled">Отменено</SelectItem>
          </SelectContent>
        </Select>
        <input
          type="date"
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          placeholder="Дата от"
        />
        <input
          type="date"
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          placeholder="Дата до"
        />
        <Button variant="outline" size="sm" onClick={() => { setPage(1); load(1); }}>
          Применить
        </Button>
      </div>

      <Card className="border-gray-100">
        <CardHeader>
          <h3 className="font-semibold text-[#2D3748] flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Встречи
          </h3>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-[#718096] py-8 text-center">Загрузка…</p>
          ) : data.length === 0 ? (
            <p className="text-[#718096] py-8 text-center">Нет встреч</p>
          ) : (
            <div className="space-y-3">
              {data.map((apt) => (
                <div
                  key={apt.id}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-gray-100 p-4"
                >
                  <div>
                    <p className="font-medium text-[#2D3748]">
                      {formatSlot(apt.slot)} · ID услуги: {apt.service?.id ?? '—'}
                    </p>
                    <p className="text-sm text-[#718096]">Клиент ID: {apt.client?.id ?? '—'} · {apt.status}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setOutcomeModal({ appointment: apt })}
                  >
                    Исход встречи
                  </Button>
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

      <Dialog open={!!outcomeModal} onOpenChange={(open) => !open && setOutcomeModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Исход встречи</DialogTitle>
          </DialogHeader>
          {outcomeModal && (
            <>
              <p className="text-sm text-[#718096]">
                Встреча: {formatSlot(outcomeModal.appointment.slot)}
              </p>
              <div className="flex flex-col gap-2 py-2">
                {(['attended', 'no_show', 'canceled'] as const).map((opt) => (
                  <label key={opt} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="outcome"
                      checked={outcome === opt}
                      onChange={() => setOutcome(opt)}
                    />
                    <span>
                      {opt === 'attended' && 'Присутствовал'}
                      {opt === 'no_show' && 'Не пришёл'}
                      {opt === 'canceled' && 'Отменено'}
                    </span>
                  </label>
                ))}
              </div>
            </>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setOutcomeModal(null)}>
              Отмена
            </Button>
            <Button onClick={handleRecordOutcome} disabled={submitting}>
              {submitting ? 'Сохранение…' : 'Сохранить'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
