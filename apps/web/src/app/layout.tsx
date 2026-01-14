import './globals.css';
import { spacing, colors, typography } from '@psychology/design-system/tokens';
import { Container } from '@psychology/design-system/components';

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
          padding: `${spacing.space[10]} 0`,
          backgroundColor: colors.bg.secondary,
          borderTop: `1px solid ${colors.border.primary}`,
          marginTop: spacing.space[16],
        }}>
          <Container>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: spacing.space[8],
            }}>
              <div>
                <h3 style={{ 
                  marginBottom: spacing.space[4], 
                  fontSize: typography.fontSize.body, 
                  fontWeight: typography.fontWeight.semibold 
                }}>Навигация</h3>
                <nav style={{ display: 'flex', flexDirection: 'column', gap: spacing.space[2] }}>
                  <a href="/start" style={{ color: colors.text.secondary }}>С чего начать</a>
                  <a href="/s-chem-ya-pomogayu" style={{ color: colors.text.secondary }}>С чем я помогаю</a>
                  <a href="/services" style={{ color: colors.text.secondary }}>Услуги</a>
                  <a href="/about" style={{ color: colors.text.secondary }}>О психологе</a>
                  <a href="/how-it-works" style={{ color: colors.text.secondary }}>Как проходит консультация</a>
                  <a href="/blog" style={{ color: colors.text.secondary }}>Блог</a>
                </nav>
              </div>
              <div>
                <h3 style={{ 
                  marginBottom: spacing.space[4], 
                  fontSize: typography.fontSize.body, 
                  fontWeight: typography.fontWeight.semibold, 
                  color: colors.semantic.error.DEFAULT 
                }}>⚠️ Экстренная помощь</h3>
                <p style={{ marginBottom: spacing.space[3], fontSize: typography.fontSize['body-sm'], color: colors.text.secondary }}>
                  Если вам нужна немедленная помощь:
                </p>
                <ul style={{ 
                  fontSize: typography.fontSize['body-sm'], 
                  color: colors.text.secondary, 
                  lineHeight: 1.6, 
                  paddingLeft: spacing.space[5] 
                }}>
                  <li>Телефон доверия: <strong>8-800-2000-122</strong></li>
                  <li>МЧС: <strong>+7 (495) 989-50-50</strong></li>
                  <li>Скорая помощь: <strong>112</strong></li>
                </ul>
                <a href="/emergency" style={{ 
                  display: 'inline-block',
                  marginTop: spacing.space[3],
                  fontSize: typography.fontSize['body-sm'],
                  color: colors.semantic.error.DEFAULT,
                  fontWeight: typography.fontWeight.semibold,
                  textDecoration: 'underline'
                }}>
                  Все экстренные контакты
                </a>
              </div>
              <div>
                <h3 style={{ 
                  marginBottom: spacing.space[4], 
                  fontSize: typography.fontSize.body, 
                  fontWeight: typography.fontWeight.semibold 
                }}>Юридическая информация</h3>
                <nav style={{ display: 'flex', flexDirection: 'column', gap: spacing.space[2] }}>
                  <a href="/legal/privacy" style={{ color: colors.text.secondary, fontSize: typography.fontSize['body-sm'] }}>Политика конфиденциальности</a>
                  <a href="/legal/personal-data-consent" style={{ color: colors.text.secondary, fontSize: typography.fontSize['body-sm'] }}>Согласие на обработку ПДн</a>
                  <a href="/legal/offer" style={{ color: colors.text.secondary, fontSize: typography.fontSize['body-sm'] }}>Публичная оферта</a>
                  <a href="/legal/disclaimer" style={{ color: colors.text.secondary, fontSize: typography.fontSize['body-sm'] }}>Отказ от ответственности</a>
                  <a href="/legal/cookies" style={{ color: colors.text.secondary, fontSize: typography.fontSize['body-sm'] }}>Cookie Policy</a>
                </nav>
              </div>
            </div>
            <div style={{
              marginTop: spacing.space[8],
              paddingTop: spacing.space[6],
              borderTop: `1px solid ${colors.border.primary}`,
              textAlign: 'center',
              fontSize: typography.fontSize['body-sm'],
              color: colors.text.muted,
            }}>
              <p>© 2026 Эмоциональный баланс. Все права защищены.</p>
              <p style={{ marginTop: spacing.space[2], fontSize: typography.fontSize.caption }}>
                Информация на сайте не является публичной офертой и носит информационный характер.
              </p>
            </div>
          </Container>
        </footer>
      </body>
    </html>
  )
}
