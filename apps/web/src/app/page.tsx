import React from 'react';
import HomeClient from './HomeClient';

// Types for the homepage data from API
interface HomepageData {
  topics: { code: string; title: string }[];
  featured_interactives: { id: string; type: string; slug: string; title: string }[];
  trust_blocks: { id: string; title: string; description: string }[];
}

async function getHomepageData(): Promise<HomepageData> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
  try {
    // Adding a timeout and more robust error handling for SSR
    const res = await fetch(`${apiUrl}/public/homepage`, { 
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(5000)
    });
    
    if (!res.ok) throw new Error(`API responded with status ${res.status}`);
    return res.json();
  } catch (error) {
    console.error('Error fetching homepage data:', error);
    // Fallback data as per tech spec NS-1/NS-2
    return {
      topics: [
        { code: 'anxiety', title: 'Тревога' },
        { code: 'burnout', title: 'Выгорание' },
        { code: 'relationships', title: 'Отношения' },
      ],
      featured_interactives: [],
      trust_blocks: [
        { id: 'confidentiality', title: 'Конфиденциальность', description: 'Ваши данные под защитой.' },
        { id: 'how_it_works', title: 'Как это работает', description: '3 шага к балансу.' },
      ],
    };
  }
}

export default async function HomePage() {
  const data = await getHomepageData();

  return <HomeClient data={data} />;
}
