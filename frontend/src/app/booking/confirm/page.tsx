'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useBookingStore } from '@/store/bookingStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { useTracking } from '@/hooks/useTracking';
import { useQuery } from '@tanstack/react-query';
import { bookingService } from '@/services/api/booking';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { CheckCircle2 } from 'lucide-react';

export default function BookingConfirmPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { track } = useTracking();
  const { appointmentId, slotStart, clearBooking } = useBookingStore();

  const bookingId = searchParams.get('booking_id') || appointmentId;

  useEffect(() => {
    if (!bookingId) {
      router.push('/booking');
    } else {
      track('booking_confirmed', {
        booking_id: bookingId,
      });
    }
  }, [bookingId, router, track]);

  const { data: booking, isLoading } = useQuery({
    queryKey: ['booking', bookingId],
    queryFn: () => bookingService.getBooking(bookingId!),
    enabled: !!bookingId,
  });

  const handleGoToCabinet = () => {
    clearBooking();
    router.push('/cabinet/appointments');
  };

  if (!bookingId) {
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

  return (
    <main id="main-content" className="min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle2 className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle className="text-2xl">Запись подтверждена!</CardTitle>
            <CardDescription>
              Мы отправили вам подтверждение на email
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Услуга</p>
              <p className="font-medium">{booking.service?.title || 'Услуга'}</p>
            </div>

            {(slotStart || booking.slot?.start_at) && (
              <div>
                <p className="text-sm text-muted-foreground">Дата и время</p>
                <p className="font-medium">
                  {format(
                    new Date(slotStart || booking.slot!.start_at),
                    'd MMMM yyyy, HH:mm',
                    { locale: ru }
                  )}
                </p>
              </div>
            )}

            <div>
              <p className="text-sm text-muted-foreground">Статус</p>
              <p className="font-medium capitalize">
                {booking.status === 'confirmed' ? 'Подтверждено' : booking.status}
              </p>
            </div>

            <div className="pt-4 space-y-2">
              <Button onClick={handleGoToCabinet} className="w-full" size="lg">
                Перейти в личный кабинет
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push('/')}
                className="w-full"
              >
                На главную
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
