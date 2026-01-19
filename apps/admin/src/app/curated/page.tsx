'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AdminAuthGuard } from '@/components/admin-auth-guard';
import { useAdminAuth } from '@/components/admin-auth-context';

interface CuratedCollection {
  id: string;
  title: string;
  slug: string;
  collectionType: string;
  status: string;
  publishedAt?: string;
}

export default function CuratedListPage() {
  const { user } = useAdminAuth();
  const canEdit = Boolean(user?.roles.some((role) => role === 'owner' || role === 'editor'));
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<CuratedCollection[]>([]);

  useEffect(() => {
    fetch('/api/admin/curated', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        setItems(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <AdminAuthGuard allowedRoles={['owner', 'assistant', 'editor']}>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1>Управление подборками (/curated/)</h1>
          {canEdit && (
            <Link href="/curated/new" className="btn btn-primary">
              Создать подборку
            </Link>
          )}
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
              <th>Дата публикации</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id}>
                <td>{item.title}</td>
                <td>{item.collectionType}</td>
                <td>{item.slug}</td>
                <td>
                  <span className={`status-badge status-${item.status}`}>
                    {item.status}
                  </span>
                </td>
                <td>{item.publishedAt ? new Date(item.publishedAt).toLocaleDateString() : '—'}</td>
                <td>
                  <Link href={`/curated/${item.id}`} style={{ color: '#3498db', marginRight: '10px' }}>
                    Изменить
                  </Link>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '20px' }}>
                  Подборки пока не созданы
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
