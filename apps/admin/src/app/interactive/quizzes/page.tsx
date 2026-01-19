'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AdminAuthGuard } from '@/components/admin-auth-guard';
import {
  Alert,
  AlertDescription,
  Badge,
  Button,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@psychology/design-system';

interface QuizDefinition {
  id: string;
  slug: string;
  title: string;
  topicCode: string | null;
  status: 'draft' | 'published' | 'archived';
  publishedAt: string | null;
}

const statusBadgeClasses: Record<QuizDefinition['status'], string> = {
  published: 'border-success/30 bg-success/10 text-success',
  draft: 'border-warning/30 bg-warning/10 text-warning',
  archived: 'border-muted text-muted-foreground bg-muted/40',
};

export default function QuizzesListPage() {
  const [loading, setLoading] = useState(true);
  const [quizzes, setQuizzes] = useState<QuizDefinition[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/interactive/definitions?type=quiz', {
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to fetch quizzes');
      }
      const data = await response.json();
      setQuizzes(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminAuthGuard allowedRoles={['owner', 'assistant', 'editor']}>
      {loading ? (
        <Card>
          <CardContent className="p-8 text-sm text-muted-foreground">Загрузка...</CardContent>
        </Card>
      ) : error ? (
        <Alert variant="destructive">
          <AlertDescription>Ошибка: {error}</AlertDescription>
        </Alert>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-foreground">Управление квизами</h1>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40 text-xs uppercase text-muted-foreground">
                    <TableHead>Название</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Тема</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead>Опубликовано</TableHead>
                    <TableHead>Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quizzes.map((quiz) => (
                    <TableRow key={quiz.id}>
                      <TableCell className="font-medium">{quiz.title}</TableCell>
                      <TableCell className="text-muted-foreground">{quiz.slug}</TableCell>
                      <TableCell className="text-muted-foreground">{quiz.topicCode || '—'}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={statusBadgeClasses[quiz.status]}>
                          {quiz.status === 'published' ? 'Опубликовано' : quiz.status === 'draft' ? 'Черновик' : 'Архив'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {quiz.publishedAt ? new Date(quiz.publishedAt).toLocaleDateString('ru-RU') : '—'}
                      </TableCell>
                      <TableCell>
                        <Button asChild variant="link" className="px-0">
                          <Link href={`/interactive/quizzes/${quiz.id}`}>Редактировать</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {quizzes.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="px-6 py-4 text-center text-sm text-muted-foreground">
                        Квизы пока не созданы
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}
    </AdminAuthGuard>
  );
}
