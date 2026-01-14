'use client';

import React, { useEffect } from 'react';
import { 
  HeroSection, 
  TrustBlocks, 
  CTABlock, 
  Button, 
  Card,
  Section,
  Container
} from '@psychology/design-system/components';
import { spacing, typography, colors } from '@psychology/design-system/tokens';
import SafeMarkdownRenderer from '../../../components/SafeMarkdownRenderer';
import { track } from '../../../lib/tracking';

interface TopicLandingClientProps {
  data: {
    topic: { code: string; title: string };
    landing?: any;
    relatedContent: any[];
    relatedInteractives: any[];
    relatedServices: any[];
  };
}

export default function TopicLandingClient({ data }: TopicLandingClientProps) {
  const { topic, landing, relatedContent, relatedInteractives } = data;

  const primaryInteractive = relatedInteractives[0];

  // Трекинг события просмотра лендинга темы
  useEffect(() => {
    track('view_problem_landing', {
      topic: topic.code,
      page_path: typeof window !== 'undefined' ? window.location.pathname : '',
    });
  }, [topic.code]);

  const getInteractiveUrl = (interactive: any) => {
    const typeMap: Record<string, string> = {
      'quiz': 'quizzes',
      'navigator': 'navigator',
      'ritual': 'rituals',
      'boundaries': 'boundaries-scripts',
      'prep': 'prep',
      'thermometer': 'thermometer'
    };
    const folder = typeMap[interactive.type] || `${interactive.type}s`;
    return `/start/${folder}/${interactive.slug}`;
  };

  // Парсинг markdown для извлечения специальных секций
  const parseMarkdownSections = (markdown: string) => {
    const sections: Record<string, string> = {};
    const lines = markdown.split('\n');
    let currentSection: string | null = null;
    let currentContent: string[] = [];

    for (const line of lines) {
      // Проверяем заголовки H2 (##)
      const h2Match = line.match(/^##\s+(.+)$/);
      if (h2Match) {
        // Сохраняем предыдущую секцию
        if (currentSection && currentContent.length > 0) {
          sections[currentSection] = currentContent.join('\n').trim();
        }
        // Начинаем новую секцию
        const sectionTitle = h2Match[1].toLowerCase();
        if (sectionTitle.includes('признаки') || sectionTitle.includes('симптомы')) {
          currentSection = 'signs';
        } else if (sectionTitle.includes('как я работаю') || sectionTitle.includes('подход')) {
          currentSection = 'how_i_work';
        } else {
          currentSection = null;
        }
        currentContent = [];
      } else if (currentSection) {
        currentContent.push(line);
      }
    }

    // Сохраняем последнюю секцию
    if (currentSection && currentContent.length > 0) {
      sections[currentSection] = currentContent.join('\n').trim();
    }

    return sections;
  };

  const markdownSections = landing?.bodyMarkdown ? parseMarkdownSections(landing.bodyMarkdown) : {};
  const signsContent = markdownSections.signs;
  const howIWorkContent = markdownSections.how_i_work;

  return (
    <main>
      <Section variant="secondary" spacingSize="none">
        <HeroSection
          title={landing?.title || topic.title}
          subtitle="С чем я помогаю"
          description={landing?.excerpt || `Узнайте больше о работе с темой "${topic.title}" и найдите полезные инструменты.`}
          primaryCTA={
            primaryInteractive ? (
              <Button 
                variant="primary" 
                size="lg" 
                onClick={() => window.location.href = getInteractiveUrl(primaryInteractive)}
              >
                Попробовать сейчас: {primaryInteractive.title}
              </Button>
            ) : (
              <Button 
                variant="primary" 
                size="lg" 
                onClick={() => window.location.href = '/start'}
              >
                Начать диагностику
              </Button>
            )
          }
          secondaryCTA={
            <Button 
              variant="secondary" 
              size="lg" 
              onClick={() => window.location.href = '/booking'}
            >
              Записаться на сессию
            </Button>
          }
        />
      </Section>

      {/* Блок "Признаки" */}
      {signsContent && (
        <Section variant="secondary">
          <Container maxWidth="800px">
            <h2 style={{ ...typography.h2, marginBottom: 'var(--space-6)', color: 'var(--color-text-primary)' }}>
              Признаки и симптомы
            </h2>
            <div style={{ 
              ...typography.body.lg, 
              color: 'var(--color-text-primary)',
              lineHeight: 1.7,
            }}>
              <SafeMarkdownRenderer content={signsContent} />
            </div>
            <p style={{ 
              ...typography.body.sm, 
              color: 'var(--color-text-secondary)', 
              marginTop: 'var(--space-6)',
              fontStyle: 'italic',
            }}>
              Это не диагноз — скорее ориентиры, которые могут помочь понять, стоит ли обратить внимание на эту тему.
            </p>
          </Container>
        </Section>
      )}

      {/* Основной контент лендинга */}
      <Section>
        <Container maxWidth="800px">
          {landing?.bodyMarkdown ? (
            <SafeMarkdownRenderer content={landing.bodyMarkdown} />
          ) : (
            <div style={{ textAlign: 'center', color: 'var(--color-text-secondary)' }}>
              <p>Здесь скоро появится подробное описание работы с этой темой.</p>
            </div>
          )}
        </Container>
      </Section>

      {/* Блок "Как я работаю" */}
      {howIWorkContent && (
        <Section variant="secondary">
          <Container maxWidth="800px">
            <h2 style={{ ...typography.h2, marginBottom: 'var(--space-6)', color: 'var(--color-text-primary)' }}>
              Как я работаю с этим
            </h2>
            <div style={{ 
              ...typography.body.lg, 
              color: 'var(--color-text-primary)',
              lineHeight: 1.7,
            }}>
              <SafeMarkdownRenderer content={howIWorkContent} />
            </div>
          </Container>
        </Section>
      )}

      <Section>
        <TrustBlocks />
      </Section>

      {(relatedContent.length > 0 || relatedInteractives.length > 1) && (
        <Section variant="secondary">
          <Container>
            <h2 style={{ ...typography.h2, marginBottom: 'var(--space-12)', textAlign: 'center', color: 'var(--color-text-primary)' }}>
              Полезные материалы по теме {topic.title}
            </h2>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
              gap: 'var(--space-6)' 
            }}>
              {relatedInteractives.slice(1).map(interactive => (
                <Card key={interactive.id} variant="elevated">
                  <h3 style={{ ...typography.h3, marginBottom: 'var(--space-4)', color: 'var(--color-text-primary)' }}>{interactive.title}</h3>
                  <p style={{ ...typography.body.md, color: 'var(--color-text-secondary)', marginBottom: 'var(--space-6)' }}>
                    Интерактивное упражнение или тест
                  </p>
                  <Button 
                    variant="tertiary" 
                    onClick={() => window.location.href = getInteractiveUrl(interactive)}
                  >
                    Запустить
                  </Button>
                </Card>
              ))}
              
              {relatedContent.map(content => (
                <Card key={content.id} variant="elevated">
                  <h3 style={{ ...typography.h3, marginBottom: 'var(--space-4)', color: 'var(--color-text-primary)' }}>{content.title}</h3>
                  <p style={{ ...typography.body.md, color: 'var(--color-text-secondary)', marginBottom: 'var(--space-6)' }}>
                    {content.excerpt || 'Статья или ресурс'}
                  </p>
                  <Button 
                    variant="tertiary" 
                    onClick={() => window.location.href = `/blog/${content.slug}`}
                  >
                    Читать далее
                  </Button>
                </Card>
              ))}
            </div>
          </Container>
        </Section>
      )}

      <Section variant="primary" spacingSize="none">
        <CTABlock
          title="Нужна персональная помощь?"
          description="Вы можете записаться на ознакомительную сессию или написать мне в Telegram для уточнения вопросов."
          primaryCTA={
            <Button 
              variant="primary" 
              size="lg" 
              onClick={() => window.location.href = 'https://t.me/your_bot'}
            >
              Написать в Telegram
            </Button>
          }
          secondaryCTA={
            <Button 
              variant="secondary" 
              size="lg" 
              onClick={() => window.location.href = '/booking'}
            >
              Запись на сессию
            </Button>
          }
        />
      </Section>
    </main>
  );
}
