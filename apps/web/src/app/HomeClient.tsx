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
      <HeroSection 
        title="Эмоциональный баланс"
        subtitle="Тёплое пространство профессиональной поддержки"
        description="Помогаю справиться с тревогой, выгоранием и найти опору в себе за 1–3 клика до первого шага."
        primaryCTA={
          <Button size="lg" onClick={() => handleBookingClick('hero_booking')}>
            Записаться на консультацию
          </Button>
        }
        secondaryCTA={
          <Button variant="outline" size="lg" onClick={() => handleTGClick('hero_tg')}>
            Начать в Telegram
          </Button>
        }
      />

      <Section>
        <Container>
          <h2 className="text-3xl font-bold text-center mb-12">С чем я помогаю</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
        <Section className="bg-muted">
          <Container>
            <h2 className="text-3xl font-bold text-center mb-12">Первый шаг за 3 минуты</h2>
            <div className="flex flex-col gap-6 max-w-3xl mx-auto">
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
        <Container>
          <h2 className="text-3xl font-bold text-center mb-12">Почему мне можно доверять</h2>
          <TrustBlocks viewport="desktop" />
        </Container>
      </Section>

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
        title="Готовы сделать первый шаг?"
        description="Выберите удобный способ начать: записаться на консультацию или получить полезные материалы в Telegram."
        primaryCTA={
          <Button size="lg" onClick={() => handleBookingClick('footer_booking')}>
            Записаться
          </Button>
        }
        secondaryCTA={
          <Button variant="outline" size="lg" onClick={() => handleTGClick('footer_tg')}>
            Telegram-бот
          </Button>
        }
      />
    </main>
  );
}
