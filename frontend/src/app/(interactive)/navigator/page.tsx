'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTracking } from '@/hooks/useTracking';

type NavigatorState = {
  question: string;
  options: Array<{ label: string; next: string | null; action?: string }>;
};

const navigatorFlow: Record<string, NavigatorState> = {
  start: {
    question: 'Как вы себя чувствуете прямо сейчас?',
    options: [
      { label: 'Тревожно', next: 'anxiety' },
      { label: 'Подавленно', next: 'depression' },
      { label: 'Раздражённо', next: 'irritation' },
      { label: 'Устало', next: 'fatigue' },
      { label: 'Нормально', next: 'normal' },
    ],
  },
  anxiety: {
    question: 'Что помогает вам справиться с тревогой?',
    options: [
      { label: 'Дыхательные упражнения', next: null, action: '/resources/breathing' },
      { label: 'Поговорить с кем-то', next: null, action: '/booking' },
      { label: 'Понять причину', next: 'anxiety-cause' },
    ],
  },
  depression: {
    question: 'Как долго вы чувствуете себя так?',
    options: [
      { label: 'Несколько дней', next: null, action: '/resources/self-care' },
      { label: 'Несколько недель', next: null, action: '/booking' },
      { label: 'Несколько месяцев', next: null, action: '/booking' },
    ],
  },
  irritation: {
    question: 'Что вызывает раздражение?',
    options: [
      { label: 'Конфликт с близкими', next: null, action: '/topics/relationships' },
      { label: 'Работа/учеба', next: null, action: '/topics/stress' },
      { label: 'Не знаю', next: null, action: '/quiz/QZ-01' },
    ],
  },
  fatigue: {
    question: 'Что может быть причиной усталости?',
    options: [
      { label: 'Недостаток сна', next: null, action: '/resources/sleep' },
      { label: 'Выгорание', next: null, action: '/quiz/QZ-02' },
      { label: 'Стресс', next: null, action: '/topics/stress' },
    ],
  },
  normal: {
    question: 'Отлично! Что вы хотели бы улучшить?',
    options: [
      { label: 'Отношения', next: null, action: '/topics/relationships' },
      { label: 'Саморазвитие', next: null, action: '/topics' },
      { label: 'Профилактика', next: null, action: '/resources' },
    ],
  },
  'anxiety-cause': {
    question: 'Что вызывает тревогу?',
    options: [
      { label: 'Конкретная ситуация', next: null, action: '/topics/anxiety' },
      { label: 'Неопределенность', next: null, action: '/resources/uncertainty' },
      { label: 'Не знаю', next: null, action: '/quiz/QZ-01' },
    ],
  },
};

export default function NavigatorPage() {
  const router = useRouter();
  const { track } = useTracking();
  const [currentState, setCurrentState] = useState<string>('start');
  const [history, setHistory] = useState<string[]>(['start']);

  const state = navigatorFlow[currentState];

  const handleOptionClick = (option: NavigatorState['options'][0]) => {
    track('navigator_option_selected', {
      current_state: currentState,
      option_label: option.label,
    });

    if (option.action) {
      router.push(option.action);
    } else if (option.next) {
      setHistory([...history, option.next]);
      setCurrentState(option.next);
    }
  };

  const handleBack = () => {
    if (history.length > 1) {
      const newHistory = history.slice(0, -1);
      setHistory(newHistory);
      setCurrentState(newHistory[newHistory.length - 1]);
    }
  };

  return (
    <main id="main-content" className="min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Навигатор состояния</CardTitle>
            <CardDescription>
              Ответьте на несколько вопросов, и мы подберём для вас подходящие ресурсы
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">{state.question}</h2>
              <div className="space-y-2">
                {state.options.map((option, idx) => (
                  <Button
                    key={idx}
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => handleOptionClick(option)}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>

            {history.length > 1 && (
              <Button variant="ghost" onClick={handleBack} className="w-full">
                Назад
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
