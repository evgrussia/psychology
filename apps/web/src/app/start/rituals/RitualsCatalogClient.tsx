'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { InteractivePlatform } from '@/lib/interactive';
import { Card } from '@psychology/design-system/components/Card';
import { Button } from '@psychology/design-system/components/Button';
import { TopicCard } from '@psychology/design-system/components/TopicCard';

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
    <div className="space-y-8">
      <header className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-slate-900">Библиотека мини-ритуалов</h1>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto">
          Короткие практики на 2–5 минут, которые помогут восстановить баланс и почувствовать себя лучше.
        </p>
      </header>

      <div className="flex flex-wrap gap-2 justify-center mb-8">
        <Button 
          variant={selectedTopic === null ? 'primary' : 'outline'}
          onClick={() => setSelectedTopic(null)}
          size="sm"
        >
          Все
        </Button>
        {topics.map(topic => (
          <Button
            key={topic}
            variant={selectedTopic === topic ? 'primary' : 'outline'}
            onClick={() => setSelectedTopic(topic)}
            size="sm"
          >
            {topic === 'anxiety' ? 'Тревога' : topic === 'panic' ? 'Паника' : topic === 'stress' ? 'Стресс' : topic}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRituals.map(ritual => (
          <Card key={ritual.id} className="h-full flex flex-col">
            <div className="p-6 flex-grow space-y-4">
              <h3 className="text-xl font-bold text-slate-900">{ritual.title}</h3>
              <p className="text-slate-600 line-clamp-3">{ritual.config.why}</p>
              {ritual.config.totalDurationSeconds && (
                <div className="text-sm text-slate-500 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  ~{Math.round(ritual.config.totalDurationSeconds / 60)} минут
                </div>
              )}
            </div>
            <div className="p-6 pt-0">
              <Link href={`/start/rituals/${ritual.slug}`} className="block">
                <Button variant="outline" className="w-full">Начать</Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>

      {filteredRituals.length === 0 && (
        <div className="text-center py-12 text-slate-500">
          Ритуалов по данной теме пока нет.
        </div>
      )}
    </div>
  );
}
