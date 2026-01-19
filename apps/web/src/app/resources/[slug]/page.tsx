import React from 'react';
import PageClient from '../../PageClient';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ContentPlatform } from '@/lib/content';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const { slug } = params;
  const data = await ContentPlatform.getContent('resource', slug);
  
  if (!data) return { title: 'Ресурс не найден' };
  
  return {
    title: `${data.title} | Полезные ресурсы «Эмоциональный баланс»`,
    description: data.excerpt || `Полезный ресурс: ${data.title}`,
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
