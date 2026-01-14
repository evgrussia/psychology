import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';

async function getBlogPosts() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001/api';
  
  try {
    const res = await fetch(`${apiUrl}/public/content/article`, {
      next: { revalidate: 300 }, // Revalidate every 5 minutes
      signal: AbortSignal.timeout(5000),
    });
    
    if (!res.ok) {
      throw new Error(`API responded with status ${res.status}`);
    }
    return res.json();
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return { items: [], total: 0 };
  }
}

export const metadata: Metadata = {
  title: 'Блог | Эмоциональный баланс',
  description: 'Статьи о психологии, эмоциональном здоровье, тревоге, выгорании и отношениях',
};

export default async function BlogPage() {
  const data = await getBlogPosts();
  const posts = data.items || [];

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px' }}>
      <h1 style={{ fontSize: '2.5em', marginBottom: '10px' }}>Блог</h1>
      <p style={{ color: '#666', marginBottom: '40px', fontSize: '1.1em' }}>
        Статьи о психологии, эмоциональном здоровье и бережной поддержке
      </p>

      {posts.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
          <p>Статьи пока не опубликованы</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          {posts.map((post: any) => (
            <article key={post.id} style={{ borderBottom: '1px solid #eee', paddingBottom: '30px' }}>
              <Link
                href={`/blog/${post.slug}`}
                style={{
                  textDecoration: 'none',
                  color: 'inherit',
                  display: 'block',
                }}
              >
                <h2
                  style={{
                    fontSize: '1.8em',
                    marginBottom: '10px',
                    color: '#2c3e50',
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#3498db')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#2c3e50')}
                >
                  {post.title}
                </h2>
                {post.excerpt && (
                  <p style={{ color: '#666', fontSize: '1.1em', lineHeight: '1.6', marginBottom: '10px' }}>
                    {post.excerpt}
                  </p>
                )}
                <div style={{ display: 'flex', gap: '15px', fontSize: '0.9em', color: '#999' }}>
                  {post.published_at && (
                    <time dateTime={post.published_at}>
                      {new Date(post.published_at).toLocaleDateString('ru-RU', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </time>
                  )}
                  {post.time_to_benefit && (
                    <span>⏱ {post.time_to_benefit.replace(/_/g, ' ')}</span>
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
