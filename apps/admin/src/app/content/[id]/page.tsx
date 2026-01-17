'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import Link from 'next/link';
import MarkdownEditor from '../../../components/MarkdownEditor';

export default function EditContentPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    contentType: 'article',
    bodyMarkdown: '',
    excerpt: '',
    status: 'draft',
    seoTitle: '',
    seoDescription: '',
    seoKeywords: '',
    canonicalUrl: '',
    topicCodes: [] as string[],
    tagIds: [] as string[],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [showQAChecklist, setShowQAChecklist] = useState(false);
  const [revisions, setRevisions] = useState<any[]>([]);
  const [showRevisions, setShowRevisions] = useState(false);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [mediaAssets, setMediaAssets] = useState<any[]>([]);
  const [qaChecklist, setQaChecklist] = useState({
    hasDisclaimer: false,
    isToneGentle: false,
    hasTryNowBlock: false,
    hasCTA: false,
    hasInternalLinks: false,
    hasAltTexts: false,
    spellCheckDone: false,
  });

  useEffect(() => {
    fetch(`http://127.0.0.1:3001/api/admin/content/${id}`)
      .then(res => res.json())
      .then(data => {
        setFormData({
          title: data.title,
          slug: data.slug,
          contentType: data.contentType,
          bodyMarkdown: data.bodyMarkdown,
          excerpt: data.excerpt || '',
          status: data.status,
          seoTitle: data.seoTitle || '',
          seoDescription: data.seoDescription || '',
          seoKeywords: data.seoKeywords || '',
          canonicalUrl: data.canonicalUrl || '',
          topicCodes: data.topicCodes || [],
          tagIds: data.tagIds || [],
        });
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  const [topics, setTopics] = useState<{ code: string, title: string }[]>([]);
  const [tags, setTags] = useState<{ id: string, title: string }[]>([]);

  useEffect(() => {
    Promise.all([
      fetch('http://127.0.0.1:3001/api/admin/content/topics').then(res => res.json()),
      fetch('http://127.0.0.1:3001/api/admin/content/tags').then(res => res.json())
    ]).then(([topicsData, tagsData]) => {
      setTopics(topicsData);
      setTags(tagsData);
    }).catch(err => console.error(err));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch(`http://127.0.0.1:3001/api/admin/content/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token',
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        alert('Сохранено успешно');
        router.refresh();
      } else {
        const err = await res.json();
        alert(`Ошибка: ${err.message}`);
      }
    } catch (err) {
      console.error(err);
      alert('Ошибка при сохранении');
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    setPublishing(true);
    try {
      const res = await fetch(`http://127.0.0.1:3001/api/admin/content/${id}/publish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token',
        },
        body: JSON.stringify({ qaChecklist }),
      });

      if (res.ok) {
        alert('Опубликовано успешно');
        setShowQAChecklist(false);
        router.refresh();
      } else {
        const err = await res.json();
        alert(`Ошибка публикации: ${err.message}`);
      }
    } catch (err) {
      console.error(err);
      alert('Ошибка при публикации');
    } finally {
      setPublishing(false);
    }
  };

  const loadRevisions = async () => {
    try {
      const res = await fetch(`http://127.0.0.1:3001/api/admin/content/${id}/revisions`);
      const data = await res.json();
      setRevisions(data);
      setShowRevisions(true);
    } catch (err) {
      console.error(err);
      alert('Ошибка при загрузке версий');
    }
  };

  const handleRollback = async (revisionId: string) => {
    if (!confirm('Вы уверены, что хотите откатиться к этой версии? Текущие несохраненные изменения будут потеряны.')) return;
    
    try {
      const res = await fetch(`http://127.0.0.1:3001/api/admin/content/${id}/revisions/${revisionId}/rollback`, {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer test-token',
        },
      });

      if (res.ok) {
        alert('Откат выполнен успешно');
        window.location.reload();
      } else {
        const err = await res.json();
        alert(`Ошибка отката: ${err.message}`);
      }
    } catch (err) {
      console.error(err);
      alert('Ошибка при откате');
    }
  };

  const loadMedia = async () => {
    try {
      const res = await fetch('http://127.0.0.1:3001/api/admin/media');
      const data = await res.json();
      setMediaAssets(data);
      setShowMediaPicker(true);
    } catch (err) {
      console.error(err);
      alert('Ошибка при загрузке медиа');
    }
  };

  const insertMedia = (asset: any) => {
    const markdown = asset.media_type === 'image' 
      ? `![${asset.alt_text || asset.title || ''}](${asset.public_url})`
      : `[${asset.title || 'Медиа файл'}](${asset.public_url})`;
    
    setFormData({
      ...formData,
      bodyMarkdown: formData.bodyMarkdown + '\n' + markdown + '\n'
    });
    setShowMediaPicker(false);
  };

  if (loading) return <p>Загрузка...</p>;

  return (
    <div className="editor-page">
      <div style={{ marginBottom: '20px' }}>
        <Link href="/content" style={{ color: '#3498db' }}>← Назад к списку</Link>
        <h1>Редактирование: {formData.title}</h1>
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
              disabled // Content type usually shouldn't be changed after creation
              onChange={e => setFormData({ ...formData, contentType: e.target.value })}
            >
              <option value="article">Статья (Блог)</option>
              <option value="resource">Ресурс</option>
              <option value="landing">Лендинг темы</option>
              <option value="page">Страница</option>
            </select>
          </div>

          <div className="form-group">
            <label>Статус</label>
            <select 
              value={formData.status} 
              onChange={e => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="draft">Черновик</option>
              <option value="published">Опубликовано</option>
              <option value="archived">В архиве</option>
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

          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Сохранение...' : 'Сохранить изменения'}
          </button>

          {formData.status !== 'published' && (
            <button 
              type="button" 
              className="btn btn-success" 
              style={{ marginTop: '10px', width: '100%', backgroundColor: '#27ae60', color: 'white' }}
              onClick={() => setShowQAChecklist(true)}
            >
              Опубликовать...
            </button>
          )}

          <button 
            type="button" 
            className="btn btn-secondary" 
            style={{ marginTop: '10px', width: '100%', backgroundColor: '#95a5a6', color: 'white' }}
            onClick={loadRevisions}
          >
            История версий
          </button>
        </div>

        <div className="editor-main">
          <MarkdownEditor
            value={formData.bodyMarkdown}
            onChange={(value) => setFormData({ ...formData, bodyMarkdown: value })}
            onInsertMedia={loadMedia}
            showPreview={true}
            height="600px"
          />
        </div>
      </form>

      {showQAChecklist && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Чек-лист перед публикацией</h2>
            <div className="qa-checklist">
              <label>
                <input type="checkbox" checked={qaChecklist.hasDisclaimer} onChange={e => setQaChecklist({...qaChecklist, hasDisclaimer: e.target.checked})} />
                Есть дисклеймер &quot;не диагноз/не лечим&quot;
              </label>
              <label>
                <input type="checkbox" checked={qaChecklist.isToneGentle} onChange={e => setQaChecklist({...qaChecklist, isToneGentle: e.target.checked})} />
                Тон бережный, не директивный
              </label>
              <label>
                <input type="checkbox" checked={qaChecklist.hasTryNowBlock} onChange={e => setQaChecklist({...qaChecklist, hasTryNowBlock: e.target.checked})} />
                Есть блок &quot;попробовать сейчас&quot;
              </label>
              <label>
                <input type="checkbox" checked={qaChecklist.hasCTA} onChange={e => setQaChecklist({...qaChecklist, hasCTA: e.target.checked})} />
                Есть CTA (Telegram/запись)
              </label>
              <label>
                <input type="checkbox" checked={qaChecklist.hasInternalLinks} onChange={e => setQaChecklist({...qaChecklist, hasInternalLinks: e.target.checked})} />
                Внутренняя перелинковка (мин. 3 ссылки)
              </label>
              <label>
                <input type="checkbox" checked={qaChecklist.hasAltTexts} onChange={e => setQaChecklist({...qaChecklist, hasAltTexts: e.target.checked})} />
                Изображения с alt-текстами
              </label>
              <label>
                <input type="checkbox" checked={qaChecklist.spellCheckDone} onChange={e => setQaChecklist({...qaChecklist, spellCheckDone: e.target.checked})} />
                Проверка орфографии выполнена
              </label>
            </div>
            <div className="modal-actions">
              <button className="btn" onClick={() => setShowQAChecklist(false)}>Отмена</button>
              <button 
                className="btn btn-primary" 
                disabled={publishing || !Object.values(qaChecklist).every(v => v)}
                onClick={handlePublish}
              >
                {publishing ? 'Публикация...' : 'Опубликовать'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showRevisions && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ width: '600px' }}>
            <h2>История версий</h2>
            <div className="revisions-list">
              {revisions.map(rev => (
                <div key={rev.id} className="revision-item">
                  <div className="revision-info">
                    <strong>{new Date(rev.createdAt).toLocaleString()}</strong>
                    <span>{rev.title}</span>
                  </div>
                  <button className="btn btn-secondary btn-sm" onClick={() => handleRollback(rev.id)}>
                    Восстановить
                  </button>
                </div>
              ))}
              {revisions.length === 0 && <p>Версий пока нет</p>}
            </div>
            <div className="modal-actions">
              <button className="btn" onClick={() => setShowRevisions(false)}>Закрыть</button>
            </div>
          </div>
        </div>
      )}

      {showMediaPicker && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ width: '800px' }}>
            <h2>Выбрать медиа</h2>
            <div className="media-grid">
              {mediaAssets.map(asset => (
                <div key={asset.id} className="media-item" onClick={() => insertMedia(asset)}>
                  {asset.media_type === 'image' ? (
                    <img src={asset.public_url} alt={asset.alt_text} />
                  ) : (
                    <div className="media-icon">{asset.media_type}</div>
                  )}
                  <span>{asset.title || asset.id.substring(0, 8)}</span>
                </div>
              ))}
              {mediaAssets.length === 0 && <p>Медиа файлы не найдены</p>}
            </div>
            <div className="modal-actions">
              <button className="btn" onClick={() => setShowMediaPicker(false)}>Отмена</button>
            </div>
          </div>
        </div>
      )}

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
        .modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        .modal-content {
          background: white;
          padding: 30px;
          border-radius: 8px;
          width: 500px;
          max-width: 90%;
        }
        .qa-checklist {
          margin: 20px 0;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .qa-checklist label {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 14px;
          cursor: pointer;
        }
        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 20px;
        }
        .revisions-list {
          max-height: 400px;
          overflow-y: auto;
          margin: 20px 0;
        }
        .revision-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px;
          border-bottom: 1px solid #eee;
        }
        .revision-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .revision-info strong { font-size: 14px; }
        .revision-info span { font-size: 12px; color: #666; }
        .btn-sm {
          padding: 5px 10px;
          font-size: 12px;
        }
        .media-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          gap: 15px;
          max-height: 500px;
          overflow-y: auto;
          margin: 20px 0;
        }
        .media-item {
          border: 1px solid #eee;
          border-radius: 4px;
          padding: 10px;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 5px;
          transition: background 0.2s;
        }
        .media-item:hover {
          background: #f0f0f0;
        }
        .media-item img {
          width: 100%;
          height: 100px;
          object-fit: cover;
          border-radius: 2px;
        }
        .media-icon {
          width: 100%;
          height: 100px;
          background: #eee;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: bold;
          color: #666;
        }
        .media-item span {
          font-size: 12px;
          text-align: center;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          width: 100%;
        }
      `}</style>
    </div>
  );
}
