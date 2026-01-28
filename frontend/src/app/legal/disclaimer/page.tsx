import { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Дисклеймер — Эмоциональный баланс',
  description: 'Дисклеймер платформы Эмоциональный баланс.',
};

export default function DisclaimerPage() {
  return (
    <main id="main-content" className="min-h-screen">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">Дисклеймер</h1>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Важная информация</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Платформа «Эмоциональный баланс» предоставляет информационные и консультационные
              услуги. Информация на платформе не заменяет профессиональную медицинскую помощь.
            </p>
            <p>
              В случае кризисной ситуации немедленно обратитесь к специалистам экстренных служб
              или в ближайшее медицинское учреждение.
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
