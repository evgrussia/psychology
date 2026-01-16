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
} from '@psychology/design-system';
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
    <>
      <HeroSection
        title={landing?.title || topic.title}
        subtitle="С чем я помогаю"
        description={landing?.excerpt || `Узнайте больше о работе с темой "${topic.title}" и найдите полезные инструменты.`}
        primaryCTA={
          primaryInteractive ? (
            <Button 
              size="lg" 
              onClick={() => window.location.href = getInteractiveUrl(primaryInteractive)}
            >
              Попробовать сейчас: {primaryInteractive.title}
            </Button>
          ) : (
            <Button 
              size="lg" 
              onClick={() => window.location.href = '/start'}
            >
              Начать диагностику
            </Button>
          )
        }
        secondaryCTA={
          <Button 
            variant="outline" 
            size="lg" 
            onClick={() => window.location.href = '/booking'}
          >
            Записаться на сессию
          </Button>
        }
      />

      {/* Блок "Признаки" */}
      {signsContent && (
        <Section className="bg-muted">
          <Container className="max-w-3xl">
            <h2 className="text-3xl font-bold mb-6 text-foreground">
              Признаки и симптомы
            </h2>
            <div className="text-lg text-foreground leading-relaxed">
              <SafeMarkdownRenderer content={signsContent} />
            </div>
            <p className="text-sm text-muted-foreground mt-6 italic">
              Это не диагноз — скорее ориентиры, которые могут помочь понять, стоит ли обратить внимание на эту тему.
            </p>
          </Container>
        </Section>
      )}

      {/* Основной контент лендинга */}
      <Section>
        <Container className="max-w-3xl">
          {landing?.bodyMarkdown ? (
            <div className="prose prose-slate dark:prose-invert max-w-none">
              <SafeMarkdownRenderer content={landing.bodyMarkdown} />
            </div>
          ) : (
            <div className="text-center text-muted-foreground">
              <p>Здесь скоро появится подробное описание работы с этой темой.</p>
            </div>
          )}
        </Container>
      </Section>

      {/* Блок "Как я работаю" */}
      {howIWorkContent && (
        <Section className="bg-muted">
          <Container className="max-w-3xl">
            <h2 className="text-3xl font-bold mb-6 text-foreground">
              Как я работаю с этим
            </h2>
            <div className="text-lg text-foreground leading-relaxed">
              <SafeMarkdownRenderer content={howIWorkContent} />
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

      {(relatedContent.length > 0 || relatedInteractives.length > 1) && (
        <Section className="bg-muted">
          <Container>
            <h2 className="text-3xl font-bold mb-12 text-center text-foreground">
              Полезные материалы по теме {topic.title}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedInteractives.slice(1).map(interactive => (
                <Card key={interactive.id} className="h-full flex flex-col">
                  <div className="p-6 flex-1">
                    <h3 className="text-xl font-bold mb-4 text-foreground">{interactive.title}</h3>
                    <p className="text-muted-foreground mb-6">
                      Интерактивное упражнение или тест
                    </p>
                  </div>
                  <div className="p-6 pt-0 mt-auto">
                    <Button 
                      variant="outline"
                      className="w-full"
                      onClick={() => window.location.href = getInteractiveUrl(interactive)}
                    >
                      Запустить
                    </Button>
                  </div>
                </Card>
              ))}
              
              {relatedContent.map(content => (
                <Card key={content.id} className="h-full flex flex-col">
                  <div className="p-6 flex-1">
                    <h3 className="text-xl font-bold mb-4 text-foreground">{content.title}</h3>
                    <p className="text-muted-foreground mb-6">
                      {content.excerpt || 'Статья или ресурс'}
                    </p>
                  </div>
                  <div className="p-6 pt-0 mt-auto">
                    <Button 
                      variant="outline"
                      className="w-full"
                      onClick={() => window.location.href = `/blog/${content.slug}`}
                    >
                      Читать далее
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </Container>
        </Section>
      )}

      <CTABlock
        className="mx-4 mb-16"
        title="Нужна персональная помощь?"
        description="Вы можете записаться на ознакомительную сессию или написать мне в Telegram для уточнения вопросов."
        primaryCTA={
          <Button 
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
    </>
  );
}
