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
    if (slug === 'about') {
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
    return {
      id: slug,
      title: slug.charAt(0).toUpperCase() + slug.slice(1),
      body_markdown: 'Контент скоро появится.'
    };
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const slug = 'about'; // fixed for this page
  const data = await getPageData(slug);
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
  const slug = 'about';
  const data = await getPageData(slug);

  return <PageClient slug={slug} data={data} />;
}
