'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { AdminAuthGuard } from '@/components/admin-auth-guard';
import { useAdminAuth } from '@/components/admin-auth-context';

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
        <div className="p-8">Загрузка...</div>
      ) : (
        <div className="p-8 space-y-6">
          <div>
            <Link href="/curated" className="text-indigo-600 hover:text-indigo-900">
              ← Назад к списку
            </Link>
            <h1 className="text-2xl font-bold mt-4">Редактирование подборки</h1>
            {error && <div className="mt-2 text-red-500">{error}</div>}
          </div>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => void save()}
          disabled={!canEdit || saving}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? 'Сохранение...' : 'Сохранить'}
        </button>
        {canEdit && formData.status !== 'published' && (
          <button
            onClick={() => void publish()}
            disabled={publishing}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            {publishing ? 'Публикация...' : 'Опубликовать'}
          </button>
        )}
      </div>

      <div className="bg-white rounded-lg shadow p-6 space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium mb-2">Заголовок</label>
            <input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Slug</label>
            <input
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              className="w-full px-3 py-2 border rounded"
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="block text-sm font-medium mb-2">Тип</label>
            <select
              value={formData.collectionType}
              onChange={(e) => setFormData({ ...formData, collectionType: e.target.value })}
              className="w-full px-3 py-2 border rounded"
            >
              <option value="problem">problem</option>
              <option value="format">format</option>
              <option value="goal">goal</option>
              <option value="context">context</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Статус</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3 py-2 border rounded"
            >
              <option value="draft">draft</option>
              <option value="published">published</option>
              <option value="archived">archived</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Тема</label>
            <select
              value={formData.topicCode}
              onChange={(e) => setFormData({ ...formData, topicCode: e.target.value })}
              className="w-full px-3 py-2 border rounded"
            >
              <option value="">—</option>
              {topics.map((t) => (
                <option key={t.code} value={t.code}>
                  {t.title}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <h2 className="text-lg font-bold">Элементы ({formData.items.length})</h2>

        {formData.items.length === 0 ? (
          <div className="text-sm text-gray-500">Добавьте элементы из списков ниже</div>
        ) : (
          <div className="space-y-2">
            {formData.items
              .slice()
              .sort((a, b) => a.position - b.position)
              .map((item, index) => (
                <div key={`${item.itemType}:${item.id ?? index}`} className="flex items-center gap-3 border rounded p-3">
                  <div className="flex-1">
                    <div className="text-sm font-medium">{item._title || '—'}</div>
                    <div className="text-xs text-gray-500">{item.itemType}</div>
                    <input
                      className="mt-2 w-full px-2 py-1 border rounded text-sm"
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
                    <button type="button" className="text-sm text-gray-700" disabled={!canEdit} onClick={() => moveItem(index, index - 1)}>
                      ↑
                    </button>
                    <button type="button" className="text-sm text-gray-700" disabled={!canEdit} onClick={() => moveItem(index, index + 1)}>
                      ↓
                    </button>
                    <button type="button" className="text-sm text-red-600" disabled={!canEdit} onClick={() => removeItem(index)}>
                      удалить
                    </button>
                  </div>
                </div>
              ))}
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2 pt-4">
          <div>
            <h3 className="font-semibold mb-2">Добавить контент</h3>
            <div className="max-h-64 overflow-auto border rounded p-2 space-y-2">
              {availableContent.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  disabled={!canEdit}
                  onClick={() => addItem(item)}
                  className="w-full text-left text-sm px-2 py-2 border rounded hover:bg-gray-50"
                >
                  {item.title}
                </button>
              ))}
            </div>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Добавить интерактив</h3>
            <div className="max-h-64 overflow-auto border rounded p-2 space-y-2">
              {availableInteractives.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  disabled={!canEdit}
                  onClick={() => addItem(item)}
                  className="w-full text-left text-sm px-2 py-2 border rounded hover:bg-gray-50"
                >
                  {item.title}
                </button>
              ))}
              {availableInteractives.length === 0 && <div className="text-sm text-gray-500">Интерактивов нет</div>}
            </div>
          </div>
        </div>
      </div>
        </div>
      )}
    </AdminAuthGuard>
  );
}

