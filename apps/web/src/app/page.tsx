import React from 'react';
import HomeClient from './HomeClient';
import { InteractivePlatform } from '@/lib/interactive';
import { isFeatureEnabled } from '@/lib/feature-flags';
import { Container, Section, Button } from '@psychology/design-system';

// Types for the homepage data from API
interface HomepageData {
  topics: { code: string; title: string }[];
  featured_interactives: { id: string; type: string; slug: string; title: string }[];
  trust_blocks: { id: string; title: string; description: string }[];
}

export default async function HomePage(
  { searchParams }: { searchParams?: { e2e?: string } } = {},
) {
  if (!isFeatureEnabled('homepage_v1_enabled')) {
    return (
      <Section>
        <Container className="max-w-3xl text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Страница обновляется</h1>
          <p className="text-muted-foreground mb-6">
            Мы готовим обновлённую версию главной. Сейчас можно перейти к практикам или консультации.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild size="lg">
              <a href="/start">Перейти к практикам</a>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a href="/booking">Записаться на консультацию</a>
            </Button>
          </div>
        </Container>
      </Section>
    );
  }

  const data = await InteractivePlatform.getHomepageData();
  const shouldForceEmpty = searchParams?.e2e === 'empty';
  const finalData = shouldForceEmpty
    ? {
        ...data,
        topics: [],
        featured_interactives: [],
        trust_blocks: [],
      }
    : data;

  return <HomeClient data={finalData} />;
}
