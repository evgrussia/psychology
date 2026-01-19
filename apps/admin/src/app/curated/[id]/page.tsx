'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { AdminAuthGuard } from '@/components/admin-auth-guard';
import { useAdminAuth } from '@/components/admin-auth-context';
import {
  Alert,
  AlertDescription,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@psychology/design-system';

interface ItemOption {
  id: string;
  title: string;
  type: 'content' | 'interactive';
}

interface CuratedItemForm {
  id?: string;
  itemType: 'content' | 'interactive';
  contentItemId?: string;
  interactiveDefinitionId?: string;
  position: number;
  note?: string;
  _title?: string;
}

export default function EditCuratedCollectionPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { user } = useAdminAuth();
  const canEdit = Boolean(user?.roles.some((role) => role === 'owner' || role === 'editor'));

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [topics, setTopics] = useState<{ code: string; title: string }[]>([]);
  const [contentItems, setContentItems] = useState<ItemOption[]>([]);
  const [interactives, setInteractives] = useState<ItemOption[]>([]);

  const [formData, setFormData] = useState({
    id,
    title: '',
    slug: '',
    collectionType: 'problem',
    status: 'draft',
    topicCode: '',
    items: [] as CuratedItemForm[],
  });

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [collection, topicsData, contentData, interactiveData] = await Promise.all([
        fetch(`/api/admin/curated/${id}`, { credentials: 'include' }).then((res) => res.json()),
        fetch('/api/admin/content/topics', { credentials: 'include' }).then((res) => res.json()),
        fetch('/api/admin/content', { credentials: 'include' }).then((res) => res.json()),
        fetch('/api/admin/interactive/definitions?status=published', { credentials: 'include' })
          .then((res) => res.json())
          .catch(() => []),
      ]);

      setTopics(topicsData);
      const contentOptions = (contentData || []).map((i: any) => ({ id: i.id, title: i.title, type: 'content' as const }));
      const interactiveOptions = (interactiveData || []).map((i: any) => ({ id: i.id, title: i.title, type: 'interactive' as const }));
      setContentItems(contentOptions);
      setInteractives(interactiveOptions);

      const titleById = new Map<string, string>();
      contentOptions.forEach((i) => titleById.set(`content:${i.id}`, i.title));
      interactiveOptions.forEach((i) => titleById.set(`interactive:${i.id}`, i.title));

      setFormData({
        id: collection.id,
        title: collection.title,
        slug: collection.slug,
        collectionType: collection.collectionType,
        status: collection.status,
        topicCode: collection.topicCode || '',
        items: (collection.items || [])
          .slice()
          .sort((a: any, b: any) => a.position - b.position)
          .map((item: any) => {
            const key =
              item.itemType === 'content'
                ? `content:${item.contentItemId}`
                : `interactive:${item.interactiveDefinitionId}`;
            return {
              id: item.id,
              itemType: item.itemType,
              contentItemId: item.contentItemId,
              interactiveDefinitionId: item.interactiveDefinitionId,
              position: item.position,
              note: item.note || '',
              _title: titleById.get(key) || key,
            } as CuratedItemForm;
          }),
      });
    } catch (e: any) {
      setError(e.message || 'Не удалось загрузить подборку');
    } finally {
      setLoading(false);
    }
  };

  const addItem = (item: ItemOption) => {
    if (!canEdit) {
      return;
    }
    const newItem: CuratedItemForm = {
      itemType: item.type,
      contentItemId: item.type === 'content' ? item.id : undefined,
      interactiveDefinitionId: item.type === 'interactive' ? item.id : undefined,
      position: formData.items.length,
      note: '',
      _title: item.title,
    };
    setFormData({ ...formData, items: [...formData.items, newItem] });
  };

  const removeItem = (index: number) => {
    if (!canEdit) {
      return;
    }
    const newItems = formData.items.filter((_, i) => i !== index);
    newItems.forEach((item, i) => (item.position = i));
    setFormData({ ...formData, items: newItems });
  };

  const moveItem = (from: number, to: number) => {
    if (!canEdit) {
      return;
    }
    if (to < 0 || to >= formData.items.length) return;
    const copy = [...formData.items];
    const [item] = copy.splice(from, 1);
    copy.splice(to, 0, item);
    copy.forEach((it, idx) => (it.position = idx));
    setFormData({ ...formData, items: copy });
  };

  const save = async () => {
    if (!canEdit) {
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/curated', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.message || 'Не удалось сохранить подборку');
      }
      alert('Сохранено');
      router.refresh();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const publish = async () => {
    if (!canEdit) {
      return;
    }
    if (!confirm('Опубликовать подборку?')) return;
    setPublishing(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/curated/${id}/publish`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.message || 'Не удалось опубликовать подборку');
      }
      alert('Опубликовано');
      await load();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setPublishing(false);
    }
  };

  const availableContent = useMemo(() => contentItems, [contentItems]);
  const availableInteractives = useMemo(() => interactives, [interactives]);

  return (
    <AdminAuthGuard allowedRoles={['owner', 'assistant', 'editor']}>
      {loading ? (
        <Card>
          <CardContent className="p-8 text-sm text-muted-foreground">Загрузка...</CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <div>
            <Button asChild variant="link" className="px-0">
              <Link href="/curated">← Назад к списку</Link>
            </Button>
            <h1 className="text-2xl font-semibold text-foreground mt-4">Редактирование подборки</h1>
            {error && (
              <Alert variant="destructive" className="mt-2">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            <Button onClick={() => void save()} disabled={!canEdit || saving}>
              {saving ? 'Сохранение...' : 'Сохранить'}
            </Button>
            {canEdit && formData.status !== 'published' && (
              <Button onClick={() => void publish()} disabled={publishing} variant="outline">
                {publishing ? 'Публикация...' : 'Опубликовать'}
              </Button>
            )}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Параметры</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Заголовок</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Slug</Label>
                  <Input
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Тип</Label>
                  <Select
                    value={formData.collectionType}
                    onValueChange={(value) => setFormData({ ...formData, collectionType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="problem">problem</SelectItem>
                      <SelectItem value="format">format</SelectItem>
                      <SelectItem value="goal">goal</SelectItem>
                      <SelectItem value="context">context</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Статус</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">draft</SelectItem>
                      <SelectItem value="published">published</SelectItem>
                      <SelectItem value="archived">archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Тема</Label>
                  <Select
                    value={formData.topicCode}
                    onValueChange={(value) => setFormData({ ...formData, topicCode: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">—</SelectItem>
                      {topics.map((t) => (
                        <SelectItem key={t.code} value={t.code}>
                          {t.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Элементы ({formData.items.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.items.length === 0 ? (
                <div className="text-sm text-muted-foreground">Добавьте элементы из списков ниже</div>
              ) : (
                <div className="space-y-2">
                  {formData.items
                    .slice()
                    .sort((a, b) => a.position - b.position)
                    .map((item, index) => (
                      <div
                        key={`${item.itemType}:${item.id ?? index}`}
                        className="flex items-center gap-3 border border-border rounded p-3"
                      >
                        <div className="flex-1">
                          <div className="text-sm font-medium text-foreground">{item._title || '—'}</div>
                          <div className="text-xs text-muted-foreground">{item.itemType}</div>
                          <Input
                            className="mt-2"
                            value={item.note || ''}
                            placeholder="Заметка (опционально)"
                            disabled={!canEdit}
                            onChange={(e) => {
                              const copy = [...formData.items];
                              copy[index] = { ...copy[index], note: e.target.value };
                              setFormData({ ...formData, items: copy });
                            }}
                          />
                        </div>
                        <div className="flex flex-col gap-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            disabled={!canEdit}
                            onClick={() => moveItem(index, index - 1)}
                          >
                            ↑
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            disabled={!canEdit}
                            onClick={() => moveItem(index, index + 1)}
                          >
                            ↓
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-destructive"
                            disabled={!canEdit}
                            onClick={() => removeItem(index)}
                          >
                            удалить
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              )}

              <div className="grid gap-6 md:grid-cols-2 pt-4">
                <div className="space-y-2">
                  <h3 className="font-semibold text-foreground">Добавить контент</h3>
                  <div className="max-h-64 overflow-auto border border-border rounded p-2 space-y-2">
                    {availableContent.map((item) => (
                      <Button
                        key={item.id}
                        type="button"
                        variant="outline"
                        disabled={!canEdit}
                        onClick={() => addItem(item)}
                        className="w-full justify-start"
                      >
                        {item.title}
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-foreground">Добавить интерактив</h3>
                  <div className="max-h-64 overflow-auto border border-border rounded p-2 space-y-2">
                    {availableInteractives.map((item) => (
                      <Button
                        key={item.id}
                        type="button"
                        variant="outline"
                        disabled={!canEdit}
                        onClick={() => addItem(item)}
                        className="w-full justify-start"
                      >
                        {item.title}
                      </Button>
                    ))}
                    {availableInteractives.length === 0 && (
                      <div className="text-sm text-muted-foreground">Интерактивов нет</div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </AdminAuthGuard>
  );
}

