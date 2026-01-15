'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card } from '@psychology/design-system';
import { BookingStepLayout } from '../BookingStepLayout';

export function NoSlotsClient() {
  const router = useRouter();

  return (
    <BookingStepLayout
      title="Пока нет свободных слотов"
      description="Оставьте заявку в лист ожидания или выберите другой формат связи."
      step={2}
      total={5}
    >
      <Card className="p-6 space-y-4">
        <p className="text-sm text-muted-foreground">
          Мы можем сообщить, когда появится новое время. Также можно написать в Telegram-консьерж и подобрать вариант.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => router.push('/start')} variant="outline">
            С чего начать
          </Button>
          <Button onClick={() => window.location.href = 'https://t.me/psy_balance_bot'}>
            Написать в Telegram
          </Button>
        </div>
      </Card>
    </BookingStepLayout>
  );
}
