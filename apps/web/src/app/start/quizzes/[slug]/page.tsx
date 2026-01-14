import React from 'react';
import { QuizClient } from './QuizClient';
import { notFound } from 'next/navigation';
import { InteractivePlatform } from '@/lib/interactive';
import { isFeatureEnabled } from '@/lib/feature-flags';

export const revalidate = 3600; // Revalidate every hour

export default async function QuizPage({ params }: { params: { slug: string } }) {
  // Check feature flag
  if (!isFeatureEnabled('interactive_quiz_enabled')) {
    notFound();
  }

  const quiz = await InteractivePlatform.getQuiz(params.slug);
  
  if (!quiz) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-50/30 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <QuizClient quiz={quiz} />
      </div>
    </div>
  );
}
