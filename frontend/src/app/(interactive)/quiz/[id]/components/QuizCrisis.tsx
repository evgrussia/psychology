import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export function QuizCrisis() {
  const router = useRouter();
  return (
    <Alert variant="destructive">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Требуется помощь</AlertTitle>
      <AlertDescription className="mt-2 space-y-4">
        <p>
          Ваши ответы указывают на то, что вам может потребоваться профессиональная помощь.
        </p>
        <p>
          Если вы находитесь в кризисной ситуации, пожалуйста, обратитесь за помощью:
        </p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>Телефон доверия: 8-800-2000-122</li>
          <li>Экстренная служба: 112</li>
        </ul>
        <div className="flex gap-4 mt-4">
          <Button variant="outline" className="w-full" onClick={() => router.push('/')}>
            На главную
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}
