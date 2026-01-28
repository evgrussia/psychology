import { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Согласие на обработку персональных данных — Эмоциональный баланс',
  description: 'Согласие на обработку персональных данных.',
};

export default function PersonalDataConsentPage() {
  return (
    <main id="main-content" className="min-h-screen">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">Согласие на обработку персональных данных</h1>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Согласие субъекта персональных данных</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Настоящим я даю согласие на обработку моих персональных данных в соответствии с
              Федеральным законом от 27.07.2006 № 152-ФЗ «О персональных данных».
            </p>
            <p>
              Я подтверждаю, что ознакомлен(а) с Политикой конфиденциальности и даю согласие на
              обработку персональных данных для целей предоставления услуг платформы.
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
