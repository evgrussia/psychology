import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface QuizStartProps {
  title: string;
  slug: string;
  questionCount: number;
  onStart: () => void;
}

export function QuizStart({ title, slug, questionCount, onStart }: QuizStartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{slug}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground">
          Этот квиз поможет вам лучше понять ваше состояние. Ответьте на все вопросы честно.
        </p>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Вопросов: {questionCount}</span>
        </div>
        <Button onClick={onStart} className="w-full">
          Начать квиз
        </Button>
      </CardContent>
    </Card>
  );
}
