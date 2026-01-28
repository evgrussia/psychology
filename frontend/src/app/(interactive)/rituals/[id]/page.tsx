'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { ErrorState } from '@/components/shared/ErrorState';
import { useTracking } from '@/hooks/useTracking';
import { CheckCircle2 } from 'lucide-react';

interface RitualStep {
  id: string;
  title: string;
  content: string;
  duration_seconds?: number;
}

interface Ritual {
  id: string;
  slug: string;
  title: string;
  description: string;
  steps: RitualStep[];
}

export default function RitualDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { track } = useTracking();
  const ritualId = params.id as string;
  const [currentStep, setCurrentStep] = useState(0);
  const [completed, setCompleted] = useState(false);

  const { data: ritual, isLoading, error } = useQuery({
    queryKey: ['ritual', ritualId],
    queryFn: async () => {
      // В реальности будет API вызов
      await new Promise((resolve) => setTimeout(resolve, 500));
      return {
        id: '1',
        slug: ritualId,
        title: 'Утренняя благодарность',
        description: 'Начните день с благодарности',
        steps: [
          {
            id: '1',
            title: 'Настройтесь',
            content: 'Найдите тихое место, где вас никто не потревожит. Сядьте удобно и закройте глаза.',
          },
          {
            id: '2',
            title: 'Подумайте о трёх вещах',
            content:
              'Подумайте о трёх вещах, за которые вы благодарны сегодня. Это могут быть большие или маленькие вещи.',
          },
          {
            id: '3',
            title: 'Почувствуйте благодарность',
            content:
              'Почувствуйте благодарность в своём теле. Где вы её ощущаете? Как она ощущается?',
          },
          {
            id: '4',
            title: 'Завершение',
            content:
              'Откройте глаза. Возьмите с собой это чувство благодарности на весь день.',
          },
        ],
      } as Ritual;
    },
  });

  const handleNext = () => {
    if (ritual && currentStep < ritual.steps.length - 1) {
      setCurrentStep(currentStep + 1);
      track('ritual_step_completed', {
        ritual_id: ritual.id,
        step_index: currentStep,
      });
    } else {
      setCompleted(true);
      track('ritual_completed', {
        ritual_id: ritual?.id,
      });
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  if (!ritual) {
    return null;
  }

  if (completed) {
    return (
      <main id="main-content" className="min-h-screen">
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-6 w-6 text-primary" />
                Ритуал завершён
              </CardTitle>
              <CardDescription>{ritual.title}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Отлично! Вы завершили ритуал. Постарайтесь практиковать его регулярно.
              </p>
              <div className="flex gap-4">
                <Button onClick={() => router.push('/rituals')}>
                  Выбрать другой ритуал
                </Button>
                <Button variant="outline" onClick={() => router.push('/')}>
                  На главную
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  const step = ritual.steps[currentStep];
  const progress = ((currentStep + 1) / ritual.steps.length) * 100;

  return (
    <main id="main-content" className="min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">
              Шаг {currentStep + 1} из {ritual.steps.length}
            </span>
            <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{step.title}</CardTitle>
            <CardDescription>{ritual.title}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="prose max-w-none">
              <p className="text-lg">{step.content}</p>
            </div>

            <div className="flex gap-4">
              {currentStep > 0 && (
                <Button variant="outline" onClick={handleBack}>
                  Назад
                </Button>
              )}
              <Button onClick={handleNext} className="flex-1">
                {currentStep === ritual.steps.length - 1 ? 'Завершить' : 'Далее'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
