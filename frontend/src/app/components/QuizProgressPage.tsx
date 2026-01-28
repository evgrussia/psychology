import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface QuizProgressPageProps {
  onComplete?: () => void;
  onBack?: () => void;
  onCrisis?: () => void;
}

const CRISIS_QUESTION_INDEX = 8; // Вопрос 9: мысли о причинении вреда

export default function QuizProgressPage({ onComplete, onBack, onCrisis }: QuizProgressPageProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>(new Array(9).fill(-1));

  const questions = [
    'Слабый интерес или удовольствие от того, чем вы занимаетесь',
    'Подавленность, депрессия или чувство безнадёжности',
    'Проблемы с засыпанием, сном или слишком долгий сон',
    'Чувство усталости или упадок сил',
    'Плохой аппетит или переедание',
    'Плохое мнение о себе, ощущение, что вы неудачник/неудачница или подвели себя или свою семью',
    'Проблемы с концентрацией внимания, например, при чтении газет или просмотре телевизора',
    'Замедленные движения или речь настолько, что это заметно другим. Или наоборот, вы настолько возбуждены или беспокойны, что двигаетесь намного больше обычного',
    'Мысли о том, что было бы лучше умереть или как-то причинить себе вред'
  ];

  const options = [
    { label: 'Ни разу', value: 0 },
    { label: 'Несколько дней', value: 1 },
    { label: 'Больше половины дней', value: 2 },
    { label: 'Почти каждый день', value: 3 }
  ];

  const handleAnswer = (value: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = value;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      const lastAnswer = answers[CRISIS_QUESTION_INDEX];
      if (onCrisis && (lastAnswer === 2 || lastAnswer === 3)) {
        onCrisis();
      } else {
        onComplete?.();
      }
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    } else {
      onBack?.();
    }
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const isAnswered = answers[currentQuestion] !== -1;

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
                За последние 2 недели, как часто вас беспокоило следующее:
              </h2>
              <p className="text-lg sm:text-xl text-[#2D3748] mt-4 leading-relaxed font-medium">
                {questions[currentQuestion]}
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
        </AnimatePresence>

        {/* Navigation Buttons - Fixed on Mobile */}
        <div className="fixed bottom-0 left-0 right-0 sm:static bg-white sm:bg-transparent border-t sm:border-0 border-gray-100 p-4 sm:p-0">
          <div className="max-w-3xl mx-auto flex items-center gap-3">
            <button
              onClick={handlePrevious}
              className="px-6 py-3.5 rounded-xl border-2 border-gray-200 text-[#2D3748] font-medium hover:border-[#A8B5FF] hover:bg-[#A8B5FF]/5 active:scale-[0.98] transition-all flex items-center gap-2"
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Назад</span>
            </button>

            <button
              onClick={handleNext}
              disabled={!isAnswered}
              className={`flex-1 px-6 py-3.5 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                isAnswered
                  ? 'bg-gradient-to-r from-[#A8B5FF] to-[#C8F5E8] text-white shadow-[0_4px_12px_-2px_rgba(168,181,255,0.4)] hover:shadow-[0_6px_16px_-2px_rgba(168,181,255,0.5)] active:scale-[0.98]'
                  : 'bg-gray-100 text-[#718096] cursor-not-allowed'
              }`}
            >
              <span>{currentQuestion === questions.length - 1 ? 'Завершить' : 'Далее'}</span>
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
