import React from 'react';
import PageClient from '../../PageClient';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ContentPlatform } from '@/lib/content';
import { resolveCanonical, resolveKeywords } from '@/lib/seo';

const ALLOWED_LEGAL_SLUGS = [
  'privacy',
  'personal-data-consent',
  'offer',
  'disclaimer',
  'cookies'
];

async function getLegalPageData(slug: string) {
  const mappedSlug = slug === 'privacy' ? 'privacy-policy' : slug;
  const data = await ContentPlatform.getPage(mappedSlug);
  return data ?? getFallbackData(slug);
}

function getFallbackData(slug: string) {
  const fallbacks: Record<string, any> = {
    'privacy': {
      title: 'Политика конфиденциальности',
      body_markdown: 'Здесь будет текст политики конфиденциальности. Мы серьезно относимся к вашим данным.'
    },
    'personal-data-consent': {
      title: 'Согласие на обработку персональных данных',
      body_markdown: 'Используя этот сайт, вы соглашаетесь на обработку ваших персональных данных.'
    },
    'offer': {
      title: 'Публичная оферта',
      body_markdown: 'Текст договора об оказании услуг.'
    },
    'disclaimer': {
      title: 'Отказ от ответственности',
      body_markdown: 'Информация на сайте не является медицинской консультацией или постановкой диагноза.'
    },
    'cookies': {
      title: 'Политика использования Cookies',
      body_markdown: 'Мы используем cookies для улучшения работы сайта.'
    }
  };

  return fallbacks[slug] || {
    title: 'Юридическая информация',
    body_markdown: 'Контент скоро появится.'
  };
}

export async function generateStaticParams() {
  return ALLOWED_LEGAL_SLUGS.map((slug) => ({
    slug,
  }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const { slug } = params;
  if (!ALLOWED_LEGAL_SLUGS.includes(slug)) return {};

  const data = await getLegalPageData(slug);
  const description = data.seo_description || `Юридическая информация: ${data.title}`;
  const title = data.seo_title || `${data.title} | Эмоциональный баланс`;
  
  return {
    title,
    description,
    keywords: resolveKeywords(data.seo_keywords),
    alternates: resolveCanonical(data.canonical_url),
    robots: 'noindex, follow',
  };
}

export default async function LegalPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  
  if (!ALLOWED_LEGAL_SLUGS.includes(slug)) {
    notFound();
  }

  const data = await getLegalPageData(slug);

  return <PageClient slug={`legal/${slug}`} data={data} />;
}
