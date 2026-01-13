'use client';

import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

interface SafeMarkdownRendererProps {
  content: string;
  className?: string;
  style?: React.CSSProperties;
}

export default function SafeMarkdownRenderer({ content, className, style }: SafeMarkdownRendererProps) {
  const [error, setError] = useState<string | null>(null);
  const [renderedContent, setRenderedContent] = useState<string>(content);

  useEffect(() => {
    setError(null);
    setRenderedContent(content);
  }, [content]);

  // Try to render and catch errors
  try {
    return (
      <div className={className} style={style}>
        {error ? (
          <div
            style={{
              padding: '20px',
              textAlign: 'center',
              backgroundColor: '#fff3cd',
              border: '1px solid #ffc107',
              borderRadius: '4px',
              color: '#856404',
            }}
          >
            <p style={{ margin: '0 0 10px 0', fontWeight: 'bold' }}>⚠️ Ошибка отображения контента</p>
            <p style={{ margin: 0, fontSize: '0.9em' }}>
              Произошла ошибка при рендеринге markdown. Контент сохранен, но может отображаться некорректно.
            </p>
            <details style={{ marginTop: '15px', textAlign: 'left' }}>
              <summary style={{ cursor: 'pointer', fontSize: '0.85em' }}>Техническая информация</summary>
              <pre
                style={{
                  marginTop: '10px',
                  padding: '10px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '4px',
                  fontSize: '0.8em',
                  overflow: 'auto',
                }}
              >
                {error}
              </pre>
            </details>
            <div
              style={{
                marginTop: '15px',
                padding: '15px',
                backgroundColor: '#f8f9fa',
                borderRadius: '4px',
                fontSize: '0.9em',
                textAlign: 'left',
                whiteSpace: 'pre-wrap',
                maxHeight: '300px',
                overflow: 'auto',
              }}
            >
              {renderedContent.substring(0, 500)}
              {renderedContent.length > 500 && '...'}
            </div>
          </div>
        ) : (
          <ReactMarkdown
            components={{
              // Custom renderers for better error handling
              img: ({ src, alt, ...props }) => (
                <img
                  src={src}
                  alt={alt || 'Изображение'}
                  {...props}
                  onError={(e) => {
                    console.error('Image load error:', src);
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ),
            }}
          >
            {renderedContent}
          </ReactMarkdown>
        )}
      </div>
    );
  } catch (err) {
    // Fallback if ReactMarkdown itself throws
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('Markdown render error:', err);
    
    return (
      <div
        className={className}
        style={{
          ...style,
          padding: '20px',
          textAlign: 'center',
          backgroundColor: '#fff3cd',
          border: '1px solid #ffc107',
          borderRadius: '4px',
          color: '#856404',
        }}
      >
        <p style={{ margin: '0 0 10px 0', fontWeight: 'bold' }}>⚠️ Ошибка отображения контента</p>
        <p style={{ margin: 0, fontSize: '0.9em' }}>
          Произошла ошибка при рендеринге markdown. Пожалуйста, сообщите об этом администратору.
        </p>
        <details style={{ marginTop: '15px', textAlign: 'left' }}>
          <summary style={{ cursor: 'pointer', fontSize: '0.85em' }}>Техническая информация</summary>
          <pre
            style={{
              marginTop: '10px',
              padding: '10px',
              backgroundColor: '#f8f9fa',
              borderRadius: '4px',
              fontSize: '0.8em',
              overflow: 'auto',
            }}
          >
            {errorMessage}
          </pre>
        </details>
      </div>
    );
  }
}
