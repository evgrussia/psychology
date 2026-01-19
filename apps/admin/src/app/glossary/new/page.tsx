'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import MarkdownEditor from '../../../components/MarkdownEditor';
import { AdminAuthGuard } from '@/components/admin-auth-guard';

export default function NewGlossaryTermPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [contentItems, setContentItems] = useState<{ id: string, title: string, contentType: string }[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    category: 'concept',
    shortDefinition: '',
    metaDescription: '',
    keywords: '',
    bodyMarkdown: '',
    synonyms: '',
    relatedContentIds: [] as string[],
  });

  useEffect(() => {
    fetch(`/api/admin/content`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => setContentItems(data))
      .catch(err => console.error(err));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const synonymsArray = formData.synonyms
        .split(',')
        .map(s => s.trim())
        .filter(s => s !== '');

      const payload = {
        ...formData,
        synonyms: synonymsArray,
        status: 'draft',
      };

      const res = await fetch('/api/admin/glossary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        router.push('/glossary');
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

  return (
    <AdminAuthGuard allowedRoles={['owner', 'editor']}>
      <div className="editor-page">
        <div style={{ marginBottom: '20px' }}>
          <Link href="/glossary" style={{ color: '#3498db' }}>← Назад к списку</Link>
          <h1>Новый термин словаря</h1>
        </div>

      <form onSubmit={handleSubmit} className="editor-form">
        <div className="editor-sidebar">
          <div className="form-group">
            <label>Заголовок (Термин)</label>
            <input 
              type="text" 
              value={formData.title} 
              onChange={e => setFormData({ ...formData, title: e.target.value })} 
              required 
              placeholder="Например: Выгорание"
            />
          </div>

          <div className="form-group">
            <label>Slug (URL)</label>
            <input 
              type="text" 
              value={formData.slug} 
              onChange={e => setFormData({ ...formData, slug: e.target.value })} 
              required 
              placeholder="vygoranie"
            />
          </div>

          <div className="form-group">
            <label>Категория</label>
            <select 
              value={formData.category} 
              onChange={e => setFormData({ ...formData, category: e.target.value })}
            >
              <option value="approach">Approach (Подход)</option>
              <option value="state">State (Состояние)</option>
              <option value="concept">Concept (Концепция)</option>
            </select>
          </div>

          <div className="form-group">
            <label>Краткое определение</label>
            <textarea 
              rows={4} 
              value={formData.shortDefinition} 
              onChange={e => setFormData({ ...formData, shortDefinition: e.target.value })} 
              required
              placeholder="Одно предложение, раскрывающее суть термина..."
            />
          </div>

          <div className="form-group">
            <label>Meta Description (SEO)</label>
            <textarea 
              rows={3} 
              value={formData.metaDescription} 
              onChange={e => setFormData({ ...formData, metaDescription: e.target.value })} 
              placeholder="Используется для поисковых систем. Если не указано, будет использовано краткое определение."
            />
            <small style={{ color: '#666', fontSize: '12px', display: 'block', marginTop: '4px' }}>
              Рекомендуемая длина: 150-160 символов
            </small>
          </div>

          <div className="form-group">
            <label>Keywords (SEO, через запятую)</label>
            <input 
              type="text" 
              value={formData.keywords} 
              onChange={e => setFormData({ ...formData, keywords: e.target.value })} 
              placeholder="например: кпт, когнитивно-поведенческая терапия, тревога"
            />
            <small style={{ color: '#666', fontSize: '12px', display: 'block', marginTop: '4px' }}>
              Ключевые слова для поисковых систем
            </small>
          </div>

          <div className="form-group">
            <label>Синонимы (через запятую)</label>
            <input 
              type="text" 
              value={formData.synonyms} 
              onChange={e => setFormData({ ...formData, synonyms: e.target.value })} 
              placeholder="Эмоциональное истощение, стресс"
            />
          </div>

          <div className="form-group">
            <label>Связанный контент</label>
            <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #ddd', padding: '10px', borderRadius: '4px' }}>
              {contentItems.map(item => (
                <label key={item.id} style={{ display: 'block', marginBottom: '8px', fontSize: '13px', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={formData.relatedContentIds.includes(item.id)}
                    onChange={e => {
                      const ids = e.target.checked 
                        ? [...formData.relatedContentIds, item.id]
                        : formData.relatedContentIds.filter(id => id !== item.id);
                      setFormData({ ...formData, relatedContentIds: ids });
                    }}
                    style={{ marginRight: '8px' }}
                  />
                  [{item.contentType}] {item.title}
                </label>
              ))}
              {contentItems.length === 0 && <p style={{ fontSize: '12px', color: '#999' }}>Контент не найден</p>}
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '20px' }} disabled={loading}>
            {loading ? 'Сохранение...' : 'Создать черновик'}
          </button>
        </div>

        <div className="editor-main">
          <label style={{ display: 'block', marginBottom: '10px', fontWeight: '600' }}>Подробное описание (Markdown)</label>
          <MarkdownEditor
            value={formData.bodyMarkdown}
            onChange={(value) => setFormData({ ...formData, bodyMarkdown: value })}
            showPreview={true}
            height="600px"
          />
        </div>
      </form>

      <style jsx>{`
        .editor-form {
          display: flex;
          gap: 30px;
        }
        .editor-sidebar {
          width: 350px;
          background: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
          height: fit-content;
        }
        .editor-main {
          flex: 1;
        }
        .form-group {
          margin-bottom: 20px;
        }
        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 600;
          font-size: 14px;
        }
        .form-group input, .form-group select, .form-group textarea {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-family: inherit;
        }
        .btn-primary {
          background-color: #3498db;
          color: white;
          border: none;
          padding: 12px;
          border-radius: 4px;
          font-weight: bold;
          cursor: pointer;
        }
        .btn-primary:disabled {
          background-color: #bdc3c7;
        }
      `}</style>
      </div>
    </AdminAuthGuard>
  );
}
