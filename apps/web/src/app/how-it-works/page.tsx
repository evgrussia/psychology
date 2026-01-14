import React from 'react';
import PageClient from '../PageClient';
import { Metadata } from 'next';

async function getPageData(slug: string) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001/api';
  try {
    const res = await fetch(`${apiUrl}/public/pages/${slug}`, { 
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(5000)
    });
    
    if (!res.ok) throw new Error(`API responded with status ${res.status}`);
    return res.json();
  } catch (error) {
    console.error(`Error fetching page ${slug}:`, error);
    // Fallback data
    if (slug === 'how-it-works') {
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
    return {
      id: slug,
      title: slug.charAt(0).toUpperCase() + slug.slice(1),
      body_markdown: 'Контент скоро появится.'
    };
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const slug = 'how-it-works';
  const data = await getPageData(slug);
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
  const slug = 'how-it-works';
  const data = await getPageData(slug);

  return <PageClient slug={slug} data={data} />;
}
