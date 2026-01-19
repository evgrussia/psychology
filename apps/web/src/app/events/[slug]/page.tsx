import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { Button, Card, Container, Section, Disclaimer } from '@psychology/design-system';
import SafeMarkdownRenderer from '@/components/SafeMarkdownRenderer';
import { EventTrackingClient } from './EventTrackingClient';

async function getEvent(slug: string) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001/api';
  try {
    const res = await fetch(`${apiUrl}/public/events/${slug}`, {
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    console.error('Error fetching event:', error);
    return null;
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const data = await getEvent(params.slug);
  if (!data) return { title: 'Мероприятие не найдено' };
  return {
    title: `${data.title} | Мероприятия`,
    description: `Мероприятие: ${data.title}`,
  };
}

export default async function EventPage({ params }: { params: { slug: string } }) {
  const event = await getEvent(params.slug);
  if (!event) notFound();

  return (
    <Section>
      <Container className="max-w-3xl">
        <EventTrackingClient eventId={event.id} eventSlug={event.slug} />
        <div className="space-y-4">
          <Link href="/events" className="text-sm text-primary underline underline-offset-2">
            ← Все мероприятия
          </Link>
          <h1 className="text-3xl font-semibold md:text-4xl">{event.title}</h1>
          <p className="text-muted-foreground">
            {event.starts_at ? new Date(event.starts_at).toLocaleString('ru-RU') : null}
            {event.format ? ` · ${event.format}` : ''}
          </p>
        </div>

        <div className="mt-8 space-y-6">
          <Card className="p-6">
            <div className="prose prose-slate dark:prose-invert max-w-none">
              <SafeMarkdownRenderer content={event.description_markdown} />
            </div>
          </Card>

          <Disclaimer variant="info" title="Важно">
            Это не экстренная помощь. Если вы находитесь в кризисе, пожалуйста, воспользуйтесь экстренными службами.
          </Disclaimer>

          {event.registration_open ? (
            <Button asChild size="lg" className="w-full">
              <Link href={`/events/${event.slug}/register`}>Зарегистрироваться</Link>
            </Button>
          ) : (
            <Button variant="outline" disabled className="w-full">
              Регистрация закрыта
            </Button>
          )}
        </div>
      </Container>
    </Section>
  );
}

