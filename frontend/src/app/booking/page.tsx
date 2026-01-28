'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { bookingService } from '@/services/api/booking';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { ErrorState } from '@/components/shared/ErrorState';
import { useTracking } from '@/hooks/useTracking';

export default function BookingPage() {
  const router = useRouter();
  const { track } = useTracking();
  const [selectedService, setSelectedService] = useState<string | null>(null);

  const { data: services, isLoading, error } = useQuery({
    queryKey: ['booking-services'],
    queryFn: () => bookingService.getServices(),
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  const handleServiceSelect = (serviceId: string, serviceSlug: string) => {
    setSelectedService(serviceId);
    track('service_selected', {
      service_id: serviceId,
      service_slug: serviceSlug,
    });
    router.push(`/booking/slot?service=${serviceId}`);
  };

  return (
    <main id="main-content" className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Выберите услугу</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services?.map((service) => (
            <Card key={service.id} className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>{service.name}</CardTitle>
                <CardDescription>{service.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-muted-foreground">
                    {service.duration_minutes} минут
                  </span>
                  <span className="text-lg font-semibold">
                    {service.price} {service.currency}
                  </span>
                </div>
                <Button
                  className="w-full"
                  onClick={() => handleServiceSelect(service.id, service.slug)}
                >
                  Выбрать
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </main>
  );
}
