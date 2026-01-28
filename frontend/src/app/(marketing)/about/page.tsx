import { Metadata } from 'next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'О проекте — Эмоциональный баланс',
  description: 'Узнайте больше о проекте Эмоциональный баланс и нашей миссии.',
};

export default function AboutPage() {
  return (
    <main id="main-content" className="min-h-screen">
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-8">О проекте</h1>
        <div className="prose max-w-none">
          <p className="text-lg text-muted-foreground mb-8">
            Эмоциональный баланс — это платформа для психологической помощи онлайн,
            которая помогает людям сделать первый шаг к эмоциональному благополучию.
          </p>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Наша миссия</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Мы верим, что каждый человек заслуживает доступа к качественной психологической
                помощи. Наша цель — сделать психологическую поддержку доступной, удобной и
                эффективной.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Что мы предлагаем</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-6 space-y-2">
                <li>Интерактивные инструменты для самопознания</li>
                <li>Онлайн консультации с профессиональными психологами</li>
                <li>Образовательные материалы и ресурсы</li>
                <li>Поддержку на каждом этапе пути</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
