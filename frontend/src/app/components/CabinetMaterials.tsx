import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { FileText, BookOpen, Headphones, Video, Download, ExternalLink, Filter, ChevronLeft, Sparkles, Loader2, AlertCircle } from 'lucide-react';
import * as contentApi from '@/api/endpoints/content';
import type { ArticleListItem, ResourceListItem } from '@/api/types/content';

interface CabinetMaterialsProps {
  onBack?: () => void;
  onNavigateToArticle?: (slug: string) => void;
  onNavigateToResource?: (slug: string) => void;
  onNavigateToResourcesList?: () => void;
}

type MaterialItem = {
  id: string;
  slug: string;
  title: string;
  description: string;
  type: string;
  typeName: string;
  duration?: string;
  addedDate: string;
  icon: typeof FileText;
  color: string;
};

const typeMeta: Record<string, { typeName: string; icon: typeof FileText; color: string }> = {
  article: { typeName: 'Статья', icon: FileText, color: 'from-[#A8B5FF] to-[#C8F5E8]' },
  guide: { typeName: 'Руководство', icon: BookOpen, color: 'from-[#7FD99A] to-[#C8F5E8]' },
  audio: { typeName: 'Аудио', icon: Headphones, color: 'from-[#FFD4B5] to-[#FFC97F]' },
  video: { typeName: 'Видео', icon: Video, color: 'from-[#FFB5C5] to-[#FFD4B5]' },
  meditation: { typeName: 'Медитация', icon: Headphones, color: 'from-[#FFD4B5] to-[#FFC97F]' },
  exercise: { typeName: 'Упражнение', icon: BookOpen, color: 'from-[#7FD99A] to-[#C8F5E8]' },
  checklist: { typeName: 'Чек-лист', icon: FileText, color: 'from-[#A8B5FF] to-[#C8F5E8]' },
};

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch {
    return iso;
  }
}

export default function CabinetMaterials({ onBack, onNavigateToArticle, onNavigateToResource, onNavigateToResourcesList }: CabinetMaterialsProps) {
  const [selectedType, setSelectedType] = useState<string>('all');
  const [materials, setMaterials] = useState<MaterialItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      contentApi.getResources({ per_page: 20 }),
      contentApi.getArticles({ per_page: 20 }),
    ])
      .then(([resourcesRes, articlesRes]) => {
        if (cancelled) return;
        const items: MaterialItem[] = [];
        (resourcesRes.data ?? []).forEach((r: ResourceListItem) => {
          const meta = typeMeta[r.type] ?? typeMeta.article;
          items.push({
            id: `resource-${r.id}`,
            slug: r.slug,
            title: r.title,
            description: r.description ?? '',
            type: r.type,
            typeName: meta.typeName,
            duration: r.duration,
            addedDate: '',
            icon: meta.icon,
            color: meta.color,
          });
        });
        (articlesRes.data ?? []).forEach((a: ArticleListItem) => {
          items.push({
            id: `article-${a.id}`,
            slug: a.slug,
            title: a.title,
            description: a.excerpt ?? '',
            type: 'article',
            typeName: 'Статья',
            duration: undefined,
            addedDate: a.published_at ? formatDate(a.published_at) : '',
            icon: FileText,
            color: 'from-[#A8B5FF] to-[#C8F5E8]',
          });
        });
        items.sort((x, y) => (y.addedDate || '').localeCompare(x.addedDate || ''));
        setMaterials(items);
      })
      .catch((err) => {
        if (!cancelled) setError(err?.message ?? 'Не удалось загрузить материалы');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredMaterials =
    selectedType === 'all'
      ? materials
      : materials.filter((m) => m.type === selectedType);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-32">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-[#FFD4B5]" />
          <p className="text-[#718096]">Загрузка материалов...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 pt-32">
        <div className="max-w-4xl mx-auto flex flex-col items-center gap-4 py-12">
          <AlertCircle className="w-12 h-12 text-red-500" />
          <p className="text-[#2D3748] font-medium">{error}</p>
          {onBack && (
            <button onClick={onBack} type="button" className="text-sm text-[#718096] hover:text-[#FFD4B5]">
              Вернуться в кабинет
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <section className="relative px-4 sm:px-6 lg:px-8 pt-32 sm:pt-36 lg:pt-40 pb-8 sm:pb-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#FFD4B5]/10 to-white -z-10" />
        
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <button
              onClick={onBack}
              className="inline-flex items-center gap-2 text-sm text-[#718096] hover:text-[#FFD4B5] transition-colors mb-6"
            >
              <ChevronLeft className="w-5 h-5" />
              Вернуться в кабинет
            </button>

            <h1 className="text-[32px] sm:text-4xl lg:text-5xl font-bold text-[#2D3748] mb-2 leading-tight">
              Мои материалы
            </h1>
            <p className="text-base sm:text-lg text-[#718096]">
              Материалы, рекомендованные специально для вас
            </p>
          </motion.div>
        </div>
      </section>

      {/* Info Card */}
      <section className="px-4 sm:px-6 lg:px-8 pb-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-gradient-to-r from-[#FFD4B5]/10 to-[#FFC97F]/10 border border-[#FFD4B5]/30 rounded-xl p-5">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#FFD4B5]/20 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 text-[#FFD4B5]" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-[#2D3748] mb-1">
                  Персональная подборка
                </h3>
                <p className="text-sm text-[#718096] leading-relaxed">
                  Эти материалы подобраны вашим психологом с учётом ваших запросов и целей терапии. 
                  Новые материалы добавляются после каждой консультации.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filter */}
      <section className="px-4 sm:px-6 lg:px-8 pb-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-[#718096]" />
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-200 text-sm text-[#2D3748] bg-white focus:outline-none focus:border-[#FFD4B5]"
            >
              <option value="all">Все материалы ({materials.length})</option>
              <option value="article">Статьи</option>
              <option value="guide">Руководства</option>
              <option value="audio">Аудио</option>
              <option value="video">Видео</option>
              <option value="meditation">Медитации</option>
              <option value="exercise">Упражнения</option>
              <option value="checklist">Чек-листы</option>
            </select>
          </div>
        </div>
      </section>

      {/* Materials Grid */}
      <section className="px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16">
        <div className="max-w-6xl mx-auto">
          {filteredMaterials.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMaterials.map((material, index) => (
                <motion.div
                  key={material.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="group bg-white border border-gray-200 rounded-2xl p-6 hover:border-transparent hover:shadow-lg transition-all cursor-pointer relative overflow-hidden"
                  onClick={() => {
                    if (material.type === 'article' && onNavigateToArticle) onNavigateToArticle(material.slug);
                    else if (onNavigateToResource) onNavigateToResource(material.slug);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (material.type === 'article' ? onNavigateToArticle : onNavigateToResource)) {
                      material.type === 'article' ? onNavigateToArticle?.(material.slug) : onNavigateToResource?.(material.slug);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${material.color} flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform`}>
                    <material.icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 text-xs font-medium text-[#718096] mb-3">
                    {material.typeName}
                  </div>
                  <h3 className="text-lg font-semibold text-[#2D3748] mb-2 leading-snug">
                    {material.title}
                  </h3>
                  <p className="text-sm text-[#718096] mb-4 leading-relaxed line-clamp-2">
                    {material.description}
                  </p>
                  <div className="flex items-center justify-between text-xs text-[#718096] mb-4 pb-4 border-b border-gray-100">
                    <span>{material.duration ?? '—'}</span>
                    <span>{material.addedDate || '—'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="flex-1 px-4 py-2.5 rounded-lg bg-gradient-to-r from-[#FFD4B5] to-[#FFC97F] text-white text-sm font-medium hover:shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (material.type === 'article' && onNavigateToArticle) onNavigateToArticle(material.slug);
                        else if (onNavigateToResource) onNavigateToResource(material.slug);
                      }}
                    >
                      <span>Открыть</span>
                      <ExternalLink className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      className="w-10 h-10 rounded-lg border border-gray-200 hover:border-[#FFD4B5]/30 hover:bg-gray-50 transition-colors flex items-center justify-center"
                    >
                      <Download className="w-4 h-4 text-[#718096]" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            // Empty State
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#FFD4B5]/10 to-[#FFC97F]/10 flex items-center justify-center mx-auto mb-6">
                <FileText className="w-10 h-10 text-[#FFD4B5]" />
              </div>
              <h3 className="text-xl font-semibold text-[#2D3748] mb-2">
                Пока нет материалов
              </h3>
              <p className="text-base text-[#718096] max-w-md mx-auto leading-relaxed">
                Материалы будут появляться здесь после ваших консультаций. 
                Психолог подберёт для вас статьи, упражнения и практики, которые помогут в работе с вашим запросом.
              </p>
            </motion.div>
          )}
        </div>
      </section>

      {/* Resources CTA */}
      <section className="px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16 lg:pb-20">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-[#A8B5FF]/10 to-[#C8F5E8]/10 border border-[#A8B5FF]/20 rounded-2xl p-8 text-center"
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#A8B5FF] to-[#C8F5E8] flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-[#2D3748] mb-3">
              Ищете больше ресурсов?
            </h3>
            <p className="text-base text-[#718096] mb-6 max-w-2xl mx-auto">
              В нашей библиотеке вы найдёте статьи, упражнения и практики по разным темам 
              психологического благополучия
            </p>
            {onNavigateToResourcesList && (
              <button
                type="button"
                onClick={onNavigateToResourcesList}
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-[#A8B5FF] to-[#C8F5E8] text-white font-medium shadow-sm hover:shadow-md active:scale-[0.98] transition-all inline-flex items-center gap-2"
              >
                <BookOpen className="w-5 h-5" />
                Перейти в библиотеку
              </button>
            )}
          </motion.div>
        </div>
      </section>
    </>
  );
}
