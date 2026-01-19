import React from 'react';
import { NavigatorClient } from './NavigatorClient';
import { notFound, redirect } from 'next/navigation';
import { InteractivePlatform } from '@/lib/interactive';

// Fallback data for development or if API is down
const FALLBACK_NAVIGATORS: Record<string, any> = {
  'state-navigator': {
    id: '33333333-3333-3333-3333-333333333333',
    slug: 'state-navigator',
    title: 'Навигатор состояния',
    initial_step_id: 'step_1',
    steps: [
      {
        step_id: 'step_1',
        question_text: 'Как вы себя чувствуете прямо сейчас?',
        choices: [
          { choice_id: 'c1', text: 'Мне очень плохо, нужна помощь', next_step_id: 'step_crisis' },
          { choice_id: 'c2', text: 'Чувствую тревогу или панику', next_step_id: 'step_anxiety' },
          { choice_id: 'c3', text: 'У меня нет сил, всё надоело', next_step_id: 'step_exhaustion' },
          { choice_id: 'c4', text: 'В целом нормально, хочу разобраться в себе', next_step_id: 'step_exploration' },
        ],
      },
      {
        step_id: 'step_crisis',
        question_text: 'Вы чувствуете, что не можете контролировать свои действия или боитесь причинить себе вред?',
        choices: [
          { choice_id: 'c5', text: 'Да', result_profile_id: 'support_contact', crisis_trigger: true, crisis_trigger_type: 'minor_risk' },
          { choice_id: 'c6', text: 'Нет, но мне очень тяжело', next_step_id: 'step_anxiety' },
        ],
      },
      {
        step_id: 'step_anxiety',
        question_text: 'Ваша тревога связана с конкретным событием или она фоновая?',
        choices: [
          { choice_id: 'c7', text: 'Конкретное событие (работа, отношения)', result_profile_id: 'clarify' },
          { choice_id: 'c8', text: 'Фоновое чувство беспокойства', result_profile_id: 'stabilize_now' },
        ],
      },
      {
        step_id: 'step_exhaustion',
        question_text: 'Как долго вы чувствуете упадок сил?',
        choices: [
          { choice_id: 'c9', text: 'Несколько дней', result_profile_id: 'restore_energy' },
          { choice_id: 'c10', text: 'Больше двух недель', result_profile_id: 'clarify' },
        ],
      },
      {
        step_id: 'step_exploration',
        question_text: 'Какая сфера жизни сейчас волнует вас больше всего?',
        choices: [
          { choice_id: 'c11', text: 'Личные границы и отношения', result_profile_id: 'boundaries' },
          { choice_id: 'c12', text: 'Самореализация и работа', result_profile_id: 'clarify' },
          { choice_id: 'c13', text: 'Эмоциональное состояние', result_profile_id: 'stabilize_now' },
        ],
      },
    ],
    result_profiles: [
      {
        id: 'stabilize_now',
        title: 'Фокус на стабилизации',
        description: 'Сейчас ваша главная задача — вернуть себе чувство безопасности и спокойствия.',
        recommendations: {
          articles: ['Как справиться с паникой', 'Техники заземления'],
          exercises: ['Дыхание 4-7-8', 'Мышечная релаксация'],
        },
      },
      {
        id: 'restore_energy',
        title: 'Восстановление ресурса',
        description: 'Похоже, ваши батарейки на нуле. Вам нужно бережное восстановление.',
        recommendations: {
          articles: ['Почему нет сил?', 'Как разрешить себе отдыхать'],
          exercises: ['Аудит ресурсов', 'Дневник приятных событий'],
        },
      },
      {
        id: 'boundaries',
        title: 'Работа с границами',
        description: 'Ваш запрос связан с тем, как выстраивать отношения с собой и окружающими.',
        recommendations: {
          articles: ['Что такое личные границы?', 'Как говорить "нет" без вины'],
          exercises: ['Круги близости', 'Скрипты отказов'],
        },
      },
      {
        id: 'clarify',
        title: 'Прояснение запроса',
        description: 'Ваша ситуация требует более глубокого анализа. Консультация поможет расставить приоритеты.',
        recommendations: {
          articles: ['Как подготовиться к первой сессии', 'С какими запросами работает психолог'],
          resources: ['Чек-лист "Мой запрос"'],
        },
      },
      {
        id: 'support_contact',
        title: 'Экстренная поддержка',
        description: 'Пожалуйста, не оставайтесь наедине со своими переживаниями. Помощь рядом.',
        recommendations: {
          articles: ['Телефоны доверия', 'Куда обратиться в кризисе'],
        },
        cta: {
          text: 'Получить контакты помощи',
          link: '/emergency',
        },
      },
    ],
  },
};

export default async function NavigatorPage({ params }: { params: { slug: string } }) {
  const data = await InteractivePlatform.getNavigator(params.slug);
  const navigator = data?.definition || FALLBACK_NAVIGATORS[params.slug];
  
  if (!navigator) {
    redirect('/start');
  }

  return (
    <div className="min-h-screen bg-slate-50/30 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <NavigatorClient definition={navigator} slug={params.slug} />
      </div>
    </div>
  );
}
