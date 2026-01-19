'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import MarkdownEditor from '../../../components/MarkdownEditor';
import { AdminAuthGuard } from '@/components/admin-auth-guard';
import { useAdminAuth } from '@/components/admin-auth-context';

export default function EditContentPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { user } = useAdminAuth();
  const canEdit = Boolean(user?.roles.some((role) => role === 'owner' || role === 'editor'));
  
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    contentType: 'article',
    bodyMarkdown: '',
    excerpt: '',
    status: 'draft',
    timeToBenefit: '',
    format: '',
    supportLevel: '',
    seoTitle: '',
    seoDescription: '',
    seoKeywords: '',
    canonicalUrl: '',
    topicCodes: [] as string[],
    tagIds: [] as string[],
    practicalBlock: buildPracticalTemplate('article', ''),
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
    fetch(`/api/admin/content/${id}`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        setFormData({
          title: data.title,
          slug: data.slug,
          contentType: data.contentType,
          bodyMarkdown: data.bodyMarkdown,
          excerpt: data.excerpt || '',
          status: data.status,
          timeToBenefit: data.timeToBenefit || '',
          format: data.format || '',
          supportLevel: data.supportLevel || '',
          seoTitle: data.seoTitle || '',
          seoDescription: data.seoDescription || '',
          seoKeywords: data.seoKeywords || '',
          canonicalUrl: data.canonicalUrl || '',
          topicCodes: data.topicCodes || [],
          tagIds: data.tagIds || [],
          practicalBlock: data.practicalBlock || buildPracticalTemplate(data.contentType, data.format || ''),
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
      fetch('/api/admin/content/topics', { credentials: 'include' }).then(res => res.json()),
      fetch('/api/admin/content/tags', { credentials: 'include' }).then(res => res.json())
    ]).then(([topicsData, tagsData]) => {
      setTopics(topicsData);
      setTags(tagsData);
    }).catch(err => console.error(err));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) {
      return;
    }
    setSaving(true);

    try {
      const res = await fetch(`/api/admin/content/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
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
    if (!canEdit) {
      return;
    }
    setPublishing(true);
    try {
      const res = await fetch(`/api/admin/content/${id}/publish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
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
      const res = await fetch(`/api/admin/content/${id}/revisions`, { credentials: 'include' });
      const data = await res.json();
      setRevisions(data);
      setShowRevisions(true);
    } catch (err) {
      console.error(err);
      alert('Ошибка при загрузке версий');
    }
  };

  const handleRollback = async (revisionId: string) => {
    if (!canEdit) {
      return;
    }
    if (!confirm('Вы уверены, что хотите откатиться к этой версии? Текущие несохраненные изменения будут потеряны.')) return;
    
    try {
      const res = await fetch(`/api/admin/content/${id}/revisions/${revisionId}/rollback`, {
        method: 'POST',
        credentials: 'include',
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
    if (!canEdit) {
      return;
    }
    try {
      const res = await fetch('/api/admin/media', { credentials: 'include' });
      const data = await res.json();
      setMediaAssets(data);
      setShowMediaPicker(true);
    } catch (err) {
      console.error(err);
      alert('Ошибка при загрузке медиа');
    }
  };

  const insertMedia = (asset: any) => {
    if (!canEdit) {
      return;
    }
    const markdown = asset.media_type === 'image' 
      ? `![${asset.alt_text || asset.title || ''}](${asset.public_url})`
      : `[${asset.title || 'Медиа файл'}](${asset.public_url})`;
    
    setFormData({
      ...formData,
      bodyMarkdown: formData.bodyMarkdown + '\n' + markdown + '\n'
    });
    setShowMediaPicker(false);
  };

  return (
    <AdminAuthGuard allowedRoles={['owner', 'assistant', 'editor']}>
      {loading ? (
        <p>Загрузка...</p>
      ) : (
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
            <label>Time to benefit</label>
            <select
              value={formData.timeToBenefit}
              onChange={e => setFormData({ ...formData, timeToBenefit: e.target.value })}
            >
              <option value="">—</option>
              <option value="min_1_3">1–3 минуты</option>
              <option value="min_7_10">7–10 минут</option>
              <option value="min_20_30">20–30 минут</option>
              <option value="series">Серия шагов</option>
            </select>
          </div>

          <div className="form-group">
            <label>Формат</label>
            <select
              value={formData.format}
              onChange={e => setFormData({
                ...formData,
                format: e.target.value,
              })}
            >
              <option value="">—</option>
              <option value="article">Статья</option>
              <option value="note">Заметка</option>
              <option value="resource">Ресурс</option>
              <option value="audio">Аудио</option>
              <option value="checklist">Чек-лист</option>
            </select>
          </div>

          <div className="form-group">
            <label>Уровень поддержки</label>
            <select
              value={formData.supportLevel}
              onChange={e => setFormData({ ...formData, supportLevel: e.target.value })}
            >
              <option value="">—</option>
              <option value="self_help">Самопомощь</option>
              <option value="micro_support">Мягкая поддержка</option>
              <option value="consultation">Консультация</option>
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
          <h3>Практический блок</h3>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.practicalBlock.enabled !== false}
                onChange={e => setFormData({
                  ...formData,
                  practicalBlock: { ...formData.practicalBlock, enabled: e.target.checked },
                })}
              />
              Показывать практический блок
            </label>
          </div>

          <div className="form-group">
            <button
              type="button"
              className="btn btn-secondary"
              disabled={!canEdit}
              onClick={() => setFormData({
                ...formData,
                practicalBlock: buildPracticalTemplate(formData.contentType, formData.format),
              })}
            >
              Применить шаблон по типу
            </button>
          </div>

          <div className="form-group">
            <label>Заголовок блока</label>
            <input
              type="text"
              value={formData.practicalBlock.title || ''}
              onChange={e => setFormData({
                ...formData,
                practicalBlock: { ...formData.practicalBlock, title: e.target.value },
              })}
            />
          </div>

          <div className="form-group">
            <label>Описание</label>
            <textarea
              rows={3}
              value={formData.practicalBlock.description || ''}
              onChange={e => setFormData({
                ...formData,
                practicalBlock: { ...formData.practicalBlock, description: e.target.value },
              })}
            />
          </div>

          <div className="form-group">
            <label>Мета (каждая строка — отдельная метка)</label>
            <textarea
              rows={3}
              value={(formData.practicalBlock.meta || []).join('\n')}
              onChange={e => setFormData({
                ...formData,
                practicalBlock: { ...formData.practicalBlock, meta: splitLines(e.target.value) },
              })}
            />
          </div>

          <div className="form-group">
            <label>Primary CTA</label>
            <select
              value={formData.practicalBlock.primary_cta?.target || 'practice'}
              onChange={e => setFormData({
                ...formData,
                practicalBlock: {
                  ...formData.practicalBlock,
                  primary_cta: {
                    ...formData.practicalBlock.primary_cta,
                    target: e.target.value as PracticalTarget,
                  },
                },
              })}
            >
              <option value="practice">Подобрать практику</option>
              <option value="thermometer">Термометр ресурса</option>
              <option value="rituals">Послушать практику</option>
              <option value="consultation-prep">Подготовка к консультации</option>
              <option value="custom">Своя ссылка</option>
            </select>
            <input
              type="text"
              placeholder="Текст кнопки"
              value={formData.practicalBlock.primary_cta?.label || ''}
              onChange={e => setFormData({
                ...formData,
                practicalBlock: {
                  ...formData.practicalBlock,
                  primary_cta: {
                    ...formData.practicalBlock.primary_cta,
                    label: e.target.value,
                  },
                },
              })}
            />
            <input
              type="text"
              placeholder="Ссылка (если target = custom)"
              value={formData.practicalBlock.primary_cta?.href || ''}
              onChange={e => setFormData({
                ...formData,
                practicalBlock: {
                  ...formData.practicalBlock,
                  primary_cta: {
                    ...formData.practicalBlock.primary_cta,
                    href: e.target.value,
                  },
                },
              })}
            />
          </div>

          <div className="form-group">
            <label>Secondary CTA</label>
            <select
              value={formData.practicalBlock.secondary_cta?.target || ''}
              onChange={e => setFormData({
                ...formData,
                practicalBlock: {
                  ...formData.practicalBlock,
                  secondary_cta: {
                    ...formData.practicalBlock.secondary_cta,
                    target: (e.target.value || undefined) as PracticalTarget | undefined,
                  },
                },
              })}
            >
              <option value="">—</option>
              <option value="practice">Подобрать практику</option>
              <option value="thermometer">Термометр ресурса</option>
              <option value="rituals">Послушать практику</option>
              <option value="consultation-prep">Подготовка к консультации</option>
              <option value="custom">Своя ссылка</option>
            </select>
            <input
              type="text"
              placeholder="Текст кнопки"
              value={formData.practicalBlock.secondary_cta?.label || ''}
              onChange={e => setFormData({
                ...formData,
                practicalBlock: {
                  ...formData.practicalBlock,
                  secondary_cta: {
                    ...formData.practicalBlock.secondary_cta,
                    label: e.target.value,
                  },
                },
              })}
            />
            <input
              type="text"
              placeholder="Ссылка (если target = custom)"
              value={formData.practicalBlock.secondary_cta?.href || ''}
              onChange={e => setFormData({
                ...formData,
                practicalBlock: {
                  ...formData.practicalBlock,
                  secondary_cta: {
                    ...formData.practicalBlock.secondary_cta,
                    href: e.target.value,
                  },
                },
              })}
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

          <button type="submit" className="btn btn-primary" disabled={!canEdit || saving}>
            {saving ? 'Сохранение...' : 'Сохранить изменения'}
          </button>

          {canEdit && formData.status !== 'published' && (
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
                disabled={!canEdit || publishing || !Object.values(qaChecklist).every(v => v)}
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
                  <button className="btn btn-secondary btn-sm" disabled={!canEdit} onClick={() => handleRollback(rev.id)}>
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
      )}
    </AdminAuthGuard>
  );
}

type PracticalTarget = 'practice' | 'thermometer' | 'rituals' | 'consultation-prep' | 'custom';

type PracticalBlock = {
  enabled?: boolean;
  title?: string;
  description?: string;
  meta?: string[];
  primary_cta?: { target?: PracticalTarget; label?: string; href?: string };
  secondary_cta?: { target?: PracticalTarget; label?: string; href?: string };
};

function splitLines(value: string): string[] {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

function buildPracticalTemplate(contentType: string, format: string): PracticalBlock {
  const meta = [
    format ? `Формат: ${format}` : null,
  ].filter(Boolean) as string[];

  const primaryTarget = resolvePrimaryTargetByFormat(format);
  const secondaryTarget = primaryTarget === 'thermometer' ? 'practice' : 'thermometer';

  return {
    enabled: true,
    title: contentType === 'resource' ? 'Практический шаг' : 'Попробовать сейчас',
    description: contentType === 'resource'
      ? 'Короткий шаг поможет закрепить пользу от материала.'
      : 'Небольшая практика помогает почувствовать эффект уже сейчас.',
    meta,
    primary_cta: { target: primaryTarget, label: resolveTargetLabel(primaryTarget) },
    secondary_cta: { target: secondaryTarget, label: resolveTargetLabel(secondaryTarget) },
  };
}

function resolvePrimaryTargetByFormat(format: string): PracticalTarget {
  switch (format) {
    case 'audio':
      return 'rituals';
    case 'checklist':
      return 'consultation-prep';
    case 'resource':
      return 'thermometer';
    default:
      return 'practice';
  }
}

function resolveTargetLabel(target: PracticalTarget): string {
  switch (target) {
    case 'thermometer':
      return 'Термометр ресурса';
    case 'rituals':
      return 'Послушать практику';
    case 'consultation-prep':
      return 'Подготовка к консультации';
    case 'custom':
      return 'Открыть ссылку';
    default:
      return 'Подобрать практику';
  }
}
