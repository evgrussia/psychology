import React from 'react';
import PageClient from '../../PageClient';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

async function getResourceData(slug: string) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001/api';
  
  try {
    const res = await fetch(`${apiUrl}/public/content/resource/${slug}`, { 
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(5000)
    });
    
    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error(`API responded with status ${res.status}`);
    }
    return res.json();
  } catch (error) {
    console.error(`Error fetching resource ${slug}:`, error);
    return null;
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const { slug } = params;
  const data = await getResourceData(slug);
  
  if (!data) return { title: 'Ресурс не найден' };
  
  return {
    title: `${data.title} | Полезные ресурсы «Эмоциональный баланс»`,
    description: data.excerpt || `Полезный ресурс: ${data.title}`,
  };
}

export default async function ResourcePage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const data = await getResourceData(slug);
  
  if (!data) {
    notFound();
  }

  return <PageClient slug={`resources/${slug}`} data={data} />;
}
