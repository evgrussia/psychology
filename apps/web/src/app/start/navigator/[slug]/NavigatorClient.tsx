'use client';

import React, { useState, useEffect } from 'react';
import { ProgressBar, ResultCard, CrisisBanner, Button, Section, Container, Card } from '@psychology/design-system/components';
import { typography } from '@psychology/design-system/tokens';
import { InteractivePlatform, ResultLevel } from '@/lib/interactive';
import SafeMarkdownRenderer from '@/components/SafeMarkdownRenderer';

interface NavigatorClientProps {
  definition: any; // NavigatorConfig
  slug: string;
}

export const NavigatorClient: React.FC<NavigatorClientProps> = ({ definition, slug }) => {
  const [step, setStep] = useState<'start' | 'progress' | 'result'>('start');
  const [currentStepId, setCurrentStepId] = useState<string>(definition.initial_step_id);
  const [history, setHistory] = useState<string[]>([]);
  const [runId, setRunId] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<number>(0);
  const [finalResultProfile, setFinalResultProfile] = useState<any>(null);
  const [crisisTriggered, setCrisisTriggered] = useState(false);
  const [isCrisisVisible, setIsCrisisVisible] = useState(true);

  const currentStep = definition.steps.find((s: any) => s.step_id === currentStepId);

  const startNavigator = async () => {
    const id = await InteractivePlatform.startRun({
      interactive_type: 'navigator',
      interactive_slug: slug,
    });
    setRunId(id);
    setStartTime(Date.now());
    setStep('progress');
    InteractivePlatform.trackNavigatorStart(slug);
  };

  const handleChoice = (choice: any) => {
    // step_index начинается с 1 (первый шаг после старта)
    const stepIndex = history.length + 1;
    InteractivePlatform.trackNavigatorStepCompleted(slug, stepIndex, choice.choice_id);

    if (choice.crisis_trigger) {
      setCrisisTriggered(true);
      setIsCrisisVisible(true);
      InteractivePlatform.trackCrisisTriggered('navigator_trigger', 'navigator');
    }

    if (choice.next_step_id) {
      setHistory([...history, currentStepId]);
      setCurrentStepId(choice.next_step_id);
    } else if (choice.result_profile_id) {
      const resultProfile = definition.result_profiles.find(
        (rp: any) => rp.id === choice.result_profile_id
      );
      finishNavigator(resultProfile);
    }
  };

  const handleBack = () => {
    if (history.length > 0) {
      const newHistory = [...history];
      const prevStepId = newHistory.pop()!;
      setHistory(newHistory);
      setCurrentStepId(prevStepId);
    }
  };

  const finishNavigator = async (resultProfile: any) => {
    const durationMs = Date.now() - startTime;
    setFinalResultProfile(resultProfile);

    if (runId) {
      await InteractivePlatform.completeRun({
        runId,
        resultProfile: resultProfile.id,
        durationMs,
        crisisTriggered,
        crisisTriggerType: crisisTriggered ? 'navigator_trigger' : undefined,
      });
    }

    InteractivePlatform.trackNavigatorComplete(slug, resultProfile.id, durationMs);
    setStep('result');
  };

  if (step === 'start') {
    return (
      <Section>
        <Container maxWidth="600px">
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
            <h1 style={{ ...typography.hero, color: 'var(--color-text-primary)' }}>{definition.title || 'Навигатор состояния'}</h1>
            <p style={{ ...typography.body.lg, color: 'var(--color-text-secondary)' }}>
              Ответьте на несколько вопросов, чтобы мы могли подобрать для вас наиболее подходящие ресурсы и план действий.
            </p>
            <Button onClick={startNavigator} size="lg" variant="primary" fullWidth>
              Начать
            </Button>
          </div>
        </Container>
      </Section>
    );
  }

  if (step === 'progress' && currentStep) {
    return (
      <Section>
        <Container maxWidth="600px">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
              <Button variant="ghost" onClick={handleBack} disabled={history.length === 0} size="sm">
                ← Назад
              </Button>
              <div style={{ fontSize: 'var(--font-size-body-sm)', color: 'var(--color-text-tertiary)', fontWeight: 500 }}>
                Шаг {history.length + 1}
              </div>
            </div>
            
            <Card style={{ padding: 'var(--space-8)' }} variant="elevated">
              <fieldset style={{ border: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
                <legend style={{ ...typography.h3, color: 'var(--color-text-primary)', marginBottom: 0 }}>
                  {currentStep.question_text}
                </legend>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--space-3)' }} role="radiogroup" aria-labelledby="navigator-question">
                  {currentStep.choices.map((choice: any, index: number) => (
                    <button
                      key={choice.choice_id}
                      onClick={() => handleChoice(choice)}
                      role="radio"
                      aria-checked="false"
                      aria-label={choice.text}
                      aria-describedby={`choice-${choice.choice_id}-desc`}
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
                      tabIndex={index === 0 ? 0 : -1}
                    >
                      <span id={`choice-${choice.choice_id}-desc`}>{choice.text}</span>
                    </button>
                  ))}
                </div>
              </fieldset>
            </Card>

            {crisisTriggered && isCrisisVisible && (
              <CrisisBanner 
                surface="navigator" 
                triggerType="panic_like" 
                onBackToResources={() => setIsCrisisVisible(false)}
              />
            )}
          </div>
        </Container>
      </Section>
    );
  }

  if (step === 'result' && finalResultProfile) {
    return (
      <Section>
        <Container maxWidth="800px">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
            {crisisTriggered && isCrisisVisible && (
              <CrisisBanner 
                surface="navigator_result" 
                triggerType="panic_like" 
                onBackToResources={() => setIsCrisisVisible(false)}
              />
            )}
            
            <ResultCard
              title={finalResultProfile.title}
              description={finalResultProfile.description}
            >
              <div style={{ marginTop: 'var(--space-8)', display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
                {finalResultProfile.recommendations && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--space-8)' }}>
                    {finalResultProfile.recommendations.articles && finalResultProfile.recommendations.articles.length > 0 && (
                      <div>
                        <h4 style={{ ...typography.h4, color: 'var(--color-text-primary)', marginBottom: 'var(--space-3)' }}>Статьи</h4>
                        <ul style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', listStyle: 'none' }}>
                          {finalResultProfile.recommendations.articles.map((item: string, i: number) => (
                            <li key={i} style={{ color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'flex-start', gap: 'var(--space-2)' }}>
                              <span style={{ color: 'var(--color-brand-primary)' }}>•</span>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {finalResultProfile.recommendations.exercises && finalResultProfile.recommendations.exercises.length > 0 && (
                      <div>
                        <h4 style={{ ...typography.h4, color: 'var(--color-text-primary)', marginBottom: 'var(--space-3)' }}>Упражнения</h4>
                        <ul style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', listStyle: 'none' }}>
                          {finalResultProfile.recommendations.exercises.map((item: string, i: number) => (
                            <li key={i} style={{ color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'flex-start', gap: 'var(--space-2)' }}>
                              <span style={{ color: 'var(--color-brand-primary)' }}>•</span>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                <div style={{ marginTop: 'var(--space-8)', display: 'flex', flexDirection: 'row', gap: 'var(--space-4)', justifyContent: 'center', flexWrap: 'wrap' }}>
                  {finalResultProfile.cta ? (
                    <Button 
                      variant={crisisTriggered ? "tertiary" : "primary"} 
                      onClick={() => window.location.href = finalResultProfile.cta.link}
                    >
                      {finalResultProfile.cta.text}
                    </Button>
                  ) : (
                    <Button 
                      variant={crisisTriggered ? "tertiary" : "primary"} 
                      onClick={() => window.location.href = 'https://t.me/psy_balance_bot'}
                    >
                      Получить план в Telegram
                    </Button>
                  )}
                  <Button 
                    variant="secondary" 
                    onClick={() => window.location.href = '/booking'}
                  >
                    Записаться к психологу
                  </Button>
                </div>
              </div>
            </ResultCard>

            <div style={{ textAlign: 'center', paddingTop: 'var(--space-8)' }}>
              <Button variant="ghost" onClick={() => window.location.href = '/start'}>
                ← Вернуться к началу
              </Button>
            </div>
          </div>
        </Container>
      </Section>
    );
  }

  return null;
};
