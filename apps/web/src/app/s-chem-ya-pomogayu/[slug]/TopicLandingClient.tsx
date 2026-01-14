'use client';

import React, { useEffect } from 'react';
import { 
  HeroSection, 
  TrustBlocks, 
  CTABlock, 
  Button, 
  Card 
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

      {/* Блок "Признаки" */}
      {signsContent && (
        <section style={{ 
          maxWidth: '800px', 
          margin: '0 auto', 
          padding: `${spacing.space[12]} ${spacing.space[6]}`,
          backgroundColor: colors.bg.secondary,
        }}>
          <h2 style={{ ...typography.h2, marginBottom: spacing.space[6] }}>
            Признаки и симптомы
          </h2>
          <div style={{ 
            ...typography.body.lg, 
            color: colors.text.primary,
            lineHeight: 1.7,
          }}>
            <SafeMarkdownRenderer content={signsContent} />
          </div>
          <p style={{ 
            ...typography.body.sm, 
            color: colors.text.secondary, 
            marginTop: spacing.space[6],
            fontStyle: 'italic',
          }}>
            Это не диагноз — скорее ориентиры, которые могут помочь понять, стоит ли обратить внимание на эту тему.
          </p>
        </section>
      )}

      {/* Основной контент лендинга */}
      <section style={{ 
        maxWidth: '800px', 
        margin: '0 auto', 
        padding: `${spacing.space[12]} ${spacing.space[6]}` 
      }}>
        {landing?.bodyMarkdown ? (
          <SafeMarkdownRenderer content={landing.bodyMarkdown} />
        ) : (
          <div style={{ textAlign: 'center', color: colors.text.secondary }}>
            <p>Здесь скоро появится подробное описание работы с этой темой.</p>
          </div>
        )}
      </section>

      {/* Блок "Как я работаю" */}
      {howIWorkContent && (
        <section style={{ 
          maxWidth: '800px', 
          margin: '0 auto', 
          padding: `${spacing.space[12]} ${spacing.space[6]}`,
          backgroundColor: colors.bg.secondary,
        }}>
          <h2 style={{ ...typography.h2, marginBottom: spacing.space[6] }}>
            Как я работаю с этим
          </h2>
          <div style={{ 
            ...typography.body.lg, 
            color: colors.text.primary,
            lineHeight: 1.7,
          }}>
            <SafeMarkdownRenderer content={howIWorkContent} />
          </div>
        </section>
      )}

      <TrustBlocks />

      {(relatedContent.length > 0 || relatedInteractives.length > 1) && (
        <section style={{ 
          backgroundColor: colors.bg.secondary,
          padding: `${spacing.space[20]} ${spacing.space[6]}` 
        }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h2 style={{ ...typography.h2, marginBottom: spacing.space[12], textAlign: 'center' }}>
              Полезные материалы по теме {topic.title}
            </h2>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
              gap: spacing.space[6] 
            }}>
              {relatedInteractives.slice(1).map(interactive => (
                <Card key={interactive.id} variant="elevated">
                  <h3 style={{ ...typography.h3, marginBottom: spacing.space[4] }}>{interactive.title}</h3>
                  <p style={{ ...typography.body.md, color: colors.text.secondary, marginBottom: spacing.space[6] }}>
                    Интерактивное упражнение или тест
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => window.location.href = getInteractiveUrl(interactive)}
                  >
                    Запустить
                  </Button>
                </Card>
              ))}
              
              {relatedContent.map(content => (
                <Card key={content.id} variant="elevated">
                  <h3 style={{ ...typography.h3, marginBottom: spacing.space[4] }}>{content.title}</h3>
                  <p style={{ ...typography.body.md, color: colors.text.secondary, marginBottom: spacing.space[6] }}>
                    {content.excerpt || 'Статья или ресурс'}
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => window.location.href = `/blog/${content.slug}`}
                  >
                    Читать далее
                  </Button>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

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
            variant="outline" 
            size="lg" 
            onClick={() => window.location.href = '/booking'}
          >
            Запись на сессию
          </Button>
        }
      />
    </main>
  );
}
