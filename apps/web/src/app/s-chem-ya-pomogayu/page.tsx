import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { TopicCard } from '@psychology/design-system/components';
import { spacing, typography, colors } from '@psychology/design-system/tokens';
import { isFeatureEnabled } from '../../lib/feature-flags';

export const metadata: Metadata = {
  title: 'С чем я помогаю | Эмоциональный баланс',
  description: 'Каталог тем и психологических проблем, с которыми я работаю: тревога, выгорание, отношения, границы, самооценка.',
};

interface Topic {
  code: string;
  title: string;
  isActive: boolean;
}

async function getTopics(): Promise<Topic[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001/api';
  try {
    const res = await fetch(`${apiUrl}/public/topics`, {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(5000)
    });
    if (!res.ok) throw new Error(`API responded with status ${res.status}`);
    return res.json();
  } catch (error) {
    console.error('Error fetching topics:', error);
    // Fallback for release 1
    return [
      { code: 'anxiety', title: 'Тревога', isActive: true },
      { code: 'burnout', title: 'Выгорание', isActive: true },
      { code: 'relationships', title: 'Отношения', isActive: true },
      { code: 'boundaries', title: 'Границы', isActive: true },
      { code: 'self-esteem', title: 'Самооценка', isActive: true },
    ];
  }
}

export default async function TopicsHubPage() {
  // Проверка feature flag
  if (!isFeatureEnabled('topic_landings_enabled')) {
    notFound();
  }

  const topics = await getTopics();

  return (
    <main style={{ 
      maxWidth: '1200px', 
      margin: '0 auto', 
      padding: `${spacing.space[12]} ${spacing.space[6]}` 
    }}>
      <header style={{ marginBottom: spacing.space[12], textAlign: 'center' }}>
        <h1 style={{ ...typography.h1, marginBottom: spacing.space[4] }}>С чем я помогаю</h1>
        <p style={{ ...typography.body.lg, color: colors.text.secondary, maxWidth: '800px', margin: '0 auto' }}>
          Выберите тему, которая вас беспокоит, чтобы узнать больше о том, как я работаю с этим запросом, 
          и найти полезные ресурсы и упражнения.
        </p>
      </header>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
        gap: spacing.space[6] 
      }}>
        {topics.map((topic) => (
          <TopicCard
            key={topic.code}
            title={topic.title}
            href={`/s-chem-ya-pomogayu/${topic.code}`}
          />
        ))}
      </div>
    </main>
  );
}
