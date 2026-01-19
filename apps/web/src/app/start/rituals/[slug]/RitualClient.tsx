'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { InteractivePlatform } from '@/lib/interactive';
import { createTelegramDeepLink } from '@/lib/telegram';
import { track } from '@/lib/tracking';
import { Button, Card, ProgressBar, Section, Container } from '@psychology/design-system';
import SafeMarkdownRenderer from '@/components/SafeMarkdownRenderer';

interface RitualStep {
  id: string;
  title: string;
  content: string;
  durationSeconds?: number;
}

interface Ritual {
  id: string;
  slug: string;
  title: string;
  topicCode: string | null;
  config: {
    why: string;
    steps: RitualStep[];
    totalDurationSeconds?: number;
    audioMediaAssetId?: string;
    audioUrl?: string;
  };
}

export function RitualClient({ initialRitual }: { initialRitual: Ritual }) {
  const router = useRouter();
  const [currentStepIndex, setCurrentStepIndex] = useState(-1); // -1 is the intro
  const [timeLeft, setTimeLeft] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [runId, setRunId] = useState<string | null>(null);
  const [audioError, setAudioError] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentStep = currentStepIndex >= 0 ? initialRitual.config.steps[currentStepIndex] : null;
  const hasAudio = initialRitual.config.audioUrl && !audioError;

  useEffect(() => {
    if (currentStep && currentStep.durationSeconds && !isPaused) {
      setTimeLeft(currentStep.durationSeconds);
      
      if (timerRef.current) clearInterval(timerRef.current);
      
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (currentStep && !currentStep.durationSeconds) {
      setTimeLeft(0);
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentStepIndex, isPaused]);

  const handleStart = async () => {
    setCurrentStepIndex(0);
    startTimeRef.current = Date.now();
    InteractivePlatform.trackRitualStart(initialRitual.slug, initialRitual.topicCode || undefined);

    try {
      const id = await InteractivePlatform.startRun({
        interactive_type: 'ritual',
        interactive_slug: initialRitual.slug,
        topic: initialRitual.topicCode || undefined,
      });
      setRunId(id);
      localStorage.setItem(`ritual_run_${initialRitual.slug}`, id);
    } catch (error) {
      console.error('Failed to create InteractiveRun:', error);
    }
  };

  const handleNext = () => {
    if (currentStepIndex < initialRitual.config.steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    } else {
      setCurrentStepIndex(-1);
      setRunId(null);
      localStorage.removeItem(`ritual_run_${initialRitual.slug}`);
    }
  };

  const handleComplete = () => {
    setIsCompleted(true);
    const durationMs = Date.now() - startTimeRef.current;
    
    // Stop audio if playing
    if (audioRef.current) {
      audioRef.current.pause();
      setIsAudioPlaying(false);
    }
    
    // Track completion
    InteractivePlatform.trackRitualComplete(initialRitual.slug, durationMs);
    
    // Complete InteractiveRun in backend
    const storedRunId = runId || localStorage.getItem(`ritual_run_${initialRitual.slug}`);
    if (storedRunId && !storedRunId.startsWith('local_')) {
      InteractivePlatform.completeRun({
        runId: storedRunId,
        durationMs,
      }).catch((error) => {
        console.error('Failed to complete InteractiveRun:', error);
      });
    }
  };

  const handleTelegramSave = async () => {
    const { deepLinkId, url } = await createTelegramDeepLink({
      flow: 'ritual',
      tgTarget: 'bot',
      source: `/start/rituals/${initialRitual.slug}`,
      entityId: `ritual:${initialRitual.slug}`,
      utmMedium: 'bot',
      utmContent: `ritual_${initialRitual.slug}_complete`,
    });
    track('cta_tg_click', {
      tg_target: 'bot',
      tg_flow: 'ritual',
      deep_link_id: deepLinkId,
      cta_id: `ritual_${initialRitual.slug}_complete`,
      topic: initialRitual.topicCode ?? undefined,
    });
    window.location.href = url;
  };

  const handleAudioToggle = () => {
    if (!audioRef.current || !hasAudio) return;
    
    if (isAudioPlaying) {
      audioRef.current.pause();
      setIsAudioPlaying(false);
    } else {
      audioRef.current.play().catch((error) => {
        console.error('Failed to play audio:', error);
        setAudioError(true);
      });
      setIsAudioPlaying(true);
    }
  };

  const handleAudioError = () => {
    setAudioError(true);
    setIsAudioPlaying(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isCompleted) {
    return (
      <Section>
        <Container className="max-w-xl">
          <Card className="p-8 text-center flex flex-col gap-6 items-center">
            <div className="w-20 h-20 bg-muted text-primary rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-foreground">Ритуал завершен!</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Вы уделили время себе и своему состоянию. Это важный шаг к эмоциональному балансу.
            </p>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => void handleTelegramSave()}
            >
              Сохранить в Telegram
            </Button>
            <Button 
              className="w-full mt-4"
              onClick={() => router.push('/start/rituals')} 
              aria-label="Вернуться в библиотеку ритуалов"
            >
              Вернуться в библиотеку
            </Button>
          </Card>
        </Container>
      </Section>
    );
  }

  if (currentStepIndex === -1) {
    return (
      <Section>
        <Container className="max-w-xl">
          <div className="flex flex-col gap-8">
            <header className="flex flex-col gap-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => router.push('/start/rituals')} 
                className="self-start"
                aria-label="Вернуться к списку ритуалов"
              >
                ← Назад к списку
              </Button>
              <h1 className="text-4xl font-bold text-foreground">{initialRitual.title}</h1>
            </header>

            <Card className="p-8 flex flex-col gap-6">
              <section className="flex flex-col gap-2">
                <h2 className="text-2xl font-bold text-foreground">Зачем это нужно?</h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {initialRitual.config.why}
                </p>
              </section>

              <section className="flex flex-col gap-6 pt-4">
                <div className="flex items-center gap-6 text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>~{Math.round((initialRitual.config.totalDurationSeconds || 0) / 60)} минут</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <span>{initialRitual.config.steps.length} шагов</span>
                  </div>
                </div>
                
                <Button 
                  onClick={handleStart} 
                  size="lg" 
                  className="w-full"
                  aria-label="Начать ритуал"
                >
                  Начать ритуал
                </Button>
              </section>
            </Card>
          </div>
        </Container>
      </Section>
    );
  }

  const progress = ((currentStepIndex + 1) / initialRitual.config.steps.length) * 100;

  return (
    <Section>
      <Container className="max-w-xl">
        <div className="flex flex-col gap-6">
          <ProgressBar 
            value={progress} 
            label={`Шаг ${currentStepIndex + 1} из ${initialRitual.config.steps.length}`}
            showValue
          />

          <Card className="p-8 min-h-[400px] flex flex-col">
            <div className="flex-1 flex flex-col gap-6">
              <h2 className="text-3xl font-bold text-foreground">{currentStep?.title}</h2>
              
              <div className="text-muted-foreground leading-relaxed">
                <SafeMarkdownRenderer content={currentStep?.content || ''} />
              </div>

              {currentStep?.durationSeconds && currentStep.durationSeconds > 0 && (
                <div className="flex flex-col items-center justify-center p-8 bg-muted rounded-2xl border border-border">
                  <div 
                    className="text-6xl font-mono font-bold text-primary mb-6 tabular-nums"
                    role="timer"
                    aria-live="polite"
                    aria-atomic="true"
                    aria-label={`Осталось времени: ${formatTime(timeLeft)}`}
                  >
                    {formatTime(timeLeft)}
                  </div>
                  <div className="flex gap-4">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setIsPaused(!isPaused)}
                      className="w-32"
                      aria-label={isPaused ? 'Продолжить таймер' : 'Поставить таймер на паузу'}
                    >
                      {isPaused ? 'Продолжить' : 'Пауза'}
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setTimeLeft(currentStep.durationSeconds!)}
                      aria-label="Сбросить таймер"
                    >
                      Сброс
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-between pt-8 gap-4">
              <Button 
                variant="ghost" 
                onClick={handleBack}
                aria-label="Вернуться к предыдущему шагу"
              >
                Назад
              </Button>
              <Button 
                onClick={handleNext} 
                className="w-32"
                aria-label={currentStepIndex === initialRitual.config.steps.length - 1 ? 'Завершить ритуал' : 'Перейти к следующему шагу'}
              >
                {currentStepIndex === initialRitual.config.steps.length - 1 ? 'Завершить' : 'Далее'}
              </Button>
            </div>
          </Card>

          {hasAudio && (
            <div className="p-4 bg-muted rounded-xl border border-border flex items-center gap-4">
              {audioRef.current === null && (
                <audio
                  ref={audioRef}
                  src={initialRitual.config.audioUrl}
                  onError={handleAudioError}
                  onEnded={() => setIsAudioPlaying(false)}
                  preload="metadata"
                />
              )}
              <div className="w-10 h-10 bg-background text-primary rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground m-0">Фоновое сопровождение</p>
                <p className="text-xs text-muted-foreground m-0">Аудио поможет лучше погрузиться в практику</p>
              </div>
              <Button 
                variant="outline"
                size="sm"
                onClick={handleAudioToggle}
                aria-label={isAudioPlaying ? 'Остановить аудио' : 'Включить аудио'}
              >
                {isAudioPlaying ? 'Остановить' : 'Включить'}
              </Button>
            </div>
          )}
        </div>
      </Container>
    </Section>
  );
}
