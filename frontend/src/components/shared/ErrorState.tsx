import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { isApiError } from '@/types/api';

interface ErrorStateProps {
  title?: string;
  message?: string;
  error?: unknown;
  onRetry?: () => void;
}

export function ErrorState({ title = 'Ошибка', message, error, onRetry }: ErrorStateProps) {
  let displayMessage = message;

  if (!displayMessage && error) {
    if (isApiError(error)) {
      displayMessage = error.error.message;
    } else if (error instanceof Error) {
      displayMessage = error.message;
    } else {
      displayMessage = 'Произошла ошибка. Пожалуйста, попробуйте позже.';
    }
  }

  if (!displayMessage) {
    displayMessage = 'Произошла ошибка. Пожалуйста, попробуйте позже.';
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-destructive" aria-hidden="true" />
          <CardTitle>{title}</CardTitle>
        </div>
        <CardDescription>{displayMessage}</CardDescription>
      </CardHeader>
      {onRetry && (
        <CardContent>
          <Button onClick={onRetry}>Попробовать снова</Button>
        </CardContent>
      )}
    </Card>
  );
}
