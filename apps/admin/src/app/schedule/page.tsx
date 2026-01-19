'use client';

import { useEffect, useMemo, useState } from 'react';

type SlotStatus = 'available' | 'reserved' | 'blocked';
type SlotSource = 'product';
type BlockType = 'exception' | 'buffer' | null;
type AppointmentOutcome = 'attended' | 'no_show' | 'canceled_by_client' | 'canceled_by_provider' | 'rescheduled';
type AppointmentOutcomeReason = 'late_cancel' | 'tech_issue' | 'illness' | 'other' | 'unknown';

interface ScheduleSlot {
  id: string;
  service_id: string | null;
  start_at_utc: string;
  end_at_utc: string;
  status: SlotStatus;
  source: SlotSource;
  block_type?: BlockType;
  note?: string | null;
}

interface ScheduleAppointment {
  id: string;
  service_id: string;
  service_slug: string;
  service_title: string;
  start_at_utc: string;
  end_at_utc: string;
  status: string;
  timezone: string;
  outcome?: AppointmentOutcome | null;
  outcome_reason_category?: AppointmentOutcomeReason | null;
  outcome_recorded_at?: string | null;
  outcome_recorded_by_role?: string | null;
}

interface ScheduleSettings {
  timezone: string;
  buffer_minutes: number;
}

interface ServiceOption {
  id: string;
  slug: string;
  title: string;
}

type ViewMode = 'day' | 'week' | 'month';

const viewLabels: Record<ViewMode, string> = {
  day: 'День',
  week: 'Неделя',
  month: 'Месяц',
};

const outcomeLabels: Record<AppointmentOutcome, string> = {
  attended: 'Был на встрече',
  no_show: 'Не пришел',
  canceled_by_client: 'Отменил клиент',
  canceled_by_provider: 'Отменил специалист',
  rescheduled: 'Перенесено',
};

const reasonLabels: Record<AppointmentOutcomeReason, string> = {
  late_cancel: 'Поздняя отмена',
  tech_issue: 'Техническая проблема',
  illness: 'Болезнь',
  other: 'Другое',
  unknown: 'Не указано',
};

export default function SchedulePage() {
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [anchorDate, setAnchorDate] = useState<Date>(new Date());
  const [slots, setSlots] = useState<ScheduleSlot[]>([]);
  const [appointments, setAppointments] = useState<ScheduleAppointment[]>([]);
  const [settings, setSettings] = useState<ScheduleSettings | null>(null);
  const [services, setServices] = useState<ServiceOption[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [selectedSlotIds, setSelectedSlotIds] = useState<string[]>([]);
  const [outcomeModalOpen, setOutcomeModalOpen] = useState(false);
  const [outcomeAppointment, setOutcomeAppointment] = useState<ScheduleAppointment | null>(null);
  const [outcomeValue, setOutcomeValue] = useState<AppointmentOutcome>('attended');
  const [outcomeReason, setOutcomeReason] = useState<AppointmentOutcomeReason | ''>('');
  const [outcomeSaving, setOutcomeSaving] = useState(false);
  const [outcomeError, setOutcomeError] = useState<string | null>(null);

  const range = useMemo(() => {
    const start = new Date(anchorDate);
    start.setHours(0, 0, 0, 0);

    if (viewMode === 'day') {
      const end = new Date(start);
      end.setDate(end.getDate() + 1);
      return { from: start, to: end };
    }

    if (viewMode === 'week') {
      const day = start.getDay();
      const diff = (day === 0 ? -6 : 1) - day;
      start.setDate(start.getDate() + diff);
      const end = new Date(start);
      end.setDate(end.getDate() + 7);
      return { from: start, to: end };
    }

    const monthStart = new Date(start.getFullYear(), start.getMonth(), 1);
    const monthEnd = new Date(start.getFullYear(), start.getMonth() + 1, 1);
    return { from: monthStart, to: monthEnd };
  }, [anchorDate, viewMode]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [slotsRes, appointmentsRes, settingsRes, servicesRes] = await Promise.all([
          fetch(`/api/admin/schedule/slots?from=${range.from.toISOString()}&to=${range.to.toISOString()}`, {
            credentials: 'include',
          }),
          fetch(`/api/admin/schedule/appointments?from=${range.from.toISOString()}&to=${range.to.toISOString()}`, {
            credentials: 'include',
          }),
          fetch('/api/admin/schedule/settings', { credentials: 'include' }),
          fetch('/api/public/services'),
        ]);

        const [slotsData, appointmentsData, settingsData, servicesData] = await Promise.all([
          slotsRes.json(),
          appointmentsRes.json(),
          settingsRes.json(),
          servicesRes.json(),
        ]);

        setSlots(slotsData);
        setAppointments(appointmentsData);
        setSettings(settingsData);
        setServices(servicesData || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [range.from, range.to]);

  const filteredSlots = useMemo(() => {
    if (statusFilter === 'all') return slots;
    if (statusFilter === 'exception') {
      return slots.filter((slot) => slot.status === 'blocked' && slot.block_type === 'exception');
    }
    if (statusFilter === 'buffer') {
      return slots.filter((slot) => slot.status === 'blocked' && slot.block_type === 'buffer');
    }
    return slots.filter((slot) => slot.status === statusFilter);
  }, [slots, statusFilter]);

  const groupedSlots = useMemo(() => {
    const groups: Record<string, ScheduleSlot[]> = {};
    for (const slot of filteredSlots) {
      const dateKey = slot.start_at_utc.slice(0, 10);
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(slot);
    }
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [filteredSlots]);

  const bookedByDay = useMemo(() => {
    const groups: Record<string, ScheduleAppointment[]> = {};
    for (const appointment of appointments) {
      const dateKey = appointment.start_at_utc.slice(0, 10);
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(appointment);
    }
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [appointments]);

  const rangeLabel = useMemo(() => {
    const fromLabel = range.from.toLocaleDateString('ru-RU');
    const toLabel = new Date(range.to.getTime() - 1).toLocaleDateString('ru-RU');
    return fromLabel === toLabel ? fromLabel : `${fromLabel} — ${toLabel}`;
  }, [range.from, range.to]);

  const toggleSlotSelection = (slotId: string) => {
    setSelectedSlotIds((prev) =>
      prev.includes(slotId) ? prev.filter((id) => id !== slotId) : [...prev, slotId],
    );
  };

  const handleDeleteSelected = async () => {
    if (selectedSlotIds.length === 0) return;
    await fetch('/api/admin/schedule/slots', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ slot_ids: selectedSlotIds }),
    });
    setSelectedSlotIds([]);
    await refreshData();
  };

  const refreshData = async () => {
    setLoading(true);
    try {
      const [slotsRes, appointmentsRes] = await Promise.all([
        fetch(`/api/admin/schedule/slots?from=${range.from.toISOString()}&to=${range.to.toISOString()}`, {
          credentials: 'include',
        }),
        fetch(`/api/admin/schedule/appointments?from=${range.from.toISOString()}&to=${range.to.toISOString()}`, {
          credentials: 'include',
        }),
      ]);
      setSlots(await slotsRes.json());
      setAppointments(await appointmentsRes.json());
    } finally {
      setLoading(false);
    }
  };

  const shiftRange = (direction: -1 | 1) => {
    const newDate = new Date(anchorDate);
    if (viewMode === 'day') newDate.setDate(newDate.getDate() + direction);
    if (viewMode === 'week') newDate.setDate(newDate.getDate() + direction * 7);
    if (viewMode === 'month') newDate.setMonth(newDate.getMonth() + direction);
    setAnchorDate(newDate);
  };

  const openOutcomeModal = (appointment: ScheduleAppointment) => {
    setOutcomeAppointment(appointment);
    setOutcomeValue((appointment.outcome ?? 'attended') as AppointmentOutcome);
    setOutcomeReason((appointment.outcome_reason_category ?? '') as AppointmentOutcomeReason | '');
    setOutcomeError(null);
    setOutcomeModalOpen(true);
  };

  const closeOutcomeModal = () => {
    setOutcomeModalOpen(false);
    setOutcomeAppointment(null);
    setOutcomeError(null);
  };

  const handleOutcomeSave = async () => {
    if (!outcomeAppointment) return;
    setOutcomeSaving(true);
    setOutcomeError(null);
    try {
      const response = await fetch(`/api/admin/schedule/appointments/${outcomeAppointment.id}/outcome`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          outcome: outcomeValue,
          reason_category: outcomeReason || undefined,
        }),
      });
      if (!response.ok) {
        const err = await response.json().catch(() => null);
        throw new Error(err?.message || 'Не удалось сохранить исход');
      }
      await refreshData();
      closeOutcomeModal();
    } catch (error: any) {
      setOutcomeError(error?.message || 'Не удалось сохранить исход');
    } finally {
      setOutcomeSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Расписание</h1>
          <p className="text-sm text-muted-foreground">
            Управление слотами, исключениями и буферами. Диапазон: {rangeLabel}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {Object.entries(viewLabels).map(([mode, label]) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode as ViewMode)}
              className={`rounded-md border px-3 py-1 text-sm ${
                viewMode === mode ? 'bg-primary text-white' : 'text-muted-foreground'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button className="rounded-md border px-3 py-1 text-sm" onClick={() => shiftRange(-1)}>
          ← Назад
        </button>
        <button className="rounded-md border px-3 py-1 text-sm" onClick={() => setAnchorDate(new Date())}>
          Сегодня
        </button>
        <button className="rounded-md border px-3 py-1 text-sm" onClick={() => shiftRange(1)}>
          Вперёд →
        </button>

        <div className="ml-auto flex items-center gap-2 text-sm">
          <label className="text-muted-foreground">Фильтр:</label>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="rounded-md border px-2 py-1"
          >
            <option value="all">Все</option>
            <option value="available">Доступные</option>
            <option value="reserved">Забронированные</option>
            <option value="exception">Исключения</option>
            <option value="buffer">Буферы</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <ScheduleForm
          title="Создать слот"
          actionLabel="Создать слот"
          services={services}
          onSubmit={async (payload) => {
            await fetch('/api/admin/schedule/slots', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify(payload),
            });
            await refreshData();
          }}
        />
        <ScheduleForm
          title="Добавить исключение"
          actionLabel="Добавить исключение"
          services={services}
          showService={false}
          onSubmit={async (payload) => {
            await fetch('/api/admin/schedule/exceptions', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify(payload),
            });
            await refreshData();
          }}
        />
        <ScheduleForm
          title="Добавить буфер"
          actionLabel="Добавить буфер"
          services={services}
          showService={false}
          onSubmit={async (payload) => {
            await fetch('/api/admin/schedule/buffers', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify(payload),
            });
            await refreshData();
          }}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border bg-white p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium">Слоты</h2>
            <button
              className="rounded-md border px-3 py-1 text-sm"
              onClick={handleDeleteSelected}
              disabled={selectedSlotIds.length === 0}
            >
              Удалить выбранные
            </button>
          </div>
          {loading ? (
            <p className="text-sm text-muted-foreground">Загрузка...</p>
          ) : groupedSlots.length === 0 ? (
            <p className="text-sm text-muted-foreground">Нет слотов в выбранном диапазоне.</p>
          ) : (
            <div className="mt-4 space-y-4">
              {groupedSlots.map(([dateKey, items]) => {
                const dateLabel = new Date(dateKey).toLocaleDateString('ru-RU');
                return (
                  <div key={dateKey}>
                    <h3 className="text-sm font-semibold text-muted-foreground">{dateLabel}</h3>
                    <div className="mt-2 space-y-2">
                      {items.map((slot) => (
                        <div key={slot.id} className="flex items-center gap-3 rounded-md border px-3 py-2 text-sm">
                          <input
                            type="checkbox"
                            checked={selectedSlotIds.includes(slot.id)}
                            onChange={() => toggleSlotSelection(slot.id)}
                          />
                          <span className="min-w-[140px]">
                            {new Date(slot.start_at_utc).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                            {' – '}
                            {new Date(slot.end_at_utc).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <StatusBadge slot={slot} />
                          {slot.note && <span className="text-muted-foreground">· {slot.note}</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <div className="rounded-lg border bg-white p-4">
          <h2 className="text-lg font-medium">Бронирования</h2>
          {loading ? (
            <p className="text-sm text-muted-foreground">Загрузка...</p>
          ) : bookedByDay.length === 0 ? (
            <p className="text-sm text-muted-foreground">Нет бронирований в выбранном диапазоне.</p>
          ) : (
            <div className="mt-4 space-y-4">
              {bookedByDay.map(([dateKey, items]) => {
                const dateLabel = new Date(dateKey).toLocaleDateString('ru-RU');
                return (
                  <div key={dateKey}>
                    <h3 className="text-sm font-semibold text-muted-foreground">{dateLabel}</h3>
                    <div className="mt-2 space-y-2">
                      {items.map((appointment) => (
                        <div key={appointment.id} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                          <div>
                            <div className="font-medium">{appointment.service_title}</div>
                            <div className="text-muted-foreground">
                              {new Date(appointment.start_at_utc).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                              {' – '}
                              {new Date(appointment.end_at_utc).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <AppointmentStatusBadge status={appointment.status} />
                            {appointment.outcome && (
                              <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700">
                                Исход: {outcomeLabels[appointment.outcome]}
                              </span>
                            )}
                            {appointment.status !== 'canceled' && appointment.status !== 'completed' && (
                              <button
                                className="rounded-md border px-2 py-1 text-xs"
                                onClick={async () => {
                                  await fetch(`/api/admin/schedule/appointments/${appointment.id}/cancel`, {
                                    method: 'POST',
                                    credentials: 'include',
                                  });
                                  await refreshData();
                                }}
                              >
                                Отменить
                              </button>
                            )}
                            {appointment.status === 'completed' && (
                              <button
                                className="rounded-md border px-2 py-1 text-xs"
                                onClick={() => openOutcomeModal(appointment)}
                              >
                                {appointment.outcome ? 'Изменить исход' : 'Отметить исход'}
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="rounded-lg border bg-white p-4">
        <h2 className="text-lg font-medium">Настройки расписания</h2>
        <p className="text-sm text-muted-foreground">
          Часовой пояс используется для отображения расписания. Буфер применяется при ручном создании буферов.
        </p>
        <ScheduleSettingsForm settings={settings} onSave={setScheduleSettings} />
      </div>

      {outcomeModalOpen && outcomeAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
            <h3 className="text-lg font-semibold">Отметить исход встречи</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {outcomeAppointment.service_title} ·{' '}
              {new Date(outcomeAppointment.start_at_utc).toLocaleString('ru-RU')}
            </p>

            <div className="mt-4 space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Исход</label>
                <select
                  value={outcomeValue}
                  onChange={(event) => setOutcomeValue(event.target.value as AppointmentOutcome)}
                  className="w-full rounded-md border px-2 py-2 text-sm"
                >
                  {Object.entries(outcomeLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Причина (опционально)</label>
                <select
                  value={outcomeReason}
                  onChange={(event) => setOutcomeReason(event.target.value as AppointmentOutcomeReason | '')}
                  className="w-full rounded-md border px-2 py-2 text-sm"
                >
                  <option value="">Не выбрано</option>
                  {Object.entries(reasonLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {outcomeError && (
              <div className="mt-3 rounded-md border border-destructive/30 bg-destructive/5 p-2 text-sm text-destructive">
                {outcomeError}
              </div>
            )}

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                className="rounded-md border px-3 py-2 text-sm"
                onClick={closeOutcomeModal}
                disabled={outcomeSaving}
              >
                Отмена
              </button>
              <button
                type="button"
                className="rounded-md bg-primary px-3 py-2 text-sm text-white disabled:opacity-50"
                onClick={handleOutcomeSave}
                disabled={outcomeSaving}
              >
                {outcomeSaving ? 'Сохраняем...' : 'Сохранить'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  async function setScheduleSettings(payload: ScheduleSettings) {
    await fetch('/api/admin/schedule/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });
    const res = await fetch('/api/admin/schedule/settings', { credentials: 'include' });
    setSettings(await res.json());
  }
}

function StatusBadge({ slot }: { slot: ScheduleSlot }) {
  if (slot.status === 'available') {
    return <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-700">Доступен</span>;
  }
  if (slot.status === 'reserved') {
    return <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs text-yellow-700">Забронирован</span>;
  }
  if (slot.block_type === 'exception') {
    return <span className="rounded-full bg-red-100 px-2 py-1 text-xs text-red-700">Исключение</span>;
  }
  if (slot.block_type === 'buffer') {
    return <span className="rounded-full bg-gray-200 px-2 py-1 text-xs text-gray-700">Буфер</span>;
  }
  return <span className="rounded-full bg-gray-200 px-2 py-1 text-xs text-gray-700">Блок</span>;
}

function AppointmentStatusBadge({ status }: { status: string }) {
  if (status === 'canceled') {
    return <span className="rounded-full bg-red-100 px-2 py-1 text-xs text-red-700">Отменена</span>;
  }
  if (status === 'completed') {
    return <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-700">Завершена</span>;
  }
  return <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs text-yellow-700">Забронирована</span>;
}

function ScheduleForm({
  title,
  actionLabel,
  onSubmit,
  services,
  showService = true,
}: {
  title: string;
  actionLabel: string;
  onSubmit: (payload: { slots: any[] }) => Promise<void>;
  services: ServiceOption[];
  showService?: boolean;
}) {
  const [startAt, setStartAt] = useState<string>('');
  const [endAt, setEndAt] = useState<string>('');
  const [serviceId, setServiceId] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [repeat, setRepeat] = useState<'none' | 'weekly' | 'biweekly' | 'custom'>('none');
  const [repeatUntil, setRepeatUntil] = useState<string>('');
  const [repeatInterval, setRepeatInterval] = useState<string>('7');

  const handleSubmit = async () => {
    if (!startAt || !endAt) return;
    if (repeat !== 'none' && !repeatUntil) return;
    const payload: any = {
      start_at_utc: new Date(startAt).toISOString(),
      end_at_utc: new Date(endAt).toISOString(),
      note: note || null,
    };
    if (showService && serviceId) {
      payload.service_id = serviceId;
    }
    if (repeat !== 'none') {
      payload.repeat = {
        frequency: repeat,
        until_at_utc: new Date(repeatUntil).toISOString(),
        interval_days: repeat === 'custom' ? Number(repeatInterval) : undefined,
      };
    }
    await onSubmit({ slots: [payload] });
    setStartAt('');
    setEndAt('');
    setNote('');
    setRepeat('none');
    setRepeatUntil('');
  };

  return (
    <div className="rounded-lg border bg-white p-4 space-y-3">
      <h3 className="text-base font-medium">{title}</h3>
      <div className="space-y-2">
        <label className="text-sm text-muted-foreground">Начало (локальное время)</label>
        <input
          type="datetime-local"
          value={startAt}
          onChange={(event) => setStartAt(event.target.value)}
          className="w-full rounded-md border px-2 py-1"
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm text-muted-foreground">Конец (локальное время)</label>
        <input
          type="datetime-local"
          value={endAt}
          onChange={(event) => setEndAt(event.target.value)}
          className="w-full rounded-md border px-2 py-1"
        />
      </div>
      {showService && (
        <div className="space-y-2">
          <label className="text-sm text-muted-foreground">Услуга</label>
          <select
            value={serviceId}
            onChange={(event) => setServiceId(event.target.value)}
            className="w-full rounded-md border px-2 py-1"
          >
            <option value="">Любая</option>
            {services.map((service) => (
              <option key={service.id} value={service.id}>
                {service.title}
              </option>
            ))}
          </select>
        </div>
      )}
      <div className="space-y-2">
        <label className="text-sm text-muted-foreground">Заметка</label>
        <input
          type="text"
          value={note}
          onChange={(event) => setNote(event.target.value)}
          className="w-full rounded-md border px-2 py-1"
          placeholder="Внутренняя заметка"
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm text-muted-foreground">Повторение</label>
        <select
          value={repeat}
          onChange={(event) => setRepeat(event.target.value as any)}
          className="w-full rounded-md border px-2 py-1"
        >
          <option value="none">Без повторения</option>
          <option value="weekly">Еженедельно</option>
          <option value="biweekly">Раз в две недели</option>
          <option value="custom">Пользовательский интервал</option>
        </select>
      </div>
      {repeat !== 'none' && (
        <>
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Повторять до</label>
            <input
              type="date"
              value={repeatUntil}
              onChange={(event) => setRepeatUntil(event.target.value)}
              className="w-full rounded-md border px-2 py-1"
            />
          </div>
          {repeat === 'custom' && (
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Интервал (дней)</label>
              <input
                type="number"
                min={1}
                value={repeatInterval}
                onChange={(event) => setRepeatInterval(event.target.value)}
                className="w-full rounded-md border px-2 py-1"
              />
            </div>
          )}
        </>
      )}
      <button className="w-full rounded-md bg-primary px-3 py-2 text-sm text-white" onClick={handleSubmit}>
        {actionLabel}
      </button>
    </div>
  );
}

function ScheduleSettingsForm({
  settings,
  onSave,
}: {
  settings: ScheduleSettings | null;
  onSave: (payload: ScheduleSettings) => Promise<void>;
}) {
  const [timezone, setTimezone] = useState(settings?.timezone || 'UTC');
  const [buffer, setBuffer] = useState(settings?.buffer_minutes ?? 0);

  useEffect(() => {
    if (settings) {
      setTimezone(settings.timezone);
      setBuffer(settings.buffer_minutes);
    }
  }, [settings]);

  const handleSave = async () => {
    await onSave({ timezone, buffer_minutes: Number(buffer) });
  };

  return (
    <div className="mt-4 grid gap-4 sm:grid-cols-3">
      <div className="space-y-2">
        <label className="text-sm text-muted-foreground">Часовой пояс</label>
        <input
          type="text"
          value={timezone}
          onChange={(event) => setTimezone(event.target.value)}
          className="w-full rounded-md border px-2 py-1"
          placeholder="Europe/Moscow"
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm text-muted-foreground">Буфер (минуты)</label>
        <input
          type="number"
          min={0}
          value={buffer}
          onChange={(event) => setBuffer(Number(event.target.value))}
          className="w-full rounded-md border px-2 py-1"
        />
      </div>
      <div className="flex items-end">
        <button className="rounded-md bg-primary px-3 py-2 text-sm text-white" onClick={handleSave}>
          Сохранить
        </button>
      </div>
    </div>
  );
}
