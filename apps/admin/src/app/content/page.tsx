'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface ContentItem {
  id: string;
  title: string;
  slug: string;
  contentType: string;
  status: string;
  updatedAt: string;
}

export default function ContentListPage() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<ContentItem[]>([]);
  const [filters, setFilters] = useState({
    type: '',
    status: '',
  });
  const [filters, setFilters] = useState({
    type: '',
    status: '',
  });

  useEffect(() => {
    let url = 'http://localhost:3000/api/admin/content?';
    if (filters.type) url += `type=${filters.type}&`;
    if (filters.status) url += `status=${filters.status}&`;

    fetch(url)
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
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Управление контентом</h1>
        <Link href="/content/new" className="btn btn-primary">
          Создать контент
        </Link>
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
                <td colSpan={6} style={{ textAlign: 'center', padding: '20px' }}>
                  Контент пока не создан
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
