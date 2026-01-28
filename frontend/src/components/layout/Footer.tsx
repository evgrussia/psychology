import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t bg-card mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <p className="font-semibold mb-4" aria-level={3} role="heading">
              Эмоциональный баланс
            </p>
            <p className="text-sm text-muted-foreground">
              Психологическая помощь онлайн
            </p>
          </div>
          <div>
            <p className="font-semibold mb-4" aria-level={4} role="heading">
              Навигация
            </p>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-foreground">
                  О проекте
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="text-muted-foreground hover:text-foreground">
                  Как это работает
                </Link>
              </li>
              <li>
                <Link href="/topics" className="text-muted-foreground hover:text-foreground">
                  С чем я помогаю
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="font-semibold mb-4" aria-level={4} role="heading">
              Правовая информация
            </p>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/legal/privacy"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Политика конфиденциальности
                </Link>
              </li>
              <li>
                <Link
                  href="/legal/personal-data-consent"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Согласие на обработку ПДн
                </Link>
              </li>
              <li>
                <Link href="/legal/offer" className="text-muted-foreground hover:text-foreground">
                  Оферта
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="font-semibold mb-4" aria-level={4} role="heading">
              Контакты
            </p>
            <p className="text-sm text-muted-foreground">
              По вопросам обращайтесь через форму обратной связи
            </p>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Эмоциональный баланс. Все права защищены.</p>
        </div>
      </div>
    </footer>
  );
}
