'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AdminAuthGuard } from '@/components/admin-auth-guard';
import { useAdminAuth } from '@/components/admin-auth-context';

interface ContentItem {
  id: string;
  title: string;
  slug: string;
  contentType: string;
  status: string;
  updatedAt: string;
  publishedAt?: string;
  authorUserId: string;
}

export default function ContentListPage() {
  const { user } = useAdminAuth();
  const canEdit = Boolean(user?.roles.some((role) => role === 'owner' || role === 'editor'));
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<ContentItem[]>([]);
  const [topics, setTopics] = useState<{ code: string; title: string }[]>([]);
  const [tags, setTags] = useState<{ id: string; name: string }[]>([]);
  const [filters, setFilters] = useState({
    type: '',
    status: '',
    author: '',
    topic: '',
    tag: '',
  });

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/content/topics', { credentials: 'include' }).then(res => res.json()),
      fetch('/api/admin/content/tags', { credentials: 'include' }).then(res => res.json()),
    ])
      .then(([topicsData, tagsData]) => {
        setTopics(topicsData);
        setTags(tagsData);
      })
      .catch(() => {
        setTopics([]);
        setTags([]);
      });
  }, []);

  useEffect(() => {
    let url = '/api/admin/content?';
    if (filters.type) url += `type=${filters.type}&`;
    if (filters.status) url += `status=${filters.status}&`;
    if (filters.author) url += `authorUserId=${filters.author}&`;
    if (filters.topic) url += `topicCode=${filters.topic}&`;
    if (filters.tag) url += `tagId=${filters.tag}&`;

    fetch(url, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        setItems(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [filters]);

  return (
    <AdminAuthGuard allowedRoles={['owner', 'assistant', 'editor']}>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1>Управление контентом</h1>
          {canEdit && (
            <Link href="/content/new" className="btn btn-primary">
              Создать контент
            </Link>
          )}
        </div>

      <div className="filters">
        <div className="filter-group">
          <label>Тип:</label>
          <select value={filters.type} onChange={e => setFilters({ ...filters, type: e.target.value })}>
            <option value="">Все типы</option>
            <option value="article">Статья</option>
            <option value="resource">Ресурс</option>
            <option value="landing">Лендинг</option>
            <option value="page">Страница</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Статус:</label>
          <select value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value })}>
            <option value="">Все статусы</option>
            <option value="draft">Черновик</option>
            <option value="published">Опубликовано</option>
            <option value="archived">В архиве</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Автор (ID):</label>
          <input
            value={filters.author}
            onChange={e => setFilters({ ...filters, author: e.target.value })}
            placeholder="user-id"
          />
        </div>
        <div className="filter-group">
          <label>Тема:</label>
          <select value={filters.topic} onChange={e => setFilters({ ...filters, topic: e.target.value })}>
            <option value="">Все темы</option>
            {topics.map(topic => (
              <option key={topic.code} value={topic.code}>{topic.title}</option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label>Тег:</label>
          <select value={filters.tag} onChange={e => setFilters({ ...filters, tag: e.target.value })}>
            <option value="">Все теги</option>
            {tags.map(tag => (
              <option key={tag.id} value={tag.id}>{tag.name}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <p>Загрузка...</p>
      ) : (
        <table className="content-table">
          <thead>
            <tr>
              <th>Заголовок</th>
              <th>Тип</th>
              <th>Slug</th>
              <th>Статус</th>
              <th>Автор</th>
              <th>Опубликовано</th>
              <th>Обновлено</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id}>
                <td>{item.title}</td>
                <td>{item.contentType}</td>
                <td>{item.slug}</td>
                <td>
                  <span className={`status-badge status-${item.status}`}>
                    {item.status}
                  </span>
                </td>
                <td>{item.authorUserId}</td>
                <td>{item.publishedAt ? new Date(item.publishedAt).toLocaleDateString() : '-'}</td>
                <td>{new Date(item.updatedAt).toLocaleDateString()}</td>
                <td>
                  <Link href={`/content/${item.id}`} style={{ color: '#3498db', marginRight: '10px' }}>
                    Изменить
                  </Link>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '20px' }}>
                  Контент пока не создан
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
      </div>
    </AdminAuthGuard>
  );
}
