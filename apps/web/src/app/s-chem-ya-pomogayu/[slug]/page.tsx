import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import TopicLandingClient from './TopicLandingClient';
import { isFeatureEnabled } from '../../../lib/feature-flags';

interface TopicLandingPageProps {
  params: { slug: string };
}

async function getTopicLandingData(slug: string) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001/api';
  try {
    const res = await fetch(`${apiUrl}/public/topic-landings/${slug}`, {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(5000)
    });
    
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`API responded with status ${res.status}`);
    
    return res.json();
  } catch (error) {
    console.error(`Error fetching topic landing data for ${slug}:`, error);
    // Fallback data for critical topics if API is down
    const fallbacks: Record<string, any> = {
      'anxiety': {
        topic: { code: 'anxiety', title: 'Тревога' },
        relatedContent: [],
        relatedInteractives: [],
        relatedServices: []
      },
      'burnout': {
        topic: { code: 'burnout', title: 'Выгорание' },
        relatedContent: [],
        relatedInteractives: [],
        relatedServices: []
      }
    };
    return fallbacks[slug] || null;
  }
}

export async function generateMetadata({ params }: TopicLandingPageProps): Promise<Metadata> {
  const data = await getTopicLandingData(params.slug);
  
  if (!data) {
    return {
      title: 'Тема не найдена | Эмоциональный баланс',
    };
  }

  return {
    title: `${data.landing?.seoTitle || data.topic.title} | Эмоциональный баланс`,
    description: data.landing?.seoDescription || `Помощь и ресурсы по теме ${data.topic.title}. Узнайте, как справиться с этой проблемой.`,
    keywords: data.landing?.seoKeywords,
  };
}

export default async function TopicLandingPage({ params }: TopicLandingPageProps) {
  // Проверка feature flag
  if (!isFeatureEnabled('topic_landings_enabled')) {
    notFound();
  }

  const data = await getTopicLandingData(params.slug);

  if (!data) {
    notFound();
  }

  return <TopicLandingClient data={data} />;
}
