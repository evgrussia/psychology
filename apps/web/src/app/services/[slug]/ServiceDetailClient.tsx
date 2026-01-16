'use client';

import React from 'react';
import Link from 'next/link';
import { Button, Card, Container, CTABlock, Disclaimer, Section } from '@psychology/design-system';
import SafeMarkdownRenderer from '@/components/SafeMarkdownRenderer';
import { track } from '@/lib/tracking';

interface ServiceDetails {
  id: string;
  slug: string;
  title: string;
  format: 'online' | 'offline' | 'hybrid';
  duration_minutes: number;
  price_amount: number;
  deposit_amount?: number | null;
  offline_address?: string | null;
  description_markdown: string;
  cancel_free_hours?: number | null;
  cancel_partial_hours?: number | null;
  reschedule_min_hours?: number | null;
  reschedule_max_count?: number | null;
}

const formatLabels: Record<ServiceDetails['format'], string> = {
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

const formatPolicyText = (service: ServiceDetails): string[] => {
  const lines: string[] = [];
  if (service.cancel_free_hours) {
    lines.push(`Отмена без удержаний — не позднее чем за ${service.cancel_free_hours} часа(ов).`);
  }
  if (service.cancel_partial_hours) {
    lines.push(`При отмене за ${service.cancel_partial_hours}–${service.cancel_free_hours ?? service.cancel_partial_hours} часа(ов) возможен частичный возврат депозита.`);
  }
  if (service.reschedule_min_hours) {
    lines.push(`Перенос возможен не позднее чем за ${service.reschedule_min_hours} часа(ов) до встречи.`);
  }
  if (service.reschedule_max_count !== null && service.reschedule_max_count !== undefined) {
    lines.push(`Количество переносов: ${service.reschedule_max_count}.`);
  }
  return lines;
};

export default function ServiceDetailClient({ service }: { service: ServiceDetails }) {
  const policyLines = formatPolicyText(service);

  React.useEffect(() => {
    track('service_selected', {
      service_slug: service.slug,
      format: service.format,
      price_bucket: priceBucket(service.price_amount),
      deposit_bucket: depositBucket(service.deposit_amount),
    });
  }, [service.slug, service.format, service.price_amount, service.deposit_amount]);

  const handleBookingClick = () => {
    track('booking_start', {
      service_slug: service.slug,
      entry_point: localStorage.getItem('entry_point') || 'direct',
    });
    window.location.href = '/booking';
  };

  return (
    <>
      <Section>
        <Container className="max-w-4xl">
          <Link href="/services" className="text-sm font-semibold text-muted-foreground hover:text-foreground">
            ← Ко всем услугам
          </Link>

          <header className="mt-6">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {formatLabels[service.format]}
            </div>
            <h1 className="mt-3 text-4xl font-bold text-foreground">{service.title}</h1>
            <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span>Длительность: {service.duration_minutes} минут</span>
              <span>Стоимость: {service.price_amount} ₽</span>
              {service.deposit_amount ? <span>Депозит: {service.deposit_amount} ₽</span> : null}
            </div>
            {service.offline_address && (
              <div className="mt-4 text-sm text-muted-foreground">
                Адрес офлайн-встреч: {service.offline_address}
              </div>
            )}
          </header>
        </Container>
      </Section>

      <Section className="pt-0">
        <Container className="max-w-4xl">
          <div className="prose prose-slate dark:prose-invert max-w-none text-muted-foreground">
            <SafeMarkdownRenderer content={service.description_markdown} />
          </div>
        </Container>
      </Section>

      <Section className="bg-muted">
        <Container className="max-w-4xl">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-foreground">Правила отмены и переноса</h2>
              {policyLines.length > 0 ? (
                <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                  {policyLines.map(line => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              ) : (
                <p className="mt-4 text-sm text-muted-foreground">
                  Правила отмены и переноса уточняются индивидуально.
                </p>
              )}
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold text-foreground">Что будет на встрече</h2>
              <p className="mt-4 text-sm text-muted-foreground">
                Мы обсудим ваш запрос, уточним цели и выберем формат работы, который будет бережным и поддерживающим.
              </p>
              <div className="mt-6">
                <Button onClick={handleBookingClick}>Начать запись</Button>
              </div>
            </Card>
          </div>
        </Container>
      </Section>

      <Section className="py-6">
        <Container className="max-w-4xl">
          <Disclaimer variant="info" showEmergencyLink title="Важно">
            Психологическая консультация не является медицинской услугой. Если вы находитесь в остром кризисе,
            пожалуйста, обратитесь в специализированные службы.
          </Disclaimer>
        </Container>
      </Section>

      <Section className="bg-muted py-0">
        <CTABlock
          className="mx-4"
          title="Готовы начать?"
          description="Запись занимает пару минут. Выберите удобный формат и время."
          primaryCTA={<Button size="lg" onClick={handleBookingClick}>Начать запись</Button>}
          secondaryCTA={(
            <Button asChild variant="outline" size="lg">
              <Link href="/start">С чего начать</Link>
            </Button>
          )}
        />
      </Section>
    </>
  );
}
