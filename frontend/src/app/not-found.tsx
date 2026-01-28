import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>404 — Страница не найдена</CardTitle>
          <CardDescription>
            Запрашиваемая страница не существует или была перемещена.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href="/">Вернуться на главную</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
