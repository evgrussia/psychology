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
  Section,
  Card
} from '@psychology/design-system';
import { track } from '../lib/tracking';
import { useFeatureFlag } from '../lib/feature-flags';
import { createTelegramDeepLink } from '../lib/telegram';

interface PageClientProps {
  slug: string;
  data: {
    id: string;
    title: string;
    body_markdown: string;
    type?: string;
    time_to_benefit?: string;
    format?: string;
    support_level?: string;
    excerpt?: string;
    practical_block?: PracticalBlockInput | null;
  };
}

export default function PageClient({ slug, data }: PageClientProps) {
  const trustPagesEnabled = useFeatureFlag('trust_pages_v1_enabled');

  const handleBookingClick = (ctaId: string) => {
    track('cta_click', { cta_id: ctaId, cta_target: 'booking' });
    window.location.href = '/booking';
  };

  const handleTGClick = (ctaId: string) => {
    void (async () => {
      const { deepLinkId, url } = await createTelegramDeepLink({
        flow: 'concierge',
        tgTarget: 'bot',
        source: `/${slug}`,
        utmMedium: 'bot',
        utmContent: ctaId,
      });
      track('cta_tg_click', {
        tg_target: 'bot',
        tg_flow: 'concierge',
        deep_link_id: deepLinkId,
        cta_id: ctaId,
      });
      window.location.href = url;
    })();
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
      content_type: data.type ?? 'page',
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
  const practicalBlock = getPracticalBlockModel(slug, data);

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
            <div className="flex-1">
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

      {practicalBlock && (
        <Section className="bg-muted">
          <Container className="max-w-4xl">
            <Card className="p-8 md:p-10 flex flex-col gap-6">
              <div className="space-y-3">
                <h2 className="text-3xl font-bold text-foreground">{practicalBlock.title}</h2>
                <p className="text-muted-foreground text-lg">{practicalBlock.description}</p>
                {practicalBlock.meta.length > 0 && (
                  <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                    {practicalBlock.meta.map((item) => (
                      <span key={item} className="rounded-full border border-border px-3 py-1 bg-background">
                        {item}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-4">
                <Button
                  size="lg"
                  onClick={() => handlePracticalClick(practicalBlock.primaryCta)}
                >
                  {practicalBlock.primaryCta.label}
                </Button>
                {practicalBlock.secondaryCta && (
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => handlePracticalClick(practicalBlock.secondaryCta)}
                  >
                    {practicalBlock.secondaryCta.label}
                  </Button>
                )}
              </div>
            </Card>
          </Container>
        </Section>
      )}

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
                  image: "/assets/graphics/spot/spot-confidentiality-1024x1024.svg"
                },
                {
                  id: 'boundaries',
                  title: 'Профессиональные границы',
                  description: 'Работа в рамках этического кодекса и четких договоренностей.',
                  image: "/assets/graphics/spot/spot-boundaries-1024x1024.svg"
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

type PracticalBlockModel = {
  title: string;
  description: string;
  meta: string[];
  primaryCta: PracticalCta;
  secondaryCta?: PracticalCta;
};

type PracticalTarget = 'practice' | 'thermometer' | 'rituals' | 'consultation-prep';

type PracticalCta = {
  id: string;
  label: string;
  href: string;
  trackingTarget: string;
};

type PracticalCtaInput = {
  id?: string;
  label?: string;
  href?: string;
  target?: PracticalTarget;
  tracking_target?: string;
};

type PracticalBlockInput = {
  enabled?: boolean;
  title?: string;
  description?: string;
  meta?: string[];
  primary_cta?: PracticalCtaInput;
  secondary_cta?: PracticalCtaInput;
};

const PRACTICAL_CONTENT_TYPES = new Set(['article', 'resource', 'note']);
const PRACTICAL_EXCLUDED_SLUGS = new Set(['about', 'how-it-works', 'emergency']);

function getPracticalBlockModel(slug: string, data: PageClientProps['data']): PracticalBlockModel | null {
  if (slug.startsWith('legal/')) {
    return null;
  }
  if (PRACTICAL_EXCLUDED_SLUGS.has(slug)) {
    return null;
  }
  if (data.practical_block?.enabled === false) {
    return null;
  }
  const isAllowedType = data.type ? PRACTICAL_CONTENT_TYPES.has(data.type) : Boolean(data.practical_block);
  if (!isAllowedType) {
    return null;
  }

  const timeLabel = resolveTimeToBenefitLabel(data.time_to_benefit);
  const formatLabel = resolveFormatLabel(data.format);
  const supportHint = resolveSupportHint(data.support_level);

  const derivedMeta = [timeLabel && `Время: ${timeLabel}`, formatLabel && `Формат: ${formatLabel}`].filter(Boolean) as string[];

  const title = data.practical_block?.title
    ?? (data.type === 'resource' ? 'Практический шаг' : 'Попробовать сейчас');
  const descriptionParts = data.practical_block?.description
    ? [data.practical_block.description]
    : [
        timeLabel ? `Займет ${timeLabel}.` : 'Короткий шаг помогает лучше почувствовать результат.',
        supportHint,
      ].filter(Boolean);
  const meta = data.practical_block?.meta ?? derivedMeta;
  const defaultCtas = resolveDefaultPracticalCtas(data.format);
  const primaryCta = resolvePracticalCta(
    data.practical_block?.primary_cta,
    defaultCtas.primary,
    `${slug}_practical_primary`,
  );
  const secondaryCta = resolvePracticalCta(
    data.practical_block?.secondary_cta,
    defaultCtas.secondary,
    `${slug}_practical_secondary`,
  );

  return {
    title,
    description: descriptionParts.join(' '),
    meta,
    primaryCta,
    secondaryCta,
  };
}

function resolveTimeToBenefitLabel(value?: string): string | null {
  switch (value) {
    case 'min_1_3':
      return '1–3 минуты';
    case 'min_7_10':
      return '7–10 минут';
    case 'min_20_30':
      return '20–30 минут';
    case 'series':
      return 'серия шагов';
    default:
      return null;
  }
}

function resolveFormatLabel(value?: string): string | null {
  switch (value) {
    case 'audio':
      return 'аудио';
    case 'checklist':
      return 'чек-лист';
    case 'resource':
      return 'ресурс';
    case 'article':
      return 'статья';
    case 'note':
      return 'заметка';
    default:
      return null;
  }
}

function resolveSupportHint(value?: string): string | null {
  switch (value) {
    case 'self_help':
      return 'Самостоятельная практика без обязательного контакта.';
    case 'micro_support':
      return 'Мягкий шаг поддержки, который можно сделать сейчас.';
    case 'consultation':
      return 'Если нужно глубже, можно перейти к записи.';
    default:
      return null;
  }
}

function resolveDefaultPracticalCtas(format?: string): { primary: PracticalCta; secondary?: PracticalCta } {
  const primaryTarget = resolvePrimaryTargetByFormat(format);
  const secondaryTarget = primaryTarget === 'thermometer' ? 'practice' : 'thermometer';
  const primary = buildCta(primaryTarget, 'content_practice_primary');
  const secondary = buildCta(secondaryTarget, 'content_practice_secondary');
  return { primary, secondary };
}

function resolvePrimaryTargetByFormat(format?: string): PracticalTarget {
  switch (format) {
    case 'audio':
      return 'rituals';
    case 'checklist':
      return 'consultation-prep';
    case 'resource':
      return 'thermometer';
    default:
      return 'practice';
  }
}

function buildCta(target: PracticalTarget, fallbackId: string): PracticalCta {
  return {
    id: fallbackId,
    label: resolveTargetLabel(target),
    href: resolveTargetHref(target),
    trackingTarget: target,
  };
}

function resolveTargetLabel(target: PracticalTarget): string {
  switch (target) {
    case 'thermometer':
      return 'Термометр ресурса';
    case 'rituals':
      return 'Послушать практику';
    case 'consultation-prep':
      return 'Подготовка к консультации';
    default:
      return 'Подобрать практику';
  }
}

function resolveTargetHref(target: PracticalTarget): string {
  switch (target) {
    case 'thermometer':
      return '/start/resource-thermometer';
    case 'rituals':
      return '/start/rituals';
    case 'consultation-prep':
      return '/start/consultation-prep';
    default:
      return '/start';
  }
}

function resolvePracticalCta(input: PracticalCtaInput | undefined, fallback: PracticalCta | undefined, fallbackId: string): PracticalCta {
  if (!input && fallback) {
    return { ...fallback, id: fallbackId };
  }
  const target = input?.target ?? fallback?.trackingTarget ?? 'practice';
  const href = input?.href ?? resolveTargetHref(target as PracticalTarget);
  return {
    id: input?.id ?? fallback?.id ?? fallbackId,
    label: input?.label ?? fallback?.label ?? resolveTargetLabel(target as PracticalTarget),
    href,
    trackingTarget: input?.tracking_target ?? input?.target ?? fallback?.trackingTarget ?? 'practice',
  };
}

function handlePracticalClick(cta: PracticalCta) {
  track('cta_click', { cta_id: cta.id, cta_target: cta.trackingTarget });
  window.location.href = cta.href;
}
