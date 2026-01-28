import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { submitQuiz } from '@/api/endpoints/interactive';
import type { QuizQuestion, QuizResultData, QuizQuestionOption } from '@/api/types/interactive';
import { ApiError } from '@/api/client';
import { showApiError } from '@/lib/errorToast';

const PHQ9_OPTION_LABELS = ['Ни разу', 'Несколько дней', 'Больше половины дней', 'Почти каждый день'];

interface QuizProgressPageProps {
  runId: string;
  questions: QuizQuestion[];
  quizSlug: string;
  onComplete?: (result: QuizResultData) => void;
  onBack?: () => void;
  onCrisis?: () => void;
}

function getOptionsForQuestion(q: QuizQuestion): { label: string; value: number }[] {
  const opts = q.options;
  if (!opts || opts.length === 0) {
    return PHQ9_OPTION_LABELS.map((label, i) => ({ label, value: i }));
  }
  if (typeof opts[0] === 'string') {
    return (opts as string[]).map((s, i) => ({
      label: PHQ9_OPTION_LABELS[i] ?? String(s),
      value: typeof s === 'string' && /^\d+$/.test(s) ? parseInt(s, 10) : i,
    }));
  }
  return (opts as QuizQuestionOption[]).map((o, i) => ({
    label: o.label ?? PHQ9_OPTION_LABELS[i] ?? String(o.value),
    value: typeof o.value === 'number' ? o.value : parseInt(String(o.value), 10) || i,
  }));
}

export default function QuizProgressPage({
  runId,
  questions,
  quizSlug,
  onComplete,
  onBack,
  onCrisis,
}: QuizProgressPageProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<(number | string)[]>(new Array(questions.length).fill(-1));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lastQuestionIndex = questions.length - 1;
  const currentQ = questions[currentQuestion];
  const options = currentQ ? getOptionsForQuestion(currentQ) : [];

  const handleAnswer = (value: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = value;
    setAnswers(newAnswers);
    setError(null);
  };

  const handleNext = async () => {
    if (currentQuestion < lastQuestionIndex) {
      setCurrentQuestion(currentQuestion + 1);
      return;
    }
    const lastAnswer = answers[lastQuestionIndex];
    const lastValue = typeof lastAnswer === 'number' ? lastAnswer : parseInt(String(lastAnswer), 10);
    if (onCrisis && (lastValue === 2 || lastValue === 3)) {
      onCrisis();
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const answerPayload = questions.map((q, i) => ({
        question_id: q.id,
        value: answers[i] === -1 ? 0 : answers[i],
      }));
      const data = await submitQuiz(quizSlug, { run_id: runId, answers: answerPayload });
      onComplete?.(data.result);
    } catch (e) {
      showApiError(e);
      if (e instanceof ApiError) {
        setError(e.message || 'Не удалось отправить ответы');
      } else {
        setError('Проверьте подключение и попробуйте снова');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    } else {
      onBack?.();
    }
  };

  const progress = questions.length ? ((currentQuestion + 1) / questions.length) * 100 : 0;
  const rawAnswer = answers[currentQuestion];
  const isAnswered = rawAnswer !== -1 && rawAnswer !== undefined;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#A8B5FF]/5 to-white pt-24 sm:pt-28 pb-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Progress Bar */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 sm:mb-12"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-[#718096]">
              Вопрос {currentQuestion + 1} из {questions.length}
            </span>
            <span className="text-sm font-medium text-[#A8B5FF]">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-[#A8B5FF] to-[#C8F5E8]"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </motion.div>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          {currentQ && (
            <motion.div
              key={currentQuestion}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 mb-6"
            >
              <div className="mb-8">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-[#A8B5FF]/10 text-[#A8B5FF] font-semibold mb-4">
                  {currentQuestion + 1}
                </div>
                <h2 className="text-xl sm:text-2xl font-semibold text-[#2D3748] leading-relaxed">
                  За последние 2 недели, как часто вас беспокоили следующие симптомы:
                </h2>
                <p className="text-lg sm:text-xl text-[#2D3748] mt-4 leading-relaxed font-medium">
                  {currentQ.text}
                </p>
              </div>

              {/* Answer Options */}
              <div className="space-y-3">
                {options.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleAnswer(option.value)}
                    className={`w-full p-4 sm:p-5 rounded-xl border-2 text-left transition-all ${
                      answers[currentQuestion] === option.value
                        ? 'border-[#A8B5FF] bg-[#A8B5FF]/5 shadow-sm'
                        : 'border-gray-200 hover:border-[#A8B5FF]/30 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                          answers[currentQuestion] === option.value
                            ? 'border-[#A8B5FF] bg-[#A8B5FF]'
                            : 'border-gray-300'
                        }`}
                      >
                        {answers[currentQuestion] === option.value && (
                          <div className="w-2 h-2 rounded-full bg-white" />
                        )}
                      </div>
                      <span
                        className={`text-base sm:text-lg ${
                          answers[currentQuestion] === option.value
                            ? 'text-[#2D3748] font-medium'
                            : 'text-[#718096]'
                        }`}
                      >
                        {option.label}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <p className="text-sm text-red-600 text-center mb-4">{error}</p>
        )}

        {/* Navigation Buttons - Fixed on Mobile */}
        <div className="fixed bottom-0 left-0 right-0 sm:static bg-white sm:bg-transparent border-t sm:border-0 border-gray-100 p-4 sm:p-0">
          <div className="max-w-3xl mx-auto flex items-center gap-3">
            <button
              onClick={handlePrevious}
              disabled={submitting}
              className="px-6 py-3.5 rounded-xl border-2 border-gray-200 text-[#2D3748] font-medium hover:border-[#A8B5FF] hover:bg-[#A8B5FF]/5 active:scale-[0.98] transition-all flex items-center gap-2 disabled:opacity-60"
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Назад</span>
            </button>

            <button
              onClick={handleNext}
              disabled={!isAnswered || submitting}
              className={`flex-1 px-6 py-3.5 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                isAnswered && !submitting
                  ? 'bg-gradient-to-r from-[#A8B5FF] to-[#C8F5E8] text-white shadow-[0_4px_12px_-2px_rgba(168,181,255,0.4)] hover:shadow-[0_6px_16px_-2px_rgba(168,181,255,0.5)] active:scale-[0.98]'
                  : 'bg-gray-100 text-[#718096] cursor-not-allowed'
              }`}
            >
              <span>
                {submitting
                  ? 'Отправка…'
                  : currentQuestion === lastQuestionIndex
                    ? 'Завершить'
                    : 'Далее'}
              </span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Helper Text */}
        <div className="mt-6 mb-20 sm:mb-6 text-center">
          <p className="text-sm text-[#718096]">
            Вы можете вернуться к предыдущим вопросам, если захотите изменить ответ
          </p>
        </div>
      </div>
    </div>
  );
}
