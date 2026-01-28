'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { interactiveService } from '@/services/api/interactive';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { ErrorState } from '@/components/shared/ErrorState';
import { useTracking } from '@/hooks/useTracking';
import { Card } from '@/components/ui/card';
import { QuizAnswer } from '@/types/api';

import { QuizStart } from './components/QuizStart';
import { QuizProgress } from './components/QuizProgress';
import { QuizQuestion } from './components/QuizQuestion';
import { QuizResults } from './components/QuizResults';
import { QuizCrisis } from './components/QuizCrisis';

type QuizState = 'start' | 'progress' | 'result' | 'crisis';

export default function QuizPage() {
  const params = useParams();
  const router = useRouter();
  const { track } = useTracking();
  const quizId = params.id as string;
  
  const [state, setState] = useState<QuizState>('start');
  const [runId, setRunId] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | number | (string | number)[] | null>(null);

  const { data: quizStart, isLoading: isLoadingStart, error: startError } = useQuery({
    queryKey: ['quiz-start', quizId],
    queryFn: () => interactiveService.startQuiz(quizId),
    enabled: state === 'start',
  });

  const submitMutation = useMutation({
    mutationFn: (data: { run_id: string; answers: QuizAnswer[] }) =>
      interactiveService.submitQuiz(quizId, data),
    onSuccess: (data) => {
      if (data.deep_link_id) {
        setState('crisis');
        track('quiz_crisis_detected', {
          quiz_id: quizId,
          run_id: data.run_id,
        });
      } else {
        setState('result');
        track('quiz_completed', {
          quiz_id: quizId,
          run_id: data.run_id,
          level: data.result.level,
        });
      }
    },
  });

  useEffect(() => {
    if (quizStart && state === 'start') {
      setRunId(quizStart.run_id);
      // We don't automatically start, user clicks start button
    }
  }, [quizStart, state]);

  const handleStart = () => {
    if (quizStart) {
      setState('progress');
      track('quiz_started', {
        quiz_id: quizId,
        run_id: quizStart.run_id,
      });
    }
  };

  const handleAnswer = (value: string | number | (string | number)[]) => {
    setSelectedAnswer(value);
  };

  const handleNext = () => {
    if (!runId || !quizStart || selectedAnswer === null) return;

    const question = quizStart.questions[currentQuestionIndex];
    const newAnswers = [...answers, { question_id: question.id, value: selectedAnswer }];
    setAnswers(newAnswers);

    if (currentQuestionIndex < quizStart.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      track('quiz_question_answered', {
        quiz_id: quizId,
        run_id: runId,
        question_index: currentQuestionIndex,
      });
    } else {
      submitMutation.mutate({
        run_id: runId,
        answers: newAnswers,
      });
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      const prevIndex = currentQuestionIndex - 1;
      setCurrentQuestionIndex(prevIndex);
      setSelectedAnswer(answers[prevIndex]?.value || null);
      setAnswers(answers.slice(0, -1));
    }
  };

  if (isLoadingStart) return <LoadingSpinner />;
  if (startError) return <ErrorState error={startError} />;
  if (!quizStart) return null;

  return (
    <main id="main-content" className="min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {state === 'start' && (
          <QuizStart 
            title={quizStart.quiz.title}
            slug={quizStart.quiz.slug}
            questionCount={quizStart.questions.length}
            onStart={handleStart}
          />
        )}

        {state === 'crisis' && <QuizCrisis />}

        {state === 'result' && submitMutation.data && (
          <QuizResults result={submitMutation.data.result} />
        )}

        {state === 'progress' && (
          <>
            <QuizProgress 
              current={currentQuestionIndex + 1}
              total={quizStart.questions.length}
            />
            <Card>
              <QuizQuestion 
                question={quizStart.questions[currentQuestionIndex]}
                selectedAnswer={selectedAnswer}
                onAnswer={handleAnswer}
                onNext={handleNext}
                onBack={handleBack}
                isFirst={currentQuestionIndex === 0}
                isLast={currentQuestionIndex === quizStart.questions.length - 1}
                isSubmitting={submitMutation.isPending}
              />
            </Card>
          </>
        )}
      </div>
    </main>
  );
}
