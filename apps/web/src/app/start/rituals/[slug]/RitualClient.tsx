'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { InteractivePlatform } from '@/lib/interactive';
import { Button, Card, ProgressBar, Section, Container } from '@psychology/design-system/components';
import { typography } from '@psychology/design-system/tokens';
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

  // Initialize InteractiveRun when ritual starts
  useEffect(() => {
    if (currentStepIndex === -1) {
      // Start tracking and create InteractiveRun
      InteractivePlatform.trackRitualStart(initialRitual.slug, initialRitual.topicCode || undefined);
      
      // Create InteractiveRun in backend
      InteractivePlatform.startRun({
        interactive_type: 'ritual',
        interactive_slug: initialRitual.slug,
        topic: initialRitual.topicCode || undefined,
      }).then((id) => {
        setRunId(id);
        localStorage.setItem(`ritual_run_${initialRitual.slug}`, id);
      }).catch((error) => {
        console.error('Failed to create InteractiveRun:', error);
      });
    }
  }, [currentStepIndex, initialRitual.slug, initialRitual.topicCode]);

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

  const handleStart = () => {
    setCurrentStepIndex(0);
    startTimeRef.current = Date.now();
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
        <Container maxWidth="600px">
          <Card style={{ padding: 'var(--space-8)', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }} variant="elevated">
            <div style={{ width: '80px', height: 'var(--space-20)', backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-brand-primary)', borderRadius: 'var(--radius-circle)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
              <svg xmlns="http://www.w3.org/2000/svg" style={{ height: 'var(--space-10)', width: 'var(--space-10)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 style={{ ...typography.h2, color: 'var(--color-text-primary)' }}>Ритуал завершен!</h2>
            <p style={{ ...typography.body.lg, color: 'var(--color-text-secondary)' }}>
              Вы уделили время себе и своему состоянию. Это важный шаг к эмоциональному балансу.
            </p>
            <div style={{ paddingTop: 'var(--space-4)' }}>
              <Button 
                onClick={() => router.push('/start/rituals')} 
                fullWidth
                aria-label="Вернуться в библиотеку ритуалов"
              >
                Вернуться в библиотеку
              </Button>
            </div>
          </Card>
        </Container>
      </Section>
    );
  }

  if (currentStepIndex === -1) {
    return (
      <Section>
        <Container maxWidth="600px">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
            <header style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <Button 
                variant="tertiary" 
                size="sm" 
                onClick={() => router.push('/start/rituals')} 
                style={{ alignSelf: 'flex-start' }}
                aria-label="Вернуться к списку ритуалов"
              >
                ← Назад к списку
              </Button>
              <h1 style={{ ...typography.hero, color: 'var(--color-text-primary)' }}>{initialRitual.title}</h1>
            </header>

            <Card style={{ padding: 'var(--space-8)', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }} variant="elevated">
              <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                <h2 style={{ ...typography.h3, color: 'var(--color-text-primary)' }}>Зачем это нужно?</h2>
                <p style={{ ...typography.body.lg, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                  {initialRitual.config.why}
                </p>
              </section>

              <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', paddingTop: 'var(--space-4)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', color: 'var(--color-text-secondary)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" style={{ height: 'var(--space-5)', width: 'var(--space-5)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>~{Math.round((initialRitual.config.totalDurationSeconds || 0) / 60)} минут</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" style={{ height: 'var(--space-5)', width: 'var(--space-5)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <span>{initialRitual.config.steps.length} шагов</span>
                  </div>
                </div>
                
                <Button 
                  onClick={handleStart} 
                  size="lg" 
                  fullWidth
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
      <Container maxWidth="600px">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-size-body-sm)', fontWeight: 500, color: 'var(--color-text-tertiary)' }}>
              <span>Шаг {currentStepIndex + 1} из {initialRitual.config.steps.length}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <ProgressBar current={currentStepIndex + 1} total={initialRitual.config.steps.length} />
          </div>

          <Card style={{ padding: 'var(--space-8)', minHeight: '400px', display: 'flex', flexDirection: 'column' }} variant="elevated">
            <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
              <h2 style={{ ...typography.h2, color: 'var(--color-text-primary)' }}>{currentStep?.title}</h2>
              
              <div style={{ color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                <SafeMarkdownRenderer content={currentStep?.content || ''} />
              </div>

              {currentStep?.durationSeconds && currentStep.durationSeconds > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-8)', backgroundColor: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border-primary)' }}>
                  <div 
                    style={{ fontSize: 'var(--space-16)', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--color-brand-primary)', marginBottom: 'var(--space-4)', fontVariantNumeric: 'tabular-nums' }}
                    role="timer"
                    aria-live="polite"
                    aria-atomic="true"
                    aria-label={`Осталось времени: ${formatTime(timeLeft)}`}
                  >
                    {formatTime(timeLeft)}
                  </div>
                  <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
                    <Button 
                      variant="tertiary" 
                      size="sm" 
                      onClick={() => setIsPaused(!isPaused)}
                      style={{ width: '120px' }}
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

            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 'var(--space-8)', gap: 'var(--space-4)' }}>
              <Button 
                variant="ghost" 
                onClick={handleBack}
                aria-label="Вернуться к предыдущему шагу"
              >
                Назад
              </Button>
              <Button 
                onClick={handleNext} 
                style={{ width: '120px' }}
                aria-label={currentStepIndex === initialRitual.config.steps.length - 1 ? 'Завершить ритуал' : 'Перейти к следующему шагу'}
              >
                {currentStepIndex === initialRitual.config.steps.length - 1 ? 'Завершить' : 'Далее'}
              </Button>
            </div>
          </Card>

          {hasAudio && (
            <div style={{ padding: 'var(--space-4)', backgroundColor: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-primary)', display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
              {audioRef.current === null && (
                <audio
                  ref={audioRef}
                  src={initialRitual.config.audioUrl}
                  onError={handleAudioError}
                  onEnded={() => setIsAudioPlaying(false)}
                  preload="metadata"
                />
              )}
              <div style={{ width: '40px', height: '40px', backgroundColor: 'var(--color-bg-primary)', color: 'var(--color-brand-primary)', borderRadius: 'var(--radius-circle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg xmlns="http://www.w3.org/2000/svg" style={{ height: 'var(--space-6)', width: 'var(--space-6)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
              </div>
              <div style={{ flexGrow: 1 }}>
                <p style={{ fontSize: 'var(--font-size-body-sm)', fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>Фоновое сопровождение</p>
                <p style={{ fontSize: 'var(--font-size-caption)', color: 'var(--color-text-secondary)', margin: 0 }}>Аудио поможет лучше погрузиться в практику</p>
              </div>
              <Button 
                variant="tertiary"
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
