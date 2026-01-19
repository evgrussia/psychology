import React from 'react';
import HomeClient from './HomeClient';
import { InteractivePlatform } from '@/lib/interactive';

// Types for the homepage data from API
interface HomepageData {
  topics: { code: string; title: string }[];
  featured_interactives: { id: string; type: string; slug: string; title: string }[];
  trust_blocks: { id: string; title: string; description: string }[];
}

export default async function HomePage() {
  const data = await InteractivePlatform.getHomepageData();

  return <HomeClient data={data} />;
}
