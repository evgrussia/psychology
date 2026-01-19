import React from 'react';
import PageClient from '../../PageClient';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ContentPlatform } from '@/lib/content';
import { resolveCanonical, resolveKeywords } from '@/lib/seo';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const { slug } = params;
  const data = await ContentPlatform.getContent('resource', slug);
  
  if (!data) return { title: 'Ресурс не найден' };
  
  const title = data.seo_title || `${data.title} | Полезные ресурсы «Эмоциональный баланс»`;
  const description = data.seo_description || data.excerpt || `Полезный ресурс: ${data.title}`;

  return {
    title,
    description,
    keywords: resolveKeywords(data.seo_keywords),
    alternates: resolveCanonical(data.canonical_url),
  };
}

export default async function ResourcePage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const data = await ContentPlatform.getContent('resource', slug);
  
  if (!data) {
    notFound();
  }

  return <PageClient slug={`resources/${slug}`} data={data} />;
}
