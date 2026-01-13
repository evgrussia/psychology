'use client';

import React, { useState, useEffect } from 'react';
import { ProgressBar, ResultCard, CrisisBanner, Button } from '@/../../design-system/components';
import { InteractivePlatform, ResultLevel } from '@/lib/interactive';

interface QuizClientProps {
  quiz: any;
}

export const QuizClient: React.FC<QuizClientProps> = ({ quiz }) => {
  const [step, setStep] = useState<'start' | 'progress' | 'result'>('start');
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [runId, setRunId] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<number>(0);

  const startQuiz = async () => {
    const id = await InteractivePlatform.startRun({
      interactiveDefinitionId: quiz.id,
    });
    setRunId(id);
    setStartTime(Date.now());
    setStep('progress');
    InteractivePlatform.trackStart('quiz', quiz.slug);
  };

  const handleAnswer = (value: number) => {
    const newAnswers = [...answers, value];
    setAnswers(newAnswers);

    if (currentQuestionIdx < quiz.questions.length - 1) {
      setCurrentQuestionIdx(currentQuestionIdx + 1);
    } else {
      finishQuiz(newAnswers);
    }
  };

  const finishQuiz = async (finalAnswers: number[]) => {
    const score = finalAnswers.reduce((a, b) => a + b, 0);
    const durationMs = Date.now() - startTime;
    
    let resultLevel: ResultLevel = ResultLevel.LOW;
    if (quiz.slug === 'anxiety') {
      if (score >= 10) resultLevel = ResultLevel.HIGH;
      else if (score >= 5) resultLevel = ResultLevel.MODERATE;
    } else {
      // Simple logic for other quizzes
      const maxScore = quiz.questions.length * 3;
      if (score > maxScore * 0.7) resultLevel = ResultLevel.HIGH;
      else if (score > maxScore * 0.3) resultLevel = ResultLevel.MODERATE;
    }

    const crisisTriggered = resultLevel === ResultLevel.HIGH && quiz.slug === 'anxiety';

    if (runId) {
      await InteractivePlatform.completeRun({
        runId,
        resultLevel,
        durationMs,
        crisisTriggered,
        crisisTriggerType: crisisTriggered ? 'high_anxiety' : undefined,
      });
    }

    InteractivePlatform.trackComplete('quiz', quiz.slug, {
      result_level: resultLevel,
      duration_ms: durationMs,
    });

    if (crisisTriggered) {
      InteractivePlatform.trackCrisisTriggered('high_anxiety', 'quiz_result');
    }

    setStep('result');
  };

  if (step === 'start') {
    return (
      <div className="text-center py-12">
        <h1 className="text-3xl font-bold text-slate-900 mb-4">{quiz.title}</h1>
        <p className="text-lg text-slate-600 mb-8 max-w-xl mx-auto">{quiz.description}</p>
        <Button onClick={startQuiz} size="lg" variant="primary">
          Начать тест
        </Button>
      </div>
    );
  }

  if (step === 'progress') {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
        <div className="mb-8">
          <ProgressBar current={currentQuestionIdx + 1} total={quiz.questions.length} />
        </div>
        
        <h2 className="text-xl font-medium text-slate-900 mb-8">
          {quiz.questions[currentQuestionIdx]}
        </h2>

        <div className="grid grid-cols-1 gap-3">
          {quiz.options.map((option: any) => (
            <button
              key={option.value}
              onClick={() => handleAnswer(option.value)}
              className="text-left px-6 py-4 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all text-slate-700 font-medium"
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  const score = answers.reduce((a, b) => a + b, 0);
  let resultKey: 'low' | 'moderate' | 'high' = 'low';
  if (quiz.slug === 'anxiety') {
    if (score >= 10) resultKey = 'high';
    else if (score >= 5) resultKey = 'moderate';
  } else {
    const maxScore = quiz.questions.length * 3;
    if (score > maxScore * 0.7) resultKey = 'high';
    else if (score > maxScore * 0.3) resultKey = 'moderate';
  }

  const result = quiz.results[resultKey];

  return (
    <div className="space-y-6">
      {resultKey === 'high' && (
        <CrisisBanner surface="quiz_result" />
      )}
      
      <ResultCard
        title={result.title}
        level={resultKey}
        description={result.description}
        steps={result.steps}
      >
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="primary" onClick={() => window.location.href = 'https://t.me/psy_balance_bot'}>
            Получить план в Telegram
          </Button>
          <Button variant="secondary" onClick={() => window.location.href = '/booking'}>
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
