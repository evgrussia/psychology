import { Button } from '@/components/ui/button';
import { CardContent } from '@/components/ui/card';
import { QuizQuestion as QuizQuestionType } from '@/types/api';

interface QuizQuestionProps {
  question: QuizQuestionType;
  selectedAnswer: string | number | (string | number)[] | null;
  onAnswer: (value: string | number | (string | number)[]) => void;
  onNext: () => void;
  onBack?: () => void;
  isFirst: boolean;
  isLast: boolean;
  isSubmitting?: boolean;
}

export function QuizQuestion({
  question,
  selectedAnswer,
  onAnswer,
  onNext,
  onBack,
  isFirst,
  isLast,
  isSubmitting,
}: QuizQuestionProps) {
  return (
    <CardContent className="space-y-4">
      {question.type === 'single_choice' && question.options && (
        <div className="space-y-2">
          {question.options.map((option, idx) => (
            <Button
              key={idx}
              variant={selectedAnswer === option ? 'default' : 'outline'}
              className="w-full justify-start"
              onClick={() => onAnswer(option)}
            >
              {option}
            </Button>
          ))}
        </div>
      )}

      {question.type === 'multiple_choice' && question.options && (
        <div className="space-y-2">
          {question.options.map((option, idx) => (
            <Button
              key={idx}
              variant={
                Array.isArray(selectedAnswer) && selectedAnswer.includes(option)
                  ? 'default'
                  : 'outline'
              }
              className="w-full justify-start"
              onClick={() => {
                const current = Array.isArray(selectedAnswer) ? selectedAnswer : [];
                const newValue = current.includes(option)
                  ? current.filter((v) => v !== option)
                  : [...current, option];
                onAnswer(newValue);
              }}
            >
              {option}
            </Button>
          ))}
        </div>
      )}

      {question.type === 'scale' && (
        <div className="space-y-4">
          <label htmlFor={`scale-${question.id}`} className="sr-only">
            {question.text}
          </label>
          <input
            id={`scale-${question.id}`}
            type="range"
            min="0"
            max="10"
            value={(selectedAnswer as number) || 5}
            onChange={(e) => onAnswer(Number(e.target.value))}
            className="w-full"
            aria-valuemin={0}
            aria-valuemax={10}
            aria-valuenow={(selectedAnswer as number) || 5}
            aria-valuetext={String(selectedAnswer || 5)}
          />
          <div className="flex justify-between text-sm text-muted-foreground" aria-hidden="true">
            <span>0</span>
            <span>5</span>
            <span>10</span>
          </div>
          <p className="text-center text-lg font-semibold" aria-hidden="true">
            {(selectedAnswer as number) || 5}
          </p>
        </div>
      )}

      <div className="flex gap-4 mt-6">
        {!isFirst && onBack && (
          <Button variant="outline" onClick={onBack}>
            Назад
          </Button>
        )}
        <Button
          onClick={onNext}
          disabled={selectedAnswer === null || isSubmitting}
          className="flex-1"
        >
          {isLast ? 'Завершить' : 'Далее'}
        </Button>
      </div>
    </CardContent>
  );
}
