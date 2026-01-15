'use client';

import React from 'react';
import SafeMarkdownRenderer from '../components/SafeMarkdownRenderer';
import { 
  HeroSection, 
  TrustBlocks, 
  FAQSection, 
  CTABlock,
  Button,
  Disclaimer,
  Container,
  Section
} from '@psychology/design-system';
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

  return (
    <main>
      <Section>
        <Container className="max-w-3xl">
          <h1 className="text-4xl font-bold mb-8 text-foreground">{data.title}</h1>
          
          <div className="prose prose-slate dark:prose-invert max-w-none text-muted-foreground">
            <SafeMarkdownRenderer content={data.body_markdown} />
          </div>
        </Container>
      </Section>

      {trustPagesEnabled && slug === 'about' && (
        <Section className="bg-muted">
          <Container>
            <h2 className="text-3xl font-bold text-center mb-12">Мои принципы и этика</h2>
            <TrustBlocks 
              viewport="desktop" 
              items={[
                {
                  id: 'confidentiality',
                  title: 'Конфиденциальность',
                  description: 'Ваши данные и история остаются строго между нами.',
                  icon: '🔒'
                },
                {
                  id: 'boundaries',
                  title: 'Профессиональные границы',
                  description: 'Работа в рамках этического кодекса и четких договоренностей.',
                  icon: '🤝'
                },
                {
                  id: 'education',
                  title: 'Образование и супервизия',
                  description: 'Постоянное обучение и регулярная супервизия практики.',
                  icon: '🎓'
                }
              ]}
            />
          </Container>
        </Section>
      )}

      {trustPagesEnabled && slug === 'how-it-works' && (
        <Section className="bg-muted">
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
        </Section>
      )}

      {slug === 'how-it-works' && (
        <Section className="py-8">
          <Container className="max-w-3xl">
            <Disclaimer variant="info" showEmergencyLink title="Важно понимать">
              Психологическая консультация не является медицинской услугой. Если вы находитесь в остром кризисном состоянии, пожалуйста, обратитесь в специализированные службы.
            </Disclaimer>
          </Container>
        </Section>
      )}

      <Section className="bg-muted py-0">
        <CTABlock 
          className="mx-4"
          title="С чего начнём?"
          description="Вы можете записаться на ознакомительную сессию или задать вопрос в Telegram."
          primaryCTA={
            <Button size="lg" onClick={() => handleBookingClick(`${slug}_footer_booking`)}>
              Записаться
            </Button>
          }
          secondaryCTA={
            <Button variant="outline" size="lg" onClick={() => handleTGClick(`${slug}_footer_tg`)}>
              Написать в Telegram
            </Button>
          }
        />
      </Section>
    </main>
  );
}
