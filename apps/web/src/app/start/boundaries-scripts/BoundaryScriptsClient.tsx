'use client';

import React, { useState, useEffect } from 'react';
import { ProgressBar, Button, CrisisBanner, Card, Section, Container } from '@psychology/design-system';
import { InteractivePlatform } from '@/lib/interactive';

interface BoundaryScriptsClientProps {
  data: {
    id: string;
    slug: string;
    title: string;
    config: any; // BoundariesConfig
  };
}

export const BoundaryScriptsClient: React.FC<BoundaryScriptsClientProps> = ({ data }) => {
  const { config } = data;
  const [step, setStep] = useState<'scenario' | 'tone' | 'goal' | 'result'>('scenario');
  const [selections, setSelections] = useState({
    scenario: '',
    tone: '',
    goal: '',
  });
  const [isCrisisVisible, setIsCrisisVisible] = useState(false);
  const [copiedVariantId, setCopiedVariantId] = useState<string | null>(null);

  const headingRef = React.useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (headingRef.current) {
      headingRef.current.focus();
    }
  }, [step]);

  const handleScenarioSelect = (id: string) => {
    setSelections({ ...selections, scenario: id });
    const scenario = config.scenarios.find((s: any) => s.id === id);
    if (scenario?.is_unsafe) {
      setIsCrisisVisible(true);
      InteractivePlatform.trackCrisisTriggered('violence_risk', 'boundaries_script_scenario');
    } else {
      setStep('tone');
    }
  };

  const handleToneSelect = (id: string) => {
    setSelections({ ...selections, tone: id });
    setStep('goal');
    InteractivePlatform.trackBoundariesStart(selections.scenario, id);
  };

  const handleGoalSelect = (id: string) => {
    setSelections({ ...selections, goal: id });
    setStep('result');
  };

  const handleCopy = async (variantId: string, text: string) => {
    setCopiedVariantId(variantId);
    InteractivePlatform.trackBoundariesCopied(variantId);
    setTimeout(() => setCopiedVariantId(null), 2000);

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        console.warn('Clipboard API not available');
      }
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const reset = () => {
    setStep('scenario');
    setSelections({ scenario: '', tone: '', goal: '' });
    setIsCrisisVisible(false);
  };

  if (isCrisisVisible) {
    return (
      <Section>
        <Container className="max-w-3xl">
          <div className="flex flex-col gap-6">
            <CrisisBanner 
              message="Ваша ситуация может быть опасной. Пожалуйста, обратитесь за помощью к специалистам или в службы поддержки."
            />
            <div className="text-center pt-8">
              <Button variant="outline" onClick={reset}>
                Вернуться к выбору сценария
              </Button>
            </div>
          </div>
        </Container>
      </Section>
    );
  }

  const renderStep = () => {
    switch (step) {
      case 'scenario':
        return (
          <div className="flex flex-col gap-8">
            <h2 ref={headingRef} tabIndex={-1} className="text-3xl font-bold text-center outline-none">Выберите ситуацию</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {config.scenarios.map((s: any) => (
                <Button
                  key={s.id}
                  onClick={() => handleScenarioSelect(s.id)}
                  variant="outline"
                  className="p-6 text-left h-auto flex flex-col items-start border border-border rounded-xl transition-all bg-card hover:border-primary shadow-sm group"
                >
                  <div className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">{s.name}</div>
                  {s.description && <div className="text-muted-foreground text-sm mt-2 leading-relaxed whitespace-normal">{s.description}</div>}
                </Button>
              ))}
            </div>
          </div>
        );
      case 'tone':
        return (
          <div className="flex flex-col gap-8">
            <h2 ref={headingRef} tabIndex={-1} className="text-3xl font-bold text-center outline-none">Выберите стиль общения</h2>
            <div className="flex flex-col gap-3 max-w-md mx-auto w-full">
              {config.tones.map((t: any) => (
                <Button key={t.id} onClick={() => handleToneSelect(t.id)} variant="outline" size="lg" className="w-full justify-start h-auto py-4">
                  {t.name}
                </Button>
              ))}
            </div>
            <div className="text-center">
               <button onClick={() => setStep('scenario')} className="text-primary hover:underline font-medium">
                  ← Назад к выбору ситуации
               </button>
            </div>
          </div>
        );
      case 'goal':
        return (
          <div className="flex flex-col gap-8">
            <h2 ref={headingRef} tabIndex={-1} className="text-3xl font-bold text-center outline-none">Чего хотите добиться?</h2>
            <div className="flex flex-col gap-3 max-w-md mx-auto w-full">
              {config.goals.map((g: any) => (
                <Button key={g.id} onClick={() => handleGoalSelect(g.id)} variant="outline" size="lg" className="w-full justify-start h-auto py-4">
                  {g.name}
                </Button>
              ))}
            </div>
            <div className="text-center">
               <button onClick={() => setStep('tone')} className="text-primary hover:underline font-medium">
                  ← Назад к выбору стиля
               </button>
            </div>
          </div>
        );
      case 'result':
        const matrixItem = config.matrix.find(
          (m: any) =>
            m.scenario_id === selections.scenario &&
            m.tone_id === selections.tone &&
            m.goal_id === selections.goal
        );

        const variants = matrixItem?.variants || [];

        return (
          <ResultView 
            variants={variants} 
            scenario={selections.scenario}
            tone={selections.tone}
            safetyText={config.safety_block.text} 
            onCopy={handleCopy} 
            copiedVariantId={copiedVariantId}
            onReset={reset}
          />
        );
    }
  };

  const stepToProgress = {
    scenario: 25,
    tone: 50,
    goal: 75,
    result: 100,
  };

  return (
    <Section>
      <Container className="max-w-3xl">
        <div className="flex flex-col gap-12">
          <div 
            aria-live="polite" 
            aria-atomic="true" 
            className="sr-only"
          >
            {copiedVariantId && 'Фраза скопирована'}
          </div>
          <div className="px-4">
            <ProgressBar value={stepToProgress[step]} label={`Шаг ${step === 'result' ? '4' : step === 'goal' ? '3' : step === 'tone' ? '2' : '1'} из 4`} showValue />
          </div>
          <div className="px-4">
            {renderStep()}
          </div>
        </div>
      </Container>
    </Section>
  );
};

interface ResultViewProps {
  variants: any[];
  scenario: string;
  tone: string;
  safetyText: string;
  onCopy: (id: string, text: string) => void;
  copiedVariantId: string | null;
  onReset: () => void;
}

const ResultView: React.FC<ResultViewProps> = ({ variants, scenario, tone, safetyText, onCopy, copiedVariantId, onReset }) => {
  const headingRef = React.useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (headingRef.current) {
      headingRef.current.focus();
    }
    variants.forEach((v: any) => {
      InteractivePlatform.trackBoundariesVariantViewed(v.variant_id, scenario, tone);
    });
  }, [variants, scenario, tone]);

  return (
    <div className="space-y-8">
      <h2 ref={headingRef} tabIndex={-1} className="text-3xl font-bold text-center outline-none">Варианты фраз</h2>
      {variants.length > 0 ? (
        <div className="space-y-4">
          {variants.map((v: any) => (
            <Card key={v.variant_id} className="p-6">
              <p className="text-xl text-foreground mb-6 italic leading-relaxed text-balance">"{v.text}"</p>
              <div className="flex justify-end">
                <Button
                  onClick={() => onCopy(v.variant_id, v.text)}
                  variant={copiedVariantId === v.variant_id ? 'default' : 'outline'}
                  size="sm"
                >
                  {copiedVariantId === v.variant_id ? 'Скопировано!' : 'Скопировать'}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-muted-foreground bg-muted/50 rounded-2xl border border-dashed border-border">
          К сожалению, для этой комбинации нет готовых фраз. Попробуйте сменить стиль или цель.
        </div>
      )}

      <div className="p-6 bg-primary/5 border border-primary/10 rounded-2xl">
        <h3 className="text-lg font-bold text-primary mb-3">Что делать, если продолжают давить?</h3>
        <p className="text-muted-foreground leading-relaxed">{safetyText}</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
        <Button onClick={onReset} variant="outline">
          Попробовать другой вариант
        </Button>
        <Button onClick={() => (window.location.href = 'https://t.me/psy_balance_bot')}>
          Больше техник в Telegram
        </Button>
      </div>
    </div>
  );
};
