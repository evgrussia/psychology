'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import MarkdownEditor from '../../../components/MarkdownEditor';
import { AdminAuthGuard } from '@/components/admin-auth-guard';

export default function NewContentPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    contentType: 'article',
    bodyMarkdown: '',
    excerpt: '',
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
  const [topics, setTopics] = useState<{ code: string, title: string }[]>([]);
  const [tags, setTags] = useState<{ id: string, title: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/content/topics', { credentials: 'include' }).then(res => res.json()),
      fetch('/api/admin/content/tags', { credentials: 'include' }).then(res => res.json())
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
      const res = await fetch('/api/admin/content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
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
    <AdminAuthGuard allowedRoles={['owner', 'editor']}>
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
              onChange={e => {
                const contentType = e.target.value;
                setFormData({
                  ...formData,
                  contentType,
                  practicalBlock: buildPracticalTemplate(contentType, formData.format),
                });
              }}
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
              onChange={e => setFormData({ ...formData, format: e.target.value })}
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
                    target: e.target.value,
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
                    target: e.target.value || undefined,
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
