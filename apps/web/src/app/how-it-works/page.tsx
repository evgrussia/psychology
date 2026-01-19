import React from 'react';
import PageClient from '../PageClient';
import { Metadata } from 'next';
import { ContentPlatform } from '@/lib/content';

async function getHowItWorksData() {
  const slug = 'how-it-works';
  const data = await ContentPlatform.getPage(slug);
  if (data) return data;

  // Fallback data
  return {
    id: 'how-it-works',
    title: 'Как проходит работа',
    body_markdown: `
Процесс консультации выстроен максимально бережно и понятно.

1. **Запись**: Вы выбираете удобное время.
2. **Знакомство**: На первой встрече мы обсуждаем ваш запрос.
3. **Работа**: Мы двигаемся к вашим целям в комфортном темпе.

---

Познакомьтесь [со мной и моим подходом](/about) — узнайте больше о том, как я работаю.
`
  };
}

export async function generateMetadata(): Promise<Metadata> {
  const data = await getHowItWorksData();
  const description = 'Узнайте, как проходит консультация: от записи до первой встречи. Частые вопросы о формате, подготовке и процессе работы.';
  
  return {
    title: `${data.title} | Эмоциональный баланс`,
    description,
    openGraph: {
      title: `${data.title} | Эмоциональный баланс`,
      description,
      type: 'website',
      locale: 'ru_RU',
      siteName: 'Эмоциональный баланс',
    },
    twitter: {
      card: 'summary',
      title: `${data.title} | Эмоциональный баланс`,
      description,
    },
  };
}

export default async function HowItWorksPage() {
  const data = await getHowItWorksData();

  return <PageClient slug="how-it-works" data={data} />;
}
