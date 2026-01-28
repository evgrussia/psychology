import { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Публичная оферта — Эмоциональный баланс',
  description: 'Публичная оферта на оказание услуг платформы Эмоциональный баланс.',
};

export default function OfferPage() {
  return (
    <main id="main-content" className="min-h-screen">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">Публичная оферта</h1>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>1. Предмет договора</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              Настоящая публичная оферта определяет условия оказания услуг платформы
              «Эмоциональный баланс».
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>2. Условия оказания услуг</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              Услуги предоставляются в соответствии с условиями, указанными на платформе. Оплата
              производится в соответствии с выбранным тарифом.
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
