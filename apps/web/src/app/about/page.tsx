import React from 'react';
import PageClient from '../PageClient';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { ContentPlatform } from '@/lib/content';
import { isFeatureEnabled } from '@/lib/feature-flags';
import { resolveCanonical, resolveKeywords } from '@/lib/seo';

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
  const description =
    data.seo_description
    || 'Узнайте больше о психологе, подходе к работе, образовании и принципах конфиденциальности. Профессиональная помощь с тревогой, выгоранием и поиском баланса.';
  const title = data.seo_title || `${data.title} | Эмоциональный баланс`;
  
  return {
    title,
    description,
    keywords: resolveKeywords(data.seo_keywords),
    alternates: resolveCanonical(data.canonical_url),
    openGraph: {
      title,
      description,
      type: 'website',
      locale: 'ru_RU',
      siteName: 'Эмоциональный баланс',
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
  };
}

export default async function AboutPage() {
  if (!isFeatureEnabled('trust_pages_v1_enabled')) {
    redirect('/');
  }

  const data = await getAboutPageData();

  return <PageClient slug="about" data={data} />;
}
