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
} from '@psychology/design-system/components';
import { spacing, typography, colors } from '@psychology/design-system/tokens';
import { track, captureUTMParameters } from '../lib/tracking';

interface HomeClientProps {
  data: {
    topics: { code: string; title: string }[];
    featured_interactives: { id: string; type: string; slug: string; title: string }[];
    trust_blocks: { id: string; title: string; description: string }[];
  };
}

export default function HomeClient({ data }: HomeClientProps) {
  const handleBookingClick = (ctaId: string) => {
    track('cta_click', { cta_id: ctaId, cta_target: 'booking' });
    window.location.href = '/booking';
  };

  const handleTGClick = (ctaId: string) => {
    track('cta_click', { cta_id: ctaId, cta_target: 'telegram' });
    window.location.href = 'https://t.me/emotional_balance_bot';
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
    track('page_view', { page_path: '/', page_title: 'Главная' });
    
    // Track trust blocks viewed (simplified: on mount)
    data.trust_blocks.forEach(block => {
      track('trust_block_viewed', { trust_block: block.id, page_path: '/' });
    });
  }, [data.trust_blocks]);

  return (
    <main>
      <Section variant="secondary" spacingSize="none">
        <HeroSection 
          title="Эмоциональный баланс"
          subtitle="Тёплое пространство профессиональной поддержки"
          description="Помогаю справиться с тревогой, выгоранием и найти опору в себе за 1–3 клика до первого шага."
          primaryCTA={
            <Button variant="primary" size="lg" onClick={() => handleBookingClick('hero_booking')}>
              Записаться на консультацию
            </Button>
          }
          secondaryCTA={
            <Button variant="secondary" size="lg" onClick={() => handleTGClick('hero_tg')}>
              Начать в Telegram
            </Button>
          }
        />
      </Section>

      <Section>
        <Container>
          <h2 style={{
            ...typography.h2,
            textAlign: 'center',
            marginBottom: spacing.space[12],
            color: colors.text.primary,
          }}>С чем я помогаю</h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: spacing.space[8],
          }}>
            {data.topics.map((topic) => (
              <TopicCard 
                key={topic.code}
                title={topic.title}
                description={`Узнайте больше о том, как я работаю с темой ${topic.title.toLowerCase()}.`}
                href={`/s-chem-ya-pomogayu/${topic.code}`}
                onClick={() => handleTopicClick(topic.code)}
              />
            ))}
          </div>
        </Container>
      </Section>

      {data.featured_interactives.length > 0 && (
        <Section variant="secondary">
          <Container>
            <h2 style={{
              ...typography.h2,
              textAlign: 'center',
              marginBottom: spacing.space[12],
              color: colors.text.primary,
            }}>Первый шаг за 3 минуты</h2>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: spacing.space[6],
              maxWidth: '800px',
              margin: '0 auto',
            }}>
              {data.featured_interactives.map((item) => (
                <TopicCard 
                  key={item.id}
                  title={item.title}
                  description="Пройдите короткий интерактив и получите план действий."
                  href={`/start/${item.slug}`}
                  onClick={() => track('cta_click', { cta_id: `interactive_${item.slug}`, cta_target: `interactive_${item.type}` })}
                />
              ))}
            </div>
          </Container>
        </Section>
      )}

      <Section>
        <TrustBlocks 
          title="Почему мне можно доверять"
          items={data.trust_blocks.map(b => ({
            ...b,
            icon: b.id === 'confidentiality' ? '🔒' : b.id === 'how_it_works' ? '🤝' : '🛡️'
          }))}
        />
      </Section>

      <Section variant="secondary">
        <FAQSection 
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
      </Section>

      <Section spacingSize="sm">
        <Container>
          <Disclaimer variant="info" showEmergencyLink title="Важная информация">
            Сайт «Эмоциональный баланс» предоставляет психологическую поддержку и информационные услуги. 
            Информация на сайте не является заменой профессиональной медицинской консультации, диагностики или лечения. 
          </Disclaimer>
        </Container>
      </Section>

      <Section variant="primary" spacingSize="none">
        <CTABlock 
          title="Готовы сделать первый шаг?"
          description="Выберите удобный способ начать: записаться на консультацию или получить полезные материалы в Telegram."
          primaryCTA={
            <Button variant="primary" size="lg" onClick={() => handleBookingClick('footer_booking')}>
              Записаться
            </Button>
          }
          secondaryCTA={
            <Button variant="secondary" size="lg" onClick={() => handleTGClick('footer_tg')}>
              Telegram-бот
            </Button>
          }
        />
      </Section>
    </main>
  );
}
