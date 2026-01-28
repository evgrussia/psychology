import { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { Headphones, FileText, Play, CheckSquare, Sparkles, ArrowRight, Mail, Filter, RefreshCw, type LucideIcon } from 'lucide-react';
import { getResources } from '@/api/endpoints/content';
import type { ResourceListItem, Pagination } from '@/api/types/content';
import { ApiError } from '@/api/client';

interface ResourcesListPageProps {
  onNavigateToResource?: (slug: string) => void;
}

// Маппинг типов на иконки и метаданные
const resourceTypeMetadata: Record<string, { icon: LucideIcon; label: string; gradient: string; bgGradient: string }> = {
  'meditation': { icon: Headphones, label: 'Медитация', gradient: 'from-[#A8B5FF] to-[#C8F5E8]', bgGradient: 'from-[#A8B5FF]/5 to-[#C8F5E8]/5' },
  'exercise': { icon: Sparkles, label: 'Упражнение', gradient: 'from-[#7FD99A] to-[#C8F5E8]', bgGradient: 'from-[#7FD99A]/5 to-[#C8F5E8]/5' },
  'video': { icon: Play, label: 'Видео', gradient: 'from-[#FFD4B5] to-[#FFC97F]', bgGradient: 'from-[#FFD4B5]/5 to-[#FFC97F]/5' },
  'checklist': { icon: CheckSquare, label: 'Чек-лист', gradient: 'from-[#C8F5E8] to-[#A8B5FF]', bgGradient: 'from-[#C8F5E8]/5 to-[#A8B5FF]/5' },
};

const defaultMetadata = { icon: FileText, label: 'Ресурс', gradient: 'from-[#A8B5FF] to-[#C8F5E8]', bgGradient: 'from-[#A8B5FF]/5 to-[#C8F5E8]/5' };

function getResourceMetadata(type: string) {
  return resourceTypeMetadata[type] || defaultMetadata;
}

const filters = [
  { id: 'all', label: 'Всё' },
  { id: 'meditation', label: 'Медитации' },
  { id: 'exercise', label: 'Упражнения' },
  { id: 'video', label: 'Видео' },
  { id: 'checklist', label: 'Чек-листы' },
];

// Loading Skeleton
function ResourceSkeleton() {
  return (
    <div className="bg-white border-2 border-gray-100 rounded-2xl p-6 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="w-12 h-12 rounded-xl bg-gray-200" />
        <div className="w-20 h-6 rounded-lg bg-gray-100" />
      </div>
      <div className="h-6 bg-gray-200 rounded w-3/4 mb-2" />
      <div className="h-4 bg-gray-100 rounded w-full mb-2" />
      <div className="h-4 bg-gray-100 rounded w-2/3 mb-4" />
      <div className="flex justify-between pt-4 border-t border-gray-100">
        <div className="h-4 bg-gray-100 rounded w-16" />
        <div className="h-4 bg-gray-100 rounded w-20" />
      </div>
    </div>
  );
}

export default function ResourcesListPage({ onNavigateToResource }: ResourcesListPageProps) {
  const [activeFilter, setActiveFilter] = useState('all');
  const [resources, setResources] = useState<ResourceListItem[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchResources = useCallback(async (type?: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await getResources({
        type: type === 'all' ? undefined : type,
        per_page: 12,
      });
      setResources(response.data);
      setPagination(response.pagination);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Не удалось загрузить ресурсы. Попробуйте позже.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchResources(activeFilter);
  }, [fetchResources, activeFilter]);

  const handleFilterChange = (filterId: string) => {
    setActiveFilter(filterId);
  };

  // Empty State (когда нет ресурсов)
  if (!loading && !error && resources.length === 0 && activeFilter === 'all') {
    return (
      <>
        {/* Hero Section */}
        <section className="relative px-4 sm:px-6 lg:px-8 pt-32 sm:pt-36 lg:pt-40 pb-12 sm:pb-16 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-[#C8F5E8]/10 to-white -z-10" />
          
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#C8F5E8]/20 to-[#7FD99A]/20 flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-10 h-10 text-[#7FD99A]" />
              </div>
              
              <h1 className="text-[32px] sm:text-4xl lg:text-5xl font-bold text-[#2D3748] mb-4 leading-tight">
                Ресурсы
              </h1>
              
              <p className="text-base sm:text-lg text-[#718096] max-w-2xl mx-auto leading-relaxed">
                Скоро здесь появятся медитации, упражнения, видео и другие полезные материалы
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
              className="bg-gradient-to-br from-[#C8F5E8]/5 to-[#7FD99A]/5 rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-center border border-[#C8F5E8]/20"
            >
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#7FD99A] to-[#C8F5E8] flex items-center justify-center mx-auto mb-6 shadow-[0_8px_24px_-4px_rgba(127,217,154,0.4)]">
                <Sparkles className="w-12 h-12 text-white" />
              </div>
              
              <h2 className="text-2xl sm:text-3xl font-bold text-[#2D3748] mb-4">
                Мы создаём для вас библиотеку ресурсов
              </h2>
              
              <p className="text-base sm:text-lg text-[#718096] mb-8 leading-relaxed">
                Здесь будут медитации, упражнения, чек-листы и видео для поддержки вашего 
                психологического благополучия. Подпишитесь, чтобы не пропустить запуск!
              </p>

              {/* Email Subscribe */}
              <div className="max-w-md mx-auto mb-6">
                <div className="relative">
                  <input
                    type="email"
                    placeholder="Ваш email"
                    className="w-full px-5 py-3.5 pr-32 rounded-xl border-2 border-gray-200 focus:border-[#7FD99A] focus:outline-none text-[#2D3748] placeholder:text-[#718096] transition-colors"
                  />
                  <button className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2 rounded-lg bg-gradient-to-r from-[#7FD99A] to-[#C8F5E8] text-white text-sm font-medium hover:scale-105 active:scale-95 transition-transform">
                    Подписаться
                  </button>
                </div>
              </div>

              <p className="text-xs text-[#718096]">
                Мы сообщим вам, когда появятся новые ресурсы
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
                Что будет в библиотеке:
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { icon: Headphones, text: 'Медитации и практики осознанности', color: 'text-[#A8B5FF]' },
                  { icon: Sparkles, text: 'Упражнения для самопомощи', color: 'text-[#7FD99A]' },
                  { icon: Play, text: 'Обучающие видео', color: 'text-[#FFD4B5]' },
                  { icon: CheckSquare, text: 'Чек-листы и рабочие листы', color: 'text-[#C8F5E8]' }
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl p-4">
                    <item.icon className={`w-6 h-6 ${item.color}`} />
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
        <div className="absolute inset-0 bg-gradient-to-b from-[#C8F5E8]/10 to-white -z-10" />
        
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#C8F5E8]/10 to-[#7FD99A]/10 text-sm font-medium text-[#2D3748] mb-6">
              <Sparkles className="w-4 h-4 text-[#7FD99A]" />
              Инструменты для самопомощи
            </div>
            
            <h1 className="text-[32px] sm:text-4xl lg:text-5xl font-bold text-[#2D3748] mb-4 leading-tight">
              Ресурсы
            </h1>
            
            <p className="text-base sm:text-lg text-[#718096] max-w-2xl mx-auto leading-relaxed">
              Медитации, упражнения, видео и чек-листы для поддержки вашего благополучия
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filters */}
      <section className="sticky top-16 sm:top-20 z-40 bg-white/95 backdrop-blur-xl border-b border-gray-100 px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
            <Filter className="w-5 h-5 text-[#718096] flex-shrink-0" />
            {filters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => handleFilterChange(filter.id)}
                className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  activeFilter === filter.id
                    ? 'bg-[#7FD99A]/10 text-[#7FD99A]'
                    : 'text-[#718096] hover:bg-gray-50 active:bg-gray-100'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Resources Grid */}
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
                onClick={() => fetchResources(activeFilter)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Попробовать снова
              </button>
            </motion.div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, index) => (
                <ResourceSkeleton key={index} />
              ))}
            </div>
          )}

          {/* Content */}
          {!loading && !error && resources.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {resources.map((resource, index) => {
                const metadata = getResourceMetadata(resource.type);
                const IconComponent = metadata.icon;
                return (
                  <motion.div
                    key={resource.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                  >
                    <button
                      onClick={() => onNavigateToResource?.(resource.slug)}
                      className="group w-full h-full bg-white border-2 border-gray-100 rounded-2xl p-6 text-left hover:border-transparent hover:shadow-[0_8px_24px_-4px_rgba(127,217,154,0.2)] transition-all duration-300"
                    >
                      {/* Gradient Background on Hover */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${metadata.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl`} />
                      
                      <div className="relative">
                        {/* Icon & Type */}
                        <div className="flex items-center justify-between mb-4">
                          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${metadata.gradient} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}>
                            <IconComponent className="w-6 h-6 text-white" />
                          </div>
                          <span className={`px-3 py-1 rounded-lg bg-gradient-to-r ${metadata.gradient} bg-opacity-10 text-xs font-medium`}>
                            {metadata.label}
                          </span>
                        </div>

                        {/* Title */}
                        <h3 className="text-lg sm:text-xl font-semibold text-[#2D3748] mb-2 leading-snug group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-[#7FD99A] group-hover:to-[#C8F5E8] transition-all">
                          {resource.title}
                        </h3>

                        {/* Description */}
                        <p className="text-sm text-[#718096] leading-relaxed mb-4">
                          {resource.description}
                        </p>

                        {/* Duration & CTA */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                          <span className="text-sm text-[#718096]">{resource.duration || '—'}</span>
                          <div className="flex items-center gap-2 text-sm font-medium text-[#7FD99A] group-hover:gap-3 transition-all">
                            <span>Открыть</span>
                            <ArrowRight className="w-4 h-4" />
                          </div>
                        </div>
                      </div>
                    </button>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* No Results for filter */}
          {!loading && !error && resources.length === 0 && activeFilter !== 'all' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <Filter className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-lg text-[#718096] mb-2">Ресурсов в этой категории пока нет</p>
              <button
                onClick={() => setActiveFilter('all')}
                className="text-sm font-medium text-[#7FD99A] hover:underline"
              >
                Показать все ресурсы
              </button>
            </motion.div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-[#A8B5FF]/10 via-[#FFD4B5]/10 to-[#C8F5E8]/10 rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-center border border-[#A8B5FF]/20"
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#7FD99A] to-[#C8F5E8] flex items-center justify-center mx-auto mb-6 shadow-[0_8px_24px_-4px_rgba(127,217,154,0.4)]">
              <Mail className="w-8 h-8 text-white" />
            </div>
            
            <h2 className="text-2xl sm:text-3xl font-bold text-[#2D3748] mb-4">
              Получайте новые ресурсы первыми
            </h2>
            
            <p className="text-base sm:text-lg text-[#718096] mb-8 max-w-2xl mx-auto leading-relaxed">
              Подпишитесь на обновления и узнавайте о новых медитациях, упражнениях и материалах
            </p>

            <div className="max-w-md mx-auto">
              <div className="relative">
                <input
                  type="email"
                  placeholder="Ваш email"
                  className="w-full px-5 py-3.5 pr-36 rounded-xl border-2 border-gray-200 focus:border-[#7FD99A] focus:outline-none text-[#2D3748] placeholder:text-[#718096] transition-colors"
                />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2.5 rounded-lg bg-gradient-to-r from-[#7FD99A] to-[#C8F5E8] text-white text-sm font-medium hover:scale-105 active:scale-95 transition-transform">
                  Подписаться
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
