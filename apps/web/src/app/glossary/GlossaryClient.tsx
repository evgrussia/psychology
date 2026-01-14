'use client';

import { useEffect } from 'react';
import { track, captureUTMParameters } from '../../lib/tracking';

interface GlossaryClientProps {
  termsCount: number;
}

export default function GlossaryClient({ termsCount }: GlossaryClientProps) {
  useEffect(() => {
    // Capture UTM parameters on first visit
    captureUTMParameters();

    // Track page view
    track('page_view', {
      page_path: '/glossary',
      page_title: 'Словарь терминов | Эмоциональный баланс',
      format: 'glossary',
      terms_count: termsCount,
    });
  }, [termsCount]);

  return null;
}
