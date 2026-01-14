'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { InteractivePlatform } from '@/lib/interactive';
import { Button, Card, ProgressBar } from '@psychology/design-system/components';
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
        interactiveDefinitionId: initialRitual.id,
      }).then((id) => {
        setRunId(id);
        localStorage.setItem(`ritual_run_${initialRitual.slug}`, id);
      }).catch((error) => {
        console.error('Failed to create InteractiveRun:', error);
      });
    }
  }, [initialRitual.slug, initialRitual.topicCode, initialRitual.id]);

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
      <Card className="max-w-2xl mx-auto p-8 text-center space-y-6">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-3xl font-bold text-slate-900">Ритуал завершен!</h2>
        <p className="text-lg text-slate-600">
          Вы уделили время себе и своему состоянию. Это важный шаг к эмоциональному балансу.
        </p>
        <div className="pt-4">
          <Button 
            onClick={() => router.push('/start/rituals')} 
            className="w-full sm:w-auto"
            aria-label="Вернуться в библиотеку ритуалов"
          >
            Вернуться в библиотеку
          </Button>
        </div>
      </Card>
    );
  }

  if (currentStepIndex === -1) {
    return (
      <div className="max-w-2xl mx-auto space-y-8">
        <header className="space-y-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => router.push('/start/rituals')} 
            className="mb-4"
            aria-label="Вернуться к списку ритуалов"
          >
            ← Назад к списку
          </Button>
          <h1 className="text-4xl font-bold text-slate-900">{initialRitual.title}</h1>
        </header>

        <Card className="p-8 space-y-6">
          <section className="space-y-2">
            <h2 className="text-xl font-semibold text-slate-800">Зачем это нужно?</h2>
            <p className="text-lg text-slate-600 leading-relaxed">
              {initialRitual.config.why}
            </p>
          </section>

          <section className="space-y-4 pt-4">
            <div className="flex items-center gap-4 text-slate-600">
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
    );
  }

  const progress = ((currentStepIndex + 1) / initialRitual.config.steps.length) * 100;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="space-y-2">
        <div className="flex justify-between text-sm font-medium text-slate-500">
          <span>Шаг {currentStepIndex + 1} из {initialRitual.config.steps.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <ProgressBar progress={progress} />
      </div>

      <Card className="p-8 min-h-[400px] flex flex-col">
        <div className="flex-grow space-y-6">
          <h2 className="text-2xl font-bold text-slate-900">{currentStep?.title}</h2>
          
          <div className="prose prose-slate max-w-none">
            <SafeMarkdownRenderer content={currentStep?.content || ''} />
          </div>

          {currentStep?.durationSeconds && currentStep.durationSeconds > 0 && (
            <div className="flex flex-col items-center justify-center p-8 bg-slate-50 rounded-2xl border-2 border-slate-100">
              <div 
                className="text-6xl font-mono font-bold text-indigo-600 mb-4 tabular-nums"
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
        <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100 flex items-center gap-4">
          {audioRef.current === null && (
            <audio
              ref={audioRef}
              src={initialRitual.config.audioUrl}
              onError={handleAudioError}
              onEnded={() => setIsAudioPlaying(false)}
              preload="metadata"
            />
          )}
          <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
          </div>
          <div className="flex-grow">
            <p className="text-sm font-medium text-indigo-900">Фоновое сопровождение</p>
            <p className="text-xs text-indigo-600">Аудио поможет лучше погрузиться в практику</p>
          </div>
          <button 
            onClick={handleAudioToggle}
            className="text-indigo-600 hover:text-indigo-800 font-medium text-sm px-3 py-1 rounded-md hover:bg-indigo-100 transition-colors"
            aria-label={isAudioPlaying ? 'Остановить аудио' : 'Включить аудио'}
          >
            {isAudioPlaying ? 'Остановить' : 'Включить'}
          </button>
        </div>
      )}
    </div>
  );
}
