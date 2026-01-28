'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { contentService } from '@/services/api/content';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { ErrorState } from '@/components/shared/ErrorState';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Calendar, Tag } from 'lucide-react';

export default function ArticlePage() {
  const params = useParams();
  const slug = params.slug as string;

  const { data: article, isLoading, error } = useQuery({
    queryKey: ['article', slug],
    queryFn: () => contentService.getArticle(slug),
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  if (!article) {
    return null;
  }

  return (
    <main id="main-content" className="min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/blog">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Назад к блогу
          </Link>
        </Button>

        <article>
          <header className="mb-8">
            <h1 className="text-4xl font-bold mb-4">{article.title}</h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <time dateTime={article.published_at}>
                  {new Date(article.published_at).toLocaleDateString('ru-RU', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </time>
              </div>
              {article.category && (
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  <span>{article.category}</span>
                </div>
              )}
            </div>
            {article.tags && article.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {article.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-muted rounded-md text-sm text-muted-foreground"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </header>

          <Card>
            <CardContent className="prose max-w-none py-8">
              <p className="text-lg text-muted-foreground mb-6">{article.excerpt}</p>
              {/* Здесь будет полный контент статьи из API */}
              <div className="prose prose-lg">
                <p>
                  Полное содержание статьи будет загружено из API. Здесь будет отображаться
                  markdown или HTML контент.
                </p>
              </div>
            </CardContent>
          </Card>
        </article>
      </div>
    </main>
  );
}
