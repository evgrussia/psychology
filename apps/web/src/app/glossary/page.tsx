import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import GlossaryClient from './GlossaryClient';

async function getGlossaryTerms() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001/api';
  
  try {
    const res = await fetch(`${apiUrl}/public/glossary`, {
      next: { revalidate: 300 }, // Revalidate every 5 minutes
      signal: AbortSignal.timeout(5000),
    });
    
    if (!res.ok) {
      throw new Error(`API responded with status ${res.status}`);
    }
    return res.json();
  } catch (error) {
    console.error('Error fetching glossary terms:', error);
    return [];
  }
}

export const metadata: Metadata = {
  title: 'Словарь терминов | Эмоциональный баланс',
  description: 'Понятный гид по психологическим терминам, состояниям и подходам в терапии',
};

export default async function GlossaryPage() {
  const terms = await getGlossaryTerms();

  // Group terms by first letter
  const groupedTerms = terms.reduce((acc: any, term: any) => {
    const firstLetter = term.title[0].toUpperCase();
    if (!acc[firstLetter]) {
      acc[firstLetter] = [];
    }
    acc[firstLetter].push(term);
    return acc;
  }, {});

  const sortedLetters = Object.keys(groupedTerms).sort();

  return (
    <>
      <GlossaryClient termsCount={terms.length} />
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 20px' }}>
        <header style={{ marginBottom: '60px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '3em', marginBottom: '20px' }}>Словарь</h1>
        <p style={{ color: '#666', fontSize: '1.2em', maxWidth: '600px', margin: '0 auto' }}>
          Понятный гид по психологическим терминам, состояниям и направлениям терапии
        </p>
      </header>

      {sortedLetters.length === 0 ? (
        <div style={{ padding: '60px', textAlign: 'center', color: '#999', backgroundColor: '#f9f9f9', borderRadius: '12px' }}>
          <p>В словаре пока нет терминов</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '50px' }}>
          {sortedLetters.map((letter) => (
            <section key={letter} style={{ borderTop: '2px solid #f0f0f0', paddingTop: '30px' }}>
              <h2 style={{ fontSize: '2em', color: '#3498db', marginBottom: '30px', position: 'sticky', top: '20px' }}>
                {letter}
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '30px' }}>
                {groupedTerms[letter].map((term: any) => (
                  <Link
                    key={term.slug}
                    href={`/glossary/${term.slug}`}
                    tabIndex={0}
                    style={{
                      textDecoration: 'none',
                      color: 'inherit',
                      padding: '24px',
                      borderRadius: '12px',
                      border: '1px solid #eee',
                      transition: 'all 0.2s ease',
                      backgroundColor: '#fff',
                      display: 'block',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#3498db';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#eee';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#3498db';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)';
                      e.currentTarget.style.outline = '2px solid #3498db';
                      e.currentTarget.style.outlineOffset = '2px';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#eee';
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.outline = 'none';
                    }}
                  >
                    <h3 style={{ fontSize: '1.3em', marginBottom: '12px', color: '#2c3e50' }}>{term.title}</h3>
                    <p style={{ color: '#666', fontSize: '0.95em', lineHeight: '1.5', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {term.shortDefinition}
                    </p>
                    <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
                      <span style={{ 
                        fontSize: '0.75em', 
                        padding: '4px 8px', 
                        backgroundColor: '#f0f7ff', 
                        color: '#0070f3', 
                        borderRadius: '4px',
                        textTransform: 'uppercase',
                        fontWeight: 'bold'
                      }}>
                        {term.category}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
      </div>
    </>
  );
}
