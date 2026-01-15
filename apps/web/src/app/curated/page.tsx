import Link from 'next/link';
import { Card, Section, Container } from '@psychology/design-system';

async function getCollections() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001/api';
  try {
    const res = await fetch(`${apiUrl}/public/curated`, { 
      cache: 'no-store',
      signal: AbortSignal.timeout(5000)
    });
    if (!res.ok) return [];
    return res.json();
  } catch (error) {
    console.error('Error fetching collections:', error);
    return [];
  }
}

export default async function CuratedHubPage() {
  const collections = await getCollections();

  return (
    <main>
      <Section>
        <Container>
          <header className="mb-12 text-center">
            <h1 className="text-4xl font-bold mb-4 text-foreground text-balance">Подборки для вас</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-balance">
              Мы собрали лучшие материалы и упражнения по самым важным темам, 
              чтобы вам было проще начать свой путь к эмоциональному балансу.
            </p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {collections.map((collection: any) => (
              <Link key={collection.id} href={`/curated/${collection.slug}`} className="no-underline">
                <Card className="h-full hover:shadow-lg transition-all border-2 group">
                  <div className="p-6">
                    <div className="text-xs font-bold text-primary uppercase mb-3 tracking-wider">
                      {collection.collectionType}
                    </div>
                    <h2 className="text-xl font-bold mb-4 text-foreground group-hover:text-primary transition-colors">{collection.title}</h2>
                    <div className="text-sm font-semibold text-muted-foreground flex items-center gap-1 group-hover:text-primary transition-colors">
                      Начать просмотр 
                      <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>

          {collections.length === 0 && (
            <div className="text-center py-24 bg-muted/50 rounded-2xl border-2 border-dashed border-border">
              <p className="text-muted-foreground text-lg">Подборки скоро появятся.</p>
            </div>
          )}
        </Container>
      </Section>
    </main>
  );
}
