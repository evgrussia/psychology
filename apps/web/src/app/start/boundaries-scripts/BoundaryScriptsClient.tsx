'use client';

import React, { useState, useEffect } from 'react';
import { ProgressBar, Button, CrisisBanner, Card, Section, Container } from '@psychology/design-system/components';
import { typography } from '@psychology/design-system/tokens';
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
    // Focus heading on step change for accessibility and E2E tests
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
    // Set UI state and track immediately to provide feedback even if clipboard fails
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
        <Container maxWidth="800px">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            <CrisisBanner 
              surface="boundaries_script" 
              triggerType="violence" 
              onBackToResources={() => reset()}
            />
            <div style={{ textAlign: 'center', paddingTop: 'var(--space-8)' }}>
              <Button variant="secondary" onClick={reset}>
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            <h2 ref={headingRef} tabIndex={-1} style={{ ...typography.h2, textAlign: 'center', outline: 'none' }}>Выберите ситуацию</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
              {config.scenarios.map((s: any) => (
                <button
                  key={s.id}
                  onClick={() => handleScenarioSelect(s.id)}
                  style={{
                    padding: 'var(--space-6)',
                    textAlign: 'left',
                    border: '1px solid var(--color-border-primary)',
                    borderRadius: 'var(--radius-md)',
                    transition: 'var(--transition-normal)',
                    backgroundColor: 'var(--color-bg-primary)',
                    boxShadow: 'var(--shadow-sm)',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--color-brand-primary)'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--color-border-primary)'}
                >
                  <div style={{ ...typography.h4, color: 'var(--color-text-primary)' }}>{s.name}</div>
                  {s.description && <div style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-body-sm)', marginTop: 'var(--space-1)' }}>{s.description}</div>}
                </button>
              ))}
            </div>
          </div>
        );
      case 'tone':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            <h2 style={{ ...typography.h2, textAlign: 'center' }}>Выберите стиль общения</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {config.tones.map((t: any) => (
                <Button key={t.id} onClick={() => handleToneSelect(t.id)} variant="secondary" size="lg" fullWidth>
                  {t.name}
                </Button>
              ))}
            </div>
            <div style={{ textAlign: 'center' }}>
               <button onClick={() => setStep('scenario')} style={{ color: 'var(--color-brand-primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}>
                  ← Назад к выбору ситуации
               </button>
            </div>
          </div>
        );
      case 'goal':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            <h2 style={{ ...typography.h2, textAlign: 'center' }}>Чего хотите добиться?</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {config.goals.map((g: any) => (
                <Button key={g.id} onClick={() => handleGoalSelect(g.id)} variant="secondary" size="lg" fullWidth>
                  {g.name}
                </Button>
              ))}
            </div>
            <div style={{ textAlign: 'center' }}>
               <button onClick={() => setStep('tone')} style={{ color: 'var(--color-brand-primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}>
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
    scenario: 1,
    tone: 2,
    goal: 3,
    result: 4,
  };

  return (
    <Section>
      <Container maxWidth="800px">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
          {/* A11y: aria-live region for toast notifications */}
          <div 
            aria-live="polite" 
            aria-atomic="true" 
            style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', border: 0 }}
          >
            {copiedVariantId && 'Фраза скопирована'}
          </div>
          <div style={{ padding: '0 var(--space-4)' }}>
            <ProgressBar current={stepToProgress[step]} total={4} />
          </div>
          <div style={{ padding: '0 var(--space-4)' }}>
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
  useEffect(() => {
    variants.forEach((v: any) => {
      InteractivePlatform.trackBoundariesVariantViewed(v.variant_id, scenario, tone);
    });
  }, [variants, scenario, tone]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-center">Варианты фраз</h2>
      {variants.length > 0 ? (
        <div className="space-y-4">
          {variants.map((v: any) => (
            <Card key={v.variant_id} className="p-6">
              <p className="text-lg text-slate-800 mb-4 italic">"{v.text}"</p>
              <div className="flex justify-end">
                <Button
                  onClick={() => onCopy(v.variant_id, v.text)}
                  variant={copiedVariantId === v.variant_id ? 'primary' : 'secondary'}
                  size="sm"
                >
                  {copiedVariantId === v.variant_id ? 'Скопировано!' : 'Скопировать'}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-slate-500 bg-white rounded-xl border border-dashed border-slate-300">
          К сожалению, для этой комбинации нет готовых фраз. Попробуйте сменить стиль или цель.
        </div>
      )}

      <div className="p-6 bg-indigo-50 border border-indigo-100 rounded-xl">
        <h3 className="font-bold text-indigo-900 mb-2">Что делать, если продолжают давить?</h3>
        <p className="text-indigo-800">{safetyText}</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
        <Button onClick={onReset} variant="secondary">
          Попробовать другой вариант
        </Button>
        <Button onClick={() => (window.location.href = 'https://t.me/psy_balance_bot')} variant="secondary">
          Больше техник в Telegram
        </Button>
      </div>
    </div>
  );
};
