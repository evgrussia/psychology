'use client';

import { useQuery } from '@tanstack/react-query';
import { contentService } from '@/services/api/content';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { ErrorState } from '@/components/shared/ErrorState';
import { EmptyState } from '@/components/shared/EmptyState';
import { useTracking } from '@/hooks/useTracking';
import Link from 'next/link';
import { Topic } from '@/types/api';

export default function TopicsPage() {
  const { track } = useTracking();

  const { data: topics, isLoading, error } = useQuery({
    queryKey: ['topics'],
    queryFn: () => contentService.getTopics(),
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
        <h1 className="text-3xl font-bold mb-4">С чем я помогаю</h1>
        <p className="text-muted-foreground mb-8">
          Выберите тему, которая вас интересует, и найдите подходящие материалы и ресурсы
        </p>

        {topics && topics.length === 0 && (
          <EmptyState message="Темы скоро появятся" />
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {topics?.map((topic) => (
            <Card
              key={topic.id}
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => {
                track('topic_selected', {
                  topic_id: topic.id,
                  topic_slug: topic.slug,
                });
              }}
            >
              <CardHeader>
                <CardTitle>{topic.title}</CardTitle>
                <CardDescription>{topic.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  {topic.article_count !== undefined && (
                    <span className="text-sm text-muted-foreground">
                      {topic.article_count} материалов
                    </span>
                  )}
                  <Button asChild variant="outline">
                    <Link href={`/topics/${topic.slug}`}>Подробнее</Link>
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
