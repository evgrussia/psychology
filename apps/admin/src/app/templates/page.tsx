'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { AdminAuthGuard } from '@/components/admin-auth-guard';
import {
  Alert,
  AlertDescription,
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@psychology/design-system';

interface TemplateItem {
  id: string;
  channel: string;
  category: string;
  name: string;
  status: string;
  language: string;
  active_version_id?: string | null;
  activated_at?: string | null;
  created_at: string;
}

const statusLabels: Record<string, string> = {
  draft: 'Черновик',
  active: 'Активен',
  archived: 'Архив',
};

const channelLabels: Record<string, string> = {
  email: 'Email',
  telegram: 'Telegram',
};

const categoryLabels: Record<string, string> = {
  booking: 'Запись',
  waitlist: 'Лист ожидания',
  event: 'Мероприятия',
  moderation: 'Модерация',
};

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<TemplateItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    channel: '',
    category: '',
    status: '',
    search: '',
  });

  const query = useMemo(() => {
    const params = new URLSearchParams();
    if (filters.channel) params.set('channel', filters.channel);
    if (filters.category) params.set('category', filters.category);
    if (filters.status) params.set('status', filters.status);
    if (filters.search) params.set('search', filters.search);
    return params.toString();
  }, [filters]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    fetch(`/api/admin/templates?${query}`, { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => {
        if (!active) return;
        setTemplates(data);
      })
      .catch((err) => {
        console.error(err);
        if (!active) return;
        setError('Не удалось загрузить шаблоны.');
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [query]);

  return (
    <AdminAuthGuard allowedRoles={['owner', 'assistant']}>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Шаблоны сообщений</h1>
            <p className="text-sm text-muted-foreground">Email и Telegram уведомления по ключевым сценариям.</p>
          </div>
          <Button asChild>
            <Link href="/templates/new">Создать шаблон</Link>
          </Button>
        </div>

        <Card>
          <CardContent className="flex flex-wrap gap-3">
            <Input
              className="w-full max-w-xs"
              placeholder="Поиск по названию"
              value={filters.search}
              onChange={(event) => setFilters((prev) => ({ ...prev, search: event.target.value }))}
            />
            <Select
              value={filters.channel || 'all'}
              onValueChange={(value) => setFilters((prev) => ({ ...prev, channel: value === 'all' ? '' : value }))}
            >
              <SelectTrigger className="w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все каналы</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="telegram">Telegram</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.category || 'all'}
              onValueChange={(value) => setFilters((prev) => ({ ...prev, category: value === 'all' ? '' : value }))}
            >
              <SelectTrigger className="w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все категории</SelectItem>
                <SelectItem value="booking">Запись</SelectItem>
                <SelectItem value="waitlist">Лист ожидания</SelectItem>
                <SelectItem value="event">Мероприятия</SelectItem>
                <SelectItem value="moderation">Модерация</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.status || 'all'}
              onValueChange={(value) => setFilters((prev) => ({ ...prev, status: value === 'all' ? '' : value }))}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все статусы</SelectItem>
                <SelectItem value="draft">Черновик</SelectItem>
                <SelectItem value="active">Активен</SelectItem>
                <SelectItem value="archived">Архив</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {loading ? (
          <Card>
            <CardContent className="p-4 text-sm text-muted-foreground">Загрузка...</CardContent>
          </Card>
        ) : error ? (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40 text-xs uppercase text-muted-foreground">
                    <TableHead>Название</TableHead>
                    <TableHead>Категория</TableHead>
                    <TableHead>Канал</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead>Активирован</TableHead>
                    <TableHead>Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {templates.map((template) => (
                    <TableRow key={template.id}>
                      <TableCell className="font-medium">{template.name}</TableCell>
                      <TableCell>{categoryLabels[template.category] || template.category}</TableCell>
                      <TableCell>{channelLabels[template.channel] || template.channel}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-muted/40 text-muted-foreground">
                          {statusLabels[template.status] || template.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {template.activated_at ? new Date(template.activated_at).toLocaleString('ru-RU') : '—'}
                      </TableCell>
                      <TableCell>
                        <Button asChild variant="link" className="px-0">
                          <Link href={`/templates/${template.id}`}>Открыть</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {templates.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="px-4 py-6 text-center text-sm text-muted-foreground">
                        Шаблоны не найдены
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminAuthGuard>
  );
}
