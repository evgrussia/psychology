import { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { BookOpen, Calendar, Clock, User, ArrowRight, Search, Mail, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { getArticles } from '@/api/endpoints/content';
import type { ArticleListItem, Pagination } from '@/api/types/content';
import { ApiError } from '@/api/client';

interface BlogListPageProps {
  onNavigateToArticle?: (slug: string) => void;
}

// Градиенты для категорий
const categoryGradients: Record<string, string> = {
  'Тревога': 'from-[#A8B5FF] to-[#C8F5E8]',
  'Границы': 'from-[#7FD99A] to-[#C8F5E8]',
  'Выгорание': 'from-[#FFD4B5] to-[#FFC97F]',
  'Практики': 'from-[#C8F5E8] to-[#7FD99A]',
  'Самопознание': 'from-[#FFD4B5] to-[#C8F5E8]',
  'Здоровье': 'from-[#A8B5FF] to-[#FFD4B5]',
};

function getGradient(category: string): string {
  return categoryGradients[category] || 'from-[#A8B5FF] to-[#C8F5E8]';
}

// Loading Skeleton
function ArticleSkeleton() {
  return (
    <div className="bg-white border-2 border-gray-100 rounded-2xl overflow-hidden animate-pulse">
      <div className="h-48 bg-gray-200" />
      <div className="p-6">
        <div className="flex gap-3 mb-3">
          <div className="h-4 bg-gray-100 rounded w-20" />
          <div className="h-4 bg-gray-100 rounded w-16" />
        </div>
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-2" />
        <div className="h-4 bg-gray-100 rounded w-full mb-2" />
        <div className="h-4 bg-gray-100 rounded w-2/3 mb-4" />
        <div className="flex justify-between pt-4 border-t border-gray-100">
          <div className="h-6 bg-gray-100 rounded w-24" />
          <div className="h-4 bg-gray-100 rounded w-4" />
        </div>
      </div>
    </div>
  );
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

export default function BlogListPage({ onNavigateToArticle }: BlogListPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [articles, setArticles] = useState<ArticleListItem[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchArticles = useCallback(async (page: number, search?: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await getArticles({
        page,
        per_page: 9,
        search: search || undefined,
      });
      setArticles(response.data);
      setPagination(response.pagination);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Не удалось загрузить статьи. Попробуйте позже.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchArticles(currentPage, searchQuery);
  }, [fetchArticles, currentPage, searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchArticles(1, searchQuery);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Empty State (когда нет статей и нет ошибки)
  if (!loading && !error && articles.length === 0 && !searchQuery) {
    return (
      <>
        {/* Hero Section */}
        <section className="relative px-4 sm:px-6 lg:px-8 pt-32 sm:pt-36 lg:pt-40 pb-12 sm:pb-16 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-[#FFD4B5]/10 to-white -z-10" />
          
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#FFD4B5]/20 to-[#FFC97F]/20 flex items-center justify-center mx-auto mb-6">
                <BookOpen className="w-10 h-10 text-[#FFD4B5]" />
              </div>
              
              <h1 className="text-[32px] sm:text-4xl lg:text-5xl font-bold text-[#2D3748] mb-4 leading-tight">
                Блог
              </h1>
              
              <p className="text-base sm:text-lg text-[#718096] max-w-2xl mx-auto leading-relaxed">
                Скоро здесь появятся статьи о психологии, самопомощи и личностном росте
              </p>
            </motion.div>
          </div>
        </section>

        {/* Empty State Content */}
        <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          <div className="max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-[#FFD4B5]/5 to-[#FFC97F]/5 rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-center border border-[#FFD4B5]/20"
            >
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#FFD4B5] to-[#FFC97F] flex items-center justify-center mx-auto mb-6 shadow-[0_8px_24px_-4px_rgba(255,212,181,0.4)]">
                <BookOpen className="w-12 h-12 text-white" />
              </div>
              
              <h2 className="text-2xl sm:text-3xl font-bold text-[#2D3748] mb-4">
                Мы готовим для вас полезный контент
              </h2>
              
              <p className="text-base sm:text-lg text-[#718096] mb-8 leading-relaxed">
                Подпишитесь на обновления, чтобы первыми узнавать о новых статьях, 
                упражнениях и материалах о психологическом благополучии.
              </p>

              {/* Email Subscribe */}
              <div className="max-w-md mx-auto mb-6">
                <div className="relative">
                  <input
                    type="email"
                    placeholder="Ваш email"
                    className="w-full px-5 py-3.5 pr-32 rounded-xl border-2 border-gray-200 focus:border-[#FFD4B5] focus:outline-none text-[#2D3748] placeholder:text-[#718096] transition-colors"
                  />
                  <button className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2 rounded-lg bg-gradient-to-r from-[#FFD4B5] to-[#FFC97F] text-white text-sm font-medium hover:scale-105 active:scale-95 transition-transform">
                    Подписаться
                  </button>
                </div>
              </div>

              <p className="text-xs text-[#718096]">
                Никакого спама, только полезные материалы
              </p>
            </motion.div>

            {/* What to Expect */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-12"
            >
              <h3 className="text-lg sm:text-xl font-semibold text-[#2D3748] mb-6 text-center">
                Что будет в блоге:
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { emoji: '📝', text: 'Статьи о психологии и самопомощи' },
                  { emoji: '🧘', text: 'Практические упражнения и техники' },
                  { emoji: '💡', text: 'Инсайты из терапевтической практики' },
                  { emoji: '🌱', text: 'Советы по личностному росту' }
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl p-4">
                    <span className="text-2xl">{item.emoji}</span>
                    <span className="text-sm sm:text-base text-[#2D3748]">{item.text}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      </>
    );
  }

  // Content State
  return (
    <>
      {/* Hero Section */}
      <section className="relative px-4 sm:px-6 lg:px-8 pt-32 sm:pt-36 lg:pt-40 pb-12 sm:pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#FFD4B5]/10 to-white -z-10" />
        
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#FFD4B5]/10 to-[#FFC97F]/10 text-sm font-medium text-[#2D3748] mb-6">
              <BookOpen className="w-4 h-4 text-[#FFD4B5]" />
              Статьи и материалы
            </div>
            
            <h1 className="text-[32px] sm:text-4xl lg:text-5xl font-bold text-[#2D3748] mb-4 leading-tight">
              Блог
            </h1>
            
            <p className="text-base sm:text-lg text-[#718096] max-w-2xl mx-auto leading-relaxed mb-8">
              Статьи о психологии, самопомощи и практические рекомендации для улучшения 
              эмоционального благополучия
            </p>

            {/* Search */}
            <form onSubmit={handleSearch} className="max-w-xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#718096]" />
                <input
                  type="text"
                  placeholder="Поиск статей..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-5 py-3.5 rounded-xl border-2 border-gray-200 focus:border-[#FFD4B5] focus:outline-none text-[#2D3748] placeholder:text-[#718096] transition-colors"
                />
              </div>
            </form>
          </motion.div>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="max-w-6xl mx-auto">
          {/* Error State */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center mb-8"
            >
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={() => fetchArticles(currentPage, searchQuery)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Попробовать снова
              </button>
            </motion.div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {[...Array(6)].map((_, index) => (
                <ArticleSkeleton key={index} />
              ))}
            </div>
          )}

          {/* Content */}
          {!loading && !error && articles.length > 0 && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {articles.map((article, index) => (
                  <motion.article
                    key={article.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                  >
                    <button
                      onClick={() => onNavigateToArticle?.(article.slug)}
                      className="group w-full h-full bg-white border-2 border-gray-100 rounded-2xl overflow-hidden hover:border-transparent hover:shadow-[0_8px_24px_-4px_rgba(168,181,255,0.2)] transition-all duration-300"
                    >
                      {/* Featured Image / Gradient */}
                      <div className={`h-48 bg-gradient-to-br ${getGradient(article.category)} relative overflow-hidden`}>
                        <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />
                        <div className="absolute bottom-4 left-4">
                          <span className="px-3 py-1 rounded-lg bg-white/90 backdrop-blur-sm text-xs font-medium text-[#2D3748]">
                            {article.category}
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-6 text-left">
                        {/* Meta */}
                        <div className="flex items-center gap-3 text-xs text-[#718096] mb-3">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{formatDate(article.published_at)}</span>
                          </div>
                        </div>

                        {/* Title */}
                        <h2 className="text-lg sm:text-xl font-semibold text-[#2D3748] mb-2 leading-snug group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-[#A8B5FF] group-hover:to-[#FFD4B5] transition-all">
                          {article.title}
                        </h2>

                        {/* Excerpt */}
                        <p className="text-sm text-[#718096] leading-relaxed mb-4 line-clamp-2">
                          {article.excerpt}
                        </p>

                        {/* Author & Arrow */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#A8B5FF] to-[#C8F5E8] flex items-center justify-center">
                              <User className="w-3.5 h-3.5 text-white" />
                            </div>
                            <span className="text-xs text-[#718096]">Психолог</span>
                          </div>
                          <ArrowRight className="w-4 h-4 text-[#718096] group-hover:text-[#A8B5FF] group-hover:translate-x-1 transition-all" />
                        </div>

                        {/* Tags */}
                        {article.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-4">
                            {article.tags.slice(0, 2).map((tag, tagIndex) => (
                              <span
                                key={tagIndex}
                                className="px-2 py-1 rounded-lg bg-gray-50 text-xs text-[#718096]"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </button>
                  </motion.article>
                ))}
              </div>

              {/* Pagination */}
              {pagination && pagination.total_pages > 1 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="flex items-center justify-center gap-2 mt-12"
                >
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="flex items-center gap-1 px-4 py-2 rounded-lg border-2 border-gray-200 text-sm font-medium text-[#718096] hover:border-[#A8B5FF] hover:text-[#A8B5FF] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span className="hidden sm:inline">Назад</span>
                  </button>

                  {/* Page Numbers */}
                  {[...Array(pagination.total_pages)].map((_, index) => {
                    const page = index + 1;
                    // Show first, last, current, and adjacent pages
                    if (
                      page === 1 ||
                      page === pagination.total_pages ||
                      Math.abs(page - currentPage) <= 1
                    ) {
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            page === currentPage
                              ? 'bg-gradient-to-r from-[#A8B5FF] to-[#C8F5E8] text-white'
                              : 'border-2 border-gray-200 text-[#718096] hover:border-[#A8B5FF] hover:text-[#A8B5FF]'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    }
                    // Show ellipsis
                    if (
                      (page === 2 && currentPage > 3) ||
                      (page === pagination.total_pages - 1 && currentPage < pagination.total_pages - 2)
                    ) {
                      return (
                        <span key={page} className="px-2 text-[#718096]">
                          ...
                        </span>
                      );
                    }
                    return null;
                  })}

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === pagination.total_pages}
                    className="flex items-center gap-1 px-4 py-2 rounded-lg border-2 border-gray-200 text-sm font-medium text-[#718096] hover:border-[#A8B5FF] hover:text-[#A8B5FF] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="hidden sm:inline">Далее</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </motion.div>
              )}
            </>
          )}

          {/* No Results */}
          {!loading && !error && articles.length === 0 && searchQuery && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-lg text-[#718096] mb-2">Ничего не найдено</p>
              <p className="text-sm text-[#718096]">
                Попробуйте изменить поисковый запрос
              </p>
            </motion.div>
          )}
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-[#A8B5FF]/10 via-[#FFD4B5]/10 to-[#C8F5E8]/10 rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-center border border-[#A8B5FF]/20"
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#FFD4B5] to-[#FFC97F] flex items-center justify-center mx-auto mb-6 shadow-[0_8px_24px_-4px_rgba(255,212,181,0.4)]">
              <Mail className="w-8 h-8 text-white" />
            </div>
            
            <h2 className="text-2xl sm:text-3xl font-bold text-[#2D3748] mb-4">
              Подпишитесь на рассылку
            </h2>
            
            <p className="text-base sm:text-lg text-[#718096] mb-8 max-w-2xl mx-auto leading-relaxed">
              Получайте новые статьи, упражнения и полезные материалы прямо на почту
            </p>

            <div className="max-w-md mx-auto">
              <div className="relative">
                <input
                  type="email"
                  placeholder="Ваш email"
                  className="w-full px-5 py-3.5 pr-36 rounded-xl border-2 border-gray-200 focus:border-[#FFD4B5] focus:outline-none text-[#2D3748] placeholder:text-[#718096] transition-colors"
                />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2.5 rounded-lg bg-gradient-to-r from-[#FFD4B5] to-[#FFC97F] text-white text-sm font-medium hover:scale-105 active:scale-95 transition-transform">
                  Подписаться
                </button>
              </div>
              <p className="text-xs text-[#718096] mt-3">
                Никакого спама, только полезные материалы
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
