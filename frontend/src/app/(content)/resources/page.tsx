'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { ErrorState } from '@/components/shared/ErrorState';
import { EmptyState } from '@/components/shared/EmptyState';
import { useTracking } from '@/hooks/useTracking';
import Link from 'next/link';
import { Play, Headphones, BookOpen, Download } from 'lucide-react';

interface Resource {
  id: string;
  slug: string;
  title: string;
  description: string;
  type: 'meditation' | 'exercise' | 'video' | 'audio' | 'article';
  duration_minutes?: number;
  category: string;
}

export default function ResourcesPage() {
  const { track } = useTracking();

  const { data: resources, isLoading, error } = useQuery({
    queryKey: ['resources'],
    queryFn: async () => {
      // В реальности будет API вызов
      await new Promise((resolve) => setTimeout(resolve, 500));
      return [
        {
          id: '1',
          slug: 'breathing-exercise',
          title: 'Дыхательное упражнение',
          description: 'Простая техника для снятия тревоги',
          type: 'exercise',
          duration_minutes: 5,
          category: 'Тревога',
        },
        {
          id: '2',
          slug: 'guided-meditation',
          title: 'Управляемая медитация',
          description: 'Медитация для расслабления и восстановления',
          type: 'meditation',
          duration_minutes: 10,
          category: 'Стресс',
        },
        {
          id: '3',
          slug: 'stress-management-video',
          title: 'Управление стрессом',
          description: 'Видео о техниках управления стрессом',
          type: 'video',
          duration_minutes: 15,
          category: 'Стресс',
        },
      ] as Resource[];
    },
  });

  const getIcon = (type: Resource['type']) => {
    switch (type) {
      case 'meditation':
        return <Headphones className="h-5 w-5" />;
      case 'exercise':
        return <BookOpen className="h-5 w-5" />;
      case 'video':
        return <Play className="h-5 w-5" />;
      case 'audio':
        return <Headphones className="h-5 w-5" />;
      default:
        return <BookOpen className="h-5 w-5" />;
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  return (
    <main id="main-content" className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4">Ресурсы</h1>
        <p className="text-muted-foreground mb-8">
          Медитации, упражнения, видео и другие материалы для поддержания эмоционального баланса
        </p>

        {resources && resources.length === 0 && (
          <EmptyState message="Ресурсы скоро появятся" />
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources?.map((resource) => (
            <Card
              key={resource.id}
              className="hover:shadow-lg transition-shadow"
              onClick={() =>
                track('resource_selected', {
                  resource_id: resource.id,
                  resource_type: resource.type,
                })
              }
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {getIcon(resource.type)}
                  {resource.title}
                </CardTitle>
                <CardDescription>{resource.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  {resource.duration_minutes && (
                    <span className="text-muted-foreground">
                      {resource.duration_minutes} минут
                    </span>
                  )}
                  <span className="px-2 py-1 bg-muted rounded-md text-xs">
                    {resource.category}
                  </span>
                </div>
                <Button asChild className="w-full">
                  <Link href={`/resources/${resource.slug}`}>
                    {resource.type === 'video' || resource.type === 'audio' ? (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Смотреть
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4 mr-2" />
                        Открыть
                      </>
                    )}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </main>
  );
}
