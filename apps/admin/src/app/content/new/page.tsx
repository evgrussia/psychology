'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import MarkdownEditor from '../../../components/MarkdownEditor';

export default function NewContentPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    contentType: 'article',
    bodyMarkdown: '',
    excerpt: '',
    seoTitle: '',
    seoDescription: '',
    seoKeywords: '',
    canonicalUrl: '',
    topicCodes: [] as string[],
    tagIds: [] as string[],
  });
  const [topics, setTopics] = useState<{ code: string, title: string }[]>([]);
  const [tags, setTags] = useState<{ id: string, title: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('http://127.0.0.1:3001/api/admin/content/topics').then(res => res.json()),
      fetch('http://127.0.0.1:3001/api/admin/content/tags').then(res => res.json())
    ]).then(([topicsData, tagsData]) => {
      setTopics(topicsData);
      setTags(tagsData);
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
      const res = await fetch('http://127.0.0.1:3001/api/admin/content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Note: Authentication will be added later
          'Authorization': 'Bearer test-token', 
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        router.push('/content');
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
    <div className="editor-page">
      <div style={{ marginBottom: '20px' }}>
        <Link href="/content" style={{ color: '#3498db' }}>← Назад к списку</Link>
        <h1>Новый контент</h1>
      </div>

      <form onSubmit={handleSubmit} className="editor-form">
        <div className="editor-sidebar">
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
            <label>Тип контента</label>
            <select 
              value={formData.contentType} 
              onChange={e => setFormData({ ...formData, contentType: e.target.value })}
            >
              <option value="article">Статья (Блог)</option>
              <option value="resource">Ресурс</option>
              <option value="landing">Лендинг темы</option>
              <option value="page">Страница</option>
            </select>
          </div>

          <div className="form-group">
            <label>Краткое описание (excerpt)</label>
            <textarea 
              rows={3} 
              value={formData.excerpt} 
              onChange={e => setFormData({ ...formData, excerpt: e.target.value })} 
            />
          </div>

          <hr style={{ margin: '20px 0', border: '0', borderTop: '1px solid #eee' }} />
          <h3>SEO настройки</h3>

          <div className="form-group">
            <label>SEO Title</label>
            <input 
              type="text" 
              value={formData.seoTitle} 
              onChange={e => setFormData({ ...formData, seoTitle: e.target.value })} 
            />
          </div>

          <div className="form-group">
            <label>SEO Description</label>
            <textarea 
              rows={2} 
              value={formData.seoDescription} 
              onChange={e => setFormData({ ...formData, seoDescription: e.target.value })} 
            />
          </div>

          <div className="form-group">
            <label>SEO Keywords</label>
            <input 
              type="text" 
              value={formData.seoKeywords} 
              onChange={e => setFormData({ ...formData, seoKeywords: e.target.value })} 
            />
          </div>

          <div className="form-group">
            <label>Canonical URL</label>
            <input 
              type="text" 
              value={formData.canonicalUrl} 
              onChange={e => setFormData({ ...formData, canonicalUrl: e.target.value })} 
            />
          </div>

          <hr style={{ margin: '20px 0', border: '0', borderTop: '1px solid #eee' }} />
          <h3>Таксономия</h3>

          <div className="form-group">
            <label>Темы</label>
            <div className="checkbox-list">
              {topics.map(topic => (
                <label key={topic.code} className="checkbox-label">
                  <input 
                    type="checkbox" 
                    checked={formData.topicCodes.includes(topic.code)} 
                    onChange={e => {
                      const codes = e.target.checked 
                        ? [...formData.topicCodes, topic.code]
                        : formData.topicCodes.filter(c => c !== topic.code);
                      setFormData({ ...formData, topicCodes: codes });
                    }} 
                  />
                  {topic.title}
                </label>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Теги</label>
            <div className="checkbox-list">
              {tags.map(tag => (
                <label key={tag.id} className="checkbox-label">
                  <input 
                    type="checkbox" 
                    checked={formData.tagIds.includes(tag.id)} 
                    onChange={e => {
                      const ids = e.target.checked 
                        ? [...formData.tagIds, tag.id]
                        : formData.tagIds.filter(id => id !== tag.id);
                      setFormData({ ...formData, tagIds: ids });
                    }} 
                  />
                  {tag.title}
                </label>
              ))}
            </div>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Сохранение...' : 'Создать черновик'}
          </button>
        </div>

        <div className="editor-main">
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
          width: 300px;
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
          margin-bottom: 15px;
        }
        .form-group label {
          display: block;
          margin-bottom: 5px;
          font-weight: 600;
          font-size: 14px;
        }
        .form-group input, .form-group select, .form-group textarea {
          width: 100%;
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-family: inherit;
        }
        .checkbox-list {
          max-height: 150px;
          overflow-y: auto;
          border: 1px solid #ddd;
          padding: 10px;
          border-radius: 4px;
        }
        .checkbox-label {
          display: block;
          margin-bottom: 5px;
          font-weight: normal !important;
          font-size: 13px;
        }
        .checkbox-label input {
          width: auto !important;
          margin-right: 8px;
        }
      `}</style>
    </div>
  );
}
