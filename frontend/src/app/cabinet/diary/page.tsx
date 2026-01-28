'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { interactiveService } from '@/services/api/interactive';
import { CreateDiaryEntryRequest } from '@/types/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { ErrorState } from '@/components/shared/ErrorState';
import { EmptyState } from '@/components/shared/EmptyState';
import { useTracking } from '@/hooks/useTracking';
import { toast } from 'sonner';
import { Plus, BookOpen } from 'lucide-react';

export default function DiaryPage() {
  const { track } = useTracking();
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<CreateDiaryEntryRequest>({
    type: 'emotion',
    content: '',
  });

  const { data: entries, isLoading, error } = useQuery({
    queryKey: ['diary-entries'],
    queryFn: () => interactiveService.getDiaries(),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateDiaryEntryRequest) => interactiveService.createDiaryEntry(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diary-entries'] });
      queryClient.invalidateQueries({ queryKey: ['cabinet-stats'] });
      setIsCreating(false);
      setFormData({ type: 'emotion', content: '' });
      toast.success('Запись создана');
      track('diary_entry_created', {
        entry_type: formData.type,
      });
    },
    onError: () => {
      toast.error('Ошибка при создании записи');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.content.trim()) {
      toast.error('Заполните содержание записи');
      return;
    }
    createMutation.mutate(formData);
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  return (
    <main id="main-content" className="min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Дневник</h1>
          <Button onClick={() => setIsCreating(!isCreating)}>
            <Plus className="h-4 w-4 mr-2" />
            {isCreating ? 'Отмена' : 'Новая запись'}
          </Button>
        </div>

        {isCreating && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Новая запись</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="type">Тип записи</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: 'emotion' | 'gratitude' | 'reflection') =>
                      setFormData({ ...formData, type: value })
                    }
                  >
                    <SelectTrigger id="type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="emotion">Эмоции</SelectItem>
                      <SelectItem value="gratitude">Благодарность</SelectItem>
                      <SelectItem value="reflection">Рефлексия</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="content">Содержание</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Опишите ваши мысли, чувства или события..."
                    rows={6}
                  />
                </div>
                <div className="flex gap-4">
                  <Button type="submit" disabled={createMutation.isPending}>
                    {createMutation.isPending ? 'Создание...' : 'Создать'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsCreating(false);
                      setFormData({ type: 'emotion', content: '' });
                    }}
                  >
                    Отмена
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {entries && entries.length === 0 && !isCreating && (
          <EmptyState
            message="У вас пока нет записей в дневнике"
            action={{
              label: 'Создать первую запись',
              onClick: () => setIsCreating(true),
            }}
          />
        )}

        <div className="space-y-4">
          {entries?.map((entry) => (
            <Card key={entry.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    {entry.type === 'emotion' && 'Эмоции'}
                    {entry.type === 'gratitude' && 'Благодарность'}
                    {entry.type === 'reflection' && 'Рефлексия'}
                  </CardTitle>
                  <CardDescription>
                    {new Date(entry.created_at).toLocaleDateString('ru-RU', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{entry.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </main>
  );
}
