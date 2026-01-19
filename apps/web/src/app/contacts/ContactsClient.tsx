'use client';

import React from 'react';
import Link from 'next/link';
import { Button, Card, Container, Section, Disclaimer } from '@psychology/design-system';
import { createTelegramDeepLink } from '@/lib/telegram';
import { track } from '@/lib/tracking';

export function ContactsClient() {
  const handleTelegram = async () => {
    const { deepLinkId, url } = await createTelegramDeepLink({
      flow: 'concierge',
      tgTarget: 'bot',
      source: '/contacts',
      utmMedium: 'bot',
      utmContent: 'contacts_telegram',
    });
    track('cta_tg_click', {
      tg_target: 'bot',
      tg_flow: 'concierge',
      deep_link_id: deepLinkId,
      cta_id: 'contacts_telegram',
    });
    window.location.href = url;
  };

  const handleBooking = () => {
    track('booking_start', { entry_point: 'contacts' });
    window.location.href = '/booking';
  };

  return (
    <Section>
      <Container className="max-w-3xl space-y-8">
        <header className="space-y-3 text-center">
          <h1 className="text-4xl font-bold">Контакты</h1>
          <p className="text-muted-foreground">
            Напишите в Telegram или начните запись — отвечу бережно и без давления.
          </p>
        </header>

        <Card className="p-6 space-y-6 text-center">
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button onClick={() => void handleTelegram()} size="lg">
              Написать в Telegram
            </Button>
            <Button variant="outline" size="lg" onClick={handleBooking}>
              Перейти к записи
            </Button>
          </div>

          <div className="text-sm text-muted-foreground">
            Если удобнее задать вопрос без контакта — можно использовать форму{' '}
            <Link className="text-primary underline underline-offset-2" href="/interactive/anonymous-question">
              «Анонимный вопрос»
            </Link>
            .
          </div>
        </Card>

        <Disclaimer variant="info" title="Важно">
          Сайт не является экстренной помощью. Если вам нужна срочная поддержка — пожалуйста, воспользуйтесь{' '}
          <Link className="text-primary underline underline-offset-2" href="/emergency">
            экстренными контактами
          </Link>
          .
        </Disclaimer>
      </Container>
    </Section>
  );
}
