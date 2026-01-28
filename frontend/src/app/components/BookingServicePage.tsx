import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Calendar, Clock, Video, MapPin, CheckCircle2, ArrowRight, HelpCircle, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getServices } from '@/api/endpoints/booking';
import { trackEvent } from '@/api/endpoints/tracking';
import type { Service } from '@/api/types/booking';
import { ApiError } from '@/api/client';
import { showApiError } from '@/lib/errorToast';

const GRADIENT_MAP: Record<string, { gradient: string; bgGradient: string }> = {
  online: { gradient: 'from-[#A8B5FF] to-[#C8F5E8]', bgGradient: 'from-[#A8B5FF]/5 to-[#C8F5E8]/5' },
  offline: { gradient: 'from-[#7FD99A] to-[#C8F5E8]', bgGradient: 'from-[#7FD99A]/5 to-[#C8F5E8]/5' },
  hybrid: { gradient: 'from-[#FFD4B5] to-[#FFC97F]', bgGradient: 'from-[#FFD4B5]/5 to-[#FFC97F]/5' },
};

function formatPrice(amount: number): string {
  return new Intl.NumberFormat('ru-RU', { style: 'decimal', maximumFractionDigits: 0 }).format(amount) + ' ₽';
}

function formatFormat(format: string): string {
  if (format === 'online') return 'Онлайн';
  if (format === 'offline') return 'Офлайн';
  return 'Онлайн / Офлайн';
}

interface BookingServicePageProps {
  onSelectService?: (service: Service) => void;
}

export default function BookingServicePage({ onSelectService }: BookingServicePageProps) {
  const { user } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    trackEvent('booking_started', { page: 'booking', user_id: user?.id ?? undefined });
  }, [user?.id]);

  useEffect(() => {
    let cancelled = false;
    getServices()
      .then((res) => {
        if (!cancelled) {
          setServices(res.data);
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          showApiError(err);
          setError(err instanceof ApiError ? err.message : 'Не удалось загрузить услуги');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const faq = [
    {
      question: 'Как проходит онлайн-консультация?',
      answer: 'Встречи проходят в видеоформате через безопасную платформу. Вам понадобится устройство с камерой и микрофоном, стабильный интернет и тихое место, где вас никто не побеспокоит.'
    },
    {
      question: 'Можно ли перенести или отменить встречу?',
      answer: 'Да, вы можете перенести или отменить встречу не позднее чем за 24 часа. При отмене менее чем за 24 часа депозит не возвращается.'
    },
    {
      question: 'Нужно ли готовиться к первой встрече?',
      answer: 'Специальная подготовка не требуется. Просто подумайте, что вас беспокоит и чего вы хотите достичь. После записи мы вышлем вам короткую анкету.'
    }
  ];

  if (loading) {
    return (
      <section className="relative px-4 sm:px-6 lg:px-8 pt-32 sm:pt-36 lg:pt-40 pb-12 overflow-hidden min-h-[50vh] flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-b from-[#A8B5FF]/10 to-white -z-10" />
        <div className="flex flex-col items-center gap-4 text-[#718096]">
          <Loader2 className="w-10 h-10 animate-spin text-[#A8B5FF]" />
          <p>Загрузка услуг...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="relative px-4 sm:px-6 lg:px-8 pt-32 sm:pt-36 lg:pt-40 pb-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#A8B5FF]/10 to-white -z-10" />
        <div className="max-w-md mx-auto text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-red-50 text-red-500 mb-4">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-semibold text-[#2D3748] mb-2">Ошибка загрузки</h2>
          <p className="text-[#718096] mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 rounded-xl bg-[#A8B5FF]/10 text-[#A8B5FF] font-medium hover:bg-[#A8B5FF]/20 transition-colors"
          >
            Повторить
          </button>
        </div>
      </section>
    );
  }

  return (
    <>
      {/* Hero Section */}
      <section className="relative px-4 sm:px-6 lg:px-8 pt-32 sm:pt-36 lg:pt-40 pb-12 sm:pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#A8B5FF]/10 to-white -z-10" />
        
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#A8B5FF]/10 to-[#C8F5E8]/10 text-sm font-medium text-[#2D3748] mb-6">
              <Calendar className="w-4 h-4 text-[#A8B5FF]" />
              Шаг 1 из 4
            </div>
            
            <h1 className="text-[32px] sm:text-4xl lg:text-5xl font-bold text-[#2D3748] mb-4 leading-tight">
              Записаться на консультацию
            </h1>
            
            <p className="text-base sm:text-lg text-[#718096] max-w-2xl mx-auto leading-relaxed">
              Выберите формат консультации, который подходит вам. Все встречи проходят 
              конфиденциально в комфортной атмосфере.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {services.map((service, index) => {
              const style = GRADIENT_MAP[service.format] ?? GRADIENT_MAP.hybrid;
              const popular = index === 0;
              return (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="relative"
                >
                  {popular && (
                    <div className="absolute -top-3 left-6 z-10 px-4 py-1.5 rounded-full bg-gradient-to-r from-[#FFD4B5] to-[#FFC97F] text-white text-xs font-medium shadow-sm">
                      Популярное
                    </div>
                  )}
                  
                  <div className={`relative bg-white border-2 ${popular ? 'border-[#FFD4B5]/30' : 'border-gray-100'} rounded-2xl p-6 sm:p-8 hover:border-transparent hover:shadow-[0_8px_24px_-4px_rgba(168,181,255,0.2)] transition-all h-full flex flex-col`}>
                    <div className={`absolute inset-0 bg-gradient-to-br ${style.bgGradient} opacity-0 hover:opacity-100 transition-opacity rounded-2xl pointer-events-none`} />
                    
                    <div className="relative flex-1">
                      <div className="mb-6">
                        <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${style.gradient} flex items-center justify-center mb-4 shadow-sm`}>
                          <Calendar className="w-7 h-7 text-white" />
                        </div>
                        <h3 className="text-xl sm:text-2xl font-bold text-[#2D3748] mb-2">
                          {service.title}
                        </h3>
                        <p className="text-sm text-[#718096]">
                          {service.description ? service.description.slice(0, 80) + (service.description.length > 80 ? '…' : '') : 'Консультация'}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-3 mb-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 text-sm text-[#2D3748]">
                          <Clock className="w-4 h-4 text-[#718096]" />
                          {service.duration_minutes} мин
                        </div>
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 text-sm text-[#2D3748]">
                          {(service.format === 'online' || service.format === 'hybrid') && <Video className="w-4 h-4 text-[#718096]" />}
                          {(service.format === 'offline' || service.format === 'hybrid') && <MapPin className="w-4 h-4 text-[#718096]" />}
                          {formatFormat(service.format)}
                        </div>
                      </div>

                      {service.description && (
                        <p className="text-base text-[#718096] mb-6 leading-relaxed">
                          {service.description}
                        </p>
                      )}

                      <div className="mb-6 pt-6 border-t border-gray-100">
                        <div className="flex items-baseline gap-2 mb-1">
                          <span className={`text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${style.gradient}`}>
                            {formatPrice(Number(service.price_amount))}
                          </span>
                        </div>
                        <p className="text-xs text-[#718096]">Разовая оплата</p>
                      </div>
                    </div>

                    <button
                      onClick={() => onSelectService?.(service)}
                      className={`relative w-full px-6 py-4 rounded-xl font-medium shadow-sm hover:shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-2 bg-gradient-to-r ${style.gradient} text-white`}
                    >
                      <span>Выбрать</span>
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-[#2D3748] mb-8 text-center">
              Как проходит встреча
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                {
                  step: '1',
                  title: 'Знакомство',
                  description: 'Первые 5-10 минут — знакомство и создание комфортной атмосферы',
                  color: 'from-[#A8B5FF] to-[#C8F5E8]'
                },
                {
                  step: '2',
                  title: 'Работа с запросом',
                  description: 'Основная часть встречи — обсуждение вашего запроса и поиск решений',
                  color: 'from-[#7FD99A] to-[#C8F5E8]'
                },
                {
                  step: '3',
                  title: 'План действий',
                  description: 'В конце — резюме встречи, ответы на вопросы и следующие шаги',
                  color: 'from-[#FFD4B5] to-[#FFC97F]'
                }
              ].map((step) => (
                <div key={step.step} className="bg-white border border-gray-200 rounded-xl p-6">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-4`}>
                    <span className="text-white font-bold text-lg">{step.step}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-[#2D3748] mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-[#718096] leading-relaxed">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16 lg:pb-20">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-[#A8B5FF]/10 flex items-center justify-center">
                <HelpCircle className="w-5 h-5 text-[#A8B5FF]" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#2D3748]">
                Частые вопросы
              </h2>
            </div>

            <div className="space-y-4">
              {faq.map((item, index) => (
                <div key={index} className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="text-base sm:text-lg font-semibold text-[#2D3748] mb-2">
                    {item.question}
                  </h3>
                  <p className="text-sm sm:text-base text-[#718096] leading-relaxed">
                    {item.answer}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-[#718096] mb-3">
                Остались вопросы? Мы на связи
              </p>
              <button className="text-sm font-medium text-[#A8B5FF] hover:underline">
                Написать нам →
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}