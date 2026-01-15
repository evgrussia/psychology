import Link from 'next/link';
import { Metadata } from 'next';
import { Card, Container, Section, Button } from '@psychology/design-system';
import SafeMarkdownRenderer from '@/components/SafeMarkdownRenderer';
import { ServiceBookingButton } from './ServiceBookingButton';

export const metadata: Metadata = {
  title: 'Услуги | Эмоциональный баланс',
  description: 'Форматы консультаций, длительность, цены и правила отмены.',
};

interface ServiceListItem {
  id: string;
  slug: string;
  title: string;
  format: 'online' | 'offline' | 'hybrid';
  duration_minutes: number;
  price_amount: number;
  deposit_amount?: number | null;
  offline_address?: string | null;
  description_markdown: string;
}

async function getServices(): Promise<ServiceListItem[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001/api';
  try {
    const res = await fetch(`${apiUrl}/public/services`, {
      next: { revalidate: 0 },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) {
      return [];
    }
    return res.json();
  } catch (error) {
    console.error('Error fetching services list:', error);
    return [];
  }
}

const formatLabels: Record<ServiceListItem['format'], string> = {
  online: 'Онлайн',
  offline: 'Офлайн',
  hybrid: 'Онлайн / офлайн',
};

export default async function ServicesPage() {
  const services = await getServices();

  return (
    <main>
      <Section>
        <Container>
          <header className="mb-10 max-w-3xl">
            <h1 className="text-4xl font-bold text-foreground">Услуги</h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Выберите формат консультации, который подходит вашему состоянию и запросу.
            </p>
          </header>

          <div className="grid gap-6 md:grid-cols-2">
            {services.map(service => (
              <Card key={service.id} className="p-6 flex h-full flex-col justify-between">
                <div>
                  <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {formatLabels[service.format]}
                  </div>
                  <h2 className="text-2xl font-semibold text-foreground">{service.title}</h2>
                  <div className="mt-4 text-sm text-muted-foreground">
                    <div>Длительность: {service.duration_minutes} минут</div>
                    <div>Стоимость: {service.price_amount} ₽</div>
                    {service.deposit_amount ? (
                      <div>Депозит: {service.deposit_amount} ₽</div>
                    ) : null}
                  </div>
                  <div className="prose prose-slate dark:prose-invert mt-4 max-w-none text-muted-foreground">
                    <SafeMarkdownRenderer content={service.description_markdown} />
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <Button asChild variant="outline">
                    <Link href={`/services/${service.slug}`}>Подробнее</Link>
                  </Button>
                  <ServiceBookingButton serviceSlug={service.slug} />
                </div>
              </Card>
            ))}
          </div>

          {services.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border bg-muted/40 p-10 text-center">
              <p className="text-muted-foreground">Список услуг временно недоступен. Пожалуйста, попробуйте позже.</p>
              <div className="mt-4">
                <Button asChild variant="outline">
                  <Link href="/start">С чего начать</Link>
                </Button>
              </div>
            </div>
          )}
        </Container>
      </Section>
    </main>
  );
}
