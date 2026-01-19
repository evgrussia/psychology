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

  const mergeClassName = (base: string, extra?: string) =>
    [base, extra].filter(Boolean).join(' ');

  const markdownComponents = {
    h1: ({ className: innerClassName, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
      <h1
        className={mergeClassName('text-3xl md:text-4xl font-bold text-foreground mt-8 first:mt-0', innerClassName)}
        {...props}
      />
    ),
    h2: ({ className: innerClassName, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
      <h2
        className={mergeClassName('text-2xl md:text-3xl font-bold text-foreground mt-8 first:mt-0', innerClassName)}
        {...props}
      />
    ),
    h3: ({ className: innerClassName, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
      <h3
        className={mergeClassName('text-xl font-semibold text-foreground mt-6 first:mt-0', innerClassName)}
        {...props}
      />
    ),
    h4: ({ className: innerClassName, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
      <h4
        className={mergeClassName('text-lg font-semibold text-foreground mt-4 first:mt-0', innerClassName)}
        {...props}
      />
    ),
    p: ({ className: innerClassName, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
      <p className={mergeClassName('text-base leading-relaxed text-muted-foreground', innerClassName)} {...props} />
    ),
    ul: ({ className: innerClassName, ...props }: React.HTMLAttributes<HTMLUListElement>) => (
      <ul
        className={mergeClassName('list-disc pl-6 space-y-2 text-muted-foreground marker:text-primary', innerClassName)}
        {...props}
      />
    ),
    ol: ({ className: innerClassName, ...props }: React.HTMLAttributes<HTMLOListElement>) => (
      <ol
        className={mergeClassName(
          'list-decimal pl-6 space-y-2 text-muted-foreground marker:text-primary marker:font-semibold',
          innerClassName,
        )}
        {...props}
      />
    ),
    li: ({ className: innerClassName, ...props }: React.HTMLAttributes<HTMLLIElement>) => (
      <li className={mergeClassName('text-base leading-relaxed', innerClassName)} {...props} />
    ),
    a: ({ className: innerClassName, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
      <a
        className={mergeClassName('text-primary underline-offset-4 hover:underline', innerClassName)}
        {...props}
      />
    ),
    blockquote: ({ className: innerClassName, ...props }: React.BlockquoteHTMLAttributes<HTMLQuoteElement>) => (
      <blockquote
        className={mergeClassName(
          'border-l-4 border-border bg-muted/40 px-4 py-3 text-muted-foreground',
          innerClassName,
        )}
        {...props}
      />
    ),
    code: ({ className: innerClassName, ...props }: React.HTMLAttributes<HTMLElement>) => (
      <code
        className={mergeClassName('rounded bg-muted px-1 py-0.5 text-sm text-foreground', innerClassName)}
        {...props}
      />
    ),
    pre: ({ className: innerClassName, ...props }: React.HTMLAttributes<HTMLPreElement>) => (
      <pre
        className={mergeClassName(
          'overflow-x-auto rounded-lg border border-border bg-muted/40 p-4 text-sm text-foreground',
          innerClassName,
        )}
        {...props}
      />
    ),
    hr: ({ className: innerClassName, ...props }: React.HTMLAttributes<HTMLHRElement>) => (
      <hr className={mergeClassName('border-border', innerClassName)} {...props} />
    ),
    img: ({ className: innerClassName, alt, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) => (
      <img
        className={mergeClassName('rounded-lg border border-border', innerClassName)}
        alt={alt || 'Изображение'}
        {...props}
      />
    ),
    strong: ({ className: innerClassName, ...props }: React.HTMLAttributes<HTMLElement>) => (
      <strong className={mergeClassName('text-foreground font-semibold', innerClassName)} {...props} />
    ),
    em: ({ className: innerClassName, ...props }: React.HTMLAttributes<HTMLElement>) => (
      <em className={mergeClassName('text-foreground/90', innerClassName)} {...props} />
    ),
  };

  // Try to render and catch errors
  try {
    return (
      <div className={mergeClassName('space-y-4', className)} style={style}>
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
            components={markdownComponents}
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
