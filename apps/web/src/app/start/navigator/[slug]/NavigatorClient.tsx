'use client';

import React, { useState, useEffect } from 'react';
import { ProgressBar, ResultCard, CrisisBanner, Button } from '@psychology/design-system/components';
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
      <div className="text-center py-12">
        <h1 className="text-3xl font-bold text-slate-900 mb-4">{definition.title || 'Навигатор состояния'}</h1>
        <p className="text-lg text-slate-600 mb-8 max-w-xl mx-auto">
          Ответьте на несколько вопросов, чтобы мы могли подобрать для вас наиболее подходящие ресурсы и план действий.
        </p>
        <Button onClick={startNavigator} size="lg" variant="primary">
          Начать
        </Button>
      </div>
    );
  }

  if (step === 'progress' && currentStep) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 max-w-2xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <Button variant="secondary" onClick={handleBack} disabled={history.length === 0}>
            Назад
          </Button>
          <div className="text-sm text-slate-500">
            Шаг {history.length + 1}
          </div>
        </div>
        
        <fieldset className="mb-8">
          <legend className="text-2xl font-semibold text-slate-900 mb-8">
            {currentStep.question_text}
          </legend>

          <div className="grid grid-cols-1 gap-4" role="radiogroup" aria-labelledby="navigator-question">
            {currentStep.choices.map((choice: any, index: number) => (
              <button
                key={choice.choice_id}
                onClick={() => handleChoice(choice)}
                role="radio"
                aria-checked="false"
                aria-label={choice.text}
                aria-describedby={`choice-${choice.choice_id}-desc`}
                className="text-left px-6 py-4 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all text-slate-700 font-medium text-lg"
                tabIndex={index === 0 ? 0 : -1}
              >
                <span id={`choice-${choice.choice_id}-desc`}>{choice.text}</span>
              </button>
            ))}
          </div>
        </fieldset>

        {crisisTriggered && isCrisisVisible && (
          <div className="mt-8">
            <CrisisBanner 
              surface="navigator" 
              triggerType="panic_like" 
              onBackToResources={() => setIsCrisisVisible(false)}
            />
          </div>
        )}
      </div>
    );
  }

  if (step === 'result' && finalResultProfile) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto">
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
          <div className="mt-8 space-y-6">
            {finalResultProfile.recommendations && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {finalResultProfile.recommendations.articles && finalResultProfile.recommendations.articles.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-3">Статьи</h4>
                    <ul className="space-y-2">
                      {finalResultProfile.recommendations.articles.map((item: string, i: number) => (
                        <li key={i} className="text-slate-600 flex items-start gap-2">
                          <span className="text-indigo-500">•</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {finalResultProfile.recommendations.exercises && finalResultProfile.recommendations.exercises.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-3">Упражнения</h4>
                    <ul className="space-y-2">
                      {finalResultProfile.recommendations.exercises.map((item: string, i: number) => (
                        <li key={i} className="text-slate-600 flex items-start gap-2">
                          <span className="text-indigo-500">•</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
              {finalResultProfile.cta ? (
                <Button 
                  variant={crisisTriggered ? "secondary" : "primary"} 
                  onClick={() => window.location.href = finalResultProfile.cta.link}
                >
                  {finalResultProfile.cta.text}
                </Button>
              ) : (
                <Button 
                  variant={crisisTriggered ? "secondary" : "primary"} 
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

        <div className="text-center pt-8">
          <Button variant="secondary" onClick={() => window.location.href = '/start'}>
            Вернуться к началу
          </Button>
        </div>
      </div>
    );
  }

  return null;
};
