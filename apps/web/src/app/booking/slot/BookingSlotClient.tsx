'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, Label, RadioGroup, RadioGroupItem, Input } from '@psychology/design-system';
import { getLeadId, track } from '@/lib/tracking';
import { BookingStepLayout } from '../BookingStepLayout';
import { loadBookingDraft, saveBookingDraft } from '../bookingStorage';

interface SlotResponse {
  status: 'available' | 'calendar_unavailable';
  timezone: string;
  service_id: string;
  service_slug: string;
  service_title: string;
  range: {
    from: string;
    to: string;
  };
  slots: {
    id: string;
    start_at_utc: string;
    end_at_utc: string;
  }[];
  message?: string | null;
}

const defaultRangeDays = 14;

function formatDateTime(value: string, timezone: string) {
  const date = new Date(value);
  const dateFormatter = new Intl.DateTimeFormat('ru-RU', {
    timeZone: timezone,
    day: '2-digit',
    month: 'long',
    weekday: 'short',
  });
  const timeFormatter = new Intl.DateTimeFormat('ru-RU', {
    timeZone: timezone,
    hour: '2-digit',
    minute: '2-digit',
  });
  return {
    date: dateFormatter.format(date),
    time: timeFormatter.format(date),
  };
}

export function BookingSlotClient() {
  const router = useRouter();
  const [timezone, setTimezone] = React.useState<string>('');
  const [slots, setSlots] = React.useState<SlotResponse['slots']>([]);
  const [status, setStatus] = React.useState<SlotResponse['status']>('available');
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [selectedSlotId, setSelectedSlotId] = React.useState<string>('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    const draft = loadBookingDraft();
    if (!draft?.serviceSlug || !draft.serviceFormat) {
      router.replace('/booking/service');
      return;
    }

    const resolvedTimezone = draft.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
    setTimezone(resolvedTimezone);
    saveBookingDraft({ timezone: resolvedTimezone });
  }, [router]);

  React.useEffect(() => {
    if (!timezone) return;
    const draft = loadBookingDraft();
    if (!draft?.serviceSlug) return;

    const controller = new AbortController();
    const loadSlots = async () => {
      setLoading(true);
      setError(null);
      const from = new Date();
      const to = new Date();
      to.setDate(from.getDate() + defaultRangeDays);

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001/api';
      const url = new URL(`${apiUrl}/public/booking/slots`);
      url.searchParams.set('service_slug', draft.serviceSlug);
      url.searchParams.set('from', from.toISOString());
      url.searchParams.set('to', to.toISOString());
      url.searchParams.set('tz', timezone);

      try {
        const res = await fetch(url.toString(), { signal: controller.signal });
        if (!res.ok) {
          throw new Error('Не удалось загрузить слоты.');
        }
        const data: SlotResponse = await res.json();
        setStatus(data.status);
        setSlots(data.slots);

        if (data.slots.length === 0) {
          track('show_no_slots', {
            service_slug: draft.serviceSlug,
            date_range: 'next_14d',
          });
        }
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          setError('Слоты временно недоступны. Пожалуйста, попробуйте позже.');
        }
      } finally {
        setLoading(false);
      }
    };

    loadSlots();
    return () => controller.abort();
  }, [timezone]);

  const handleReserve = async () => {
    const draft = loadBookingDraft();
    if (!draft?.serviceSlug || !draft?.serviceFormat || !selectedSlotId || !timezone) {
      setError('Пожалуйста, выберите слот.');
      return;
    }

    const slot = slots.find((item) => item.id === selectedSlotId);
    if (!slot) {
      setError('Выбранный слот недоступен. Пожалуйста, обновите список.');
      return;
    }

    let clientRequestId = draft.clientRequestId;
    if (!clientRequestId) {
      clientRequestId = crypto.randomUUID();
      saveBookingDraft({ clientRequestId });
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001/api';
      const res = await fetch(`${apiUrl}/public/booking/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_slug: draft.serviceSlug,
          slot_id: slot.id,
          timezone,
          format: draft.serviceFormat,
          client_request_id: clientRequestId,
          lead_id: getLeadId(),
        }),
      });

      if (!res.ok) {
        if (res.status === 409) {
          const data = await res.json();
          if (data.code === 'slot_conflict') {
            setError('К сожалению, этот слот только что забронировали. Пожалуйста, выберите другое время.');
            // Refresh slots to show updated availability
            const from = new Date();
            const to = new Date();
            to.setDate(from.getDate() + defaultRangeDays);
            const url = new URL(`${apiUrl}/public/booking/slots`);
            url.searchParams.set('service_slug', draft.serviceSlug);
            url.searchParams.set('from', from.toISOString());
            url.searchParams.set('to', to.toISOString());
            url.searchParams.set('tz', timezone);
            const slotsRes = await fetch(url.toString());
            if (slotsRes.ok) {
              const slotsData = await slotsRes.json();
              setSlots(slotsData.slots);
            }
            return;
          }
        }
        throw new Error('Не удалось забронировать слот.');
      }

      const data = await res.json();
      saveBookingDraft({
        appointmentId: data.appointment_id,
        slotId: slot.id,
        slotStartAtUtc: slot.start_at_utc,
        slotEndAtUtc: slot.end_at_utc,
        timezone,
      });

      track('booking_slot_selected', {
        slot_start_at: slot.start_at_utc,
        timezone,
        service_slug: draft.serviceSlug,
      });

      router.push('/booking/intake');
    } catch (err: any) {
      setError(err.message || 'Не удалось забронировать слот. Попробуйте ещё раз.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasNoSlots = !loading && slots.length === 0;

  return (
    <BookingStepLayout
      title="Выберите время"
      description="Показываем слоты в вашей локальной таймзоне."
      step={2}
      total={5}
    >
      <Card className="p-6">
        <div className="space-y-3">
          <Label htmlFor="timezone">Ваша таймзона</Label>
          <Input
            id="timezone"
            value={timezone}
            onChange={(event) => {
              const value = event.target.value;
              setTimezone(value);
              saveBookingDraft({ timezone: value });
            }}
            placeholder="Europe/Moscow"
          />
          <p className="text-xs text-muted-foreground">
            Убедитесь, что таймзона указана верно. Например: Europe/Moscow.
          </p>
        </div>
      </Card>

      {loading && (
        <Card className="p-6 text-muted-foreground">Загружаем доступные слоты...</Card>
      )}

      {error && (
        <div role="alert" aria-live="polite" className="rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {status === 'calendar_unavailable' && !loading && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-foreground">Календарь временно недоступен</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Мы не можем загрузить актуальные слоты. Оставьте запрос в лист ожидания или попробуйте позже.
          </p>
          <div className="mt-4">
            <Button variant="outline" onClick={() => router.push('/booking/no-slots')}>
              Перейти к листу ожидания
            </Button>
          </div>
        </Card>
      )}

      {hasNoSlots && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-foreground">Пока нет свободных слотов</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Мы можем сообщить, когда появится ближайшее время.
          </p>
          <div className="mt-4">
            <Button variant="outline" onClick={() => router.push('/booking/no-slots')}>
              Перейти к листу ожидания
            </Button>
          </div>
        </Card>
      )}

      {!loading && slots.length > 0 && (
        <Card className="p-6">
          <RadioGroup value={selectedSlotId} onValueChange={setSelectedSlotId} className="space-y-4">
            {slots.map((slot) => {
              const formatted = formatDateTime(slot.start_at_utc, timezone);
              return (
                <div key={slot.id} className="flex items-center gap-3 rounded-xl border border-border p-4">
                  <RadioGroupItem id={`slot-${slot.id}`} value={slot.id} />
                  <Label htmlFor={`slot-${slot.id}`} className="flex flex-col gap-1">
                    <span className="text-foreground font-medium">{formatted.date}</span>
                    <span className="text-sm text-muted-foreground">{formatted.time}</span>
                  </Label>
                </div>
              );
            })}
          </RadioGroup>

          <div className="mt-6">
            <Button onClick={handleReserve} disabled={!selectedSlotId || isSubmitting}>
              {isSubmitting ? 'Бронируем...' : 'Продолжить'}
            </Button>
          </div>
        </Card>
      )}
    </BookingStepLayout>
  );
}
