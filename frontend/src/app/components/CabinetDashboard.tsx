import { useEffect } from 'react';
import { motion } from 'motion/react';
import { Calendar, BookOpen, FileText, ArrowRight, Clock, TrendingUp, Heart, Sparkles, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { trackEvent } from '@/api/endpoints/tracking';

interface CabinetDashboardProps {
  onNavigate?: (page: string) => void;
}

export default function CabinetDashboard({ onNavigate }: CabinetDashboardProps) {
  const { user } = useAuth();
  const userName = user?.display_name ?? user?.email ?? 'Пользователь';

  useEffect(() => {
    trackEvent('page_view', { page: 'cabinet', user_id: user?.id ?? undefined });
  }, [user?.id]);

  const stats = [
    {
      id: 'appointments',
      icon: Calendar,
      label: 'Встречи',
      value: '2',
      description: 'Предстоящие',
      gradient: 'from-[#A8B5FF] to-[#C8F5E8]',
      bgGradient: 'from-[#A8B5FF]/5 to-[#C8F5E8]/5',
      action: () => onNavigate?.('appointments')
    },
    {
      id: 'diary',
      icon: BookOpen,
      label: 'Дневники',
      value: '12',
      description: 'Записей',
      gradient: 'from-[#7FD99A] to-[#C8F5E8]',
      bgGradient: 'from-[#7FD99A]/5 to-[#C8F5E8]/5',
      action: () => onNavigate?.('diary')
    },
    {
      id: 'materials',
      icon: FileText,
      label: 'Материалы',
      value: '8',
      description: 'Доступно',
      gradient: 'from-[#FFD4B5] to-[#FFC97F]',
      bgGradient: 'from-[#FFD4B5]/5 to-[#FFC97F]/5',
      action: () => onNavigate?.('materials')
    }
  ];

  const quickActions = [
    {
      title: 'Записаться на консультацию',
      description: 'Выбрать удобное время',
      icon: Calendar,
      gradient: 'from-[#A8B5FF] to-[#C8F5E8]'
    },
    {
      title: 'Пройти диагностику',
      description: 'Оценить своё состояние',
      icon: TrendingUp,
      gradient: 'from-[#7FD99A] to-[#C8F5E8]'
    },
    {
      title: 'Навигатор состояния',
      description: 'Подобрать практики',
      icon: Heart,
      gradient: 'from-[#FFB5C5] to-[#FFD4B5]'
    }
  ];

  const recentActivity = [
    {
      type: 'appointment',
      title: 'Консультация с психологом',
      description: 'Встреча прошла успешно',
      date: '25 янв, 15:00',
      icon: Calendar,
      color: 'text-[#A8B5FF]'
    },
    {
      type: 'diary',
      title: 'Новая запись в дневнике',
      description: 'ABC дневник',
      date: '24 янв, 21:30',
      icon: BookOpen,
      color: 'text-[#7FD99A]'
    },
    {
      type: 'material',
      title: 'Добавлен новый материал',
      description: 'Техники заземления',
      date: '23 янв, 14:20',
      icon: FileText,
      color: 'text-[#FFD4B5]'
    }
  ];

  return (
    <>
      {/* Header */}
      <section className="relative px-4 sm:px-6 lg:px-8 pt-32 sm:pt-36 lg:pt-40 pb-8 sm:pb-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#A8B5FF]/10 to-white -z-10" />
        
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#A8B5FF]/10 to-[#C8F5E8]/10 text-sm font-medium text-[#2D3748] mb-4">
                  <Sparkles className="w-4 h-4 text-[#A8B5FF]" />
                  Личный кабинет
                </div>
                <h1 className="text-[32px] sm:text-4xl lg:text-5xl font-bold text-[#2D3748] mb-2 leading-tight">
                  Добро пожаловать, {userName}
                </h1>
                <p className="text-base sm:text-lg text-[#718096]">
                  Сегодня {new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>

              <button className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-[#718096] hover:border-[#A8B5FF]/30 hover:bg-gray-50 transition-all">
                <LogOut className="w-4 h-4" />
                Выйти
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Cards */}
      <section className="px-4 sm:px-6 lg:px-8 pb-8 sm:pb-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            {stats.map((stat, index) => (
              <motion.button
                key={stat.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                onClick={stat.action}
                className="group relative bg-white border border-gray-200 rounded-2xl p-6 hover:border-transparent hover:shadow-[0_8px_24px_-4px_rgba(168,181,255,0.2)] transition-all text-left"
              >
                {/* Background Gradient on Hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl pointer-events-none`} />
                
                <div className="relative">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-sm`}>
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                    <ArrowRight className="w-5 h-5 text-[#718096] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>

                  <div className="mb-1">
                    <p className={`text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${stat.gradient}`}>
                      {stat.value}
                    </p>
                  </div>

                  <p className="text-base font-semibold text-[#2D3748] mb-1">
                    {stat.label}
                  </p>
                  <p className="text-sm text-[#718096]">
                    {stat.description}
                  </p>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="px-4 sm:px-6 lg:px-8 pb-8 sm:pb-12">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-xl sm:text-2xl font-bold text-[#2D3748] mb-6">
              Быстрые действия
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  className="group bg-white border border-gray-200 rounded-xl p-5 sm:p-6 hover:border-transparent hover:shadow-lg transition-all text-left"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <action.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-[#2D3748] mb-1">
                    {action.title}
                  </h3>
                  <p className="text-sm text-[#718096]">
                    {action.description}
                  </p>
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Recent Activity & Next Step */}
      <section className="px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16 lg:pb-20">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-2"
            >
              <h2 className="text-xl sm:text-2xl font-bold text-[#2D3748] mb-6">
                Недавняя активность
              </h2>

              <div className="space-y-3">
                {recentActivity.map((item, index) => (
                  <div
                    key={index}
                    className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 hover:border-gray-300 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
                        <item.icon className={`w-5 h-5 ${item.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-semibold text-[#2D3748] mb-1">
                          {item.title}
                        </h3>
                        <p className="text-sm text-[#718096] mb-2">
                          {item.description}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-[#718096]">
                          <Clock className="w-3 h-3" />
                          {item.date}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 text-center">
                <button className="text-sm font-medium text-[#A8B5FF] hover:underline">
                  Показать всё →
                </button>
              </div>
            </motion.div>

            {/* Next Step */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <h2 className="text-xl sm:text-2xl font-bold text-[#2D3748] mb-6">
                Следующий шаг
              </h2>

              <div className="bg-gradient-to-br from-[#A8B5FF]/10 to-[#C8F5E8]/10 border border-[#A8B5FF]/20 rounded-2xl p-6">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#A8B5FF] to-[#C8F5E8] flex items-center justify-center mb-4 shadow-sm">
                  <Calendar className="w-7 h-7 text-white" />
                </div>

                <h3 className="text-lg font-semibold text-[#2D3748] mb-2">
                  Следующая встреча
                </h3>

                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-2 text-sm text-[#718096]">
                    <Calendar className="w-4 h-4" />
                    <span>28 февраля, 15:00</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-[#718096]">
                    <Clock className="w-4 h-4" />
                    <span>Через 3 дня</span>
                  </div>
                </div>

                <p className="text-sm text-[#718096] mb-6 leading-relaxed">
                  Первичная консультация • Онлайн
                </p>

                <button className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-[#A8B5FF] to-[#C8F5E8] text-white font-medium shadow-sm hover:shadow-md active:scale-[0.98] transition-all">
                  Подробнее
                </button>
              </div>

              {/* Recommendation */}
              <div className="mt-4 bg-white border border-gray-200 rounded-2xl p-6">
                <div className="w-12 h-12 rounded-xl bg-[#7FD99A]/10 flex items-center justify-center mb-4">
                  <Heart className="w-6 h-6 text-[#7FD99A]" />
                </div>

                <h3 className="text-base font-semibold text-[#2D3748] mb-2">
                  Рекомендуем попробовать
                </h3>

                <p className="text-sm text-[#718096] mb-4 leading-relaxed">
                  Техника дыхания 4-7-8 может помочь снизить тревогу перед встречей
                </p>

                <button className="text-sm font-medium text-[#7FD99A] hover:underline">
                  Попробовать →
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}
