import './globals.css';
import '@psychology/design-system/styles.css';
import { ThemeProvider } from '@/components/theme-provider';
import { LayoutClientWrapper } from '@/components/layout-client-wrapper';

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
    <html lang="ru" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <LayoutClientWrapper>
            {children}
          </LayoutClientWrapper>
        </ThemeProvider>
      </body>
    </html>
  )
}
