'use client';

import { useEffect } from 'react';
import { track, captureUTMParameters } from '../../../lib/tracking';

interface GlossaryTermClientProps {
  slug: string;
  title: string;
  category: string;
}

export default function GlossaryTermClient({ slug, title, category }: GlossaryTermClientProps) {
  useEffect(() => {
    // Capture UTM parameters on first visit
    captureUTMParameters();

    // Track page view
    track('page_view', {
      page_path: `/glossary/${slug}`,
      page_title: `${title} | Словарь | Эмоциональный баланс`,
      format: 'glossary_term',
      term_slug: slug,
      term_category: category,
    });

    // Track CTA clicks
    const handleCTAClick = (e: Event) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a[href="/start"]');
      if (link) {
        track('cta_click', {
          cta_id: 'glossary_term_booking',
          cta_label: 'Подобрать психолога',
          cta_target: 'booking',
          page_path: `/glossary/${slug}`,
          term_slug: slug,
          term_category: category,
        });
      }
    };

    document.addEventListener('click', handleCTAClick);
    return () => {
      document.removeEventListener('click', handleCTAClick);
    };
  }, [slug, title, category]);

  return null;
}
