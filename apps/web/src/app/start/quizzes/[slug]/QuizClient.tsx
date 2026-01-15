'use client';

import React, { useState, useEffect } from 'react';
import { ProgressBar, ResultCard, CrisisBanner, Button, Section, Container, Card } from '@psychology/design-system';
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
    } else if (finalResultLevel === ResultLevel.HIGH) {
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
      <Section>
        <Container className="max-w-xl text-center flex flex-col gap-8">
          <h1 className="text-4xl font-bold text-foreground">{quiz.title}</h1>
          <p className="text-lg text-muted-foreground">
            {quiz.description || 'Пройдите этот тест, чтобы лучше понять свое состояние.'}
          </p>
          <Button onClick={startQuiz} size="lg" className="w-full">
            Начать тест
          </Button>
        </Container>
      </Section>
    );
  }

  if (step === 'progress') {
    const currentQuestion = questions[currentQuestionIdx];
    const progress = ((currentQuestionIdx + 1) / questions.length) * 100;
    
    return (
      <Section>
        <Container className="max-w-xl">
          <div className="flex flex-col gap-6">
            <ProgressBar 
              value={progress} 
              label={`Вопрос ${currentQuestionIdx + 1} из ${questions.length}`}
              showValue
            />
            
            <Card className="p-8">
              <h2 className="text-2xl font-bold text-foreground mb-8">
                {currentQuestion.text}
              </h2>

              <div className="grid grid-cols-1 gap-3">
                {currentQuestion.options.map((option) => (
                  <Button
                    key={option.value}
                    variant="outline"
                    className="justify-start h-auto py-4 px-6 text-left whitespace-normal font-medium"
                    onClick={() => handleAnswer(option.value)}
                  >
                    {option.text}
                  </Button>
                ))}
              </div>
            </Card>
          </div>
        </Container>
      </Section>
    );
  }

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
    <Section>
      <Container className="max-w-3xl">
        <div className="flex flex-col gap-8">
          {isHighRisk && isCrisisVisible && (
            <CrisisBanner 
              className="mb-4"
              message="Ваш результат указывает на высокий уровень напряжения. Пожалуйста, обратитесь за поддержкой."
            />
          )}
          
          <ResultCard
            title={resultData.title}
            level={isHighRisk ? 'high' : 'low'}
            description={resultData.description}
            steps={steps}
          >
            <div className="mt-8 flex flex-wrap gap-4 justify-center">
              <Button 
                onClick={() => window.location.href = 'https://t.me/psy_balance_bot'}
              >
                {resultData.ctaText || 'Получить план в Telegram'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => window.location.href = '/booking'}
              >
                Записаться к психологу
              </Button>
            </div>
          </ResultCard>

          <div className="text-center pt-8">
            <Button variant="ghost" onClick={() => window.location.href = '/start'}>
              ← Вернуться к списку тестов
            </Button>
          </div>
        </div>
      </Container>
    </Section>
  );
};
