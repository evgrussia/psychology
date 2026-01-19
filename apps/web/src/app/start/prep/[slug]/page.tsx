import React from 'react';
import { notFound } from 'next/navigation';
import { PrepClient } from './PrepClient';
import { InteractivePlatform } from '@/lib/interactive';

const FALLBACK_PREP: Record<string, any> = {
  'consultation-prep': {
    id: '55555555-5555-5555-5555-555555555555',
    slug: 'consultation-prep',
    title: 'Подготовка к первой консультации',
    topicCode: null,
    config: {
      intro:
        'Это короткий мастер, который поможет мягко сформулировать запрос и подготовиться к первой встрече. Без обязательного текста.',
      steps: [
        {
          id: 's1',
          title: 'С чем вы приходите?',
          description: 'Выберите один или несколько вариантов.',
          options: [
            { id: 'anxiety', text: 'Тревога, паника' },
            { id: 'burnout', text: 'Усталость, выгорание' },
            { id: 'relationships', text: 'Отношения, конфликты' },
            { id: 'boundaries', text: 'Границы, “не могу отказать”' },
            { id: 'selfesteem', text: 'Самооценка, самокритика' },
          ],
        },
        {
          id: 's2',
          title: 'Что вы хотите получить от встречи?',
          options: [
            { id: 'clarity', text: 'Прояснить, что со мной происходит' },
            { id: 'plan', text: 'Собрать план действий' },
            { id: 'support', text: 'Поддержку и опору' },
            { id: 'skills', text: 'Навыки и техники' },
          ],
        },
        {
          id: 's3',
          title: 'Какой темп вам комфортен?',
          options: [
            { id: 'slow', text: 'Мягко и без спешки' },
            { id: 'structured', text: 'Структурно и по шагам' },
            { id: 'mixed', text: 'Смешанный' },
          ],
        },
        {
          id: 's4',
          title: 'Есть ли важные ограничения?',
          options: [
            { id: 'time', text: 'Ограничено время/ресурс' },
            { id: 'privacy', text: 'Важно про конфиденциальность' },
            { id: 'online', text: 'Только онлайн' },
            { id: 'offline', text: 'Хочу офлайн (если возможно)' },
          ],
        },
        {
          id: 's5',
          title: 'Что поможет вам почувствовать себя безопаснее?',
          options: [
            { id: 'rules', text: 'Понять правила и границы' },
            { id: 'process', text: 'Понимать план встречи' },
            { id: 'questions', text: 'Задать пару вопросов заранее' },
          ],
          optionalNoteLabel: 'Можно добавить заметку для себя (не обязательно)',
        },
      ],
      result: {
        title: 'Ваш черновик подготовки',
        description:
          'Вы можете использовать это как подсказку для первой встречи. Если хочется, сохраним план в Telegram.',
        checklist: [
          'Сформулировать 1–2 главные темы (без деталей, можно коротко)',
          'Подумать, какой результат вы хотите (прояснение / план / поддержка)',
          'Подготовить 1–2 вопроса про процесс и конфиденциальность',
          'Выбрать комфортный формат (онлайн/офлайн) и время',
        ],
        ctaText: 'Сохранить в Telegram',
      },
    },
  },
};

export default async function PrepPage({ params }: { params: { slug: string } }) {
  const data = await InteractivePlatform.getPrep(params.slug);
  const prep = data ?? FALLBACK_PREP[params.slug];

  if (!prep) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-50/30 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <PrepClient definition={prep} slug={params.slug} />
      </div>
    </div>
  );
}

