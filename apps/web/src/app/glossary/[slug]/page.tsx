import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import SafeMarkdownRenderer from '@/components/SafeMarkdownRenderer';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  Container,
  Section,
} from '@psychology/design-system';
import GlossaryTermClient from './GlossaryTermClient';

async function getGlossaryTerm(slug: string) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001/api';
  
  try {
    const res = await fetch(`${apiUrl}/public/glossary/${slug}`, {
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(5000),
    });
    
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`API responded with status ${res.status}`);
    
    return res.json();
  } catch (error) {
    console.error(`Error fetching glossary term ${slug}:`, error);
    return null;
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const term = await getGlossaryTerm(params.slug);
  
  if (!term) return { title: 'Термин не найден' };

  const description = term.metaDescription || term.shortDefinition;
  const keywords = term.keywords ? term.keywords.split(',').map(k => k.trim()) : undefined;

  return {
    title: `${term.title} | Словарь | Эмоциональный баланс`,
    description,
    keywords,
  };
}

export default async function GlossaryTermPage({ params }: { params: { slug: string } }) {
  const term = await getGlossaryTerm(params.slug);

  if (!term) {
    notFound();
  }

  return (
    <>
      <GlossaryTermClient slug={term.slug} title={term.title} category={term.category} />
      <Section className="py-12 md:py-16">
        <Container>
          <article className="space-y-10">
            <nav>
              <Button variant="link" asChild className="px-0">
                <Link href="/glossary">← Вернуться в словарь</Link>
              </Button>
            </nav>

            <header className="space-y-6">
              <Badge variant="secondary" className="uppercase">
                {term.category}
              </Badge>
              <h1 className="text-4xl font-semibold text-foreground md:text-5xl">
                {term.title}
              </h1>
              <p className="border-primary text-muted-foreground border-l-4 pl-6 text-lg italic">
                {term.shortDefinition}
              </p>
            </header>

            {term.synonyms && term.synonyms.length > 0 && (
              <Card className="bg-muted/40">
                <CardHeader>
                  <CardTitle className="text-muted-foreground text-sm uppercase">
                    Также известно как:
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {term.synonyms.map((synonym: string) => (
                      <Badge key={synonym} variant="outline">
                        {synonym}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="text-foreground text-base leading-relaxed">
              <SafeMarkdownRenderer className="space-y-6" content={term.bodyMarkdown} />
            </div>

            {term.relatedContent && term.relatedContent.length > 0 && (
              <section className="space-y-6 border-t border-border pt-8">
                <h2 className="text-2xl font-semibold">Связанные материалы</h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {term.relatedContent.map((item: any) => (
                    <Link
                      key={item.id}
                      href={`/${item.contentType === 'article' ? 'blog' : item.contentType === 'resource' ? 'resources' : 's-chem-ya-pomogayu'}/${item.slug}`}
                      className="group block focus-visible:outline-none"
                    >
                      <Card className="h-full transition-shadow group-hover:shadow-sm">
                        <CardHeader className="space-y-2">
                          <Badge variant="outline" className="w-fit uppercase">
                            {item.contentType}
                          </Badge>
                          <CardTitle className="text-base text-foreground transition-colors group-hover:text-primary">
                            {item.title}
                          </CardTitle>
                        </CardHeader>
                      </Card>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            <footer className="border-t border-border pt-10">
              <Card className="bg-accent/40">
                <CardHeader className="space-y-2 text-center">
                  <CardTitle className="text-2xl">Хотите разобраться в себе?</CardTitle>
                  <p className="text-muted-foreground text-base">
                    Наши психологи помогут разобраться с вашим состоянием на индивидуальной консультации.
                  </p>
                </CardHeader>
                <CardFooter className="justify-center">
                  <Button asChild size="lg">
                    <Link href="/start">Подобрать психолога</Link>
                  </Button>
                </CardFooter>
              </Card>
            </footer>
          </article>
        </Container>
      </Section>
    </>
  );
}
