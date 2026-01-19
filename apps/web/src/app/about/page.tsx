import React from 'react';
import PageClient from '../PageClient';
import { Metadata } from 'next';
import { ContentPlatform } from '@/lib/content';

async function getAboutPageData() {
  const slug = 'about';
  const data = await ContentPlatform.getPage(slug);
  if (data) return data;

  // Fallback data
  return {
    id: 'about',
    title: 'Обо мне',
    body_markdown: `
Я — психолог, помогающий найти баланс и опору. 

### Мой подход
Я работаю в доказательных подходах (КПТ, ACT), бережно и профессионально. 

### Образование
- Магистратура по психологии
- Курсы повышения квалификации по КПТ

---

Узнайте, [как проходит консультация](/how-it-works) — от записи до первой встречи.
`
  };
}

export async function generateMetadata(): Promise<Metadata> {
  const data = await getAboutPageData();
  const description = 'Узнайте больше о психологе, подходе к работе, образовании и принципах конфиденциальности. Профессиональная помощь с тревогой, выгоранием и поиском баланса.';
  
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

export default async function AboutPage() {
  const data = await getAboutPageData();

  return <PageClient slug="about" data={data} />;
}
