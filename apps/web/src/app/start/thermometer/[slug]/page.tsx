import React from 'react';
import { notFound } from 'next/navigation';
import { ThermometerClient } from './ThermometerClient';

async function getThermometer(slug: string) {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001/api';

  try {
    const res = await fetch(`${API_BASE_URL}/public/interactive/thermometers/${slug}`, {
      next: { revalidate: 0 },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    console.error('Error fetching thermometer:', error);
    return null;
  }
}

const FALLBACK_THERMOMETERS: Record<string, any> = {
  'resource-thermometer': {
    id: '44444444-4444-4444-4444-444444444444',
    slug: 'resource-thermometer',
    title: 'Термометр ресурса',
    topicCode: null,
    config: {
      intro: 'Быстрая проверка: как вы сейчас по энергии, напряжению и опоре.',
      scales: [
        { id: 'energy', title: 'Энергия', minLabel: '0', maxLabel: '10', minValue: 0, maxValue: 10 },
        { id: 'tension', title: 'Напряжение', minLabel: '0', maxLabel: '10', minValue: 0, maxValue: 10 },
        { id: 'support', title: 'Опора', minLabel: '0', maxLabel: '10', minValue: 0, maxValue: 10 },
      ],
      thresholds: [
        { level: 'low', minScore: 0, maxScore: 12 },
        { level: 'moderate', minScore: 13, maxScore: 20 },
        { level: 'high', minScore: 21, maxScore: 30 },
      ],
      results: [
        {
          level: 'low',
          title: 'Ресурс на минимуме',
          description: 'Похоже, сейчас важно снизить нагрузку и найти маленькие точки опоры.',
          recommendations: {
            now: ['Сделайте 2–3 медленных вдоха и выдоха', 'Выпейте воды', 'Снимите одну не срочную задачу на сегодня'],
            nextDays: ['Выделите 10 минут “тихого времени”', 'Подумайте, кого можно попросить о помощи'],
            whenToSeekHelp: 'Если состояние держится больше 2 недель или становится хуже — обсудите это со специалистом.',
          },
          ctaText: 'Получить план в Telegram',
        },
        {
          level: 'moderate',
          title: 'Ресурс есть, но требуется забота',
          description: 'Сейчас вы держитесь, но телу и психике нужна поддержка и более мягкий темп.',
          recommendations: {
            now: ['Сделайте короткую паузу 2–5 минут', 'Выберите один маленький шаг вместо “всё сразу”'],
            nextDays: ['Запланируйте одну восстановительную активность', 'Отслеживайте “утечки энергии”'],
          },
          ctaText: 'Сохранить в Telegram',
        },
        {
          level: 'high',
          title: 'Ресурс относительно устойчив',
          description: 'Похоже, сейчас у вас есть опора. Можно аккуратно укреплять навыки и поддержку.',
          recommendations: {
            now: ['Отметьте, что именно помогает вам держаться', 'Закрепите одну полезную привычку на сегодня'],
            nextDays: ['Добавьте короткий ритуал восстановления 2–5 минут', 'Составьте мягкий план на неделю'],
          },
          ctaText: 'План на 7 дней в Telegram',
        },
      ],
    },
  },
};

export default async function ThermometerPage({ params }: { params: { slug: string } }) {
  const data = await getThermometer(params.slug);
  const thermometer = data ?? FALLBACK_THERMOMETERS[params.slug];

  if (!thermometer) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-50/30 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <ThermometerClient definition={thermometer} slug={params.slug} />
      </div>
    </div>
  );
}

