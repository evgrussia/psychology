import type { MetadataRoute } from 'next';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001/api';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://127.0.0.1:3000';

async function safeFetchJson<T>(path: string, fallback: T): Promise<T> {
  try {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return fallback;
    return (await res.json()) as T;
  } catch {
    return fallback;
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [articles, resources, curated, glossary, services, topics, events, rituals] = await Promise.all([
    safeFetchJson<{ items?: { slug: string }[] }>('/public/content/article', { items: [] }),
    safeFetchJson<{ items?: { slug: string }[] }>('/public/content/resource', { items: [] }),
    safeFetchJson<{ items?: { slug: string }[] }>('/public/curated', { items: [] }),
    safeFetchJson<{ items?: { slug: string }[] }>('/public/glossary', { items: [] }),
    safeFetchJson<any[]>('/public/services', []),
    safeFetchJson<any[]>('/public/topics', []),
    safeFetchJson<any[]>('/public/events', []),
    safeFetchJson<{ items?: { slug: string }[] }>('/public/interactive/rituals', { items: [] }),
  ]);

  const staticRoutes = [
    '/',
    '/start',
    '/start/quizzes',
    '/start/navigator',
    '/start/thermometer',
    '/start/prep',
    '/start/boundaries-scripts',
    '/start/rituals',
    '/services',
    '/s-chem-ya-pomogayu',
    '/about',
    '/how-it-works',
    '/blog',
    '/resources',
    '/events',
    '/glossary',
    '/curated',
    '/contacts',
    '/emergency',
    '/legal/privacy',
    '/legal/personal-data-consent',
    '/legal/offer',
    '/legal/disclaimer',
    '/legal/cookies',
  ];

  const dynamicRoutes = [
    ...(articles.items ?? []).map((item) => `/blog/${item.slug}`),
    ...(resources.items ?? []).map((item) => `/resources/${item.slug}`),
    ...(curated.items ?? []).map((item) => `/curated/${item.slug}`),
    ...(glossary.items ?? []).map((item) => `/glossary/${item.slug}`),
    ...(services ?? []).map((service: any) => `/services/${service.slug}`),
    ...(topics ?? []).map((topic: any) => `/s-chem-ya-pomogayu/${topic.code || topic.slug}`),
    ...(events ?? []).map((event: any) => `/events/${event.slug}`),
    ...(rituals.items ?? []).map((ritual) => `/start/rituals/${ritual.slug}`),
    '/start/quizzes/anxiety',
    '/start/quizzes/burnout',
    '/start/navigator/state-navigator',
    '/start/thermometer/resource-thermometer',
    '/start/prep/consultation-prep',
    '/start/boundaries-scripts/default',
  ];

  const urls = [...staticRoutes, ...dynamicRoutes]
    .filter(Boolean)
    .map((route) => ({
      url: `${SITE_URL}${route}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: route === '/' ? 1 : 0.7,
    }));

  return urls;
}
