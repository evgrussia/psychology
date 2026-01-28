import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Эмоциональный баланс — Психологическая помощь онлайн',
  description: 'Первый шаг к эмоциональному балансу. Интерактивные инструменты, консультации, ресурсы.',
};

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Эмоциональный баланс</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Первый шаг к эмоциональному балансу
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/booking">Записаться на консультацию</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/topics">С чем я помогаю</Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <Card>
            <CardHeader>
              <CardTitle>Интерактивные инструменты</CardTitle>
              <CardDescription>
                Квизы, навигатор состояния и другие инструменты для самопознания
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline">
                <Link href="/quiz">Попробовать</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Консультации</CardTitle>
              <CardDescription>
                Онлайн консультации с профессиональным психологом
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline">
                <Link href="/booking">Записаться</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ресурсы</CardTitle>
              <CardDescription>
                Статьи, материалы и подборки по психологии
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline">
                <Link href="/blog">Читать</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-20">
          <h2 className="text-3xl font-bold mb-8 text-center">С чем я помогаю</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'Тревога', description: 'Помощь в преодолении тревожных состояний и панических атак', slug: 'anxiety' },
              { title: 'Выгорание', description: 'Восстановление сил и поиск баланса при профессиональном выгорании', slug: 'burnout' },
              { title: 'Отношения', description: 'Разрешение конфликтов и построение гармоничных отношений', slug: 'relationships' },
              { title: 'Самооценка', description: 'Работа над уверенностью в себе и принятием себя', slug: 'self-esteem' },
            ].map((problem) => (
              <Card key={problem.slug} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-xl">{problem.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{problem.description}</p>
                  <Button asChild variant="ghost" size="sm" className="p-0 hover:bg-transparent text-primary">
                    <Link href={`/topics/${problem.slug}`}>Узнать больше →</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center mt-10">
            <Button asChild variant="outline">
              <Link href="/topics">Все темы</Link>
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
