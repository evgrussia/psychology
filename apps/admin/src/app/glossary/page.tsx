'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface GlossaryTerm {
  id: string;
  title: string;
  slug: string;
  category: string;
  status: string;
  shortDefinition: string;
}

export default function GlossaryListPage() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<GlossaryTerm[]>([]);
  const [filters, setFilters] = useState({
    category: '',
    status: '',
    search: '',
  });

  useEffect(() => {
    let url = 'http://127.0.0.1:3001/api/admin/glossary?';
    if (filters.category) url += `category=${filters.category}&`;
    if (filters.status) url += `status=${filters.status}&`;
    if (filters.search) url += `search=${filters.search}&`;

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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1>Словарь терминов</h1>
        <Link href="/glossary/new" className="btn btn-primary">
          Создать термин
        </Link>
      </div>

      <div className="filters" style={{ display: 'flex', gap: '20px', marginBottom: '30px', backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '8px' }}>
        <div className="filter-group">
          <label style={{ display: 'block', marginBottom: '5px' }}>Категория:</label>
          <select 
            value={filters.category} 
            onChange={e => setFilters({ ...filters, category: e.target.value })}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
          >
            <option value="">Все категории</option>
            <option value="approach">Approach (Подход)</option>
            <option value="state">State (Состояние)</option>
            <option value="concept">Concept (Концепция)</option>
          </select>
        </div>
        <div className="filter-group">
          <label style={{ display: 'block', marginBottom: '5px' }}>Статус:</label>
          <select 
            value={filters.status} 
            onChange={e => setFilters({ ...filters, status: e.target.value })}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
          >
            <option value="">Все статусы</option>
            <option value="draft">Черновик</option>
            <option value="published">Опубликовано</option>
          </select>
        </div>
        <div className="filter-group" style={{ flex: 1 }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Поиск:</label>
          <input 
            type="text" 
            value={filters.search} 
            onChange={e => setFilters({ ...filters, search: e.target.value })}
            placeholder="Поиск по заголовку или определению..."
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd', width: '100%' }}
          />
        </div>
      </div>

      {loading ? (
        <p>Загрузка...</p>
      ) : (
        <table className="content-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left' }}>
              <th style={{ padding: '12px' }}>Заголовок</th>
              <th style={{ padding: '12px' }}>Категория</th>
              <th style={{ padding: '12px' }}>Slug</th>
              <th style={{ padding: '12px' }}>Статус</th>
              <th style={{ padding: '12px' }}>Действия</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '12px' }}>{item.title}</td>
                <td style={{ padding: '12px' }}>
                   <span style={{ fontSize: '0.85em', color: '#666' }}>{item.category}</span>
                </td>
                <td style={{ padding: '12px' }}>{item.slug}</td>
                <td style={{ padding: '12px' }}>
                  <span className={`status-badge status-${item.status}`}>
                    {item.status === 'published' ? 'Опубликовано' : 'Черновик'}
                  </span>
                </td>
                <td style={{ padding: '12px' }}>
                  <Link href={`/glossary/${item.id}`} style={{ color: '#3498db', marginRight: '15px', textDecoration: 'none' }}>
                    Изменить
                  </Link>
                  <a 
                    href={`/glossary/${item.slug}`} 
                    target="_blank" 
                    rel="noreferrer"
                    style={{ color: '#999', fontSize: '0.9em', textDecoration: 'none' }}
                  >
                    Предпросмотр
                  </a>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                  Термины пока не созданы
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
