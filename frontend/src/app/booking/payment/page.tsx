'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useBookingStore } from '@/store/bookingStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { useTracking } from '@/hooks/useTracking';
import { useQuery } from '@tanstack/react-query';
import { bookingService } from '@/services/api/booking';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

export default function BookingPaymentPage() {
  const router = useRouter();
  const { track } = useTracking();
  const { appointmentId, paymentUrl, slotStart } = useBookingStore();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (!appointmentId) {
      router.push('/booking');
    }
  }, [appointmentId, router]);

  const { data: booking, isLoading } = useQuery({
    queryKey: ['booking', appointmentId],
    queryFn: () => bookingService.getBooking(appointmentId!),
    enabled: !!appointmentId,
  });

  const handlePayment = () => {
    if (paymentUrl) {
      setIsRedirecting(true);
      track('booking_payment_started', {
        booking_id: appointmentId,
      });
      window.location.href = paymentUrl;
    }
  };

  if (!appointmentId) {
    return null;
  }

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!booking) {
    return (
      <main id="main-content" className="min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-6">
              <p>Запись не найдена</p>
              <Button onClick={() => router.push('/booking')} className="mt-4">
                Вернуться к выбору услуги
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  const paymentAmount = booking.payment?.amount || 0;
  const depositAmount = booking.payment?.deposit_amount || 0;

  return (
    <main id="main-content" className="min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-3xl font-bold mb-6">Оплата</h1>

        <Card>
          <CardHeader>
            <CardTitle>Детали записи</CardTitle>
            <CardDescription>
              {booking.service?.title || 'Услуга'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {slotStart && (
              <div>
                <p className="text-sm text-muted-foreground">Дата и время</p>
                <p className="font-medium">
                  {format(new Date(slotStart), 'd MMMM yyyy, HH:mm', { locale: ru })}
                </p>
              </div>
            )}

            <div>
              <p className="text-sm text-muted-foreground">Сумма к оплате</p>
              <p className="text-2xl font-bold">{paymentAmount} ₽</p>
              {depositAmount > 0 && depositAmount < paymentAmount && (
                <p className="text-sm text-muted-foreground mt-1">
                  Предоплата: {depositAmount} ₽
                </p>
              )}
            </div>

            <div className="pt-4 border-t">
              <Button
                onClick={handlePayment}
                disabled={!paymentUrl || isRedirecting}
                className="w-full"
                size="lg"
              >
                {isRedirecting ? 'Перенаправление...' : 'Перейти к оплате'}
              </Button>
            </div>

            <div className="pt-4">
              <Button
                variant="outline"
                onClick={() => router.push('/booking/form')}
                className="w-full"
              >
                Назад
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
