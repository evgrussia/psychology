'use client';

import React, { useState } from 'react';
import { ResultCard, CrisisBanner, Button, Section, Container, Card } from '@psychology/design-system';
import { InteractivePlatform, type CrisisTriggerType } from '@/lib/interactive';
import { createTelegramDeepLink } from '@/lib/telegram';
import { track } from '@/lib/tracking';

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
  const [crisisTriggerType, setCrisisTriggerType] = useState<CrisisTriggerType | null>(null);
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
    InteractivePlatform.trackNavigatorStart(slug, id);
  };

  const handleChoice = (choice: any) => {
    const stepIndex = history.length + 1;
    InteractivePlatform.trackNavigatorStepCompleted(slug, stepIndex, choice.choice_id, runId ?? undefined);

    if (choice.crisis_trigger) {
      setCrisisTriggered(true);
      setIsCrisisVisible(true);
      const resolvedTrigger = (choice.crisis_trigger_type as CrisisTriggerType | undefined) ?? 'minor_risk';
      setCrisisTriggerType(resolvedTrigger);
      InteractivePlatform.trackCrisisTriggered(resolvedTrigger, 'other');
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
        crisisTriggerType: crisisTriggered ? crisisTriggerType ?? 'minor_risk' : undefined,
      });
    }

    InteractivePlatform.trackNavigatorComplete(slug, resultProfile.id, durationMs, runId ?? undefined);
    setStep('result');
  };

  const handleTelegram = async (ctaId: string) => {
    const { deepLinkId, url } = await createTelegramDeepLink({
      flow: 'plan_7d',
      tgTarget: 'bot',
      source: `/start/navigator/${slug}`,
      utmMedium: 'bot',
      utmContent: ctaId,
    });
    track('cta_tg_click', {
      tg_target: 'bot',
      tg_flow: 'plan_7d',
      deep_link_id: deepLinkId,
      cta_id: ctaId,
    });
    window.location.href = url;
  };

  if (step === 'start') {
    return (
      <Section>
        <Container className="max-w-xl text-center flex flex-col gap-8">
          <h1 className="text-4xl font-bold text-foreground">{definition.title || 'Навигатор состояния'}</h1>
          <p className="text-lg text-muted-foreground">
            Ответьте на несколько вопросов, чтобы мы могли подобрать для вас наиболее подходящие ресурсы и план действий.
          </p>
          <Button onClick={startNavigator} size="lg" className="w-full">
            Начать
          </Button>
        </Container>
      </Section>
    );
  }

  if (step === 'progress' && currentStep) {
    return (
      <Section>
        <Container className="max-w-xl">
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between mb-4">
              <Button variant="ghost" onClick={handleBack} disabled={history.length === 0} size="sm">
                ← Назад
              </Button>
              <div className="text-sm font-medium text-muted-foreground">
                Шаг {history.length + 1}
              </div>
            </div>
            
            <Card className="p-8">
              <fieldset className="border-none p-0 m-0 flex flex-col gap-8">
                <legend className="text-2xl font-bold text-foreground mb-4">
                  {currentStep.question_text}
                </legend>

                <div className="grid grid-cols-1 gap-3" role="radiogroup">
                  {currentStep.choices.map((choice: any, index: number) => (
                    <Button
                      key={choice.choice_id}
                      variant="outline"
                      className="justify-start h-auto py-4 px-6 text-left whitespace-normal font-medium"
                      onClick={() => handleChoice(choice)}
                    >
                      {choice.text}
                    </Button>
                  ))}
                </div>
              </fieldset>
            </Card>

            {crisisTriggered && isCrisisVisible && (
              <CrisisBanner 
                className="mt-4"
                message="Похоже, вы переживаете сложный момент. Пожалуйста, рассмотрите возможность обращения за экстренной помощью."
              />
            )}
          </div>
        </Container>
      </Section>
    );
  }

  if (step === 'result' && finalResultProfile) {
    const steps = [];
    if (finalResultProfile.recommendations) {
      if (finalResultProfile.recommendations.articles?.length) {
        steps.push({ title: 'Статьи', items: finalResultProfile.recommendations.articles });
      }
      if (finalResultProfile.recommendations.exercises?.length) {
        steps.push({ title: 'Упражнения', items: finalResultProfile.recommendations.exercises });
      }
    }

    return (
      <Section>
        <Container className="max-w-3xl">
          <div className="flex flex-col gap-8">
            {crisisTriggered && isCrisisVisible && (
              <CrisisBanner 
                className="mb-4"
                message="Ваш результат указывает на необходимость профессиональной поддержки."
              />
            )}
            
            <ResultCard
              title={finalResultProfile.title}
              description={finalResultProfile.description}
              steps={steps}
              level={crisisTriggered ? 'high' : 'low'}
            >
              <div className="mt-8 flex flex-wrap gap-4 justify-center">
                {finalResultProfile.cta ? (
                  <Button 
                    onClick={() => window.location.href = finalResultProfile.cta.link}
                  >
                    {finalResultProfile.cta.text}
                  </Button>
                ) : (
                  <Button onClick={() => void handleTelegram(`navigator_${slug}_result`)}>
                    Получить план в Telegram
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  onClick={() => window.location.href = '/booking'}
                >
                  Записаться к психологу
                </Button>
              </div>
            </ResultCard>

            <div className="text-center pt-8">
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
