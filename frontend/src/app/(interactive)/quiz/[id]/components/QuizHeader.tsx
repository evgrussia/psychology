import { CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface QuizHeaderProps {
  title: string;
  description?: string;
}

export function QuizHeader({ title, description }: QuizHeaderProps) {
  return (
    <CardHeader>
      <CardTitle>{title}</CardTitle>
      {description && <CardDescription>{description}</CardDescription>}
    </CardHeader>
  );
}
