import { notFound } from 'next/navigation';
import { BoundaryScriptsClient } from '../BoundaryScriptsClient';

async function getBoundaryScripts(slug: string) {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001/api';
  
  try {
    const res = await fetch(`${API_BASE_URL}/public/interactive/boundaries-scripts/${slug}`, {
      next: { revalidate: 0 }
    });
    
    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    console.error('Error fetching boundary scripts:', error);
    return null;
  }
}

export default async function BoundaryScriptsPage({ params }: { params: { slug: string } }) {
  const data = await getBoundaryScripts(params.slug);
  
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
