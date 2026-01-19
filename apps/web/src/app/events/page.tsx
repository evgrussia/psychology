import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { Card, CardHeader, CardTitle, CardDescription, Container, Section, Button } from '@psychology/design-system';

export const metadata: Metadata = {
  title: 'Мероприятия | Эмоциональный баланс',
  description: 'Вебинары, Q&A и другие события. Регистрация без давления.',
};

async function getEvents() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001/api';
  try {
    const res = await fetch(`${apiUrl}/public/events`, {
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) throw new Error('Failed');
    return res.json();
  } catch (error) {
    console.error('Error fetching events:', error);
    return [];
  }
}

function formatDate(value: string) {
  const date = new Date(value);
  return new Intl.DateTimeFormat('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: '2-digit',
    weekday: 'short',
  }).format(date);
}

export default async function EventsPage() {
  const events = await getEvents();

  return (
    <Section>
      <Container>
        <div className="space-y-4">
          <h1 className="text-3xl font-semibold md:text-4xl">Мероприятия</h1>
          <p className="text-muted-foreground text-lg">Вебинары, Q&amp;A и бережные встречи. Можно участвовать без лишнего.</p>
        </div>

        <div className="mt-10">
          {events.length === 0 ? (
            <Card className="border-dashed">
              <CardHeader className="text-muted-foreground items-center text-center">
                <CardTitle className="text-base">Пока нет опубликованных мероприятий</CardTitle>
              </CardHeader>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {events.map((event: any) => (
                <Card key={event.id} className="h-full flex flex-col">
                  <CardHeader className="space-y-2">
                    <CardTitle className="text-lg">{event.title}</CardTitle>
                    <CardDescription>
                      {event.starts_at ? formatDate(event.starts_at) : null}
                      {event.format ? ` · ${event.format}` : ''}
                    </CardDescription>
                  </CardHeader>
                  <div className="p-6 pt-0 mt-auto flex gap-3">
                    <Button asChild variant="outline" className="w-full">
                      <Link href={`/events/${event.slug}`}>Подробнее</Link>
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </Container>
    </Section>
  );
}

