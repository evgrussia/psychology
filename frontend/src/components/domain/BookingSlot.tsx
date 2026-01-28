'use client';

import { Card, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { cn } from '@/components/ui/utils';

export interface BookingSlotProps {
  id: string;
  start_at: string;
  end_at?: string;
  status: 'available' | 'booked' | 'unavailable';
  onClick?: () => void;
  className?: string;
}

export function BookingSlot({
  id,
  start_at,
  end_at,
  status,
  onClick,
  className,
}: BookingSlotProps) {
  const startTime = format(new Date(start_at), 'HH:mm', { locale: ru });
  const endTime = end_at ? format(new Date(end_at), 'HH:mm', { locale: ru }) : null;
  const isAvailable = status === 'available';
  const isClickable = isAvailable && onClick;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <Card
      className={cn(
        'transition-shadow',
        isClickable && 'cursor-pointer hover:shadow-lg focus-visible:ring-2 focus-visible:ring-ring outline-none',
        !isAvailable && 'opacity-50 cursor-not-allowed',
        className
      )}
      onClick={isClickable ? onClick : undefined}
      onKeyDown={handleKeyDown}
      tabIndex={isClickable ? 0 : -1}
      role={isClickable ? 'button' : undefined}
      aria-disabled={!isAvailable}
    >
      <CardContent className="p-4">
        <div className="text-center">
          <div className="text-2xl font-bold">{startTime}</div>
          {endTime && (
            <div className="text-sm text-muted-foreground">— {endTime}</div>
          )}
          {status === 'booked' && (
            <div className="text-xs text-muted-foreground mt-1">Занято</div>
          )}
          {status === 'unavailable' && (
            <div className="text-xs text-muted-foreground mt-1">Недоступно</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
