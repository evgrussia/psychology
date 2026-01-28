'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { bookingService } from '@/services/api/booking';
import { useBookingStore } from '@/store/bookingStore';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { ErrorState } from '@/components/shared/ErrorState';
import { EmptyState } from '@/components/shared/EmptyState';
import { BookingSlot } from '@/components/domain/BookingSlot';
import { useTracking } from '@/hooks/useTracking';
import { format } from 'date-fns';

export default function BookingSlotPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { track } = useTracking();
  const { serviceId, setSlot } = useBookingStore();
  const [selectedDate, setSelectedDate] = useState<string>(
    format(new Date(), 'yyyy-MM-dd')
  );

  const serviceIdParam = searchParams.get('service') || serviceId;

  useEffect(() => {
    if (!serviceIdParam) {
      router.push('/booking');
    }
  }, [serviceIdParam, router]);

  const { data: slots, isLoading, error } = useQuery({
    queryKey: ['booking-slots', serviceIdParam, selectedDate],
    queryFn: () =>
      bookingService.getAvailableSlots(serviceIdParam!, {
        date_from: `${selectedDate}T00:00:00Z`,
        date_to: `${selectedDate}T23:59:59Z`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      }),
    enabled: !!serviceIdParam,
  });

  const handleSlotSelect = (slot: { id: string; start_at: string; end_at: string }) => {
    setSlot(slot.id, slot.start_at, slot.end_at);
    track('booking_slot_selected', {
      slot_id: slot.id,
      service_id: serviceIdParam,
    });
    router.push('/booking/form');
  };

  if (!serviceIdParam) {
    return null;
  }

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  const availableSlots = slots?.filter((slot) => slot.status === 'available') || [];

  if (availableSlots.length === 0) {
    return (
      <main id="main-content" className="min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6">Выберите время</h1>
          <EmptyState
            message="На выбранную дату нет доступных слотов"
            action={{
              label: 'Выбрать другую дату',
              onClick: () => {
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                setSelectedDate(format(tomorrow, 'yyyy-MM-dd'));
              },
            }}
          />
        </div>
      </main>
    );
  }

  return (
    <main id="main-content" className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Выберите время</h1>

        <div className="mb-6">
          <label htmlFor="date" className="block text-sm font-medium mb-2">
            Дата
          </label>
          <input
            id="date"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            min={format(new Date(), 'yyyy-MM-dd')}
            className="rounded-md border border-input bg-transparent px-3 py-2 text-sm"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {availableSlots.map((slot) => (
            <BookingSlot
              key={slot.id}
              id={slot.id}
              start_at={slot.start_at}
              end_at={slot.end_at}
              status={slot.status}
              onClick={() => handleSlotSelect(slot)}
            />
          ))}
        </div>

        <div className="mt-6">
          <Button variant="outline" onClick={() => router.push('/booking')}>
            Назад
          </Button>
        </div>
      </div>
    </main>
  );
}
