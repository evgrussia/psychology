import React from 'react';
import PageClient from '../../PageClient';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ContentPlatform } from '@/lib/content';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const { slug } = params;
  const data = await ContentPlatform.getContent('article', slug);
  
  if (!data) return { title: 'Статья не найдена' };
  
  return {
    title: `${data.title} | Блог «Эмоциональный баланс»`,
    description: data.excerpt || `Читать статью ${data.title}`,
  };
}

export default async function ArticlePage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const data = await ContentPlatform.getContent('article', slug);
  
  if (!data) {
    notFound();
  }

  return <PageClient slug={`blog/${slug}`} data={data} />;
}
