'use client';

import React, { useState, useEffect } from 'react';
import { ProgressBar, ResultCard, CrisisBanner, Button, Section, Container, Card } from '@psychology/design-system/components';
import { typography } from '@psychology/design-system/tokens';
import { InteractivePlatform, ResultLevel } from '@/lib/interactive';

interface QuizClientProps {
  quiz: {
    id: string;
    slug: string;
    title: string;
    description?: string;
    config: {
      questions: {
        id: string;
        text: string;
        options: { value: number; text: string }[];
      }[];
      thresholds: {
        level: ResultLevel;
        minScore: number;
        maxScore: number;
      }[];
      results: {
        level: ResultLevel;
        title: string;
        description: string;
        recommendations: {
          now: string[];
          week: string[];
          whenToSeekHelp?: string;
        };
        ctaText?: string;
      }[];
      crisisTrigger?: {
        questionId?: string;
        thresholdScore?: number;
      };
    };
  };
}

export const QuizClient: React.FC<QuizClientProps> = ({ quiz }) => {
  const [step, setStep] = useState<'start' | 'progress' | 'result'>('start');
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [runId, setRunId] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<number>(0);
  const [resultLevel, setResultLevel] = useState<ResultLevel | null>(null);
  const [isCrisisVisible, setIsCrisisVisible] = useState(true);

  const { questions, thresholds, results, crisisTrigger } = quiz.config;

  const startQuiz = async () => {
    const id = await InteractivePlatform.startRun({
      interactive_type: 'quiz',
      interactive_slug: quiz.slug,
    });
    setRunId(id);
    setStartTime(Date.now());
    setStep('progress');
    InteractivePlatform.trackStart('quiz', quiz.slug);
  };

  const handleAnswer = (value: number) => {
    const newAnswers = [...answers, value];
    setAnswers(newAnswers);

    if (currentQuestionIdx < questions.length - 1) {
      setCurrentQuestionIdx(currentQuestionIdx + 1);
    } else {
      finishQuiz(newAnswers);
    }
  };

  const finishQuiz = async (finalAnswers: number[]) => {
    const score = finalAnswers.reduce((a, b) => a + b, 0);
    const durationMs = Date.now() - startTime;
    
    // Find result level based on thresholds
    const matchedThreshold = thresholds.find(
      t => score >= t.minScore && score <= t.maxScore
    ) || thresholds[thresholds.length - 1];
    
    const finalResultLevel = matchedThreshold.level;
    setResultLevel(finalResultLevel);

    // Crisis trigger logic
    let crisisTriggered = false;
    if (crisisTrigger) {
      if (crisisTrigger.thresholdScore !== undefined && score >= crisisTrigger.thresholdScore) {
        crisisTriggered = true;
      }
      // question-based trigger could be added here if needed
    } else if (finalResultLevel === ResultLevel.HIGH) {
      // Default fallback: HIGH level triggers crisis banner for certain topics
      if (['anxiety', 'burnout'].includes(quiz.slug)) {
        crisisTriggered = true;
      }
    }

    if (runId) {
      await InteractivePlatform.completeRun({
        runId,
        resultLevel: finalResultLevel,
        durationMs,
        crisisTriggered,
        crisisTriggerType: crisisTriggered ? 'high_score' : undefined,
      });
    }

    InteractivePlatform.trackComplete('quiz', quiz.slug, {
      result_level: finalResultLevel,
      duration_ms: durationMs,
    });

    if (crisisTriggered) {
      InteractivePlatform.trackCrisisTriggered('high_score', 'quiz_result');
    }

    setStep('result');
  };

  if (step === 'start') {
    return (
      <Section>
        <Container maxWidth="600px">
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
            <h1 style={{ ...typography.hero, color: 'var(--color-text-primary)' }}>{quiz.title}</h1>
            <p style={{ ...typography.body.lg, color: 'var(--color-text-secondary)' }}>
              {quiz.description || 'Пройдите этот тест, чтобы лучше понять свое состояние.'}
            </p>
            <Button onClick={startQuiz} size="lg" variant="primary" fullWidth>
              Начать тест
            </Button>
          </div>
        </Container>
      </Section>
    );
  }

  if (step === 'progress') {
    const currentQuestion = questions[currentQuestionIdx];
    return (
      <Section>
        <Container maxWidth="600px">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-size-body-sm)', fontWeight: 500, color: 'var(--color-text-tertiary)' }}>
                <span>Вопрос {currentQuestionIdx + 1} из {questions.length}</span>
                <span>{Math.round(((currentQuestionIdx + 1) / questions.length) * 100)}%</span>
              </div>
              <ProgressBar current={currentQuestionIdx + 1} total={questions.length} />
            </div>
            
            <Card style={{ padding: 'var(--space-8)' }} variant="elevated">
              <h2 style={{ ...typography.h3, color: 'var(--color-text-primary)', marginBottom: 'var(--space-8)' }}>
                {currentQuestion.text}
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--space-3)' }}>
                {currentQuestion.options.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleAnswer(option.value)}
                    style={{
                      textAlign: 'left',
                      padding: 'var(--space-4) var(--space-6)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--color-border-primary)',
                      backgroundColor: 'var(--color-bg-primary)',
                      transition: 'var(--transition-normal)',
                      color: 'var(--color-text-primary)',
                      fontWeight: 500,
                      fontSize: 'var(--font-size-body)',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--color-brand-primary)';
                      e.currentTarget.style.backgroundColor = 'var(--color-bg-secondary)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--color-border-primary)';
                      e.currentTarget.style.backgroundColor = 'var(--color-bg-primary)';
                    }}
                  >
                    {option.text}
                  </button>
                ))}
              </div>
            </Card>
          </div>
        </Container>
      </Section>
    );
  }

  const score = answers.reduce((a, b) => a + b, 0);
  const resultData = results.find(r => r.level === resultLevel) || results[0];
  const isHighRisk = resultLevel === ResultLevel.HIGH;

  const steps = [
    { title: 'Прямо сейчас', items: resultData.recommendations.now },
    { title: 'На этой неделе', items: resultData.recommendations.week },
  ];

  if (resultData.recommendations.whenToSeekHelp) {
    steps.push({ title: 'Когда стоит обратиться к специалисту', items: [resultData.recommendations.whenToSeekHelp] });
  }

  return (
    <Section>
      <Container maxWidth="800px">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
          {isHighRisk && isCrisisVisible && (
            <CrisisBanner 
              surface="quiz_result" 
              triggerType="panic_like" 
              onBackToResources={() => setIsCrisisVisible(false)}
            />
          )}
          
          <ResultCard
            title={resultData.title}
            level={resultLevel as any}
            description={resultData.description}
            steps={steps}
          >
            <div style={{ marginTop: 'var(--space-8)', display: 'flex', flexDirection: 'row', gap: 'var(--space-4)', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button 
                variant={isHighRisk ? "tertiary" : "primary"} 
                onClick={() => window.location.href = 'https://t.me/psy_balance_bot'}
              >
                {resultData.ctaText || 'Получить план в Telegram'}
              </Button>
              <Button 
                variant="secondary" 
                onClick={() => window.location.href = '/booking'}
              >
                Записаться к психологу
              </Button>
            </div>
          </ResultCard>

          <div style={{ textAlign: 'center', paddingTop: 'var(--space-8)' }}>
            <Button variant="ghost" onClick={() => window.location.href = '/start'}>
              ← Вернуться к списку тестов
            </Button>
          </div>
        </div>
      </Container>
    </Section>
  );
};
