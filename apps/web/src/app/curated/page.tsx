import Link from 'next/link';
import { Card } from '@psychology/design-system/components';

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
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Подборки для вас</h1>
      <p className="text-gray-600 mb-8">
        Мы собрали лучшие материалы и упражнения по самым важным темам, 
        чтобы вам было проще начать свой путь к эмоциональному балансу.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {collections.map((collection: any) => (
          <Link key={collection.id} href={`/curated/${collection.slug}`}>
            <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
              <div className="p-6">
                <div className="text-xs font-semibold text-blue-600 uppercase mb-2">
                  {collection.collectionType}
                </div>
                <h2 className="text-xl font-bold mb-3">{collection.title}</h2>
                <div className="text-sm text-gray-500">
                  Начать просмотр →
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {collections.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">Подборки скоро появятся.</p>
        </div>
      )}
    </div>
  );
}
