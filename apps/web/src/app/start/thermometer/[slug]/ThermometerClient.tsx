'use client';

import React from 'react';
import { Button, Card, ProgressBar, Section, Container, ResultCard, CrisisBanner } from '@psychology/design-system';
import { InteractivePlatform, ResultLevel } from '@/lib/interactive';
import { createTelegramDeepLink } from '@/lib/telegram';
import { track } from '@/lib/tracking';

type ThermometerScaleId = 'energy' | 'tension' | 'support';

type ThermometerScale = {
  id: ThermometerScaleId;
  title: string;
  description?: string;
  minLabel?: string;
  maxLabel?: string;
  minValue?: number;
  maxValue?: number;
};

type ThermometerThreshold = {
  level: ResultLevel;
  minScore: number;
  maxScore: number;
};

type ThermometerResult = {
  level: ResultLevel;
  title: string;
  description: string;
  recommendations: {
    now: string[];
    nextDays?: string[];
    whenToSeekHelp?: string;
  };
  ctaText?: string;
};

type ThermometerConfig = {
  intro?: string;
  scales: ThermometerScale[];
  thresholds: ThermometerThreshold[];
  results: ThermometerResult[];
};

type ThermometerDefinition = {
  id: string;
  slug: string;
  title: string;
  topicCode: string | null;
  config: ThermometerConfig;
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function computeScore(answers: Record<ThermometerScaleId, number>, scales: ThermometerScale[]) {
  // Default scoring rule (0..30):
  // score = energy + support + (10 - tension)
  const energy = answers.energy ?? 0;
  const support = answers.support ?? 0;
  const tension = answers.tension ?? 0;

  const energyMax = scales.find((s) => s.id === 'energy')?.maxValue ?? 10;
  const supportMax = scales.find((s) => s.id === 'support')?.maxValue ?? 10;
  const tensionMax = scales.find((s) => s.id === 'tension')?.maxValue ?? 10;

  const score = energy + support + (tensionMax - tension);
  // Keep within theoretical bounds
  return clamp(score, 0, energyMax + supportMax + tensionMax);
}

function resolveLevel(score: number, thresholds: ThermometerThreshold[]): ResultLevel {
  const match = thresholds.find((t) => score >= t.minScore && score <= t.maxScore);
  return match?.level ?? ResultLevel.MODERATE;
}

export function ThermometerClient({ definition, slug }: { definition: ThermometerDefinition; slug: string }) {
  const [stepIndex, setStepIndex] = React.useState<number>(-1); // -1 intro
  const [answers, setAnswers] = React.useState<Record<ThermometerScaleId, number>>({
    energy: 5,
    tension: 5,
    support: 5,
  });
  const [runId, setRunId] = React.useState<string | null>(null);
  const [startTime, setStartTime] = React.useState<number>(0);
  const [result, setResult] = React.useState<{ level: ResultLevel; score: number; model: ThermometerResult } | null>(null);
  const [isCrisisVisible] = React.useState(true);

  const scales = definition.config.scales ?? [];
  const totalSteps = scales.length;
  const currentScale = stepIndex >= 0 ? scales[stepIndex] : null;

  const start = async () => {
    const id = await InteractivePlatform.startRun({
      interactive_type: 'thermometer',
      interactive_slug: slug,
      topic: definition.topicCode ?? undefined,
    });
    setRunId(id);
    setStartTime(Date.now());
    setStepIndex(0);
    track('resource_thermometer_start', {
      topic: definition.topicCode ?? undefined,
      run_id: id,
    });
  };

  const finish = async () => {
    const score = computeScore(answers, scales);
    const level = resolveLevel(score, definition.config.thresholds ?? []);
    const model =
      (definition.config.results ?? []).find((r) => r.level === level) ??
      (definition.config.results ?? [])[0];

    const durationMs = Date.now() - startTime;
    setResult({ level, score, model });

    if (runId) {
      await InteractivePlatform.completeRun({
        runId,
        resultLevel: level,
        durationMs,
      });
    }

    track('resource_thermometer_complete', {
      resource_level: level,
      duration_ms: durationMs,
      topic: definition.topicCode ?? undefined,
      run_id: runId ?? undefined,
    });
  };

  const handleNext = async () => {
    if (stepIndex < totalSteps - 1) {
      setStepIndex((prev) => prev + 1);
      return;
    }
    await finish();
  };

  const handleBack = () => {
    if (stepIndex <= 0) {
      setStepIndex(-1);
      return;
    }
    setStepIndex((prev) => prev - 1);
  };

  const handleTelegram = async () => {
    const { deepLinkId, url } = await createTelegramDeepLink({
      flow: 'plan_7d',
      tgTarget: 'bot',
      source: `/start/thermometer/${slug}`,
      utmMedium: 'bot',
      utmContent: `thermometer_${slug}_result`,
    });
    track('cta_tg_click', {
      tg_target: 'bot',
      tg_flow: 'plan_7d',
      deep_link_id: deepLinkId,
      cta_id: `thermometer_${slug}_result`,
    });
    window.location.href = url;
  };

  if (result) {
    const steps = [
      { title: 'Прямо сейчас', items: result.model.recommendations.now },
      ...(result.model.recommendations.nextDays?.length
        ? [{ title: 'На ближайшие дни', items: result.model.recommendations.nextDays }]
        : []),
      ...(result.model.recommendations.whenToSeekHelp
        ? [{ title: 'Когда стоит обратиться к специалисту', items: [result.model.recommendations.whenToSeekHelp] }]
        : []),
    ];

    return (
      <Section>
        <Container className="max-w-3xl">
          {result.level === ResultLevel.HIGH && isCrisisVisible && (
            <CrisisBanner message="Если вам сейчас очень тяжело, пожалуйста, обратитесь за поддержкой. Экстренные контакты доступны по ссылке." />
          )}
          <ResultCard
            title={result.model.title}
            description={result.model.description}
            steps={steps}
            level={result.level === ResultLevel.LOW ? 'low' : result.level === ResultLevel.MODERATE ? 'medium' : 'high'}
          >
            <div className="mt-8 flex flex-wrap gap-4 justify-center">
              <Button onClick={() => void handleTelegram()}>{result.model.ctaText || 'Получить план в Telegram'}</Button>
              <Button variant="outline" onClick={() => (window.location.href = '/booking')}>
                Записаться
              </Button>
            </div>
          </ResultCard>
          <div className="text-center pt-8">
            <Button variant="ghost" onClick={() => window.location.reload()}>
              Пройти ещё раз
            </Button>
          </div>
        </Container>
      </Section>
    );
  }

  if (stepIndex === -1) {
    return (
      <Section>
        <Container className="max-w-xl text-center flex flex-col gap-6">
          <h1 className="text-4xl font-bold text-foreground">{definition.title}</h1>
          <p className="text-lg text-muted-foreground">
            {definition.config.intro || 'Отметьте несколько шкал — и получите бережный следующий шаг.'}
          </p>
          <Card className="p-6 text-left">
            <div className="space-y-2 text-sm text-muted-foreground">
              <div>Это не диагноз и не экстренная помощь.</div>
              <div>Никакой свободный текст не требуется.</div>
            </div>
          </Card>
          <Button size="lg" onClick={() => void start()}>
            Начать
          </Button>
        </Container>
      </Section>
    );
  }

  if (!currentScale) return null;

  const min = currentScale.minValue ?? 0;
  const max = currentScale.maxValue ?? 10;
  const value = answers[currentScale.id] ?? Math.round((min + max) / 2);
  const progress = ((stepIndex + 1) / totalSteps) * 100;

  return (
    <Section>
      <Container className="max-w-xl">
        <div className="flex flex-col gap-6">
          <ProgressBar value={progress} label={`Шкала ${stepIndex + 1} из ${totalSteps}`} showValue />

          <Card className="p-8 space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-foreground">{currentScale.title}</h2>
              {currentScale.description && <p className="text-muted-foreground">{currentScale.description}</p>}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{currentScale.minLabel ?? min}</span>
                <span>{currentScale.maxLabel ?? max}</span>
              </div>
              <input
                type="range"
                min={min}
                max={max}
                step={1}
                value={value}
                onChange={(event) =>
                  setAnswers((prev) => ({
                    ...prev,
                    [currentScale.id]: Number(event.target.value),
                  }))
                }
                className="w-full accent-primary"
              />
              <div className="text-center text-sm text-muted-foreground">
                Значение: <span className="font-semibold text-foreground">{value}</span>
              </div>
            </div>

            <div className="flex justify-between gap-3 pt-2">
              <Button variant="ghost" onClick={handleBack}>
                Назад
              </Button>
              <Button onClick={() => void handleNext()}>{stepIndex === totalSteps - 1 ? 'Результат' : 'Далее'}</Button>
            </div>
          </Card>
        </div>
      </Container>
    </Section>
  );
}

