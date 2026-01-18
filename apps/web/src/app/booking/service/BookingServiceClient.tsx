'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  Button,
  Card,
  RadioGroup,
  RadioGroupItem,
  Label,
} from '@psychology/design-system';
import { track } from '@/lib/tracking';
import { BookingStepLayout } from '../BookingStepLayout';
import { saveBookingDraft } from '../bookingStorage';

interface ServiceListItem {
  id: string;
  slug: string;
  title: string;
  format: 'online' | 'offline' | 'hybrid';
  duration_minutes: number;
  price_amount: number;
  deposit_amount?: number | null;
  offline_address?: string | null;
}

const formatLabels: Record<ServiceListItem['format'], string> = {
  online: 'Онлайн',
  offline: 'Офлайн',
  hybrid: 'Онлайн / офлайн',
};

const priceBucket = (amount: number): string => {
  if (amount <= 3000) return '0_3000';
  if (amount <= 5000) return '3001_5000';
  if (amount <= 8000) return '5001_8000';
  return '8000_plus';
};

const depositBucket = (amount?: number | null): string | null => {
  if (!amount) return null;
  if (amount <= 1000) return '0_1000';
  if (amount <= 2000) return '1001_2000';
  if (amount <= 3000) return '2001_3000';
  return '3000_plus';
};

export function BookingServiceClient({ services }: { services: ServiceListItem[] }) {
  const router = useRouter();
  const errorSummaryRef = React.useRef<HTMLDivElement>(null);
  const [formatByService, setFormatByService] = React.useState<Record<string, 'online' | 'offline'>>({});
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    const alreadyTracked = localStorage.getItem('booking_start_tracked');
    if (!alreadyTracked) {
      track('booking_start', {
        entry_point: localStorage.getItem('entry_point') || 'direct',
      });
      localStorage.setItem('booking_start_tracked', '1');
    }
  }, []);

  React.useEffect(() => {
    if (Object.keys(fieldErrors).length > 0) {
      errorSummaryRef.current?.focus();
    }
  }, [fieldErrors]);

  const handleSelectService = (service: ServiceListItem) => {
    setFieldErrors({});
    const selectedFormat = service.format === 'hybrid'
      ? formatByService[service.id]
      : service.format;

    if (service.format === 'hybrid' && !selectedFormat) {
      setFieldErrors({ [service.id]: 'Пожалуйста, выберите формат консультации.' });
      return;
    }

    const resolvedFormat = selectedFormat ?? service.format;

    track('service_selected', {
      service_slug: service.slug,
      format: resolvedFormat,
      price_bucket: priceBucket(service.price_amount),
      deposit_bucket: depositBucket(service.deposit_amount),
    });

    saveBookingDraft({
      serviceId: service.id,
      serviceSlug: service.slug,
      serviceTitle: service.title,
      serviceFormat: resolvedFormat,
      serviceDuration: service.duration_minutes,
      priceAmount: service.price_amount,
      depositAmount: service.deposit_amount ?? null,
    });

    router.push('/booking/slot');
  };

  return (
    <BookingStepLayout
      title="Выберите услугу"
      description="Подберите формат консультации и перейдите к выбору времени."
      step={1}
      total={5}
    >
      {Object.keys(fieldErrors).length > 0 && (
        <div
          ref={errorSummaryRef}
          tabIndex={-1}
          role="alert"
          aria-live="assertive"
          className="rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive"
        >
          <p className="font-semibold">Пожалуйста, проверьте выбор формата:</p>
          <ul className="mt-2 list-disc pl-5">
            {Object.entries(fieldErrors).map(([serviceId, message]) => (
              <li key={serviceId}>
                <a className="underline underline-offset-2" href={`#service-format-${serviceId}`}>
                  {message}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {services.map((service) => (
          <Card key={service.id} className="p-6 flex h-full flex-col justify-between">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {formatLabels[service.format]}
              </div>
              <h2 className="mt-3 text-2xl font-semibold text-foreground">{service.title}</h2>
              <div className="mt-4 text-sm text-muted-foreground space-y-1">
                <div>Длительность: {service.duration_minutes} минут</div>
                <div>Стоимость: {service.price_amount} ₽</div>
                {service.deposit_amount ? <div>Депозит: {service.deposit_amount} ₽</div> : null}
              </div>
              {service.offline_address && (
                <div className="mt-4 text-sm text-muted-foreground">
                  Адрес офлайн-встреч: {service.offline_address}
                </div>
              )}
              {service.format === 'hybrid' && (
                <fieldset className="mt-6 space-y-3" id={`service-format-${service.id}`} tabIndex={-1}>
                  <legend className="text-sm font-medium text-foreground">Формат консультации</legend>
                  <RadioGroup
                    value={formatByService[service.id]}
                    onValueChange={(value: 'online' | 'offline') => {
                      setFormatByService((prev) => ({ ...prev, [service.id]: value }));
                    }}
                    className="flex flex-col gap-2"
                    aria-invalid={!!fieldErrors[service.id]}
                    aria-describedby={fieldErrors[service.id] ? `service-format-${service.id}-error` : undefined}
                  >
                    <div className="flex items-center gap-2">
                      <RadioGroupItem id={`${service.id}-online`} value="online" />
                      <Label htmlFor={`${service.id}-online`}>Онлайн</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem id={`${service.id}-offline`} value="offline" />
                      <Label htmlFor={`${service.id}-offline`}>Офлайн</Label>
                    </div>
                  </RadioGroup>
                  {fieldErrors[service.id] && (
                    <p id={`service-format-${service.id}-error`} className="text-xs text-destructive">
                      {fieldErrors[service.id]}
                    </p>
                  )}
                </fieldset>
              )}
            </div>
            <div className="mt-6">
              <Button onClick={() => handleSelectService(service)} className="w-full">
                Выбрать слот
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {services.length === 0 && (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Список услуг временно недоступен. Попробуйте позже.</p>
          <div className="mt-4">
            <Button variant="outline" onClick={() => router.push('/start')}>
              С чего начать
            </Button>
          </div>
        </Card>
      )}
    </BookingStepLayout>
  );
}
