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

  const getPageGraphics = () => {
    switch(slug) {
      case 'about':
        return {
          hero: "/assets/graphics/hero/hero-about-office-1376x768.webp",
          spot: "/assets/graphics/spot/spot-journal-reflection-1024x1024.svg",
          abstract: "/assets/graphics/abstract/abstract-inner-landscape-1376x768.webp"
        };
      case 'how-it-works':
        return {
          hero: "/assets/graphics/hero/hero-journey-1376x768.webp",
          spot: "/assets/graphics/spot/spot-hopeful-progression-1024x1024.svg",
          abstract: "/assets/graphics/abstract/abstract-balance-forms-1376x768.webp"
        };
      case 'emergency':
        return {
          hero: "/assets/graphics/hero/hero-trust-office-1376x768.webp",
          spot: "/assets/graphics/spot/spot-safe-space-1024x1024.svg",
          abstract: "/assets/graphics/abstract/abstract-emotional-waves-1376x768.webp"
        };
      default:
        return {
          hero: undefined,
          spot: undefined,
          abstract: undefined
        };
    }
  };

  const graphics = getPageGraphics();

  return (
    <>
      {graphics.hero ? (
        <HeroSection 
          title={data.title}
          image={graphics.hero}
          className="bg-background border-b"
        />
      ) : (
        <Section>
          <Container className="max-w-3xl text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-bold mb-8 text-foreground">{data.title}</h1>
          </Container>
        </Section>
      )}
      
      <Section className="relative overflow-hidden">
        {graphics.abstract && (
          <div className="absolute top-0 right-0 w-1/3 h-full opacity-5 pointer-events-none">
            <img src={graphics.abstract} alt="" className="w-full h-full object-cover" />
          </div>
        )}
        <Container className="max-w-4xl relative z-10">
          <div className="flex flex-col md:flex-row gap-12">
            <div className="flex-1 prose prose-slate dark:prose-invert max-w-none text-muted-foreground">
              <SafeMarkdownRenderer content={data.body_markdown} />
            </div>
            {graphics.spot && (
              <div className="hidden md:block w-64 h-64 flex-shrink-0">
                <img src={graphics.spot} alt="" className="w-full h-full object-contain opacity-80" />
              </div>
            )}
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
                  image: "/assets/graphics/spot/spot-safe-space-1024x1024.svg"
                },
                {
                  id: 'boundaries',
                  title: 'Профессиональные границы',
                  description: 'Работа в рамках этического кодекса и четких договоренностей.',
                  image: "/assets/graphics/spot/spot-support-connection-1024x1024.svg"
                },
                {
                  id: 'education',
                  title: 'Образование и супервизия',
                  description: 'Постоянное обучение и регулярная супервизия практики.',
                  image: "/assets/graphics/spot/spot-education-1024x1024.svg"
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
          backgroundImage={graphics.abstract}
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
    </>
  );
}
