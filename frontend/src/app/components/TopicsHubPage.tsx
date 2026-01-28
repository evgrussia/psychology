import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Brain, Heart, Zap, Users, Shield, Sparkles, Cloud, Target, TrendingUp, Smile, AlertCircle, ArrowRight, ClipboardList, Compass, RefreshCw, type LucideIcon } from 'lucide-react';
import { getTopics } from '@/api/endpoints/content';
import type { Topic } from '@/api/types/content';
import { ApiError } from '@/api/client';

interface TopicsHubPageProps {
  onNavigateToTopic?: (slug: string) => void;
  onNavigateToQuiz?: () => void;
  onNavigateToNavigator?: () => void;
}

// Локальный маппинг иконок и градиентов по slug
const topicMetadata: Record<string, { icon: LucideIcon; gradient: string; bgGradient: string }> = {
  'anxiety': { icon: AlertCircle, gradient: 'from-[#A8B5FF] to-[#C8F5E8]', bgGradient: 'from-[#A8B5FF]/5 to-[#C8F5E8]/5' },
  'depression': { icon: Cloud, gradient: 'from-[#C8F5E8] to-[#7FD99A]', bgGradient: 'from-[#C8F5E8]/5 to-[#7FD99A]/5' },
  'stress': { icon: Zap, gradient: 'from-[#FFD4B5] to-[#FFC97F]', bgGradient: 'from-[#FFD4B5]/5 to-[#FFC97F]/5' },
  'burnout': { icon: Zap, gradient: 'from-[#FFC97F] to-[#FFD4B5]', bgGradient: 'from-[#FFC97F]/5 to-[#FFD4B5]/5' },
  'relationships': { icon: Heart, gradient: 'from-[#FFB5C5] to-[#FFD4B5]', bgGradient: 'from-[#FFB5C5]/5 to-[#FFD4B5]/5' },
  'boundaries': { icon: Shield, gradient: 'from-[#7FD99A] to-[#C8F5E8]', bgGradient: 'from-[#7FD99A]/5 to-[#C8F5E8]/5' },
  'self-esteem': { icon: Sparkles, gradient: 'from-[#FFD4B5] to-[#C8F5E8]', bgGradient: 'from-[#FFD4B5]/5 to-[#C8F5E8]/5' },
  'trauma': { icon: Heart, gradient: 'from-[#A8B5FF] to-[#FFD4B5]', bgGradient: 'from-[#A8B5FF]/5 to-[#FFD4B5]/5' },
  'grief': { icon: Cloud, gradient: 'from-[#C8F5E8] to-[#A8B5FF]', bgGradient: 'from-[#C8F5E8]/5 to-[#A8B5FF]/5' },
  'life-transitions': { icon: TrendingUp, gradient: 'from-[#7FD99A] to-[#FFD4B5]', bgGradient: 'from-[#7FD99A]/5 to-[#FFD4B5]/5' },
  'purpose': { icon: Target, gradient: 'from-[#A8B5FF] to-[#7FD99A]', bgGradient: 'from-[#A8B5FF]/5 to-[#7FD99A]/5' },
  'personal-growth': { icon: Smile, gradient: 'from-[#FFD4B5] to-[#7FD99A]', bgGradient: 'from-[#FFD4B5]/5 to-[#7FD99A]/5' },
};

// Дефолтные значения для неизвестных тем
const defaultMetadata = { icon: Heart, gradient: 'from-[#A8B5FF] to-[#C8F5E8]', bgGradient: 'from-[#A8B5FF]/5 to-[#C8F5E8]/5' };

function getTopicMetadata(slug: string) {
  return topicMetadata[slug] || defaultMetadata;
}

// Loading Skeleton
function TopicSkeleton() {
  return (
    <div className="bg-white border-2 border-gray-100 rounded-2xl p-6 animate-pulse">
      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gray-200 mb-4" />
      <div className="h-6 bg-gray-200 rounded w-2/3 mb-2" />
      <div className="h-4 bg-gray-100 rounded w-full mb-2" />
      <div className="h-4 bg-gray-100 rounded w-3/4 mb-4" />
      <div className="h-4 bg-gray-100 rounded w-1/3" />
    </div>
  );
}

export default function TopicsHubPage({ onNavigateToTopic, onNavigateToQuiz, onNavigateToNavigator }: TopicsHubPageProps) {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTopics = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getTopics();
      setTopics(response.data);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Не удалось загрузить темы. Попробуйте позже.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopics();
  }, []);

  return (
    <>
      {/* Hero Section */}
      <section className="relative px-4 sm:px-6 lg:px-8 pt-32 sm:pt-36 lg:pt-40 pb-12 sm:pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#A8B5FF]/10 via-[#FFD4B5]/5 to-white -z-10" />
        
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#A8B5FF]/10 to-[#FFD4B5]/10 text-sm font-medium text-[#2D3748] mb-6">
              <Brain className="w-4 h-4 text-[#A8B5FF]" />
              Психологическая помощь
            </div>
            
            <h1 className="text-[32px] sm:text-4xl lg:text-5xl font-bold text-[#2D3748] mb-4 leading-tight">
              С чем я помогаю
            </h1>
            
            <p className="text-base sm:text-lg text-[#718096] max-w-2xl mx-auto leading-relaxed">
              Вместе мы найдём подходящее решение для вашей ситуации. Выберите тему, 
              которая вас волнует, чтобы узнать больше о моём подходе.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Quiz & Navigator Entry Points */}
      {(onNavigateToQuiz || onNavigateToNavigator) && (
        <section className="px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {onNavigateToQuiz && (
                <motion.button
                  type="button"
                  onClick={onNavigateToQuiz}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="group w-full bg-white border-2 border-gray-100 rounded-2xl p-6 text-left hover:border-[#A8B5FF]/30 hover:shadow-[0_8px_24px_-4px_rgba(168,181,255,0.2)] transition-all duration-300"
                >
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-[#A8B5FF] to-[#C8F5E8] flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">
                    <ClipboardList className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-[#2D3748] mb-2">
                    Опросник PHQ-9
                  </h3>
                  <p className="text-sm sm:text-base text-[#718096] leading-relaxed mb-4">
                    Оценка симптомов депрессии за 3–5 минут. Помогает лучше понять своё состояние.
                  </p>
                  <div className="flex items-center gap-2 text-sm font-medium text-[#A8B5FF] group-hover:gap-3 transition-all">
                    <span>Пройти квиз</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </motion.button>
              )}
              {onNavigateToNavigator && (
                <motion.button
                  type="button"
                  onClick={onNavigateToNavigator}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.05 }}
                  className="group w-full bg-white border-2 border-gray-100 rounded-2xl p-6 text-left hover:border-[#A8B5FF]/30 hover:shadow-[0_8px_24px_-4px_rgba(168,181,255,0.2)] transition-all duration-300"
                >
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-[#C8F5E8] to-[#7FD99A] flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">
                    <Compass className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-[#2D3748] mb-2">
                    Навигатор практик
                  </h3>
                  <p className="text-sm sm:text-base text-[#718096] leading-relaxed mb-4">
                    Подберите упражнения и практики по эмоции, времени и формату.
                  </p>
                  <div className="flex items-center gap-2 text-sm font-medium text-[#A8B5FF] group-hover:gap-3 transition-all">
                    <span>Подобрать практики</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </motion.button>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Topics Grid */}
      <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
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
                onClick={fetchTopics}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Попробовать снова
              </button>
            </motion.div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {[...Array(6)].map((_, index) => (
                <TopicSkeleton key={index} />
              ))}
            </div>
          )}

          {/* Content State */}
          {!loading && !error && topics.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {topics.map((topic, index) => {
                const metadata = getTopicMetadata(topic.slug);
                const IconComponent = metadata.icon;
                return (
                  <motion.div
                    key={topic.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                  >
                    <button
                      onClick={() => onNavigateToTopic?.(topic.slug)}
                      className="group w-full h-full bg-white border-2 border-gray-100 rounded-2xl p-6 text-left hover:border-transparent hover:shadow-[0_8px_24px_-4px_rgba(168,181,255,0.2)] transition-all duration-300"
                    >
                      {/* Gradient Background on Hover */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${metadata.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl`} />
                      
                      <div className="relative">
                        {/* Icon */}
                        <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br ${metadata.gradient} flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform`}>
                          <IconComponent className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                        </div>

                        {/* Title */}
                        <h3 className="text-lg sm:text-xl font-semibold text-[#2D3748] mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-[#A8B5FF] group-hover:to-[#FFD4B5] transition-all">
                          {topic.title}
                        </h3>

                        {/* Description */}
                        <p className="text-sm sm:text-base text-[#718096] leading-relaxed mb-4">
                          {topic.description}
                        </p>

                        {/* CTA */}
                        <div className="flex items-center gap-2 text-sm font-medium text-[#A8B5FF] group-hover:gap-3 transition-all">
                          <span>Узнать больше</span>
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      </div>
                    </button>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && topics.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <Brain className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-lg text-[#718096]">Темы пока не добавлены</p>
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
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#A8B5FF] to-[#FFD4B5] flex items-center justify-center mx-auto mb-6 shadow-[0_8px_24px_-4px_rgba(168,181,255,0.4)]">
              <Heart className="w-8 h-8 text-white" fill="white" />
            </div>
            
            <h2 className="text-2xl sm:text-3xl font-bold text-[#2D3748] mb-4">
              Не нашли подходящую тему?
            </h2>
            
            <p className="text-base sm:text-lg text-[#718096] mb-8 max-w-2xl mx-auto leading-relaxed">
              Каждая ситуация уникальна. Запишитесь на консультацию, и мы вместе разберёмся, 
              как я могу вам помочь.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              <button className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-[#A8B5FF] to-[#C8F5E8] text-white font-medium shadow-[0_8px_24px_-4px_rgba(168,181,255,0.4)] hover:shadow-[0_12px_32px_-4px_rgba(168,181,255,0.5)] active:scale-[0.98] transition-all">
                Записаться на консультацию
              </button>
              <button className="w-full sm:w-auto px-8 py-4 rounded-xl border-2 border-gray-200 text-[#2D3748] font-medium hover:border-[#A8B5FF] hover:bg-[#A8B5FF]/5 transition-all">
                Задать вопрос
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
