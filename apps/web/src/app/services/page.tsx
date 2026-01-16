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
    <>
      <Section>
        <Container>
          <header className="mb-12 max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">Услуги</h1>
            <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
              Выберите формат консультации, который подходит вашему состоянию и запросу. 
              Я провожу встречи онлайн по всему миру и очно в кабинете.
            </p>
          </header>

          <div className="grid gap-8 md:grid-cols-2">
            {services.map(service => (
              <Card key={service.id} className="overflow-hidden group flex flex-col h-full border-2 hover:border-primary/50 transition-all duration-300">
                <div className="aspect-[3/2] overflow-hidden relative">
                  <img 
                    src={
                      service.slug.includes('individual') ? "/assets/graphics/services/service-individual-therapy-1264x848.png" :
                      service.slug.includes('couple') ? "/assets/graphics/services/service-couples-therapy-1264x848.jpg" :
                      service.slug.includes('group') ? "/assets/graphics/services/service-group-therapy-1264x848.jpg" :
                      "/assets/graphics/photos/photo-desk-journal-1264x848.webp"
                    } 
                    alt={service.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4">
                    <div className="bg-background/90 backdrop-blur px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider text-primary shadow-sm">
                      {formatLabels[service.format]}
                    </div>
                  </div>
                </div>
                <div className="p-8 flex flex-col flex-1">
                  <h2 className="text-2xl font-bold text-foreground mb-4 group-hover:text-primary transition-colors">
                    {service.title}
                  </h2>
                  <div className="flex gap-4 mb-6 text-sm text-muted-foreground font-medium">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      {service.duration_minutes} минут
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      {service.price_amount} ₽
                    </div>
                  </div>
                  <div className="prose prose-slate dark:prose-invert mb-8 max-w-none text-muted-foreground line-clamp-4">
                    <SafeMarkdownRenderer content={service.description_markdown} />
                  </div>
                  
                  <div className="mt-auto pt-6 border-t flex flex-wrap gap-4">
                    <Button asChild variant="outline" className="flex-1">
                      <Link href={`/services/${service.slug}`}>Подробнее</Link>
                    </Button>
                    <ServiceBookingButton serviceSlug={service.slug} className="flex-1" />
                  </div>
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
    </>
  );
}
