'use client';

import React from 'react';
import { Button, Card, ProgressBar, Section, Container, ResultCard } from '@psychology/design-system';
import { InteractivePlatform } from '@/lib/interactive';
import { createTelegramDeepLink } from '@/lib/telegram';
import { track } from '@/lib/tracking';

type PrepOption = { id: string; text: string };
type PrepStep = { id: string; title: string; description?: string; options: PrepOption[]; optionalNoteLabel?: string };
type PrepConfig = {
  intro?: string;
  steps: PrepStep[];
  result: { title: string; description?: string; checklist: string[]; ctaText?: string };
};

type PrepDefinition = { id: string; slug: string; title: string; topicCode: string | null; config: PrepConfig };

export function PrepClient({ definition, slug }: { definition: PrepDefinition; slug: string }) {
  const [stepIndex, setStepIndex] = React.useState<number>(-1); // -1 intro
  const [selected, setSelected] = React.useState<Record<string, string[]>>({});
  const [note, setNote] = React.useState('');
  const [runId, setRunId] = React.useState<string | null>(null);
  const [startTime, setStartTime] = React.useState<number>(0);
  const [isFinished, setIsFinished] = React.useState(false);

  const steps = definition.config.steps ?? [];
  const total = steps.length;
  const current = stepIndex >= 0 ? steps[stepIndex] : null;

  const start = async () => {
    const id = await InteractivePlatform.startRun({
      interactive_type: 'prep',
      interactive_slug: slug,
      topic: definition.topicCode ?? undefined,
    });
    setRunId(id);
    setStartTime(Date.now());
    setStepIndex(0);
    track('consultation_prep_start', {
      prep_slug: slug,
      topic: definition.topicCode ?? undefined,
      run_id: id,
    });
  };

  const toggleOption = (stepId: string, optionId: string) => {
    setSelected((prev) => {
      const current = new Set(prev[stepId] ?? []);
      if (current.has(optionId)) current.delete(optionId);
      else current.add(optionId);
      return { ...prev, [stepId]: Array.from(current) };
    });
  };

  const canNext = () => {
    if (!current) return false;
    const picks = selected[current.id] ?? [];
    return picks.length > 0;
  };

  const finish = async () => {
    const durationMs = Date.now() - startTime;
    setIsFinished(true);
    if (runId) {
      await InteractivePlatform.completeRun({
        runId,
        durationMs,
      });
    }
    track('consultation_prep_complete', {
      prep_slug: slug,
      topic: definition.topicCode ?? undefined,
      duration_ms: durationMs,
      run_id: runId ?? undefined,
    });
  };

  const handleTelegram = async () => {
    const { deepLinkId, url } = await createTelegramDeepLink({
      flow: 'save_resource',
      tgTarget: 'bot',
      source: `/start/prep/${slug}`,
      entityId: `prep:${slug}`,
      utmMedium: 'bot',
      utmContent: `prep_${slug}_result`,
    });
    track('consultation_prep_exported', {
      export_target: 'telegram',
      topic: definition.topicCode ?? undefined,
      run_id: runId ?? undefined,
    });
    track('cta_tg_click', {
      tg_target: 'bot',
      tg_flow: 'save_resource',
      deep_link_id: deepLinkId,
      cta_id: `prep_${slug}_result`,
    });
    window.location.href = url;
  };

  if (isFinished) {
    const result = definition.config.result;
    const stepsForCard = [{ title: 'Чек-лист', items: result.checklist }];
    return (
      <Section>
        <Container className="max-w-3xl">
          <ResultCard title={result.title} description={result.description} steps={stepsForCard} level="low">
            <div className="mt-8 flex flex-wrap gap-4 justify-center">
              <Button onClick={() => void handleTelegram()}>{result.ctaText || 'Сохранить в Telegram'}</Button>
              <Button variant="outline" onClick={() => (window.location.href = '/booking')}>
                Перейти к записи
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
            {definition.config.intro ||
              'Небольшой мастер, чтобы спокойно подготовиться к первой встрече. Без обязательного текста.'}
          </p>
          <Card className="p-6 text-left">
            <div className="space-y-2 text-sm text-muted-foreground">
              <div>Можно отвечать коротко — выбирая варианты.</div>
              <div>Свободный текст (если появится) остаётся только у вас в браузере.</div>
            </div>
          </Card>
          <Button size="lg" onClick={() => void start()}>
            Начать
          </Button>
        </Container>
      </Section>
    );
  }

  if (!current) return null;

  const progress = ((stepIndex + 1) / total) * 100;
  const picks = selected[current.id] ?? [];

  return (
    <Section>
      <Container className="max-w-xl">
        <div className="flex flex-col gap-6">
          <ProgressBar value={progress} label={`Шаг ${stepIndex + 1} из ${total}`} showValue />
          <Card className="p-8 space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-foreground">{current.title}</h2>
              {current.description && <p className="text-muted-foreground">{current.description}</p>}
            </div>

            <div className="space-y-3">
              {current.options.map((opt) => {
                const isSelected = picks.includes(opt.id);
                return (
                  <Button
                    key={opt.id}
                    type="button"
                    variant={isSelected ? 'default' : 'outline'}
                    className="w-full justify-start h-auto py-4 px-6 text-left whitespace-normal"
                    onClick={() => toggleOption(current.id, opt.id)}
                  >
                    {opt.text}
                  </Button>
                );
              })}
            </div>

            {current.optionalNoteLabel && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground" htmlFor="prep-note">
                  {current.optionalNoteLabel}
                </label>
                <textarea
                  id="prep-note"
                  className="w-full rounded-md border border-border bg-background p-3 text-sm"
                  rows={3}
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder="Можно оставить пустым"
                />
              </div>
            )}

            <div className="flex justify-between gap-3 pt-2">
              <Button
                variant="ghost"
                onClick={() => {
                  if (stepIndex <= 0) setStepIndex(-1);
                  else setStepIndex((prev) => prev - 1);
                }}
              >
                Назад
              </Button>
              <Button
                onClick={() => {
                  if (stepIndex < total - 1) setStepIndex((prev) => prev + 1);
                  else void finish();
                }}
                disabled={!canNext()}
              >
                {stepIndex === total - 1 ? 'Готово' : 'Далее'}
              </Button>
            </div>
          </Card>
        </div>
      </Container>
    </Section>
  );
}

