'use client';

import { useQuery } from '@tanstack/react-query';
import { cabinetService } from '@/services/api/cabinet';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { ErrorState } from '@/components/shared/ErrorState';
import { useTracking } from '@/hooks/useTracking';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Calendar, BookOpen, FileText, ArrowRight, LogOut } from 'lucide-react';

export default function CabinetPage() {
  const { track } = useTracking();
  const { logout } = useAuth();
  const router = useRouter();

  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['cabinet-stats'],
    queryFn: () => cabinetService.getStats(),
  });

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Личный кабинет</h1>
        <Button variant="ghost" onClick={handleLogout} className="flex items-center gap-2 text-muted-foreground hover:text-destructive transition-colors">
          <LogOut className="h-4 w-4" aria-hidden="true" />
          Выйти
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Встречи
              </CardTitle>
              <CardDescription>
                {stats?.upcoming_appointments || 0} предстоящих
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/cabinet/appointments">
                  Перейти <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Дневники
              </CardTitle>
              <CardDescription>
                {stats?.diary_entries_count || 0} записей
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/cabinet/diary">
                  Перейти <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Материалы
              </CardTitle>
              <CardDescription>
                {stats?.materials_count || 0} доступно
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/cabinet/materials">
                  Перейти <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Быстрые действия</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/booking">Записаться на консультацию</Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/quiz/QZ-01">Пройти диагностику</Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/navigator">Навигатор состояния</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Недавняя активность</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Ваша недавняя активность появится здесь
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
