'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { ErrorState } from '@/components/shared/ErrorState';
import { useTracking } from '@/hooks/useTracking';
import Link from 'next/link';
import { Clock } from 'lucide-react';

interface Ritual {
  id: string;
  slug: string;
  title: string;
  description: string;
  duration_minutes: number;
  category: string;
}

export default function RitualsPage() {
  const { track } = useTracking();

  const { data: rituals, isLoading, error } = useQuery({
    queryKey: ['rituals'],
    queryFn: async () => {
      // В реальности будет API вызов
      await new Promise((resolve) => setTimeout(resolve, 500));
      return [
        {
          id: '1',
          slug: 'morning-gratitude',
          title: 'Утренняя благодарность',
          description: 'Начните день с благодарности за то, что у вас есть',
          duration_minutes: 5,
          category: 'gratitude',
        },
        {
          id: '2',
          slug: 'evening-reflection',
          title: 'Вечерняя рефлексия',
          description: 'Подведите итоги дня и отметьте свои достижения',
          duration_minutes: 10,
          category: 'reflection',
        },
        {
          id: '3',
          slug: 'breathing-break',
          title: 'Дыхательная пауза',
          description: 'Короткая практика для восстановления баланса',
          duration_minutes: 3,
          category: 'breathing',
        },
      ] as Ritual[];
    },
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  return (
    <main id="main-content" className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Мини-ритуалы</h1>
        <p className="text-muted-foreground mb-8">
          Короткие практики для поддержания эмоционального баланса
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rituals?.map((ritual) => (
            <Card key={ritual.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>{ritual.title}</CardTitle>
                <CardDescription>{ritual.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{ritual.duration_minutes} мин</span>
                  </div>
                  <Button
                    asChild
                    onClick={() =>
                      track('ritual_selected', {
                        ritual_id: ritual.id,
                        ritual_slug: ritual.slug,
                      })
                    }
                  >
                    <Link href={`/rituals/${ritual.slug}`}>Начать</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </main>
  );
}
