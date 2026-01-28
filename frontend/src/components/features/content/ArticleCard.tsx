import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Article } from '@/types/api';

interface ArticleCardProps {
  article: Article;
}

export function ArticleCard({ article }: ArticleCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Link href={`/blog/${article.slug}`} className="hover:text-primary">
            {article.title}
          </Link>
        </CardTitle>
        <CardDescription>{article.excerpt}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{article.category}</span>
          <time dateTime={article.published_at}>
            {new Date(article.published_at).toLocaleDateString('ru-RU')}
          </time>
        </div>
      </CardContent>
    </Card>
  );
}
