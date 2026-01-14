'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface ItemOption {
  id: string;
  title: string;
  type: 'content' | 'interactive';
}

export default function NewCuratedCollectionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    collectionType: 'problem',
    status: 'draft',
    topicCode: '',
    items: [] as any[],
  });

  const [topics, setTopics] = useState<{ code: string, title: string }[]>([]);
  const [contentItems, setContentItems] = useState<ItemOption[]>([]);
  const [interactives, setInteractives] = useState<ItemOption[]>([]);

  useEffect(() => {
    Promise.all([
      fetch('http://127.0.0.1:3001/api/admin/content/topics').then(res => res.json()),
      fetch('http://127.0.0.1:3001/api/admin/content').then(res => res.json()),
      // Note: We might need a proper endpoint for interactives, using content for now as placeholder
    ]).then(([topicsData, contentData]) => {
      setTopics(topicsData);
      setContentItems(contentData.map((i: any) => ({ id: i.id, title: i.title, type: 'content' })));
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('http://127.0.0.1:3001/api/admin/curated', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token',
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        router.push('/curated');
      } else {
        const err = await res.json();
        alert(`Ошибка: ${err.message}`);
      }
    } catch (err) {
      console.error(err);
      alert('Ошибка при сохранении');
    } finally {
      setLoading(false);
    }
  };

  const addItem = (item: ItemOption) => {
    const newItem = {
      itemType: item.type,
      contentItemId: item.type === 'content' ? item.id : undefined,
      interactiveDefinitionId: item.type === 'interactive' ? item.id : undefined,
      position: formData.items.length,
      note: '',
      _title: item.title, // temporary for UI
    };
    setFormData({ ...formData, items: [...formData.items, newItem] });
  };

  const removeItem = (index: number) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    // update positions
    newItems.forEach((item, i) => item.position = i);
    setFormData({ ...formData, items: newItems });
  };

  return (
    <div className="admin-page">
      <div style={{ marginBottom: '20px' }}>
        <Link href="/curated" style={{ color: '#3498db' }}>← Назад к списку</Link>
        <h1>Новая подборка</h1>
      </div>

      <form onSubmit={handleSubmit} className="admin-form">
        <div style={{ display: 'flex', gap: '30px' }}>
          <div style={{ flex: '1', background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <h3>Основная информация</h3>
            <div className="form-group">
              <label>Заголовок</label>
              <input 
                type="text" 
                value={formData.title} 
                onChange={e => setFormData({ ...formData, title: e.target.value })} 
                required 
              />
            </div>

            <div className="form-group">
              <label>Slug (URL)</label>
              <input 
                type="text" 
                value={formData.slug} 
                onChange={e => setFormData({ ...formData, slug: e.target.value })} 
                required 
              />
            </div>

            <div className="form-group">
              <label>Тип подборки</label>
              <select 
                value={formData.collectionType} 
                onChange={e => setFormData({ ...formData, collectionType: e.target.value })}
              >
                <option value="problem">По проблеме (problem)</option>
                <option value="format">По формату (format)</option>
                <option value="goal">По цели (goal)</option>
                <option value="context">По контексту (context)</option>
              </select>
            </div>

            <div className="form-group">
              <label>Тема (необязательно)</label>
              <select 
                value={formData.topicCode} 
                onChange={e => setFormData({ ...formData, topicCode: e.target.value })}
              >
                <option value="">Без темы</option>
                {topics.map(t => <option key={t.code} value={t.code}>{t.title}</option>)}
              </select>
            </div>

            <button type="submit" className="btn btn-primary" style={{ marginTop: '20px' }} disabled={loading}>
              {loading ? 'Сохранение...' : 'Создать подборку'}
            </button>
          </div>

          <div style={{ flex: '1', background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <h3>Элементы подборки ({formData.items.length})</h3>
            
            <div className="items-list" style={{ marginBottom: '20px', border: '1px solid #eee', borderRadius: '4px', minHeight: '100px', padding: '10px' }}>
              {formData.items.map((item, index) => (
                <div key={index} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', borderBottom: '1px solid #eee', background: '#f9f9f9', marginBottom: '5px', borderRadius: '4px' }}>
                  <span>{item._title} ({item.itemType})</span>
                  <button type="button" onClick={() => removeItem(index)} style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer' }}>Удалить</button>
                </div>
              ))}
              {formData.items.length === 0 && <p style={{ color: '#999', textAlign: 'center' }}>Добавьте элементы из списка справа</p>}
            </div>

            <h4>Добавить контент:</h4>
            <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #eee', padding: '10px' }}>
              {contentItems.map(item => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px' }}>
                  <span style={{ fontSize: '14px' }}>{item.title}</span>
                  <button type="button" onClick={() => addItem(item)} className="btn-sm">+</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </form>

      <style jsx>{`
        .form-group { margin-bottom: 15px; }
        .form-group label { display: block; margin-bottom: 5px; font-weight: 600; font-size: 14px; }
        .form-group input, .form-group select, .form-group textarea { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; }
        .btn-sm { padding: 2px 8px; cursor: pointer; }
      `}</style>
    </div>
  );
}
