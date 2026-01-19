import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import TopicLandingClient from './TopicLandingClient';
import { isFeatureEnabled } from '../../../lib/feature-flags';
import { ContentPlatform } from '@/lib/content';

interface TopicLandingPageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: TopicLandingPageProps): Promise<Metadata> {
  const data = await ContentPlatform.getTopicLanding(params.slug);
  
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

  const data = await ContentPlatform.getTopicLanding(params.slug);

  if (!data) {
    notFound();
  }

  return <TopicLandingClient data={data} />;
}
