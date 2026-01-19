import { notFound } from 'next/navigation';
import { BoundaryScriptsClient } from '../BoundaryScriptsClient';
import { InteractivePlatform } from '@/lib/interactive';

export default async function BoundaryScriptsPage({ params }: { params: { slug: string } }) {
  const data = await InteractivePlatform.getBoundaryScripts(params.slug);
  
  if (!data) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <BoundaryScriptsClient data={data} />
      </div>
    </main>
  );
}
