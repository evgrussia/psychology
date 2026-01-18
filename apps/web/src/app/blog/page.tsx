import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  Container,
  Section,
  Separator,
} from '@psychology/design-system';

async function getBlogPosts() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001/api';
  
  try {
    const res = await fetch(`${apiUrl}/public/content/article`, {
      next: { revalidate: 300 }, // Revalidate every 5 minutes
      signal: AbortSignal.timeout(5000),
    });
    
    if (!res.ok) {
      throw new Error(`API responded with status ${res.status}`);
    }
    return res.json();
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return { items: [], total: 0 };
  }
}

export const metadata: Metadata = {
  title: 'Блог | Эмоциональный баланс',
  description: 'Статьи о психологии, эмоциональном здоровье, тревоге, выгорании и отношениях',
};

export default async function BlogPage() {
  const data = await getBlogPosts();
  const posts = data.items || [];

  return (
    <Section>
      <Container>
        <div className="space-y-4">
          <h1 className="text-3xl font-semibold md:text-4xl">Блог</h1>
          <p className="text-muted-foreground text-lg">
            Статьи о психологии, эмоциональном здоровье и бережной поддержке
          </p>
        </div>

        <div className="mt-10 space-y-6">
          {posts.length === 0 ? (
            <Card className="border-dashed">
              <CardHeader className="text-muted-foreground items-center text-center">
                <CardTitle className="text-base">Статьи пока не опубликованы</CardTitle>
              </CardHeader>
            </Card>
          ) : (
            posts.map((post: any, index: number) => (
              <div key={post.id} className="space-y-6">
                <Link href={`/blog/${post.slug}`} className="group block focus-visible:outline-none">
                  <Card className="transition-shadow group-hover:shadow-sm">
                    <CardHeader className="space-y-3">
                      <CardTitle className="text-2xl text-foreground transition-colors group-hover:text-primary">
                        {post.title}
                      </CardTitle>
                      {post.excerpt && (
                        <CardDescription className="text-base text-muted-foreground">
                          {post.excerpt}
                        </CardDescription>
                      )}
                      <div className="text-muted-foreground flex flex-wrap gap-3 text-sm">
                        {post.published_at && (
                          <time dateTime={post.published_at}>
                            {new Date(post.published_at).toLocaleDateString('ru-RU', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </time>
                        )}
                        {post.time_to_benefit && (
                          <span>⏱ {post.time_to_benefit.replace(/_/g, ' ')}</span>
                        )}
                      </div>
                    </CardHeader>
                  </Card>
                </Link>
                {index < posts.length - 1 && <Separator />}
              </div>
            ))
          )}
        </div>
      </Container>
    </Section>
  );
}
