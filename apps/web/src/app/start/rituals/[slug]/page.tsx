import React from 'react';
import { notFound } from 'next/navigation';
import { RitualClient } from './RitualClient';
import { InteractivePlatform } from '@/lib/interactive';

export default async function RitualPage({ params }: { params: { slug: string } }) {
  let ritual;
  
  try {
    ritual = await InteractivePlatform.getRitual(params.slug);
  } catch (error) {
    console.error('Error loading ritual:', error);
    notFound();
  }

  if (!ritual) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-50/30 py-12 px-4">
      <RitualClient initialRitual={ritual} />
    </div>
  );
}
