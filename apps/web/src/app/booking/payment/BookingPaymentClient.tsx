'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card } from '@psychology/design-system';
import { BookingStepLayout } from '../BookingStepLayout';
import { loadBookingDraft } from '../bookingStorage';

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

export function BookingPaymentClient() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const draft = loadBookingDraft();

  React.useEffect(() => {
    if (!draft?.appointmentId) {
      router.replace('/booking/service');
    }
  }, [router]);

  const handlePayment = async () => {
    if (!draft?.appointmentId) {
      router.replace('/booking/service');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001/api';
      const res = await fetch(`${apiUrl}/public/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointment_id: draft.appointmentId }),
      });

      if (!res.ok) {
        throw new Error('Оплата временно недоступна. Попробуйте позже.');
      }

      const data = await res.json();
      const confirmationUrl = data?.confirmation?.confirmation_url || data?.confirmation?.url;

      if (confirmationUrl) {
        window.location.href = confirmationUrl;
        return;
      }

      router.push('/booking/confirmation');
    } catch (err: any) {
      setErrorMessage(err.message || 'Оплата временно недоступна. Попробуйте позже.');
    } finally {
      setIsLoading(false);
    }
  };

  const slotSummary = formatSlot(draft?.slotStartAtUtc, draft?.timezone);

  return (
    <BookingStepLayout
      title="Оплата"
      description="Мы перенаправим вас к платёжному провайдеру. Подтверждение придёт после проверки на стороне сервера."
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
          <h2 className="text-lg font-semibold text-foreground">Детали записи</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {draft?.serviceTitle || 'Консультация'}{slotSummary ? ` · ${slotSummary}` : ''}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button onClick={handlePayment} disabled={isLoading}>
            {isLoading ? 'Переходим к оплате...' : 'Перейти к оплате'}
          </Button>
          <Button variant="outline" onClick={() => router.push('/booking/confirmation')}>
            Я уже оплатил(а)
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Статус оплаты подтверждается сервером через вебхук, поэтому итоговая страница может обновляться несколько минут.
        </p>
      </Card>
    </BookingStepLayout>
  );
}
