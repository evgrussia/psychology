import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { TopicCard, Section, Container } from '@psychology/design-system';
import { isFeatureEnabled } from '../../lib/feature-flags';
import { ContentPlatform } from '@/lib/content';

export const metadata: Metadata = {
  title: 'С чем я помогаю | Эмоциональный баланс',
  description: 'Каталог тем и психологических проблем, с которыми я работаю: тревога, выгорание, отношения, границы, самооценка.',
};

export default async function TopicsHubPage() {
  // Проверка feature flag
  if (!isFeatureEnabled('topic_landings_enabled')) {
    notFound();
  }

  const topics = await ContentPlatform.listTopics();

  return (
    <>
      <Section>
        <Container>
          <header className="mb-12 text-center">
            <h1 className="text-4xl font-bold mb-4 text-foreground">С чем я помогаю</h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Выберите тему, которая вас беспокоит, чтобы узнать больше о том, как я работаю с этим запросом, 
              и найти полезные ресурсы и упражнения.
            </p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topics.map((topic) => (
              <TopicCard
                key={topic.code}
                title={topic.title}
                description={`Узнайте больше о работе с темой "${topic.title.toLowerCase()}" и найдите полезные инструменты.`}
                href={`/s-chem-ya-pomogayu/${topic.code}`}
              />
            ))}
          </div>
        </Container>
      </Section>
    </>
  );
}
