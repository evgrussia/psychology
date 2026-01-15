import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import ServiceDetailClient from './ServiceDetailClient';

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

async function getService(slug: string): Promise<ServiceDetails | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001/api';
  try {
    const res = await fetch(`${apiUrl}/public/services/${slug}`, {
      next: { revalidate: 0 },
      signal: AbortSignal.timeout(5000),
    });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`API responded with status ${res.status}`);
    return res.json();
  } catch (error) {
    console.error(`Error fetching service ${slug}:`, error);
    return null;
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const data = await getService(params.slug);
  if (!data) {
    return { title: 'Услуга не найдена | Эмоциональный баланс' };
  }
  return {
    title: `${data.title} | Услуги «Эмоциональный баланс»`,
    description: 'Формат, длительность, стоимость и правила отмены консультации.',
  };
}

export default async function ServicePage({ params }: { params: { slug: string } }) {
  const service = await getService(params.slug);
  if (!service) {
    notFound();
  }
  return <ServiceDetailClient service={service} />;
}
