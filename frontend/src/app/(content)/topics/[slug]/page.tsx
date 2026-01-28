'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { ErrorState } from '@/components/shared/ErrorState';
import { useTracking } from '@/hooks/useTracking';
import Link from 'next/link';
import { ArrowLeft, BookOpen, FileText } from 'lucide-react';
import { ArticleCard } from '@/components/features/content/ArticleCard';

interface Topic {
  id: string;
  slug: string;
  title: string;
  description: string;
  content: string;
  articles: Array<{
    id: string;
    slug: string;
    title: string;
    excerpt: string;
    published_at: string;
    category: string;
    tags: string[];
  }>;
}

export default function TopicPage() {
  const params = useParams();
  const { track } = useTracking();
  const slug = params.slug as string;

  const { data: topic, isLoading, error } = useQuery({
    queryKey: ['topic', slug],
    queryFn: async () => {
      // В реальности будет API вызов
      await new Promise((resolve) => setTimeout(resolve, 500));
      return {
        id: '1',
        slug,
        title: 'Тревога',
        description: 'Информация и ресурсы о тревожных состояниях',
        content:
          'Тревога — это естественная реакция организма на стресс. Она может быть полезной в некоторых ситуациях, но когда тревога становится постоянной или чрезмерной, она может мешать повседневной жизни.',
        articles: [
          {
            id: '1',
            slug: 'understanding-anxiety',
            title: 'Понимание тревоги',
            excerpt: 'Что такое тревога и как она влияет на нашу жизнь',
            published_at: new Date().toISOString(),
            category: 'Тревога',
            tags: ['тревога', 'психология'],
          },
        ],
      } as Topic;
    },
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  if (!topic) {
    return null;
  }

  return (
    <main id="main-content" className="min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/topics">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Назад к темам
          </Link>
        </Button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">{topic.title}</h1>
          <p className="text-xl text-muted-foreground mb-6">{topic.description}</p>
          <div className="prose max-w-none">
            <p>{topic.content}</p>
          </div>
        </div>

        {topic.articles && topic.articles.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="h-5 w-5" />
              <h2 className="text-2xl font-semibold">Статьи по теме</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {topic.articles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Дополнительные ресурсы
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Button variant="outline" asChild>
                <Link href="/quiz/QZ-01">Пройти диагностику</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/resources">Ресурсы</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/booking">Записаться на консультацию</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
