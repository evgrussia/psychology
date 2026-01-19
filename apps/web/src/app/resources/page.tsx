import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Container,
  Section,
} from '@psychology/design-system';
import { ContentPlatform } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Полезные ресурсы | Эмоциональный баланс',
  description: 'Упражнения, чек-листы, аудио и другие полезные материалы для поддержки эмоционального здоровья',
};

export default async function ResourcesPage() {
  const data = await ContentPlatform.listContent('resource');
  const resources = data.items || [];

  return (
    <Section>
      <Container>
        <div className="space-y-4">
          <h1 className="text-3xl font-semibold md:text-4xl">Полезные ресурсы</h1>
          <p className="text-muted-foreground text-lg">
            Упражнения, чек-листы, аудио и другие материалы для поддержки эмоционального здоровья
          </p>
        </div>

        <div className="mt-10">
          {resources.length === 0 ? (
            <Card className="border-dashed">
              <CardHeader className="text-muted-foreground items-center text-center">
                <CardTitle className="text-base">Ресурсы пока не опубликованы</CardTitle>
              </CardHeader>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {resources.map((resource: any) => (
                <Link
                  key={resource.id}
                  href={`/resources/${resource.slug}`}
                  className="group block focus-visible:outline-none"
                >
                  <Card className="h-full transition-shadow group-hover:shadow-md">
                    <CardHeader className="space-y-3">
                      <CardTitle className="text-lg text-foreground transition-colors group-hover:text-primary">
                        {resource.title}
                      </CardTitle>
                      {resource.excerpt && (
                        <CardDescription className="text-sm text-muted-foreground">
                          {resource.excerpt}
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="text-muted-foreground flex flex-wrap gap-2 text-xs">
                        {resource.format && <Badge variant="secondary">{resource.format}</Badge>}
                        {resource.time_to_benefit && (
                          <span>⏱ {resource.time_to_benefit.replace(/_/g, ' ')}</span>
                        )}
                        {resource.support_level && (
                          <span>💚 {resource.support_level.replace(/_/g, ' ')}</span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </Container>
    </Section>
  );
}
