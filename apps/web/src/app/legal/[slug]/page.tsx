import React from 'react';
import PageClient from '../../PageClient';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

const ALLOWED_LEGAL_SLUGS = [
  'privacy',
  'personal-data-consent',
  'offer',
  'disclaimer',
  'cookies'
];

async function getPageData(slug: string) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001/api';
  
  // Mapping some short slugs from layout to full slugs if needed
  const mappedSlug = slug === 'privacy' ? 'privacy-policy' : slug;
  
  try {
    const res = await fetch(`${apiUrl}/public/pages/${mappedSlug}`, { 
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(5000)
    });
    
    if (!res.ok) {
      if (res.status === 404) return getFallbackData(slug);
      throw new Error(`API responded with status ${res.status}`);
    }
    return res.json();
  } catch (error) {
    console.error(`Error fetching legal page ${slug}:`, error);
    return getFallbackData(slug);
  }
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

  const data = await getPageData(slug);
  
  return {
    title: `${data.title} | Эмоциональный баланс`,
    description: `Юридическая информация: ${data.title}`,
    robots: 'noindex, follow', // Legal pages usually don't need SEO juice
  };
}

export default async function LegalPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  
  if (!ALLOWED_LEGAL_SLUGS.includes(slug)) {
    notFound();
  }

  const data = await getPageData(slug);

  return <PageClient slug={`legal/${slug}`} data={data} />;
}
