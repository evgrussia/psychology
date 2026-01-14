'use client';

import React from 'react';
import SafeMarkdownRenderer from '../components/SafeMarkdownRenderer';
import { 
  HeroSection, 
  TrustBlocks, 
  FAQSection, 
  CTABlock,
  Button,
  Disclaimer
} from '@psychology/design-system/components';
import { spacing, typography, colors } from '@psychology/design-system/tokens';
import { track } from '../lib/tracking';
import { useFeatureFlag } from '../lib/feature-flags';

interface PageClientProps {
  slug: string;
  data: {
    id: string;
    title: string;
    body_markdown: string;
  };
}

export default function PageClient({ slug, data }: PageClientProps) {
  const trustPagesEnabled = useFeatureFlag('trust_pages_v1_enabled');

  const handleBookingClick = (ctaId: string) => {
    track('cta_click', { cta_id: ctaId, cta_target: 'booking' });
    window.location.href = '/booking';
  };

  const handleTGClick = (ctaId: string) => {
    track('cta_click', { cta_id: ctaId, cta_target: 'telegram' });
    window.location.href = 'https://t.me/emotional_balance_bot';
  };

  const handleFAQToggle = (faqId: string, isOpen: boolean) => {
    if (isOpen) {
      track('faq_opened', { faq_id: faqId, page_path: `/${slug}` });
    }
  };

  React.useEffect(() => {
    track('page_view', { 
      page_path: `/${slug}`, 
      page_title: data.title,
      content_type: 'page',
      content_slug: slug
    });

    if (slug === 'about') {
      ['confidentiality', 'boundaries', 'education'].forEach(blockId => {
        track('trust_block_viewed', { trust_block: blockId, page_path: '/about' });
      });
    }
  }, [slug, data.title]);

  // Extract FAQ items from markdown if any, or use fallback
  // For simplicity, we assume pages might have structured blocks in the future
  // For now, we just render the markdown body
  
  return (
    <main>
      <section style={{ 
        padding: `${spacing.space[20]} ${spacing.space[6]}`,
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        <h1 style={{
          ...typography.h1,
          marginBottom: spacing.space[8],
          color: colors.text.primary,
        }}>{data.title}</h1>
        
        <div className="prose" style={{
          ...typography.body.md,
          color: colors.text.secondary,
        }}>
          <SafeMarkdownRenderer content={data.body_markdown} />
        </div>
      </section>

      {trustPagesEnabled && slug === 'about' && (
        <TrustBlocks 
          title="Мои принципы и этика"
          items={[
            { id: 'confidentiality', title: 'Конфиденциальность', description: 'Соблюдаю профессиональную тайну и этический кодекс.', icon: '🔒' },
            { id: 'boundaries', title: 'Границы', description: 'Создаю безопасное и предсказуемое пространство.', icon: '🛡️' },
            { id: 'education', title: 'Образование', description: 'Регулярная супервизия и повышение квалификации.', icon: '🎓' },
          ]}
        />
      )}

      {trustPagesEnabled && slug === 'how-it-works' && (
        <>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'FAQPage',
                mainEntity: [
                  {
                    '@type': 'Question',
                    name: 'Как подготовиться к первой встрече?',
                    acceptedAnswer: {
                      '@type': 'Answer',
                      text: 'Специальная подготовка не нужна. Достаточно вашего желания и тихого места, где вас никто не побеспокоит.',
                    },
                  },
                  {
                    '@type': 'Question',
                    name: 'В каком формате проходят встречи?',
                    acceptedAnswer: {
                      '@type': 'Answer',
                      text: 'Обычно это видеозвонок (Google Meet, Zoom или Telegram) длительностью 50 минут.',
                    },
                  },
                  {
                    '@type': 'Question',
                    name: 'Можно ли отменить или перенести встречу?',
                    acceptedAnswer: {
                      '@type': 'Answer',
                      text: 'Да, отмена или перенос возможны не позднее чем за 24 часа до назначенного времени.',
                    },
                  },
                ],
              }),
            }}
          />
          <FAQSection 
            title="Частые вопросы о процессе"
            onItemToggle={handleFAQToggle}
            items={[
              { 
                id: 'prep', 
                question: 'Как подготовиться к первой встрече?', 
                answer: 'Специальная подготовка не нужна. Достаточно вашего желания и тихого места, где вас никто не побеспокоит.' 
              },
              { 
                id: 'format', 
                question: 'В каком формате проходят встречи?', 
                answer: 'Обычно это видеозвонок (Google Meet, Zoom или Telegram) длительностью 50 минут.' 
              },
              { 
                id: 'cancel', 
                question: 'Можно ли отменить или перенести встречу?', 
                answer: 'Да, отмена или перенос возможны не позднее чем за 24 часа до назначенного времени.' 
              }
            ]}
          />
        </>
      )}

      {slug === 'how-it-works' && (
        <section style={{ maxWidth: '800px', margin: '0 auto', padding: `0 ${spacing.space[6]}` }}>
          <Disclaimer variant="info" showEmergencyLink title="Важно понимать">
            Психологическая консультация не является медицинской услугой. Если вы находитесь в остром кризисном состоянии, пожалуйста, обратитесь в специализированные службы.
          </Disclaimer>
        </section>
      )}

      <CTABlock 
        title="С чего начнём?"
        description="Вы можете записаться на ознакомительную сессию или задать вопрос в Telegram."
        primaryCTA={
          <Button variant="primary" size="lg" onClick={() => handleBookingClick(`${slug}_footer_booking`)}>
            Записаться
          </Button>
        }
        secondaryCTA={
          <Button variant="secondary" size="lg" onClick={() => handleTGClick(`${slug}_footer_tg`)}>
            Написать в Telegram
          </Button>
        }
      />
    </main>
  );
}
