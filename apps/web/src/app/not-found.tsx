'use client';

import React from 'react';
import { Button, Container, Section } from '@psychology/design-system';

export default function NotFound() {
  return (
    <main className="min-h-[80vh] flex flex-col items-center justify-center text-center px-6">
      <div className="text-[120px] font-extrabold text-primary/20 leading-none mb-4">
        404
      </div>
      
      <h1 className="text-4xl font-bold mb-4 text-foreground">
        Страница не найдена
      </h1>
      
      <p className="text-lg text-muted-foreground max-w-lg mb-12 text-balance">
        Похоже, эта страница куда-то ушла. Но не волнуйтесь, мы поможем вам найти дорогу.
      </p>

      <div className="bg-muted p-8 md:p-12 rounded-[2.5rem] w-full max-w-2xl mb-12 border border-border">
        <h2 className="text-2xl font-bold mb-6 text-foreground text-center">С чего начать?</h2>
        <p className="text-muted-foreground mb-8 text-center">
          Вы можете начать с руководства, изучить материалы блога или узнать больше об услугах.
        </p>
        <nav className="grid grid-cols-1 sm:grid-cols-2 gap-4" aria-label="Навигация по основным разделам">
          {[
            { href: '/start', icon: '📖', label: 'Руководство' },
            { href: '/blog', icon: '📝', label: 'Читать блог' },
            { href: '/services', icon: '🤝', label: 'Мои услуги' },
            { href: '/about', icon: '👩‍💼', label: 'О психологе' },
          ].map((link) => (
            <a 
              key={link.href}
              href={link.href} 
              className="p-6 bg-background rounded-2xl font-semibold border border-border hover:border-primary hover:shadow-lg transition-all flex flex-col items-center gap-3 group"
            >
              <span className="text-3xl group-hover:scale-110 transition-transform">{link.icon}</span>
              <span className="text-foreground group-hover:text-primary transition-colors">{link.label}</span>
            </a>
          ))}
        </nav>
      </div>

      <Button size="lg" className="px-12" onClick={() => window.location.href = '/'}>
        На главную
      </Button>
    </main>
  );
}
