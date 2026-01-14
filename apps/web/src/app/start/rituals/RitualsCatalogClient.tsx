'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { InteractivePlatform } from '@/lib/interactive';
import { Card, Button, TopicCard, Container, Section } from '@psychology/design-system/components';
import { typography } from '@psychology/design-system/tokens';

interface Ritual {
  id: string;
  slug: string;
  title: string;
  topicCode: string | null;
  config: {
    why: string;
    totalDurationSeconds?: number;
  };
}

const MOCK_RITUALS: Ritual[] = [
  {
    id: 'rit-01',
    slug: 'breathing-478',
    title: 'Дыхание 4-7-8',
    topicCode: 'anxiety',
    config: {
      why: 'Помогает быстро успокоиться и снизить уровень стресса.',
      totalDurationSeconds: 120,
    }
  },
  {
    id: 'rit-02',
    slug: 'grounding-54321',
    title: 'Заземление 5-4-3-2-1',
    topicCode: 'panic',
    config: {
      why: 'Позволяет вернуться в настоящий момент при сильной тревоге.',
      totalDurationSeconds: 300,
    }
  },
  {
    id: 'rit-03',
    slug: 'muscle-relaxation',
    title: 'Прогрессивная релаксация',
    topicCode: 'stress',
    config: {
      why: 'Снимает физическое напряжение в теле.',
      totalDurationSeconds: 480,
    }
  }
];

export function RitualsCatalogClient() {
  const [rituals, setRituals] = useState<Ritual[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRituals() {
      try {
        const data = await InteractivePlatform.listRituals();
        if (data && data.items && data.items.length > 0) {
          setRituals(data.items);
        } else {
          setRituals(MOCK_RITUALS);
        }
      } catch (error) {
        console.error('Error fetching rituals:', error);
        setRituals(MOCK_RITUALS);
      } finally {
        setLoading(false);
      }
    }

    fetchRituals();
  }, []);

  const filteredRituals = selectedTopic 
    ? rituals.filter(r => r.topicCode === selectedTopic)
    : rituals;

  const topics = Array.from(new Set(rituals.map(r => r.topicCode).filter(Boolean))) as string[];

  if (loading) {
    return <div className="text-center py-12">Загрузка ритуалов...</div>;
  }

  return (
    <Section>
      <Container>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
          <header style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <h1 style={{ ...typography.hero, color: 'var(--color-text-primary)' }}>Библиотека мини-ритуалов</h1>
            <p style={{ ...typography.body.lg, color: 'var(--color-text-secondary)', maxWidth: '800px', margin: '0 auto' }}>
              Короткие практики на 2–5 минут, которые помогут восстановить баланс и почувствовать себя лучше.
            </p>
          </header>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', justifyContent: 'center' }}>
            <Button 
              variant={selectedTopic === null ? 'primary' : 'tertiary'}
              onClick={() => setSelectedTopic(null)}
              size="sm"
            >
              Все
            </Button>
            {topics.map(topic => (
              <Button
                key={topic}
                variant={selectedTopic === topic ? 'primary' : 'tertiary'}
                onClick={() => setSelectedTopic(topic)}
                size="sm"
              >
                {topic === 'anxiety' ? 'Тревога' : topic === 'panic' ? 'Паника' : topic === 'stress' ? 'Стресс' : topic}
              </Button>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 'var(--space-6)' }}>
            {filteredRituals.map(ritual => (
              <Card key={ritual.id} style={{ height: '100%', display: 'flex', flexDirection: 'column' }} variant="elevated">
                <div style={{ padding: 'var(--space-6)', flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                  <h3 style={{ ...typography.h3, color: 'var(--color-text-primary)' }}>{ritual.title}</h3>
                  <p style={{ ...typography.body.md, color: 'var(--color-text-secondary)', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{ritual.config.why}</p>
                  {ritual.config.totalDurationSeconds && (
                    <div style={{ fontSize: 'var(--font-size-body-sm)', color: 'var(--color-text-tertiary)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                      <svg xmlns="http://www.w3.org/2000/svg" style={{ height: '1rem', width: '1rem' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      ~{Math.round(ritual.config.totalDurationSeconds / 60)} минут
                    </div>
                  )}
                </div>
                <div style={{ padding: 'var(--space-6)', paddingTop: 0 }}>
                  <Link href={`/start/rituals/${ritual.slug}`} style={{ display: 'block' }}>
                    <Button variant="tertiary" fullWidth>Начать</Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>

          {filteredRituals.length === 0 && (
            <div style={{ textAlign: 'center', padding: 'var(--space-12)', color: 'var(--color-text-tertiary)' }}>
              Ритуалов по данной теме пока нет.
            </div>
          )}
        </div>
      </Container>
    </Section>
  );
}
