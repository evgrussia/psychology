import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { QuizResult } from '@/types/api';

interface QuizResultsProps {
  result: QuizResult;
}

export function QuizResults({ result }: QuizResultsProps) {
  const router = useRouter();
  return (
    <Card>
      <CardHeader>
        <CardTitle>Результаты квиза</CardTitle>
        <CardDescription>Уровень: {result.level}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-semibold mb-2">Профиль:</h3>
          <p className="text-muted-foreground">{result.profile}</p>
        </div>
        <div>
          <h3 className="font-semibold mb-2">Рекомендации:</h3>
          <ul className="list-disc list-inside space-y-2 ml-4">
            {result.recommendations.map((rec, idx) => (
              <li key={idx} className="text-muted-foreground">
                {rec}
              </li>
            ))}
          </ul>
        </div>
        <div className="flex gap-4 mt-6">
          <Button onClick={() => router.push('/booking')}>
            Записаться на консультацию
          </Button>
          <Button variant="outline" onClick={() => router.push('/')}>
            На главную
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
