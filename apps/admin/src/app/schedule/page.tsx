'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  AlertDescription,
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Checkbox,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@psychology/design-system';

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
          <h1 className="text-2xl font-semibold text-foreground">Расписание</h1>
          <p className="text-sm text-muted-foreground">
            Управление слотами, исключениями и буферами. Диапазон: {rangeLabel}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {Object.entries(viewLabels).map(([mode, label]) => (
            <Button
              key={mode}
              size="sm"
              variant={viewMode === mode ? 'default' : 'outline'}
              onClick={() => setViewMode(mode as ViewMode)}
            >
              {label}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button variant="outline" size="sm" onClick={() => shiftRange(-1)}>
          ← Назад
        </Button>
        <Button variant="outline" size="sm" onClick={() => setAnchorDate(new Date())}>
          Сегодня
        </Button>
        <Button variant="outline" size="sm" onClick={() => shiftRange(1)}>
          Вперёд →
        </Button>

        <div className="ml-auto flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Фильтр:</span>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все</SelectItem>
              <SelectItem value="available">Доступные</SelectItem>
              <SelectItem value="reserved">Забронированные</SelectItem>
              <SelectItem value="exception">Исключения</SelectItem>
              <SelectItem value="buffer">Буферы</SelectItem>
            </SelectContent>
          </Select>
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
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Слоты</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDeleteSelected}
              disabled={selectedSlotIds.length === 0}
            >
              Удалить выбранные
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <p className="text-sm text-muted-foreground">Загрузка...</p>
            ) : groupedSlots.length === 0 ? (
              <p className="text-sm text-muted-foreground">Нет слотов в выбранном диапазоне.</p>
            ) : (
              <div className="space-y-4">
                {groupedSlots.map(([dateKey, items]) => {
                  const dateLabel = new Date(dateKey).toLocaleDateString('ru-RU');
                  return (
                    <div key={dateKey}>
                      <h3 className="text-sm font-semibold text-muted-foreground">{dateLabel}</h3>
                      <div className="mt-2 space-y-2">
                        {items.map((slot) => (
                          <div key={slot.id} className="flex items-center gap-3 rounded-md border px-3 py-2 text-sm">
                            <Checkbox
                              checked={selectedSlotIds.includes(slot.id)}
                              onCheckedChange={() => toggleSlotSelection(slot.id)}
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
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Бронирования</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <p className="text-sm text-muted-foreground">Загрузка...</p>
            ) : bookedByDay.length === 0 ? (
              <p className="text-sm text-muted-foreground">Нет бронирований в выбранном диапазоне.</p>
            ) : (
              <div className="space-y-4">
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
                                <Badge variant="outline" className="bg-muted/40 text-muted-foreground">
                                  Исход: {outcomeLabels[appointment.outcome]}
                                </Badge>
                              )}
                              {appointment.status !== 'canceled' && appointment.status !== 'completed' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={async () => {
                                    await fetch(`/api/admin/schedule/appointments/${appointment.id}/cancel`, {
                                      method: 'POST',
                                      credentials: 'include',
                                    });
                                    await refreshData();
                                  }}
                                >
                                  Отменить
                                </Button>
                              )}
                              {appointment.status === 'completed' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openOutcomeModal(appointment)}
                                >
                                  {appointment.outcome ? 'Изменить исход' : 'Отметить исход'}
                                </Button>
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
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Настройки расписания</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Часовой пояс используется для отображения расписания. Буфер применяется при ручном создании буферов.
          </p>
          <ScheduleSettingsForm settings={settings} onSave={setScheduleSettings} />
        </CardContent>
      </Card>

      {outcomeModalOpen && outcomeAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-lg">Отметить исход встречи</CardTitle>
              <p className="text-sm text-muted-foreground">
                {outcomeAppointment.service_title} ·{' '}
                {new Date(outcomeAppointment.start_at_utc).toLocaleString('ru-RU')}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Исход</Label>
                <Select
                  value={outcomeValue}
                  onValueChange={(value) => setOutcomeValue(value as AppointmentOutcome)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(outcomeLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Причина (опционально)</Label>
                <Select
                  value={outcomeReason || 'none'}
                  onValueChange={(value) =>
                    setOutcomeReason(value === 'none' ? '' : (value as AppointmentOutcomeReason))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Не выбрано</SelectItem>
                    {Object.entries(reasonLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {outcomeError && (
                <Alert variant="destructive">
                  <AlertDescription>{outcomeError}</AlertDescription>
                </Alert>
              )}

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeOutcomeModal}
                  disabled={outcomeSaving}
                >
                  Отмена
                </Button>
                <Button
                  type="button"
                  onClick={handleOutcomeSave}
                  disabled={outcomeSaving}
                >
                  {outcomeSaving ? 'Сохраняем...' : 'Сохранить'}
                </Button>
              </div>
            </CardContent>
          </Card>
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
    return <Badge variant="outline" className="border-success/30 bg-success/10 text-success">Доступен</Badge>;
  }
  if (slot.status === 'reserved') {
    return <Badge variant="outline" className="border-warning/30 bg-warning/10 text-warning">Забронирован</Badge>;
  }
  if (slot.block_type === 'exception') {
    return <Badge variant="outline" className="border-destructive/30 bg-destructive/10 text-destructive">Исключение</Badge>;
  }
  if (slot.block_type === 'buffer') {
    return <Badge variant="outline" className="border-muted text-muted-foreground bg-muted/40">Буфер</Badge>;
  }
  return <Badge variant="outline" className="border-muted text-muted-foreground bg-muted/40">Блок</Badge>;
}

function AppointmentStatusBadge({ status }: { status: string }) {
  if (status === 'canceled') {
    return <Badge variant="outline" className="border-destructive/30 bg-destructive/10 text-destructive">Отменена</Badge>;
  }
  if (status === 'completed') {
    return <Badge variant="outline" className="border-success/30 bg-success/10 text-success">Завершена</Badge>;
  }
  return <Badge variant="outline" className="border-warning/30 bg-warning/10 text-warning">Забронирована</Badge>;
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
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <Label>Начало (локальное время)</Label>
          <Input
            type="datetime-local"
            value={startAt}
            onChange={(event) => setStartAt(event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Конец (локальное время)</Label>
          <Input
            type="datetime-local"
            value={endAt}
            onChange={(event) => setEndAt(event.target.value)}
          />
        </div>
        {showService && (
          <div className="space-y-2">
            <Label>Услуга</Label>
            <Select
              value={serviceId || 'all'}
              onValueChange={(value) => setServiceId(value === 'all' ? '' : value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Любая</SelectItem>
                {services.map((service) => (
                  <SelectItem key={service.id} value={service.id}>
                    {service.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        <div className="space-y-2">
          <Label>Заметка</Label>
          <Input
            type="text"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Внутренняя заметка"
          />
        </div>
        <div className="space-y-2">
          <Label>Повторение</Label>
          <Select value={repeat} onValueChange={(value) => setRepeat(value as any)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Без повторения</SelectItem>
              <SelectItem value="weekly">Еженедельно</SelectItem>
              <SelectItem value="biweekly">Раз в две недели</SelectItem>
              <SelectItem value="custom">Пользовательский интервал</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {repeat !== 'none' && (
          <>
            <div className="space-y-2">
              <Label>Повторять до</Label>
              <Input
                type="date"
                value={repeatUntil}
                onChange={(event) => setRepeatUntil(event.target.value)}
              />
            </div>
            {repeat === 'custom' && (
              <div className="space-y-2">
                <Label>Интервал (дней)</Label>
                <Input
                  type="number"
                  min={1}
                  value={repeatInterval}
                  onChange={(event) => setRepeatInterval(event.target.value)}
                />
              </div>
            )}
          </>
        )}
        <Button className="w-full" onClick={handleSubmit}>
          {actionLabel}
        </Button>
      </CardContent>
    </Card>
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
    <div className="grid gap-4 sm:grid-cols-3">
      <div className="space-y-2">
        <Label>Часовой пояс</Label>
        <Input
          type="text"
          value={timezone}
          onChange={(event) => setTimezone(event.target.value)}
          placeholder="Europe/Moscow"
        />
      </div>
      <div className="space-y-2">
        <Label>Буфер (минуты)</Label>
        <Input
          type="number"
          min={0}
          value={buffer}
          onChange={(event) => setBuffer(Number(event.target.value))}
        />
      </div>
      <div className="flex items-end">
        <Button onClick={handleSave}>
          Сохранить
        </Button>
      </div>
    </div>
  );
}
