import { Metadata } from 'next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Как это работает — Эмоциональный баланс',
  description: 'Узнайте, как работает платформа Эмоциональный баланс.',
};

export default function HowItWorksPage() {
  return (
    <main id="main-content" className="min-h-screen">
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-8">Как это работает</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Шаг 1</CardTitle>
              <CardDescription>Изучите инструменты</CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                Попробуйте интерактивные инструменты — квизы, навигатор состояния и другие
                инструменты для самопознания.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Шаг 2</CardTitle>
              <CardDescription>Запишитесь на консультацию</CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                Выберите удобное время и заполните анкету. Мы подберём для вас подходящего
                специалиста.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Шаг 3</CardTitle>
              <CardDescription>Получите поддержку</CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                Пройдите консультацию онлайн и получите рекомендации. Продолжайте работу с
                материалами и инструментами.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
