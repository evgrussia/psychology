'use client';

import React from 'react';
import { HeroSection, TopicCard, CTABlock, Button, Section, Container } from '@psychology/design-system/components';
import { spacing, typography, colors } from '@psychology/design-system/tokens';
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
    {
      id: 'rituals',
      title: 'Библиотека ритуалов',
      description: 'Короткие практики для восстановления баланса и снятия напряжения.',
      slug: 'rituals',
      topic: 'balance',
      time: '2-5 мин',
    },
  ];

  return (
    <main>
      <Section variant="secondary" spacingSize="none">
        <HeroSection
          title="С чего начнём?"
          subtitle="Выберите инструмент"
          description="Выберите подходящий инструмент, чтобы лучше понять своё состояние и получить практические рекомендации. Это анонимно и бесплатно."
        />
      </Section>

      <Section>
        <Container>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
            gap: 'var(--space-6)' 
          }}>
            {interactives.map((item) => (
              <TopicCard
                key={item.id}
                title={item.title}
                description={item.description}
                href={`/start/${item.slug}`}
              />
            ))}
          </div>
        </Container>
      </Section>

      <Section variant="primary" spacingSize="none">
        <CTABlock
          title="Нужна помощь специалиста?"
          description="Если вы чувствуете, что самопомощи недостаточно, наши психологи всегда готовы поддержать вас."
          primaryCTA={
            <Button variant="primary" onClick={() => window.location.href = '/booking'}>
              Подобрать психолога
            </Button>
          }
          secondaryCTA={
            <Button variant="secondary" onClick={() => window.location.href = '/services'}>
              Посмотреть услуги
            </Button>
          }
        />
      </Section>
    </main>
  );
}
