import { BookingServiceClient } from './BookingServiceClient';

interface ServiceListItem {
  id: string;
  slug: string;
  title: string;
  format: 'online' | 'offline' | 'hybrid';
  duration_minutes: number;
  price_amount: number;
  deposit_amount?: number | null;
  offline_address?: string | null;
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

export default async function BookingServicePage() {
  const services = await getServices();

  return <BookingServiceClient services={services} />;
}
