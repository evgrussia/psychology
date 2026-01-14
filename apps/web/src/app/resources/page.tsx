import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';

async function getResources() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001/api';
  
  try {
    const res = await fetch(`${apiUrl}/public/content/resource`, {
      next: { revalidate: 300 }, // Revalidate every 5 minutes
      signal: AbortSignal.timeout(5000),
    });
    
    if (!res.ok) {
      throw new Error(`API responded with status ${res.status}`);
    }
    return res.json();
  } catch (error) {
    console.error('Error fetching resources:', error);
    return { items: [], total: 0 };
  }
}

export const metadata: Metadata = {
  title: 'Полезные ресурсы | Эмоциональный баланс',
  description: 'Упражнения, чек-листы, аудио и другие полезные материалы для поддержки эмоционального здоровья',
};

export default async function ResourcesPage() {
  const data = await getResources();
  const resources = data.items || [];

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px' }}>
      <h1 style={{ fontSize: '2.5em', marginBottom: '10px' }}>Полезные ресурсы</h1>
      <p style={{ color: '#666', marginBottom: '40px', fontSize: '1.1em' }}>
        Упражнения, чек-листы, аудио и другие материалы для поддержки эмоционального здоровья
      </p>

      {resources.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
          <p>Ресурсы пока не опубликованы</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '30px' }}>
          {resources.map((resource: any) => (
            <article
              key={resource.id}
              style={{
                border: '1px solid #eee',
                borderRadius: '8px',
                padding: '20px',
                transition: 'box-shadow 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)')}
              onMouseLeave={(e) => (e.currentTarget.style.boxShadow = 'none')}
            >
              <Link
                href={`/resources/${resource.slug}`}
                style={{
                  textDecoration: 'none',
                  color: 'inherit',
                  display: 'block',
                }}
              >
                <h2
                  style={{
                    fontSize: '1.4em',
                    marginBottom: '10px',
                    color: '#2c3e50',
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#3498db')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#2c3e50')}
                >
                  {resource.title}
                </h2>
                {resource.excerpt && (
                  <p style={{ color: '#666', fontSize: '0.95em', lineHeight: '1.6', marginBottom: '15px' }}>
                    {resource.excerpt}
                  </p>
                )}
                <div style={{ display: 'flex', gap: '15px', fontSize: '0.85em', color: '#999', flexWrap: 'wrap' }}>
                  {resource.format && (
                    <span style={{ backgroundColor: '#f0f0f0', padding: '4px 8px', borderRadius: '4px' }}>
                      {resource.format}
                    </span>
                  )}
                  {resource.time_to_benefit && (
                    <span>⏱ {resource.time_to_benefit.replace(/_/g, ' ')}</span>
                  )}
                  {resource.support_level && (
                    <span>💚 {resource.support_level.replace(/_/g, ' ')}</span>
                  )}
                </div>
              </Link>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
