import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Container,
  Section,
} from '@psychology/design-system';
import GlossaryClient from './GlossaryClient';

async function getGlossaryTerms() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001/api';
  
  try {
    const res = await fetch(`${apiUrl}/public/glossary`, {
      next: { revalidate: 300 }, // Revalidate every 5 minutes
      signal: AbortSignal.timeout(5000),
    });
    
    if (!res.ok) {
      throw new Error(`API responded with status ${res.status}`);
    }
    return res.json();
  } catch (error) {
    console.error('Error fetching glossary terms:', error);
    return [];
  }
}

export const metadata: Metadata = {
  title: 'Словарь терминов | Эмоциональный баланс',
  description: 'Понятный гид по психологическим терминам, состояниям и подходам в терапии',
};

export default async function GlossaryPage() {
  const terms = await getGlossaryTerms();

  // Group terms by first letter
  const groupedTerms = terms.reduce((acc: any, term: any) => {
    const firstLetter = term.title[0].toUpperCase();
    if (!acc[firstLetter]) {
      acc[firstLetter] = [];
    }
    acc[firstLetter].push(term);
    return acc;
  }, {});

  const sortedLetters = Object.keys(groupedTerms).sort();

  return (
    <>
      <GlossaryClient termsCount={terms.length} />
      <Section>
        <Container>
          <header className="mx-auto mb-12 max-w-3xl space-y-4 text-center">
            <h1 className="text-4xl font-semibold md:text-5xl">Словарь</h1>
            <p className="text-muted-foreground text-lg">
              Понятный гид по психологическим терминам, состояниям и направлениям терапии
            </p>
          </header>

          {sortedLetters.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="text-muted-foreground py-12 text-center">
                В словаре пока нет терминов
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-12">
              {sortedLetters.map((letter) => (
                <section key={letter} className="space-y-6 border-t border-border pt-8">
                  <div className="bg-background/80 sticky top-5 z-10 rounded-md py-2 backdrop-blur">
                    <h2 className="text-3xl font-semibold text-primary">{letter}</h2>
                  </div>
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {groupedTerms[letter].map((term: any) => (
                      <Link
                        key={term.slug}
                        href={`/glossary/${term.slug}`}
                        className="group block focus-visible:outline-none"
                      >
                        <Card className="flex h-full flex-col transition-shadow group-hover:shadow-sm">
                          <CardHeader className="space-y-3">
                            <CardTitle className="text-xl text-foreground transition-colors group-hover:text-primary">
                              {term.title}
                            </CardTitle>
                            <CardDescription className="text-muted-foreground line-clamp-3 text-sm">
                              {term.shortDefinition}
                            </CardDescription>
                          </CardHeader>
                          <CardFooter>
                            <Badge variant="secondary" className="uppercase">
                              {term.category}
                            </Badge>
                          </CardFooter>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </Container>
      </Section>
    </>
  );
}
