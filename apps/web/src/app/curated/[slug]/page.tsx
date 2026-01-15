import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Card, Button, Section, Container } from '@psychology/design-system';

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
    <main>
      <Section>
        <Container>
          <Link href="/curated" className="text-primary hover:underline mb-6 inline-block font-medium">
            ← Ко всем подборкам
          </Link>
          
          <header className="bg-muted p-8 md:p-12 rounded-2xl mb-12">
            <div className="text-xs font-bold text-primary uppercase mb-3 tracking-wider">
              {collection.collectionType}
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-foreground text-balance">{collection.title}</h1>
            {collection.topicCode && (
              <div className="inline-block bg-background border border-border rounded-full px-4 py-1.5 text-sm font-semibold text-muted-foreground">
                Тема: {collection.topicCode}
              </div>
            )}
          </header>

          <h2 className="text-2xl font-bold mb-8 text-foreground">В этой подборке:</h2>
          
          <div className="flex flex-col gap-6 max-w-4xl">
            {collection.items.map((item: any, index: number) => (
              <div key={index} className="flex gap-4 md:gap-6">
                <div className="flex-none w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
                  {index + 1}
                </div>
                <div className="flex-1">
                  {item.itemType === 'content' ? (
                    <Link href={`/resources/${item.contentItem.slug}`} className="no-underline">
                      <Card className="p-6 hover:shadow-lg transition-all group border-2">
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors mb-2">{item.contentItem.title}</h3>
                            <p className="text-muted-foreground text-sm leading-relaxed mb-4">{item.contentItem.excerpt}</p>
                            <div className="flex gap-2">
                              {item.contentItem.format && (
                                <span className="text-[10px] uppercase font-bold bg-muted px-2 py-1 rounded tracking-wider text-muted-foreground">{item.contentItem.format}</span>
                              )}
                              {item.contentItem.timeToBenefit && (
                                <span className="text-[10px] uppercase font-bold bg-muted px-2 py-1 rounded tracking-wider text-muted-foreground">{item.contentItem.timeToBenefit}</span>
                              )}
                            </div>
                          </div>
                          <span className="text-primary font-bold group-hover:translate-x-1 transition-transform">→</span>
                        </div>
                        {item.note && <div className="mt-6 p-4 bg-primary/5 text-sm italic border-l-4 border-primary rounded-r-lg text-muted-foreground">{item.note}</div>}
                      </Card>
                    </Link>
                  ) : (
                    <Link href={`/start/quizzes/${item.interactive.slug}`} className="no-underline">
                      <Card className="p-6 border-2 border-primary/20 hover:border-primary hover:shadow-lg transition-all group bg-primary/5">
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-primary mb-2">{item.interactive.title}</h3>
                            <p className="text-muted-foreground text-sm leading-relaxed mb-4">Интерактивное упражнение</p>
                            <div className="flex gap-2">
                              <span className="text-[10px] uppercase font-bold bg-primary/10 text-primary px-2 py-1 rounded tracking-wider">Интерактив: {item.interactive.type}</span>
                            </div>
                          </div>
                          <span className="text-primary font-bold group-hover:translate-x-1 transition-transform">→</span>
                        </div>
                        {item.note && <div className="mt-6 p-4 bg-primary/5 text-sm italic border-l-4 border-primary rounded-r-lg text-muted-foreground">{item.note}</div>}
                      </Card>
                    </Link>
                  )}
                </div>
              </div>
            ))}

            {collection.items.length === 0 && (
              <div className="text-center py-16 bg-muted/50 rounded-2xl border-2 border-dashed border-border">
                <p className="text-muted-foreground text-lg mb-4">В этой подборке пока нет элементов.</p>
                <Link href="/curated">
                  <Button variant="outline">Вернуться к списку подборок</Button>
                </Link>
              </div>
            )}
          </div>

          <div className="mt-20 p-8 md:p-12 bg-primary rounded-3xl text-primary-foreground text-center flex flex-col items-center">
            <h2 className="text-3xl font-bold mb-4">Нужна помощь специалиста?</h2>
            <p className="mb-8 opacity-90 text-lg max-w-2xl">Запишитесь на консультацию, чтобы обсудить ваши результаты и получить персональный план работы.</p>
            <Link href="/start">
              <Button variant="secondary" size="lg" className="px-12">Подобрать формат работы</Button>
            </Link>
          </div>
        </Container>
      </Section>
    </main>
  );
}
