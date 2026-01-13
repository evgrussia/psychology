export const metadata = {
  title: 'Эмоциональный баланс — Психологическая поддержка онлайн',
  description: 'Тёплое пространство профессиональной поддержки. Помогаю справиться с тревогой, выгоранием и найти опору в себе. Запись на консультацию онлайн.',
  keywords: 'психолог онлайн, психологическая помощь, тревога, выгорание, консультация психолога',
  openGraph: {
    title: 'Эмоциональный баланс — Психологическая поддержка',
    description: 'Тёплое пространство профессиональной поддержки. Помощь с тревогой, выгоранием, отношениями.',
    type: 'website',
    locale: 'ru_RU',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <body>
        {children}
        <footer style={{
          padding: '40px 24px',
          backgroundColor: '#f5f5f5',
          borderTop: '1px solid #e0e0e0',
          marginTop: '60px',
        }}>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '32px',
          }}>
            <div>
              <h3 style={{ marginBottom: '16px', fontSize: '16px', fontWeight: 600 }}>Навигация</h3>
              <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <a href="/start" style={{ color: '#666', textDecoration: 'none' }}>С чего начать</a>
                <a href="/s-chem-ya-pomogayu" style={{ color: '#666', textDecoration: 'none' }}>С чем я помогаю</a>
                <a href="/services" style={{ color: '#666', textDecoration: 'none' }}>Услуги</a>
                <a href="/about" style={{ color: '#666', textDecoration: 'none' }}>О психологе</a>
                <a href="/how-it-works" style={{ color: '#666', textDecoration: 'none' }}>Как проходит консультация</a>
                <a href="/blog" style={{ color: '#666', textDecoration: 'none' }}>Блог</a>
              </nav>
            </div>
            <div>
              <h3 style={{ marginBottom: '16px', fontSize: '16px', fontWeight: 600, color: '#d32f2f' }}>⚠️ Экстренная помощь</h3>
              <p style={{ marginBottom: '12px', fontSize: '14px', color: '#666' }}>
                Если вам нужна немедленная помощь:
              </p>
              <ul style={{ fontSize: '14px', color: '#666', lineHeight: 1.6, paddingLeft: '20px' }}>
                <li>Телефон доверия: <strong>8-800-2000-122</strong></li>
                <li>МЧС: <strong>+7 (495) 989-50-50</strong></li>
                <li>Скорая помощь: <strong>112</strong></li>
              </ul>
              <a href="/emergency" style={{ 
                display: 'inline-block',
                marginTop: '12px',
                fontSize: '14px',
                color: '#d32f2f',
                fontWeight: 600,
                textDecoration: 'underline'
              }}>
                Все экстренные контакты
              </a>
            </div>
            <div>
              <h3 style={{ marginBottom: '16px', fontSize: '16px', fontWeight: 600 }}>Юридическая информация</h3>
              <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <a href="/legal/privacy" style={{ color: '#666', textDecoration: 'none', fontSize: '14px' }}>Политика конфиденциальности</a>
                <a href="/legal/personal-data-consent" style={{ color: '#666', textDecoration: 'none', fontSize: '14px' }}>Согласие на обработку ПДн</a>
                <a href="/legal/offer" style={{ color: '#666', textDecoration: 'none', fontSize: '14px' }}>Публичная оферта</a>
                <a href="/legal/disclaimer" style={{ color: '#666', textDecoration: 'none', fontSize: '14px' }}>Отказ от ответственности</a>
                <a href="/legal/cookies" style={{ color: '#666', textDecoration: 'none', fontSize: '14px' }}>Cookie Policy</a>
              </nav>
            </div>
          </div>
          <div style={{
            maxWidth: '1200px',
            margin: '32px auto 0',
            paddingTop: '24px',
            borderTop: '1px solid #e0e0e0',
            textAlign: 'center',
            fontSize: '14px',
            color: '#999',
          }}>
            <p>© 2026 Эмоциональный баланс. Все права защищены.</p>
            <p style={{ marginTop: '8px', fontSize: '12px' }}>
              Информация на сайте не является публичной офертой и носит информационный характер.
            </p>
          </div>
        </footer>
      </body>
    </html>
  )
}
