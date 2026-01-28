import { motion } from 'motion/react';
import { CheckCircle2, Info, ArrowRight, Heart, BookOpen, MessageCircle, Download } from 'lucide-react';
import type { QuizResultData } from '@/api/types/interactive';

interface QuizResultPageProps {
  result: QuizResultData | null;
  onBackToHome?: () => void;
}

function levelToSeverity(level: string): { label: string; color: string; bg: string } {
  const l = level.toLowerCase();
  if (l.includes('minimal') || l.includes('none') || l === '0') return { label: 'Минимальные симптомы', color: 'from-[#7FD99A] to-[#C8F5E8]', bg: 'from-[#7FD99A]/10 to-[#C8F5E8]/10' };
  if (l.includes('mild') || l.includes('light') || l === '1') return { label: 'Лёгкая депрессия', color: 'from-[#C8F5E8] to-[#A8B5FF]', bg: 'from-[#C8F5E8]/10 to-[#A8B5FF]/10' };
  if (l.includes('moderate') || l.includes('moderat')) return { label: 'Умеренная депрессия', color: 'from-[#FFD4B5] to-[#FFC97F]', bg: 'from-[#FFD4B5]/10 to-[#FFC97F]/10' };
  if (l.includes('severe') || l.includes('heavy')) return { label: 'Тяжёлая депрессия', color: 'from-[#FF9A9A] to-[#FFC97F]', bg: 'from-[#FF9A9A]/10 to-[#FFC97F]/10' };
  return { label: level, color: 'from-[#FFD4B5] to-[#FFC97F]', bg: 'from-[#FFD4B5]/10 to-[#FFC97F]/10' };
}

export default function QuizResultPage({ result, onBackToHome }: QuizResultPageProps) {
  const severity = result ? levelToSeverity(result.level) : { label: '—', color: 'from-[#FFD4B5] to-[#FFC97F]', bg: 'from-[#FFD4B5]/10 to-[#FFC97F]/10' };
  const recommendations = result?.recommendations ?? [];

  if (!result) {
    return (
      <section className="px-4 sm:px-6 lg:px-8 pt-32 pb-16">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-[#718096] mb-6">Результат недоступен. Пройдите тест заново.</p>
          <button
            onClick={onBackToHome}
            className="px-8 py-4 rounded-xl border-2 border-gray-200 text-[#2D3748] font-medium hover:border-[#A8B5FF] hover:bg-[#A8B5FF]/5 transition-all"
          >
            Вернуться на главную
          </button>
        </div>
      </section>
    );
  }

  return (
    <>
      {/* Hero Section */}
      <section className="relative px-4 sm:px-6 lg:px-8 pt-32 sm:pt-36 lg:pt-40 pb-12 sm:pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#FFD4B5]/10 to-white -z-10" />
        
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#7FD99A] to-[#C8F5E8] flex items-center justify-center mx-auto mb-6 shadow-[0_8px_24px_-4px_rgba(127,217,154,0.4)]">
              <CheckCircle2 className="w-10 h-10 text-white" />
            </div>
            
            <h1 className="text-[32px] sm:text-4xl lg:text-5xl font-bold text-[#2D3748] mb-4 leading-tight">
              Ваш результат
            </h1>
            
            <p className="text-base sm:text-lg text-[#718096]">
              PHQ-9 • Оценка депрессии
            </p>
          </motion.div>
        </div>
      </section>

      {/* Result Card */}
      <section className="px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`bg-gradient-to-br ${severity.bg} border-2 border-[#FFD4B5]/30 rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-center`}
          >
            <div className={`inline-block px-4 py-2 rounded-xl bg-gradient-to-r ${severity.color} text-white font-medium text-sm mb-6`}>
              {severity.label}
            </div>
            {result.profile && (
              <p className="text-sm text-[#718096] mb-4">{result.profile}</p>
            )}
          </motion.div>
        </div>
      </section>

      {/* Important Note */}
      <section className="px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-[#A8B5FF]/10 to-[#C8F5E8]/10 border border-[#A8B5FF]/30 rounded-2xl p-6"
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#A8B5FF]/20 flex items-center justify-center flex-shrink-0">
                <Info className="w-6 h-6 text-[#A8B5FF]" />
              </div>
              <div className="flex-1">
                <h3 className="text-base sm:text-lg font-semibold text-[#2D3748] mb-2">
                  Важно помнить
                </h3>
                <p className="text-sm sm:text-base text-[#718096] leading-relaxed">
                  Это не медицинский диагноз. Результат показывает выраженность симптомов депрессии 
                  за последние 2 недели. Только квалифицированный специалист может поставить диагноз 
                  и подобрать подходящее лечение.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Interpretation */}
      <section className="px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-[#2D3748] mb-6">
              Что означает ваш результат
            </h2>

            <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 mb-6">
              <h3 className="text-lg sm:text-xl font-semibold text-[#2D3748] mb-4">
                {severity.label}
              </h3>
              <div className="space-y-4 text-base text-[#718096] leading-relaxed">
                <p>
                  Результат показывает выраженность симптомов за последние 2 недели. 
                  Только квалифицированный специалист может поставить диагноз и подобрать лечение.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Recommendations */}
      <section className="px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-[#2D3748] mb-6">
              Рекомендации
            </h2>

            {recommendations.length > 0 ? (
              <ul className="space-y-4">
                {recommendations.map((rec, i) => (
                  <li
                    key={i}
                    className="bg-gradient-to-r from-[#A8B5FF]/5 to-[#C8F5E8]/5 border border-[#A8B5FF]/20 rounded-2xl p-6 flex items-start gap-4"
                  >
                    <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#A8B5FF] to-[#C8F5E8] flex items-center justify-center flex-shrink-0 text-white font-bold">
                      {i + 1}
                    </span>
                    <p className="text-base text-[#2D3748] leading-relaxed pt-1">{rec}</p>
                  </li>
                ))}
              </ul>
            ) : (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-[#A8B5FF]/5 to-[#C8F5E8]/5 border border-[#A8B5FF]/20 rounded-2xl p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#A8B5FF] to-[#C8F5E8] flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-lg">1</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-[#2D3748] mb-2">
                      Обратитесь к специалисту
                    </h3>
                    <p className="text-sm sm:text-base text-[#718096] leading-relaxed mb-4">
                      При умеренной депрессии рекомендуется консультация психолога или психотерапевта. 
                      Психотерапия доказала свою эффективность в лечении депрессии этого уровня.
                    </p>
                    <button className="inline-flex items-center gap-2 text-sm font-medium text-[#A8B5FF] hover:underline">
                      Записаться на консультацию
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-[#7FD99A]/5 to-[#C8F5E8]/5 border border-[#7FD99A]/20 rounded-2xl p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#7FD99A] to-[#C8F5E8] flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-lg">2</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-[#2D3748] mb-2">
                      Используйте техники самопомощи
                    </h3>
                    <p className="text-sm sm:text-base text-[#718096] leading-relaxed mb-4">
                      Регулярная физическая активность, практики осознанности и структурированный 
                      распорядок дня могут помочь улучшить ваше состояние.
                    </p>
                    <button className="inline-flex items-center gap-2 text-sm font-medium text-[#7FD99A] hover:underline">
                      Посмотреть упражнения
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-[#FFD4B5]/5 to-[#FFC97F]/5 border border-[#FFD4B5]/20 rounded-2xl p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FFD4B5] to-[#FFC97F] flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-lg">3</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-[#2D3748] mb-2">
                      Отслеживайте динамику
                    </h3>
                    <p className="text-sm sm:text-base text-[#718096] leading-relaxed mb-4">
                      Регулярно проходите тест (раз в 2 недели), чтобы отслеживать изменения. 
                      Это поможет понять, работают ли выбранные стратегии.
                    </p>
                    <button className="inline-flex items-center gap-2 text-sm font-medium text-[#FFD4B5] hover:underline">
                      Сохранить результат
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Resources */}
      <section className="px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-[#2D3748] mb-6">
              Полезные ресурсы
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  icon: BookOpen,
                  title: 'Статьи о депрессии',
                  description: 'Узнайте больше о симптомах и методах работы',
                  color: 'from-[#A8B5FF] to-[#C8F5E8]'
                },
                {
                  icon: MessageCircle,
                  title: 'Упражнения и практики',
                  description: 'Инструменты для улучшения настроения',
                  color: 'from-[#7FD99A] to-[#C8F5E8]'
                },
                {
                  icon: Heart,
                  title: 'Поддержка близких',
                  description: 'Как рассказать о своём состоянии',
                  color: 'from-[#FFD4B5] to-[#FFC97F]'
                },
                {
                  icon: CheckCircle2,
                  title: 'Другие тесты',
                  description: 'Оценка тревоги, стресса и других состояний',
                  color: 'from-[#FFD4B5] to-[#C8F5E8]'
                }
              ].map((resource, index) => (
                <button
                  key={index}
                  className="group bg-white border border-gray-200 rounded-xl p-5 text-left hover:border-[#A8B5FF]/30 hover:shadow-sm transition-all"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${resource.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <resource.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-base font-semibold text-[#2D3748] mb-1">
                    {resource.title}
                  </h3>
                  <p className="text-sm text-[#718096]">
                    {resource.description}
                  </p>
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16 lg:pb-20">
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
              Вы не одни
            </h2>
            
            <p className="text-base sm:text-lg text-[#718096] mb-8 max-w-2xl mx-auto leading-relaxed">
              Депрессия — это состояние, с которым можно работать. Профессиональная помощь и 
              поддержка близких помогут вам справиться.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              <button className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-[#A8B5FF] to-[#C8F5E8] text-white font-medium shadow-[0_8px_24px_-4px_rgba(168,181,255,0.4)] hover:shadow-[0_12px_32px_-4px_rgba(168,181,255,0.5)] active:scale-[0.98] transition-all">
                Записаться на консультацию
              </button>
              <button
                onClick={onBackToHome}
                className="w-full sm:w-auto px-8 py-4 rounded-xl border-2 border-gray-200 text-[#2D3748] font-medium hover:border-[#A8B5FF] hover:bg-[#A8B5FF]/5 transition-all"
              >
                Вернуться на главную
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
