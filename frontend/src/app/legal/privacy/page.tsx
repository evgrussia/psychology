import { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Политика конфиденциальности — Эмоциональный баланс',
  description: 'Политика конфиденциальности платформы Эмоциональный баланс.',
};

export default function PrivacyPage() {
  return (
    <main id="main-content" className="min-h-screen">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">Политика конфиденциальности</h1>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>1. Общие положения</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              Настоящая Политика конфиденциальности определяет порядок обработки и защиты
              персональных данных пользователей платформы «Эмоциональный баланс».
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>2. Собираемые данные</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              Мы собираем только те данные, которые необходимы для предоставления услуг:
              электронная почта, имя (при регистрации), данные для записи на консультацию.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>3. Использование данных</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              Персональные данные используются исключительно для предоставления услуг платформы
              и не передаются третьим лицам без вашего согласия.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>4. Ваши права</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              Вы имеете право на доступ, исправление, удаление ваших персональных данных, а
              также право на отзыв согласия на обработку.
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
