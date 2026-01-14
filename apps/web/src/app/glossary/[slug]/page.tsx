import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import SafeMarkdownRenderer from '@/components/SafeMarkdownRenderer';
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
      <article style={{ maxWidth: '800px', margin: '0 auto', padding: '60px 20px' }}>
        <nav style={{ marginBottom: '40px' }}>
        <Link href="/glossary" style={{ color: '#3498db', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
          ← Вернуться в словарь
        </Link>
      </nav>

      <header style={{ marginBottom: '50px' }}>
        <div style={{ 
          fontSize: '0.9em', 
          color: '#0070f3', 
          backgroundColor: '#f0f7ff', 
          padding: '4px 12px', 
          borderRadius: '20px', 
          display: 'inline-block',
          marginBottom: '20px',
          fontWeight: 'bold',
          textTransform: 'uppercase'
        }}>
          {term.category}
        </div>
        <h1 style={{ fontSize: '3.5em', marginBottom: '20px', color: '#2c3e50' }}>{term.title}</h1>
        <p style={{ fontSize: '1.4em', lineHeight: '1.5', color: '#555', borderLeft: '4px solid #3498db', paddingLeft: '24px', fontStyle: 'italic' }}>
          {term.shortDefinition}
        </p>
      </header>

      {term.synonyms && term.synonyms.length > 0 && (
        <div style={{ marginBottom: '40px', padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '12px' }}>
          <h3 style={{ fontSize: '1em', color: '#999', textTransform: 'uppercase', marginBottom: '10px' }}>Также известно как:</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {term.synonyms.map((synonym: string) => (
              <span key={synonym} style={{ padding: '6px 12px', backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '6px', fontSize: '0.95em' }}>
                {synonym}
              </span>
            ))}
          </div>
        </div>
      )}

      <div style={{ fontSize: '1.15em', lineHeight: '1.8', color: '#2c3e50' }}>
        <SafeMarkdownRenderer content={term.bodyMarkdown} />
      </div>

      {term.relatedContent && term.relatedContent.length > 0 && (
        <section style={{ marginTop: '60px', paddingTop: '40px', borderTop: '1px solid #eee' }}>
          <h2 style={{ fontSize: '1.8em', marginBottom: '30px', color: '#2c3e50' }}>Связанные материалы</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
            {term.relatedContent.map((item: any) => (
              <Link
                key={item.id}
                href={`/${item.contentType === 'article' ? 'blog' : item.contentType === 'resource' ? 'resources' : 's-chem-ya-pomogayu'}/${item.slug}`}
                style={{
                  textDecoration: 'none',
                  color: 'inherit',
                  padding: '20px',
                  borderRadius: '12px',
                  border: '1px solid #eee',
                  transition: 'all 0.2s ease',
                  backgroundColor: '#fff',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#3498db';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#eee';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ fontSize: '0.75em', color: '#999', textTransform: 'uppercase', marginBottom: '8px' }}>
                  {item.contentType}
                </div>
                <h3 style={{ fontSize: '1.1em', color: '#2c3e50', margin: 0 }}>{item.title}</h3>
              </Link>
            ))}
          </div>
        </section>
      )}

      <footer style={{ marginTop: '80px', paddingTop: '40px', borderTop: '1px solid #eee' }}>
        <div style={{ backgroundColor: '#f0f7ff', padding: '40px', borderRadius: '16px', textAlign: 'center' }}>
          <h2 style={{ marginBottom: '15px' }}>Хотите разобраться в себе?</h2>
          <p style={{ color: '#666', marginBottom: '30px', fontSize: '1.1em' }}>
            Наши психологи помогут разобраться с вашим состоянием на индивидуальной консультации.
          </p>
          <Link 
            href="/start" 
            tabIndex={0}
            style={{ 
              display: 'inline-block', 
              padding: '16px 32px', 
              backgroundColor: '#0070f3', 
              color: '#fff', 
              textDecoration: 'none', 
              borderRadius: '8px',
              fontWeight: 'bold',
              transition: 'transform 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            onFocus={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.outline = '2px solid #fff';
              e.currentTarget.style.outlineOffset = '2px';
            }}
            onBlur={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.outline = 'none';
            }}
          >
            Подобрать психолога
          </Link>
        </div>
      </footer>
      </article>
    </>
  );
}
