'use client';

import React, { useState, useEffect } from 'react';
import { ProgressBar, ResultCard, CrisisBanner, Button } from '@psychology/design-system/components';
import { InteractivePlatform, ResultLevel } from '@/lib/interactive';

interface QuizClientProps {
  quiz: {
    id: string;
    slug: string;
    title: string;
    description?: string;
    config: {
      questions: {
        id: string;
        text: string;
        options: { value: number; text: string }[];
      }[];
      thresholds: {
        level: ResultLevel;
        minScore: number;
        maxScore: number;
      }[];
      results: {
        level: ResultLevel;
        title: string;
        description: string;
        recommendations: {
          now: string[];
          week: string[];
          whenToSeekHelp?: string;
        };
        ctaText?: string;
      }[];
      crisisTrigger?: {
        questionId?: string;
        thresholdScore?: number;
      };
    };
  };
}

export const QuizClient: React.FC<QuizClientProps> = ({ quiz }) => {
  const [step, setStep] = useState<'start' | 'progress' | 'result'>('start');
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [runId, setRunId] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<number>(0);
  const [resultLevel, setResultLevel] = useState<ResultLevel | null>(null);
  const [isCrisisVisible, setIsCrisisVisible] = useState(true);

  const { questions, thresholds, results, crisisTrigger } = quiz.config;

  const startQuiz = async () => {
    const id = await InteractivePlatform.startRun({
      interactive_type: 'quiz',
      interactive_slug: quiz.slug,
    });
    setRunId(id);
    setStartTime(Date.now());
    setStep('progress');
    InteractivePlatform.trackStart('quiz', quiz.slug);
  };

  const handleAnswer = (value: number) => {
    const newAnswers = [...answers, value];
    setAnswers(newAnswers);

    if (currentQuestionIdx < questions.length - 1) {
      setCurrentQuestionIdx(currentQuestionIdx + 1);
    } else {
      finishQuiz(newAnswers);
    }
  };

  const finishQuiz = async (finalAnswers: number[]) => {
    const score = finalAnswers.reduce((a, b) => a + b, 0);
    const durationMs = Date.now() - startTime;
    
    // Find result level based on thresholds
    const matchedThreshold = thresholds.find(
      t => score >= t.minScore && score <= t.maxScore
    ) || thresholds[thresholds.length - 1];
    
    const finalResultLevel = matchedThreshold.level;
    setResultLevel(finalResultLevel);

    // Crisis trigger logic
    let crisisTriggered = false;
    if (crisisTrigger) {
      if (crisisTrigger.thresholdScore !== undefined && score >= crisisTrigger.thresholdScore) {
        crisisTriggered = true;
      }
      // question-based trigger could be added here if needed
    } else if (finalResultLevel === ResultLevel.HIGH) {
      // Default fallback: HIGH level triggers crisis banner for certain topics
      if (['anxiety', 'burnout'].includes(quiz.slug)) {
        crisisTriggered = true;
      }
    }

    if (runId) {
      await InteractivePlatform.completeRun({
        runId,
        resultLevel: finalResultLevel,
        durationMs,
        crisisTriggered,
        crisisTriggerType: crisisTriggered ? 'high_score' : undefined,
      });
    }

    InteractivePlatform.trackComplete('quiz', quiz.slug, {
      result_level: finalResultLevel,
      duration_ms: durationMs,
    });

    if (crisisTriggered) {
      InteractivePlatform.trackCrisisTriggered('high_score', 'quiz_result');
    }

    setStep('result');
  };

  if (step === 'start') {
    return (
      <div className="text-center py-12">
        <h1 className="text-3xl font-bold text-slate-900 mb-4">{quiz.title}</h1>
        <p className="text-lg text-slate-600 mb-8 max-w-xl mx-auto">
          {quiz.description || 'Пройдите этот тест, чтобы лучше понять свое состояние.'}
        </p>
        <Button onClick={startQuiz} size="lg" variant="primary">
          Начать тест
        </Button>
      </div>
    );
  }

  if (step === 'progress') {
    const currentQuestion = questions[currentQuestionIdx];
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
        <div className="mb-8">
          <ProgressBar current={currentQuestionIdx + 1} total={questions.length} />
        </div>
        
        <h2 className="text-xl font-medium text-slate-900 mb-8">
          {currentQuestion.text}
        </h2>

        <div className="grid grid-cols-1 gap-3">
          {currentQuestion.options.map((option) => (
            <button
              key={option.value}
              onClick={() => handleAnswer(option.value)}
              className="text-left px-6 py-4 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all text-slate-700 font-medium"
            >
              {option.text}
            </button>
          ))}
        </div>
      </div>
    );
  }

  const score = answers.reduce((a, b) => a + b, 0);
  const resultData = results.find(r => r.level === resultLevel) || results[0];
  const isHighRisk = resultLevel === ResultLevel.HIGH;

  const steps = [
    { title: 'Прямо сейчас', items: resultData.recommendations.now },
    { title: 'На этой неделе', items: resultData.recommendations.week },
  ];

  if (resultData.recommendations.whenToSeekHelp) {
    steps.push({ title: 'Когда стоит обратиться к специалисту', items: [resultData.recommendations.whenToSeekHelp] });
  }

  return (
    <div className="space-y-6">
      {isHighRisk && isCrisisVisible && (
        <CrisisBanner 
          surface="quiz_result" 
          triggerType="panic_like" 
          onBackToResources={() => setIsCrisisVisible(false)}
        />
      )}
      
      <ResultCard
        title={resultData.title}
        level={resultLevel as any}
        description={resultData.description}
        steps={steps}
      >
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            variant={isHighRisk ? "secondary" : "primary"} 
            onClick={() => window.location.href = 'https://t.me/psy_balance_bot'}
          >
            {resultData.ctaText || 'Получить план в Telegram'}
          </Button>
          <Button 
            variant="secondary" 
            onClick={() => window.location.href = '/booking'}
          >
            Записаться к психологу
          </Button>
        </div>
      </ResultCard>

      <div className="text-center pt-8">
        <Button variant="secondary" onClick={() => window.location.href = '/start'}>
          Вернуться к списку тестов
        </Button>
      </div>
    </div>
  );
};
