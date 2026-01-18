'use client';

import React from 'react';
import { 
  HeroSection, 
  TopicCard, 
  TrustBlocks, 
  FAQSection, 
  CTABlock,
  Button,
  Disclaimer,
  Container,
  Section
} from '@psychology/design-system';
import { track, captureUTMParameters } from '../lib/tracking';
import { createTelegramDeepLink } from '../lib/telegram';
import { useFeatureFlag } from '../lib/feature-flags';
import { getExperimentTrackingProperties, useExperimentAssignment } from '../lib/experiments';
import { RetentionOffersSection } from '@/components/RetentionOffersSection';

interface HomeClientProps {
  data: {
    topics: { code: string; title: string }[];
    featured_interactives: { id: string; type: string; slug: string; title: string }[];
    trust_blocks: { id: string; title: string; description: string }[];
  };
}

export default function HomeClient({ data }: HomeClientProps) {
  const experimentAssignment = useExperimentAssignment('EXP-HP-CTA-01');
  const experimentProps = getExperimentTrackingProperties(experimentAssignment);
  const conversionV2Enabled =
    experimentAssignment?.variant ? experimentAssignment.variant === 'B' : useFeatureFlag('homepage_conversion_v2_enabled');

  const handleBookingClick = (ctaId: string, ctaLabel: string) => {
    track('cta_click', { cta_id: ctaId, cta_label: ctaLabel, cta_target: 'booking', ...experimentProps });
    window.location.href = '/booking';
  };

  const handleTGClick = async (ctaId: string) => {
    try {
      const { deepLinkId, url } = await createTelegramDeepLink({
        flow: 'plan_7d',
        tgTarget: 'channel',
        source: '/',
        utmMedium: 'channel',
        utmContent: ctaId,
      });
      track('cta_tg_click', {
        tg_target: 'channel',
        tg_flow: 'plan_7d',
        deep_link_id: deepLinkId,
        cta_id: ctaId,
        ...experimentProps,
      });
      window.location.href = url;
    } catch (error) {
      console.error('Failed to open Telegram channel', error);
      const channelUsername = process.env.NEXT_PUBLIC_TELEGRAM_CHANNEL_USERNAME || 'emotional_balance_channel';
      window.location.href = `https://t.me/${channelUsername.replace(/^@/, '')}`;
    }
  };

  const handleTopicClick = (topicCode: string) => {
    track('view_problem_card', { topic: topicCode, card_slug: topicCode, page_path: '/' });
  };

  const handleFAQToggle = (faqId: string, isOpen: boolean) => {
    if (isOpen) {
      track('faq_opened', { faq_id: faqId, page_path: '/' });
    }
  };

  React.useEffect(() => {
    // Capture UTM parameters on first visit
    captureUTMParameters();
    
    // Track page view
    track('page_view', { page_path: '/', page_title: 'Главная', ...experimentProps });
    
    // Track trust blocks viewed (simplified: on mount)
    data.trust_blocks.forEach(block => {
      track('trust_block_viewed', { trust_block: block.id, page_path: '/' });
    });
  }, [data.trust_blocks]);

  const heroCopy = conversionV2Enabled
    ? {
        subtitle: 'Психологическая поддержка онлайн',
        description:
          'Бережная помощь при тревоге, выгорании и сложных отношениях. Начните с бесплатного плана в Telegram или выберите консультацию.',
        badge: 'Первый шаг без давления',
        primaryLabel: 'Получить план в Telegram',
        secondaryLabel: 'Записаться на консультацию',
      }
    : {
        subtitle: 'Тёплое пространство профессиональной поддержки',
        description:
          'Помогаю справиться с тревогой, выгоранием и найти опору в себе за 1–3 клика до первого шага.',
        badge: undefined,
        primaryLabel: 'Записаться на консультацию',
        secondaryLabel: 'Подписаться на канал',
      };

  const topicsTitle = conversionV2Enabled ? 'С чего начать прямо сейчас' : 'С чем я помогаю';
  const topicsDescription = conversionV2Enabled
    ? 'Выберите тему, которая сейчас важнее всего — подберём бережный старт.'
    : undefined;

  const quickStartSection = conversionV2Enabled ? (
    <Section className="pt-8">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="rounded-2xl border bg-background p-6 shadow-sm">
            <h2 className="text-2xl font-semibold mb-3">План в Telegram</h2>
            <p className="text-muted-foreground mb-4">
              Мягкий старт на 7 дней: короткие шаги и поддержка, без регистрации и давления.
            </p>
            <Button size="lg" onClick={() => void handleTGClick('quickstart_tg')}>
              Получить план
            </Button>
            <p className="text-sm text-muted-foreground mt-3">Можно остановить в любой момент.</p>
          </div>
          <div className="rounded-2xl border bg-background p-6 shadow-sm">
            <h2 className="text-2xl font-semibold mb-3">Консультация</h2>
            <p className="text-muted-foreground mb-4">
              Выберите удобное время и формат встречи. Спокойный первый шаг с бережным сопровождением.
            </p>
            <Button size="lg" variant="outline" onClick={() => handleBookingClick('quickstart_booking', 'Записаться')}>
              Записаться
            </Button>
            <p className="text-sm text-muted-foreground mt-3">Онлайн-встречи 50 минут.</p>
          </div>
        </div>
      </Container>
    </Section>
  ) : null;

  const featuredInteractivesSection = data.featured_interactives.length > 0 ? (
    <Section className="bg-muted overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
        <img src="/assets/graphics/patterns/pattern-waves-subtle-1024x1024.png" alt="" className="w-full h-full object-cover" />
      </div>
      <Container className="relative z-10">
        <h2 className="text-3xl font-bold text-center mb-4">Первый шаг за несколько минут</h2>
        <p className="text-muted-foreground text-center mb-12">
          Короткие интерактивы помогут прояснить состояние и выбрать следующий шаг.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {data.featured_interactives.map((item) => (
            <TopicCard 
              key={item.id}
              title={item.title}
              description="Пройдите короткий интерактив и получите план действий."
              href={`/start/${item.slug}`}
              image={item.type === 'quiz' ? "/assets/graphics/modules/module-anxiety-test-1264x848.jpg" : "/assets/graphics/modules/module-exercises-1264x848.png"}
              onClick={() =>
                track('cta_click', {
                  cta_id: `interactive_${item.slug}`,
                  cta_label: item.title,
                  cta_target: `interactive_${item.type}`,
                })
              }
            />
          ))}
        </div>
      </Container>
    </Section>
  ) : null;

  const topicsSection = (
    <Section>
      <Container>
        <h2 className="text-3xl font-bold text-center mb-4">{topicsTitle}</h2>
        {topicsDescription && (
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">{topicsDescription}</p>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {data.topics.map((topic) => (
            <TopicCard 
              key={topic.code}
              title={topic.title}
              description={`Узнайте больше о том, как я работаю с темой ${topic.title.toLowerCase()}.`}
              href={`/s-chem-ya-pomogayu/${topic.code}`}
              image={`/assets/graphics/spot/${
                topic.code === 'anxiety' ? 'spot-anxiety-waves-1024x1024.svg' : 
                topic.code === 'relationship' ? 'spot-support-connection-1024x1024.svg' :
                topic.code === 'growth' ? 'spot-growth-sprout-1024x1024.svg' :
                'spot-dialog-bubbles-1024x1024.svg'
              }`}
              onClick={() => handleTopicClick(topic.code)}
            />
          ))}
        </div>
      </Container>
    </Section>
  );

  const howItWorksSection = (
    <Section>
      <Container>
        <div className="flex flex-col lg:flex-row items-center gap-12 mb-16">
          <div className="flex-1">
            <h2 className="text-3xl font-bold mb-6">
              {conversionV2Enabled ? 'Как проходит работа' : 'Как я работаю'}
            </h2>
            <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
              {conversionV2Enabled
                ? 'Понятный процесс, бережный темп и опора на доказательные методы психотерапии.'
                : 'Мой подход основан на бережности, профессионализме и доказательных методах психотерапии. Мы вместе создаем безопасное пространство, где вы можете быть собой.'}
            </p>
            <Button variant="outline" onClick={() => window.location.href = '/how-it-works'}>
              Подробнее о подходе
            </Button>
          </div>
          <div className="flex-1 w-full max-w-[500px]">
            <img 
              src="/assets/graphics/sections/section-homepage-how-i-work-1376x768.png" 
              alt="Как проходит работа" 
              className="w-full h-auto rounded-2xl shadow-xl"
            />
          </div>
        </div>
      </Container>
    </Section>
  );

  const trustSection = (
    <Section>
      <Container>
        <TrustBlocks 
          viewport="desktop" 
          title="Почему мне можно доверять"
          items={data.trust_blocks.map((block, index) => ({
            ...block,
            image: index === 0 ? "/assets/graphics/spot/spot-safe-space-1024x1024.svg" :
                   index === 1 ? "/assets/graphics/spot/spot-education-1024x1024.svg" :
                   index === 2 ? "/assets/graphics/spot/spot-hopeful-progression-1024x1024.svg" :
                   "/assets/graphics/spot/spot-support-connection-1024x1024.svg"
          }))} 
        />
      </Container>
    </Section>
  );
  
  const retentionOffersSection = <RetentionOffersSection surface="home" />;

  return (
    <>
      <HeroSection 
        title="Эмоциональный баланс"
        subtitle={heroCopy.subtitle}
        description={heroCopy.description}
        badge={heroCopy.badge}
        image="/assets/graphics/hero/hero-homepage-calm-1376x768.webp"
        primaryCTA={
          conversionV2Enabled ? (
            <Button size="lg" onClick={() => void handleTGClick('hero_tg')}>
              {heroCopy.primaryLabel}
            </Button>
          ) : (
            <Button size="lg" onClick={() => handleBookingClick('hero_booking', heroCopy.primaryLabel)}>
              {heroCopy.primaryLabel}
            </Button>
          )
        }
        secondaryCTA={
          conversionV2Enabled ? (
            <Button variant="outline" size="lg" onClick={() => handleBookingClick('hero_booking', heroCopy.secondaryLabel)}>
              {heroCopy.secondaryLabel}
            </Button>
          ) : (
            <Button variant="outline" size="lg" onClick={() => void handleTGClick('hero_tg')}>
              {heroCopy.secondaryLabel}
            </Button>
          )
        }
      />

      {quickStartSection}
      {conversionV2Enabled ? (
        <>
          {featuredInteractivesSection}
          {trustSection}
          {topicsSection}
          {retentionOffersSection}
          {howItWorksSection}
        </>
      ) : (
        <>
          {howItWorksSection}
          {topicsSection}
          {retentionOffersSection}
          {featuredInteractivesSection}
          {trustSection}
        </>
      )}

      <FAQSection 
        className="bg-muted"
        title="Частые вопросы"
        onItemToggle={handleFAQToggle}
        items={[
          { 
            id: '1', 
            question: 'Как проходит первая встреча?', 
            answer: 'Мы знакомимся, обсуждаем ваш запрос и определяем цели работы. Это безопасное пространство для ваших чувств.' 
          },
          { 
            id: '2', 
            question: 'Это конфиденциально?', 
            answer: 'Да, всё, что обсуждается на сессиях, остается строго между нами, согласно этическому кодексу.' 
          },
          { 
            id: '3', 
            question: 'Сколько нужно встреч?', 
            answer: 'Всё индивидуально. Кому-то достаточно 3–5 встреч для решения конкретного вопроса, кто-то выбирает длительную терапию.' 
          }
        ]}
      />

      <Section className="py-8">
        <Container>
          <Disclaimer variant="info" showEmergencyLink title="Важная информация">
            Сайт «Эмоциональный баланс» предоставляет психологическую поддержку и информационные услуги. 
            Информация на сайте не является заменой профессиональной медицинской консультации, диагностики или лечения. 
          </Disclaimer>
        </Container>
      </Section>

      <CTABlock 
        className="mx-4 mb-16"
        title={conversionV2Enabled ? 'Готовы сделать спокойный первый шаг?' : 'Готовы сделать первый шаг?'}
        description={
          conversionV2Enabled
            ? 'Выберите темп, который комфортен: консультация или план поддержки в Telegram.'
            : 'Выберите удобный способ начать: записаться на консультацию или получить полезные материалы в Telegram.'
        }
        backgroundImage="/assets/graphics/abstract/abstract-balance-forms-1376x768.webp"
        primaryCTA={
          conversionV2Enabled ? (
            <Button size="lg" onClick={() => void handleTGClick('footer_tg')}>
              Telegram-план
            </Button>
          ) : (
            <Button size="lg" onClick={() => handleBookingClick('footer_booking', 'Записаться')}>
              Записаться
            </Button>
          )
        }
        secondaryCTA={
          conversionV2Enabled ? (
            <Button variant="outline" size="lg" onClick={() => handleBookingClick('footer_booking', 'Записаться')}>
              Записаться
            </Button>
          ) : (
            <Button variant="outline" size="lg" onClick={() => void handleTGClick('footer_tg')}>
              Telegram-канал
            </Button>
          )
        }
      />
    </>
  );
}
