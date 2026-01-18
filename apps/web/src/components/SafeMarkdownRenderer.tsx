'use client';

import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Alert, AlertDescription, AlertTitle, Card } from '@psychology/design-system';

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
          <div className="space-y-4">
            <Alert className="border-warning/40 bg-warning/10 text-foreground">
              <AlertTitle className="text-warning flex items-center gap-2">
                <span aria-hidden>⚠️</span> Ошибка отображения контента
              </AlertTitle>
              <AlertDescription>
                Произошла ошибка при рендеринге markdown. Контент сохранен, но может отображаться
                некорректно.
              </AlertDescription>
            </Alert>
            <details className="text-sm">
              <summary className="text-foreground cursor-pointer">Техническая информация</summary>
              <Card className="bg-muted/60 text-muted-foreground mt-3 border border-border p-3 text-xs">
                <pre className="whitespace-pre-wrap">{error}</pre>
              </Card>
            </details>
            <Card className="bg-muted/60 text-muted-foreground border border-border p-4 text-sm">
              <div className="whitespace-pre-wrap">
                {renderedContent.substring(0, 500)}
                {renderedContent.length > 500 && '...'}
              </div>
            </Card>
          </div>
        ) : (
          <ReactMarkdown
            components={{
              // Custom renderers for better error handling
              img: ({ src, alt, ...props }) => <img src={src} alt={alt || 'Изображение'} {...props} />,
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
      <div className={className} style={style}>
        <div className="space-y-4">
          <Alert className="border-warning/40 bg-warning/10 text-foreground">
            <AlertTitle className="text-warning flex items-center gap-2">
              <span aria-hidden>⚠️</span> Ошибка отображения контента
            </AlertTitle>
            <AlertDescription>
              Произошла ошибка при рендеринге markdown. Пожалуйста, сообщите об этом администратору.
            </AlertDescription>
          </Alert>
          <details className="text-sm">
            <summary className="text-foreground cursor-pointer">Техническая информация</summary>
            <Card className="bg-muted/60 text-muted-foreground mt-3 border border-border p-3 text-xs">
              <pre className="whitespace-pre-wrap">{errorMessage}</pre>
            </Card>
          </details>
        </div>
      </div>
    );
  }
}
