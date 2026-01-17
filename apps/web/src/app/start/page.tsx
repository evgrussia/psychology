'use client';

import React from 'react';
import { HeroSection, TopicCard, CTABlock, Button, Section, Container } from '@psychology/design-system';

export default function StartHubPage() {
  const interactives = [
    {
      id: 'anxiety',
      title: 'Тест на тревогу',
      description: 'Оцените уровень своего беспокойства по шкале GAD-7 за 2 минуты.',
      href: '/start/quizzes/anxiety',
      topic: 'anxiety',
      time: '2 мин',
    },
    {
      id: 'burnout',
      title: 'Проверка выгорания',
      description: 'Узнайте, насколько вы близки к эмоциональному истощению.',
      href: '/start/quizzes/burnout',
      topic: 'burnout',
      time: '3 мин',
    },
    {
      id: 'navigator',
      title: 'Навигатор состояния',
      description: 'Поможем понять, что с вами происходит, и найти верный путь.',
      href: '/start/navigator',
      topic: 'any',
      time: '3 мин',
    },
    {
      id: 'thermometer',
      title: 'Термометр ресурса',
      description: 'Быстрая проверка вашего энергобюджета на сегодня.',
      href: '/start/resource-thermometer',
      topic: 'energy',
      time: '1 мин',
    },
    {
      id: 'rituals',
      title: 'Библиотека ритуалов',
      description: 'Короткие практики для восстановления баланса и снятия напряжения.',
      href: '/start/rituals',
      topic: 'balance',
      time: '2-5 мин',
    },
    {
      id: 'anonymous-question',
      title: 'Анонимный вопрос',
      description: 'Задайте вопрос психологу без регистрации и получите бережный ответ.',
      href: '/interactive/anonymous-question',
      topic: 'support',
      time: '2 мин',
    },
  ];

  return (
    <>
      <HeroSection
        title="С чего начнём?"
        subtitle="Выберите инструмент"
        description="Выберите подходящий инструмент, чтобы лучше понять своё состояние и получить практические рекомендации. Это анонимно и бесплатно."
        image="/assets/graphics/hero/hero-journey-1376x768.webp"
      />

      <Section>
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {interactives.map((item) => (
              <TopicCard
                key={item.id}
                title={item.title}
                description={item.description}
                href={item.href}
                image={
                  item.id === 'anxiety' ? "/assets/graphics/modules/module-anxiety-test-1264x848.jpg" :
                  item.id === 'rituals' ? "/assets/graphics/modules/module-emotions-journal-1264x848.png" :
                  "/assets/graphics/modules/module-exercises-1264x848.png"
                }
              />
            ))}
          </div>
        </Container>
      </Section>

      <CTABlock
        className="mx-4 mb-16"
        title="Нужна помощь специалиста?"
        description="Если вы чувствуете, что самопомощи недостаточно, наши психологи всегда готовы поддержать вас."
        backgroundImage="/assets/graphics/abstract/abstract-inner-landscape-1376x768.webp"
        primaryCTA={
          <Button onClick={() => window.location.href = '/booking'}>
            Подобрать психолога
          </Button>
        }
        secondaryCTA={
          <Button variant="outline" onClick={() => window.location.href = '/services'}>
            Посмотреть услуги
          </Button>
        }
      />
    </>
  );
}
