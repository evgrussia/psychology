'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Что-то пошло не так</CardTitle>
          <CardDescription>
            Произошла ошибка. Пожалуйста, попробуйте ещё раз.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={reset}>Попробовать снова</Button>
        </CardContent>
      </Card>
    </div>
  );
}
