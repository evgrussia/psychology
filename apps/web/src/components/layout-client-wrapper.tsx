"use client";

import React from 'react';
import { Button, Container } from '@psychology/design-system';

export function LayoutClientWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <a className="skip-link" href="#main-content">
        Перейти к основному содержимому
      </a>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <Container className="flex h-16 items-center justify-between">
          <a href="/" className="flex items-center gap-2 group">
            <div className="h-10 w-auto">
              <img 
                src="/assets/graphics/brand/logo-full.svg" 
                alt="Эмоциональный баланс" 
                className="h-full w-auto transition-transform group-hover:scale-105"
              />
            </div>
          </a>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium" aria-label="Основная навигация">
            <a href="/services" className="transition-colors hover:text-primary">Услуги</a>
            <a href="/start" className="transition-colors hover:text-primary">С чего начать</a>
            <a href="/about" className="transition-colors hover:text-primary">Обо мне</a>
            <a href="/blog" className="transition-colors hover:text-primary">Блог</a>
            <a href="/contacts" className="transition-colors hover:text-primary">Контакты</a>
            <a href="/cabinet" className="transition-colors hover:text-primary">Личный кабинет</a>
          </nav>
          <div className="flex items-center gap-4">
            <Button asChild variant="outline" className="hidden sm:inline-flex">
              <a href="/login">Войти</a>
            </Button>
            <Button asChild>
              <a href="/booking">Записаться</a>
            </Button>
          </div>
        </Container>
      </header>
      
      <main id="main-content" className="flex-1" tabIndex={-1}>
        {children}
      </main>

      <footer className="mt-16 border-t bg-muted py-12">
        <Container>
          <div className="grid grid-cols-1 gap-12 md:grid-cols-4">
            <div className="space-y-4">
              <a href="/" className="flex items-center gap-2">
                <img 
                  src="/assets/graphics/brand/logo-full.svg" 
                  alt="Эмоциональный баланс" 
                  className="h-8 w-auto grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all"
                />
              </a>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Профессиональная психологическая помощь и поддержка на пути к вашему внутреннему балансу.
              </p>
            </div>
            <div>
              <h3 className="mb-4 text-base font-semibold">Навигация</h3>
              <nav className="flex flex-col gap-2">
                <a href="/start" className="text-sm text-muted-foreground hover:text-foreground">С чего начать</a>
                <a href="/s-chem-ya-pomogayu" className="text-sm text-muted-foreground hover:text-foreground">С чем я помогаю</a>
                <a href="/services" className="text-sm text-muted-foreground hover:text-foreground">Услуги</a>
                <a href="/about" className="text-sm text-muted-foreground hover:text-foreground">О психологе</a>
                <a href="/how-it-works" className="text-sm text-muted-foreground hover:text-foreground">Как проходит консультация</a>
                <a href="/blog" className="text-sm text-muted-foreground hover:text-foreground">Блог</a>
                <a href="/contacts" className="text-sm text-muted-foreground hover:text-foreground">Контакты</a>
              </nav>
            </div>
            <div>
              <h3 className="mb-4 text-base font-semibold text-destructive">⚠️ Экстренная помощь</h3>
              <p className="mb-3 text-sm text-muted-foreground">
                Если вам нужна немедленная помощь:
              </p>
              <ul className="list-inside list-disc pl-2 text-sm leading-relaxed text-muted-foreground">
                <li>Телефон доверия: <strong className="font-semibold text-foreground">8-800-2000-122</strong></li>
                <li>МЧС: <strong className="font-semibold text-foreground">+7 (495) 989-50-50</strong></li>
                <li>Скорая помощь: <strong className="font-semibold text-foreground">112</strong></li>
              </ul>
              <a href="/emergency" className="mt-3 inline-block text-sm font-semibold text-destructive underline hover:opacity-80">
                Все экстренные контакты
              </a>
            </div>
            <div>
              <h3 className="mb-4 text-base font-semibold">Юридическая информация</h3>
              <nav className="flex flex-col gap-2">
                <a href="/legal/privacy" className="text-sm text-muted-foreground hover:text-foreground">Политика конфиденциальности</a>
                <a href="/legal/personal-data-consent" className="text-sm text-muted-foreground hover:text-foreground">Согласие на обработку ПДн</a>
                <a href="/legal/offer" className="text-sm text-muted-foreground hover:text-foreground">Публичная оферта</a>
                <a href="/legal/disclaimer" className="text-sm text-muted-foreground hover:text-foreground">Отказ от ответственности</a>
                <a href="/legal/cookies" className="text-sm text-muted-foreground hover:text-foreground">Cookie Policy</a>
              </nav>
            </div>
          </div>
          <div className="mt-12 border-t pt-8 text-center text-sm text-muted-foreground">
            <p>© 2026 Эмоциональный баланс. Все права защищены.</p>
            <p className="mt-2 text-xs">
              Информация на сайте не является публичной офертой и носит информационный характер.
            </p>
          </div>
        </Container>
      </footer>
    </div>
  );
}
