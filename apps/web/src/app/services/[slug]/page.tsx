import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import ServiceDetailClient from './ServiceDetailClient';
import { ContentPlatform } from '@/lib/content';

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

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const data = await ContentPlatform.getService(params.slug);
  if (!data) {
    return { title: 'Услуга не найдена | Эмоциональный баланс' };
  }
  return {
    title: `${data.title} | Услуги «Эмоциональный баланс»`,
    description: 'Формат, длительность, стоимость и правила отмены консультации.',
  };
}

export default async function ServicePage({ params }: { params: { slug: string } }) {
  const service = await ContentPlatform.getService(params.slug);
  if (!service) {
    notFound();
  }
  return <ServiceDetailClient service={service} />;
}
