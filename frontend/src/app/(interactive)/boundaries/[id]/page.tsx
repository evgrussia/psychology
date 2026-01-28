'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { ErrorState } from '@/components/shared/ErrorState';
import { useTracking } from '@/hooks/useTracking';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface BoundaryScript {
  id: string;
  title: string;
  description: string;
  content: string;
  category: string;
}

export default function BoundaryScriptDetailPage() {
  const params = useParams();
  const { track } = useTracking();
  const scriptId = params.id as string;

  const { data: script, isLoading, error } = useQuery({
    queryKey: ['boundary-script', scriptId],
    queryFn: async () => {
      // В реальности будет API вызов
      await new Promise((resolve) => setTimeout(resolve, 500));
      return {
        id: scriptId,
        title: 'Пример скрипта границ',
        description: 'Детальное описание скрипта',
        content: 'Полное содержание скрипта с примерами использования...',
        category: 'boundary',
      } as BoundaryScript;
    },
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  if (!script) {
    return null;
  }

  return (
    <main id="main-content" className="min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/boundaries/scripts">← Назад к скриптам</Link>
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>{script.title}</CardTitle>
            <CardDescription>{script.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="prose max-w-none">
              <p>{script.content}</p>
            </div>

            <div className="flex gap-4 mt-6">
              <Button asChild>
                <Link href="/boundaries/scripts">Создать свой скрипт</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/topics/boundaries">Узнать больше о границах</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
