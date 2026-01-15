"use client";

import React from 'react';
import { Container } from '@psychology/design-system';

export function LayoutClientWrapper({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <footer className="mt-16 border-t bg-muted py-10">
        <Container>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div>
              <h3 className="mb-4 text-base font-semibold">Навигация</h3>
              <nav className="flex flex-col gap-2">
                <a href="/start" className="text-sm text-muted-foreground hover:text-foreground">С чего начать</a>
                <a href="/s-chem-ya-pomogayu" className="text-sm text-muted-foreground hover:text-foreground">С чем я помогаю</a>
                <a href="/services" className="text-sm text-muted-foreground hover:text-foreground">Услуги</a>
                <a href="/about" className="text-sm text-muted-foreground hover:text-foreground">О психологе</a>
                <a href="/how-it-works" className="text-sm text-muted-foreground hover:text-foreground">Как проходит консультация</a>
                <a href="/blog" className="text-sm text-muted-foreground hover:text-foreground">Блог</a>
              </nav>
            </div>
            <div>
              <h3 className="mb-4 text-base font-semibold text-destructive">⚠️ Экстренная помощь</h3>
              <p className="mb-3 text-sm text-muted-foreground">
                Если вам нужна немедленная помощь:
              </p>
              <ul className="list-inside list-disc pl-5 text-sm leading-relaxed text-muted-foreground">
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
          <div className="mt-8 border-t pt-6 text-center text-sm text-muted-foreground">
            <p>© 2026 Эмоциональный баланс. Все права защищены.</p>
            <p className="mt-2 text-xs">
              Информация на сайте не является публичной офертой и носит информационный характер.
            </p>
          </div>
        </Container>
      </footer>
    </>
  );
}
