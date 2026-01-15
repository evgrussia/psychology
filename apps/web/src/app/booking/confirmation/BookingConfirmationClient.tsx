'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card } from '@psychology/design-system';
import { BookingStepLayout } from '../BookingStepLayout';
import { loadBookingDraft } from '../bookingStorage';

interface BookingStatusResponse {
  appointment_id: string;
  status: 'pending_payment' | 'paid' | 'confirmed' | 'canceled' | 'rescheduled' | 'completed';
  service_slug: string;
  format: 'online' | 'offline' | 'hybrid';
  timezone: string;
  start_at_utc: string;
  end_at_utc: string;
}

function formatSlot(dateString?: string, timezone?: string) {
  if (!dateString || !timezone) return null;
  const date = new Date(dateString);
  const datePart = new Intl.DateTimeFormat('ru-RU', {
    timeZone: timezone,
    day: '2-digit',
    month: 'long',
    weekday: 'short',
  }).format(date);
  const timePart = new Intl.DateTimeFormat('ru-RU', {
    timeZone: timezone,
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
  return `${datePart} · ${timePart}`;
}

export function BookingConfirmationClient() {
  const router = useRouter();
  const [status, setStatus] = React.useState<BookingStatusResponse | null>(null);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const draft = loadBookingDraft();

  const fetchStatus = React.useCallback(async () => {
    if (!draft?.appointmentId) return;
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001/api';
      const res = await fetch(`${apiUrl}/public/booking/${draft.appointmentId}/status`);
      if (!res.ok) {
        throw new Error('Не удалось получить статус записи.');
      }
      const data = await res.json();
      setStatus(data);
    } catch (err: any) {
      setErrorMessage(err.message || 'Не удалось получить статус записи.');
    } finally {
      setIsLoading(false);
    }
  }, [draft?.appointmentId]);

  React.useEffect(() => {
    if (!draft?.appointmentId) {
      router.replace('/booking/service');
      return;
    }

    fetchStatus();
    const interval = window.setInterval(fetchStatus, 8000);
    return () => window.clearInterval(interval);
  }, [fetchStatus, router]);

  const slotSummary = formatSlot(status?.start_at_utc ?? draft?.slotStartAtUtc, status?.timezone ?? draft?.timezone);
  const isConfirmed = status?.status === 'confirmed';

  return (
    <BookingStepLayout
      title={isConfirmed ? 'Запись подтверждена' : 'Ожидаем подтверждение'}
      description="Статус обновляется после проверки оплаты на стороне сервера."
      step={5}
      total={5}
    >
      {errorMessage && (
        <div role="alert" aria-live="polite" className="rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
          {errorMessage}
        </div>
      )}

      <Card className="p-6 space-y-4">
        <div>
          <p className="text-sm text-muted-foreground">
            {slotSummary ? `Слот: ${slotSummary}` : 'Слот будет подтверждён после оплаты.'}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Статус: {status?.status || 'pending_payment'}
          </p>
        </div>

        {!isConfirmed && (
          <div className="text-sm text-muted-foreground">
            Если оплата не прошла, попробуйте ещё раз или свяжитесь с нами через Telegram.
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <Button onClick={fetchStatus} disabled={isLoading}>
            {isLoading ? 'Проверяем...' : 'Проверить статус'}
          </Button>
          {!isConfirmed && (
            <Button variant="outline" onClick={() => router.push('/booking/payment')}>
              Повторить оплату
            </Button>
          )}
          <Button variant="ghost" onClick={() => router.push('/')}>
            На главную
          </Button>
        </div>
      </Card>
    </BookingStepLayout>
  );
}
