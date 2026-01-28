import { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { Calendar, Clock, User, Tag, ArrowLeft, ArrowRight, Heart, Share2, RefreshCw, AlertTriangle } from 'lucide-react';
import { getArticleBySlug } from '@/api/endpoints/content';
import type { Article } from '@/api/types/content';
import { ApiError } from '@/api/client';

interface BlogArticlePageProps {
  slug?: string | null;
  onBack?: () => void;
  onNavigateToArticle?: (slug: string) => void;
}

// Форматирование даты
function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

// Loading Skeleton
function ArticleSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Header */}
      <div className="px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-12">
        <div className="max-w-3xl mx-auto">
          <div className="h-8 bg-gray-200 rounded-xl w-24 mb-6" />
          <div className="h-12 bg-gray-300 rounded w-3/4 mb-4" />
          <div className="h-12 bg-gray-200 rounded w-1/2 mb-8" />
          <div className="flex gap-4 pb-8 border-b border-gray-200">
            <div className="h-10 w-10 rounded-full bg-gray-200" />
            <div className="h-6 bg-gray-100 rounded w-24" />
            <div className="h-6 bg-gray-100 rounded w-20" />
          </div>
          <div className="bg-gray-100 rounded-2xl h-24 mt-8" />
        </div>
      </div>
      {/* Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="h-4 bg-gray-100 rounded w-full" />
          <div className="h-4 bg-gray-100 rounded w-5/6" />
          <div className="h-4 bg-gray-100 rounded w-full" />
          <div className="h-4 bg-gray-100 rounded w-4/5" />
          <div className="h-4 bg-gray-100 rounded w-full" />
        </div>
      </div>
    </div>
  );
}

// Simple Markdown-like content rendering
function renderContent(content: string) {
  // Split content into paragraphs
  const paragraphs = content.split('\n\n');
  
  return paragraphs.map((paragraph, index) => {
    // Handle headers
    if (paragraph.startsWith('## ')) {
      return (
        <h2 key={index} className="text-2xl sm:text-3xl font-bold text-[#2D3748] mt-8 mb-4">
          {paragraph.replace('## ', '')}
        </h2>
      );
    }
    if (paragraph.startsWith('### ')) {
      return (
        <h3 key={index} className="text-xl sm:text-2xl font-bold text-[#2D3748] mt-6 mb-3">
          {paragraph.replace('### ', '')}
        </h3>
      );
    }
    // Handle lists
    if (paragraph.startsWith('- ') || paragraph.startsWith('* ')) {
      const items = paragraph.split('\n').filter(Boolean);
      return (
        <ul key={index} className="space-y-2 text-base text-[#718096] my-4 ml-4">
          {items.map((item, itemIndex) => (
            <li key={itemIndex} className="flex items-start gap-2">
              <span className="text-[#A8B5FF] mt-1">•</span>
              <span>{item.replace(/^[-*]\s/, '')}</span>
            </li>
          ))}
        </ul>
      );
    }
    // Regular paragraph
    return (
      <p key={index} className="text-base sm:text-lg text-[#718096] leading-relaxed my-4">
        {paragraph}
      </p>
    );
  });
}

export default function BlogArticlePage({ slug, onBack, onNavigateToArticle }: BlogArticlePageProps) {
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  const fetchArticle = useCallback(async () => {
    if (!slug) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    setNotFound(false);

    try {
      const response = await getArticleBySlug(slug);
      setArticle(response.data);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 404) {
          setNotFound(true);
        } else {
          setError(err.message);
        }
      } else {
        setError('Не удалось загрузить статью. Попробуйте позже.');
      }
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchArticle();
  }, [fetchArticle]);

  // Loading state
  if (loading) {
    return (
      <>
        <div className="px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28">
          <div className="max-w-3xl mx-auto">
            <button
              onClick={onBack}
              className="inline-flex items-center gap-2 text-sm sm:text-base text-[#718096] hover:text-[#A8B5FF] transition-colors mb-6"
            >
              <ArrowLeft className="w-5 h-5" />
              Все статьи
            </button>
          </div>
        </div>
        <ArticleSkeleton />
      </>
    );
  }

  // Not found state
  if (notFound) {
    return (
      <>
        <div className="px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28">
          <div className="max-w-3xl mx-auto">
            <button
              onClick={onBack}
              className="inline-flex items-center gap-2 text-sm sm:text-base text-[#718096] hover:text-[#A8B5FF] transition-colors mb-6"
            >
              <ArrowLeft className="w-5 h-5" />
              Все статьи
            </button>
          </div>
        </div>
        <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="max-w-2xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-amber-50 border border-amber-200 rounded-2xl p-8 sm:p-12"
            >
              <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="w-8 h-8 text-amber-600" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#2D3748] mb-4">
                Статья не найдена
              </h1>
              <p className="text-base sm:text-lg text-[#718096] mb-8">
                К сожалению, запрашиваемая статья не существует или была удалена.
              </p>
              <button
                onClick={onBack}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#A8B5FF] to-[#C8F5E8] text-white font-medium shadow-[0_4px_12px_-2px_rgba(168,181,255,0.4)] hover:shadow-[0_6px_16px_-2px_rgba(168,181,255,0.5)] transition-all"
              >
                Вернуться к списку статей
              </button>
            </motion.div>
          </div>
        </section>
      </>
    );
  }

  // Error state
  if (error) {
    return (
      <>
        <div className="px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28">
          <div className="max-w-3xl mx-auto">
            <button
              onClick={onBack}
              className="inline-flex items-center gap-2 text-sm sm:text-base text-[#718096] hover:text-[#A8B5FF] transition-colors mb-6"
            >
              <ArrowLeft className="w-5 h-5" />
              Все статьи
            </button>
          </div>
        </div>
        <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center"
            >
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={fetchArticle}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Попробовать снова
              </button>
            </motion.div>
          </div>
        </section>
      </>
    );
  }

  // No article
  if (!article) {
    return null;
  }

  return (
    <>
      {/* Back Button */}
      <div className="px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28">
        <div className="max-w-3xl mx-auto">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-sm sm:text-base text-[#718096] hover:text-[#A8B5FF] transition-colors mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            Все статьи
          </button>
        </div>
      </div>

      {/* Article Header */}
      <article className="px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Category Badge */}
            <div className="mb-6">
              <span className="inline-block px-4 py-2 rounded-xl bg-gradient-to-r from-[#A8B5FF]/10 to-[#C8F5E8]/10 text-sm font-medium text-[#A8B5FF]">
                {article.category}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-[30px] sm:text-4xl lg:text-5xl font-bold text-[#2D3748] mb-6 leading-tight">
              {article.title}
            </h1>

            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm text-[#718096] mb-8 pb-8 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#A8B5FF] to-[#C8F5E8] flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#2D3748]">Психолог</p>
                  <p className="text-xs text-[#718096]">Автор</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(article.published_at)}</span>
              </div>
              <button className="ml-auto flex items-center gap-2 text-[#718096] hover:text-[#A8B5FF] transition-colors">
                <Share2 className="w-4 h-4" />
                <span className="hidden sm:inline">Поделиться</span>
              </button>
            </div>

            {/* Featured Quote/Intro */}
            {article.excerpt && (
              <div className="bg-gradient-to-r from-[#C8F5E8]/10 to-[#7FD99A]/10 rounded-2xl p-6 sm:p-8 border-l-4 border-[#7FD99A] mb-8">
                <p className="text-lg sm:text-xl text-[#2D3748] leading-relaxed italic">
                  {article.excerpt}
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </article>

      {/* Article Content */}
      <section className="px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="max-w-3xl mx-auto">
          <div className="prose prose-slate max-w-none">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              {renderContent(article.content)}
            </motion.div>

            {/* Tags */}
            {article.tags.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="pt-8 border-t border-gray-200 mt-8"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Tag className="w-4 h-4 text-[#718096]" />
                  <span className="text-sm font-medium text-[#718096]">Теги:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {article.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 rounded-xl bg-[#A8B5FF]/10 text-sm font-medium text-[#A8B5FF] hover:bg-[#A8B5FF]/20 transition-colors cursor-pointer"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* Author Bio */}
      <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16 bg-gradient-to-b from-white to-[#A8B5FF]/5">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8"
          >
            <div className="flex items-start gap-4 sm:gap-6">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-[#A8B5FF] to-[#C8F5E8] flex items-center justify-center flex-shrink-0">
                <User className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg sm:text-xl font-semibold text-[#2D3748] mb-2">
                  Психолог
                </h3>
                <p className="text-sm sm:text-base text-[#718096] leading-relaxed mb-4">
                  Клинический психолог с многолетним опытом работы. Специализируюсь на тревожных 
                  расстройствах, стрессе и эмоциональной регуляции. Помогаю людям находить баланс 
                  и спокойствие в современном мире.
                </p>
                <button className="text-sm sm:text-base font-medium text-[#A8B5FF] hover:underline">
                  Записаться на консультацию →
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-[#A8B5FF]/10 via-[#FFD4B5]/10 to-[#C8F5E8]/10 rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-center border border-[#A8B5FF]/20"
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#A8B5FF] to-[#C8F5E8] flex items-center justify-center mx-auto mb-6 shadow-[0_8px_24px_-4px_rgba(168,181,255,0.4)]">
              <Heart className="w-8 h-8 text-white" fill="white" />
            </div>
            
            <h2 className="text-2xl sm:text-3xl font-bold text-[#2D3748] mb-4">
              Нужна профессиональная поддержка?
            </h2>
            
            <p className="text-base sm:text-lg text-[#718096] mb-8 max-w-2xl mx-auto leading-relaxed">
              Если вы чувствуете, что вам нужна помощь, я помогу вам найти способы справиться 
              с трудностями.
            </p>
            
            <button className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-[#A8B5FF] to-[#C8F5E8] text-white font-medium shadow-[0_8px_24px_-4px_rgba(168,181,255,0.4)] hover:shadow-[0_12px_32px_-4px_rgba(168,181,255,0.5)] active:scale-[0.98] transition-all">
              Записаться на консультацию
            </button>
          </motion.div>
        </div>
      </section>
    </>
  );
}
