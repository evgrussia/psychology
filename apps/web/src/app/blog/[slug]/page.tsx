import React from 'react';
import PageClient from '../../PageClient';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

async function getArticleData(slug: string) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001/api';
  
  try {
    const res = await fetch(`${apiUrl}/public/content/article/${slug}`, { 
      next: { revalidate: 60 }, // Blog posts can change more often than legal pages
      signal: AbortSignal.timeout(5000)
    });
    
    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error(`API responded with status ${res.status}`);
    }
    return res.json();
  } catch (error) {
    console.error(`Error fetching article ${slug}:`, error);
    return null;
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const { slug } = params;
  const data = await getArticleData(slug);
  
  if (!data) return { title: 'Статья не найдена' };
  
  return {
    title: `${data.title} | Блог «Эмоциональный баланс»`,
    description: data.excerpt || `Читать статью ${data.title}`,
  };
}

export default async function ArticlePage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const data = await getArticleData(slug);
  
  if (!data) {
    notFound();
  }

  return <PageClient slug={`blog/${slug}`} data={data} />;
}
