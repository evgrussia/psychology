import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Card } from '@psychology/design-system/components/Card';
import { Button } from '@psychology/design-system/components/Button';

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
    <div className="container mx-auto px-4 py-8">
      <Link href="/curated" className="text-blue-600 mb-4 inline-block">← Ко всем подборкам</Link>
      
      <div className="bg-white rounded-lg p-8 shadow-sm mb-8">
        <div className="text-xs font-semibold text-blue-600 uppercase mb-2">
          {collection.collectionType}
        </div>
        <h1 className="text-4xl font-bold mb-4">{collection.title}</h1>
        {collection.topicCode && (
          <div className="inline-block bg-gray-100 rounded-full px-3 py-1 text-sm font-medium text-gray-700">
            Тема: {collection.topicCode}
          </div>
        )}
      </div>

      <h2 className="text-2xl font-bold mb-6">В этой подборке:</h2>
      
      <div className="space-y-4">
        {collection.items.map((item: any, index: number) => (
          <div key={index} className="flex gap-4">
            <div className="flex-none w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
              {index + 1}
            </div>
            <div className="flex-grow">
              {item.itemType === 'content' ? (
                <Link href={`/resources/${item.contentItem.slug}`}>
                  <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-bold">{item.contentItem.title}</h3>
                        <p className="text-gray-600 text-sm mt-1">{item.contentItem.excerpt}</p>
                        <div className="flex gap-3 mt-3">
                          {item.contentItem.format && (
                            <span className="text-xs bg-gray-100 px-2 py-1 rounded">{item.contentItem.format}</span>
                          )}
                          {item.contentItem.timeToBenefit && (
                            <span className="text-xs bg-gray-100 px-2 py-1 rounded">{item.contentItem.timeToBenefit}</span>
                          )}
                        </div>
                      </div>
                      <span className="text-blue-600 text-sm">Читать →</span>
                    </div>
                    {item.note && <div className="mt-4 p-2 bg-yellow-50 text-sm italic border-l-2 border-yellow-400">{item.note}</div>}
                  </Card>
                </Link>
              ) : (
                <Link href={`/start/quizzes/${item.interactive.slug}`}>
                  <Card className="p-4 border-blue-200 hover:shadow-md transition-shadow cursor-pointer">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-bold text-blue-800">{item.interactive.title}</h3>
                        <p className="text-gray-600 text-sm mt-1">Интерактивное упражнение</p>
                        <div className="mt-3">
                          <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">Интерактив: {item.interactive.type}</span>
                        </div>
                      </div>
                      <span className="text-blue-600 text-sm">Начать →</span>
                    </div>
                    {item.note && <div className="mt-4 p-2 bg-yellow-50 text-sm italic border-l-2 border-yellow-400">{item.note}</div>}
                  </Card>
                </Link>
              )}
            </div>
          </div>
        ))}

        {collection.items.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500">В этой подборке пока нет элементов.</p>
            <Link href="/curated" className="text-blue-600 mt-2 inline-block">Вернуться к списку подборок</Link>
          </div>
        )}
      </div>

      <div className="mt-12 p-8 bg-blue-600 rounded-2xl text-white text-center">
        <h2 className="text-2xl font-bold mb-4">Нужна помощь специалиста?</h2>
        <p className="mb-6 opacity-90">Запишитесь на консультацию, чтобы обсудить ваши результаты и получить персональный план работы.</p>
        <Link href="/start">
          <Button variant="secondary" size="lg">Подобрать формат работы</Button>
        </Link>
      </div>
    </div>
  );
}
