import React from 'react';
import { HeroSection, TopicCard, CTABlock } from '@/../../design-system/components';
import Link from 'next/link';

export default function StartHubPage() {
  const interactives = [
    {
      id: 'anxiety',
      title: 'Тест на тревогу',
      description: 'Оцените уровень своего беспокойства по шкале GAD-7 за 2 минуты.',
      slug: 'quizzes/anxiety',
      topic: 'anxiety',
      time: '2 мин',
    },
    {
      id: 'burnout',
      title: 'Проверка выгорания',
      description: 'Узнайте, насколько вы близки к эмоциональному истощению.',
      slug: 'quizzes/burnout',
      topic: 'burnout',
      time: '3 мин',
    },
    {
      id: 'navigator',
      title: 'Навигатор состояния',
      description: 'Поможем понять, что с вами происходит, и найти верный путь.',
      slug: 'navigator',
      topic: 'any',
      time: '3 мин',
    },
    {
      id: 'thermometer',
      title: 'Термометр ресурса',
      description: 'Быстрая проверка вашего энергобюджета на сегодня.',
      slug: 'resource-thermometer',
      topic: 'energy',
      time: '1 мин',
    },
  ];

  return (
    <main className="min-h-screen bg-slate-50/50">
      <HeroSection
        title="С чего начнём?"
        description="Выберите подходящий инструмент, чтобы лучше понять своё состояние и получить практические рекомендации. Это анонимно и бесплатно."
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {interactives.map((item) => (
            <Link key={item.id} href={`/start/${item.slug}`} className="block h-full transition-transform hover:-translate-y-1">
              <TopicCard
                title={item.title}
                description={item.description}
                topicCode={item.topic}
                // @ts-ignore - TopicCard might not have time prop in its definition yet but we can pass metadata
                metadata={`${item.time} • Бесплатно`}
              />
            </Link>
          ))}
        </div>
      </div>

      <CTABlock
        title="Нужна помощь специалиста?"
        description="Если вы чувствуете, что самопомощи недостаточно, наши психологи всегда готовы поддержать вас."
        primaryCTA={{
          label: "Подобрать психолога",
          href: "/booking"
        }}
        secondaryCTA={{
          label: "Посмотреть услуги",
          href: "/services"
        }}
      />
    </main>
  );
}
