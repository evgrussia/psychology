'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { ErrorState } from '@/components/shared/ErrorState';
import { useTracking } from '@/hooks/useTracking';
import Link from 'next/link';
import { ArrowLeft, Play, Download } from 'lucide-react';

interface Resource {
  id: string;
  slug: string;
  title: string;
  description: string;
  content: string;
  type: 'meditation' | 'exercise' | 'video' | 'audio' | 'article';
  duration_minutes?: number;
  video_url?: string;
  audio_url?: string;
  download_url?: string;
}

export default function ResourcePage() {
  const params = useParams();
  const { track } = useTracking();
  const slug = params.slug as string;

  const { data: resource, isLoading, error } = useQuery({
    queryKey: ['resource', slug],
    queryFn: async () => {
      // В реальности будет API вызов
      await new Promise((resolve) => setTimeout(resolve, 500));
      return {
        id: '1',
        slug,
        title: 'Дыхательное упражнение',
        description: 'Простая техника для снятия тревоги',
        content:
          'Это упражнение поможет вам быстро успокоиться в моменты тревоги. Сядьте удобно, закройте глаза и следуйте инструкциям...',
        type: 'exercise',
        duration_minutes: 5,
      } as Resource;
    },
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  if (!resource) {
    return null;
  }

  return (
    <main id="main-content" className="min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/resources">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Назад к ресурсам
          </Link>
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>{resource.title}</CardTitle>
            <CardDescription>{resource.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {resource.video_url && (
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                <Button
                  size="lg"
                  onClick={() => {
                    window.open(resource.video_url, '_blank');
                    track('resource_video_played', {
                      resource_id: resource.id,
                    });
                  }}
                >
                  <Play className="h-5 w-5 mr-2" />
                  Смотреть видео
                </Button>
              </div>
            )}

            {resource.audio_url && (
              <div className="bg-muted rounded-lg p-8 flex items-center justify-center">
                <Button
                  size="lg"
                  onClick={() => {
                    window.open(resource.audio_url, '_blank');
                    track('resource_audio_played', {
                      resource_id: resource.id,
                    });
                  }}
                >
                  <Play className="h-5 w-5 mr-2" />
                  Слушать аудио
                </Button>
              </div>
            )}

            <div className="prose max-w-none">
              <p>{resource.content}</p>
            </div>

            {resource.download_url && (
              <Button
                variant="outline"
                onClick={() => {
                  window.open(resource.download_url, '_blank');
                  track('resource_downloaded', {
                    resource_id: resource.id,
                  });
                }}
              >
                <Download className="h-4 w-4 mr-2" />
                Скачать
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
