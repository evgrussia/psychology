'use client';

import React from 'react';
import { Button } from '@psychology/design-system';
import { track } from '@/lib/tracking';

interface ServiceBookingButtonProps {
  serviceSlug: string;
  className?: string;
  children?: React.ReactNode;
}

export function ServiceBookingButton({ serviceSlug, className, children = 'Записаться' }: ServiceBookingButtonProps) {
  const handleBookingClick = () => {
    track('booking_start', {
      service_slug: serviceSlug,
      entry_point: localStorage.getItem('entry_point') || 'direct',
    });
    window.location.href = '/booking';
  };

  return (
    <Button onClick={handleBookingClick} className={className}>
      {children}
    </Button>
  );
}
