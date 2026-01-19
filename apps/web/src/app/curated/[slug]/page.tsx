import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Badge, Card, CardContent, Button, Section, Container, CTABlock } from '@psychology/design-system';
import { resolveContentHref } from '@/lib/content-links';

async function getCollection(slug: string) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001/api';
  try {
    const res = await fetch(`${apiUrl}/public/curated/${slug}`, { 
      cache: 'no-store',
      signal: AbortSignal.timeout(5000)
    });
    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    console.error(`Error fetching collection ${slug}:`, error);
    return null;
  }
}

export default async function CuratedCollectionPage({ params }: { params: { slug: string } }) {
  const collection = await getCollection(params.slug);

  if (!collection) {
    notFound();
  }

  return (
    <>
      <Section>
        <Container>
          <Link href="/curated" className="text-primary hover:underline mb-6 inline-block font-medium">
            ← Ко всем подборкам
          </Link>
          
          <Card className="mb-12 bg-muted">
            <CardContent className="p-8 md:p-12">
              <Badge variant="secondary" className="mb-3 uppercase tracking-wider">
                {collection.collectionType}
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-6 text-foreground text-balance">{collection.title}</h1>
              {collection.topicCode && (
                <Badge variant="outline" className="text-muted-foreground">
                  Тема: {collection.topicCode}
                </Badge>
              )}
            </CardContent>
          </Card>

          <h2 className="text-2xl font-bold mb-8 text-foreground">В этой подборке:</h2>
          
          <div className="flex flex-col gap-6 max-w-4xl">
            {collection.items.map((item: any, index: number) => (
              <div key={index} className="flex gap-4 md:gap-6">
                <div className="flex-none w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
                  {index + 1}
                </div>
                <div className="flex-1">
                  {item.itemType === 'content' ? (
                    <Link
                      href={resolveContentHref(item.contentItem.contentType, item.contentItem.slug)}
                      className="no-underline"
                    >
                      <Card className="border-2 transition-all group hover:shadow-lg">
                        <CardContent className="p-6 space-y-4">
                          <div className="flex justify-between items-start gap-4">
                            <div className="flex-1 space-y-3">
                              <div>
                                <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors mb-2">
                                  {item.contentItem.title}
                                </h3>
                                <p className="text-muted-foreground text-sm leading-relaxed">
                                  {item.contentItem.excerpt}
                                </p>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {item.contentItem.contentType && (
                                  <Badge variant="secondary" className="uppercase tracking-wider text-xs">
                                    {item.contentItem.contentType}
                                  </Badge>
                                )}
                                {item.contentItem.format && (
                                  <Badge variant="secondary" className="uppercase tracking-wider text-xs">
                                    {item.contentItem.format}
                                  </Badge>
                                )}
                                {item.contentItem.timeToBenefit && (
                                  <Badge variant="secondary" className="uppercase tracking-wider text-xs">
                                    {item.contentItem.timeToBenefit}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <span className="text-primary font-bold group-hover:translate-x-1 transition-transform">→</span>
                          </div>
                          {item.note && (
                            <div className="rounded-lg border-l-4 border-primary/40 bg-primary/5 p-4 text-sm italic text-muted-foreground">
                              {item.note}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </Link>
                  ) : (
                    <Link href={`/start/quizzes/${item.interactive.slug}`} className="no-underline">
                      <Card className="border-2 border-primary/20 bg-primary/5 transition-all group hover:border-primary hover:shadow-lg">
                        <CardContent className="p-6 space-y-4">
                          <div className="flex justify-between items-start gap-4">
                            <div className="flex-1 space-y-3">
                              <div>
                                <h3 className="text-xl font-bold text-primary mb-2">{item.interactive.title}</h3>
                                <p className="text-muted-foreground text-sm leading-relaxed">Интерактивное упражнение</p>
                              </div>
                              <div>
                                <Badge className="uppercase tracking-wider text-xs">
                                  Интерактив: {item.interactive.type}
                                </Badge>
                              </div>
                            </div>
                            <span className="text-primary font-bold group-hover:translate-x-1 transition-transform">→</span>
                          </div>
                          {item.note && (
                            <div className="rounded-lg border-l-4 border-primary/40 bg-primary/10 p-4 text-sm italic text-muted-foreground">
                              {item.note}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </Link>
                  )}
                </div>
              </div>
            ))}

            {collection.items.length === 0 && (
              <Card className="border-dashed">
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground text-lg mb-4">В этой подборке пока нет элементов.</p>
                  <Button asChild variant="outline">
                    <Link href="/curated">Вернуться к списку подборок</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          <CTABlock
            className="mt-20"
            title="Нужна помощь специалиста?"
            description="Запишитесь на консультацию, чтобы обсудить ваши результаты и получить персональный план работы."
            primaryCTA={
              <Button asChild size="lg">
                <Link href="/start">Подобрать формат работы</Link>
              </Button>
            }
          />
        </Container>
      </Section>
    </>
  );
}
