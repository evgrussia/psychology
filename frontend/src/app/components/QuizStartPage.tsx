import { motion } from 'motion/react';
import { ClipboardList, Clock, Shield, AlertCircle, Info, Phone, MessageCircle, ChevronRight } from 'lucide-react';

interface QuizStartPageProps {
  onStart?: () => void;
}

export default function QuizStartPage({ onStart }: QuizStartPageProps) {
  return (
    <>
      {/* Hero Section */}
      <section className="relative px-4 sm:px-6 lg:px-8 pt-32 sm:pt-36 lg:pt-40 pb-12 sm:pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#A8B5FF]/10 to-white -z-10" />
        
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#A8B5FF] to-[#C8F5E8] flex items-center justify-center mx-auto mb-6 shadow-[0_8px_24px_-4px_rgba(168,181,255,0.4)]">
              <ClipboardList className="w-10 h-10 text-white" />
            </div>
            
            <h1 className="text-[32px] sm:text-4xl lg:text-5xl font-bold text-[#2D3748] mb-4 leading-tight">
              Оценка депрессии (PHQ-9)
            </h1>
            
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#A8B5FF]/10 text-sm font-medium text-[#2D3748]">
              <Clock className="w-4 h-4 text-[#A8B5FF]" />
              9 вопросов • 3-5 минут
            </div>
          </motion.div>
        </div>
      </section>

      {/* Description */}
      <section className="px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 mb-6">
              <h2 className="text-xl sm:text-2xl font-semibold text-[#2D3748] mb-4">
                Что это за опросник?
              </h2>
              <p className="text-base text-[#718096] leading-relaxed mb-4">
                PHQ-9 (Patient Health Questionnaire-9) — это стандартизированный опросник для оценки 
                симптомов депрессии за последние 2 недели. Он широко используется в клинической 
                практике и помогает отследить изменения настроения.
              </p>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-[#7FD99A]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <ChevronRight className="w-4 h-4 text-[#7FD99A]" />
                  </div>
                  <p className="text-sm sm:text-base text-[#718096]">
                    <span className="font-medium text-[#2D3748]">Для чего используется:</span> Помогает 
                    понять, какие симптомы депрессии вы испытываете и насколько они выражены
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-[#7FD99A]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <ChevronRight className="w-4 h-4 text-[#7FD99A]" />
                  </div>
                  <p className="text-sm sm:text-base text-[#718096]">
                    <span className="font-medium text-[#2D3748]">Как проходит:</span> Вы ответите на 
                    9 вопросов о том, как часто вас беспокоили определённые симптомы
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-[#7FD99A]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <ChevronRight className="w-4 h-4 text-[#7FD99A]" />
                  </div>
                  <p className="text-sm sm:text-base text-[#718096]">
                    <span className="font-medium text-[#2D3748]">Результат:</span> Получите оценку 
                    симптомов и рекомендации о дальнейших шагах
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Important Warnings */}
      <section className="px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16">
        <div className="max-w-3xl mx-auto space-y-4">
          {/* Not a Diagnosis */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-[#FFD4B5]/10 to-[#FFC97F]/10 border-2 border-[#FFD4B5]/30 rounded-2xl p-6"
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#FFD4B5]/20 flex items-center justify-center flex-shrink-0">
                <Info className="w-6 h-6 text-[#FFD4B5]" />
              </div>
              <div className="flex-1">
                <h3 className="text-base sm:text-lg font-semibold text-[#2D3748] mb-2">
                  Это не диагноз
                </h3>
                <p className="text-sm sm:text-base text-[#718096] leading-relaxed">
                  Результаты опросника — это не медицинский диагноз. Только квалифицированный 
                  специалист может поставить диагноз депрессии. Этот тест помогает вам лучше 
                  понять своё состояние.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Privacy */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-r from-[#C8F5E8]/10 to-[#7FD99A]/10 border border-[#C8F5E8]/30 rounded-2xl p-6"
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#7FD99A]/20 flex items-center justify-center flex-shrink-0">
                <Shield className="w-6 h-6 text-[#7FD99A]" />
              </div>
              <div className="flex-1">
                <h3 className="text-base sm:text-lg font-semibold text-[#2D3748] mb-2">
                  Ваши данные в безопасности
                </h3>
                <p className="text-sm sm:text-base text-[#718096] leading-relaxed">
                  Ответы полностью конфиденциальны. Мы не храним ваши результаты без вашего согласия. 
                  Вы можете сохранить результаты только если зарегистрируетесь.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Crisis Warning */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-r from-[#FF9A9A]/10 to-[#FFC97F]/10 border-2 border-[#FF9A9A]/30 rounded-2xl p-6"
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#FF9A9A]/20 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-6 h-6 text-[#FF9A9A]" />
              </div>
              <div className="flex-1">
                <h3 className="text-base sm:text-lg font-semibold text-[#2D3748] mb-2">
                  Если вы в кризисе
                </h3>
                <p className="text-sm sm:text-base text-[#718096] leading-relaxed mb-4">
                  Если у вас есть мысли о причинении вреда себе или другим, пожалуйста, 
                  немедленно обратитесь за помощью. Не ждите результатов теста.
                </p>
                <div className="space-y-3">
                  <a
                    href="tel:88002000122"
                    className="flex items-center gap-3 p-3 rounded-xl bg-white border-2 border-[#FF9A9A]/30 hover:bg-[#FF9A9A]/5 transition-all"
                  >
                    <div className="w-10 h-10 rounded-lg bg-[#FF9A9A]/10 flex items-center justify-center">
                      <Phone className="w-5 h-5 text-[#FF9A9A]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#2D3748]">Телефон доверия</p>
                      <p className="text-base font-semibold text-[#FF9A9A]">8 (800) 2000-122</p>
                    </div>
                  </a>
                  <a
                    href="#"
                    className="flex items-center gap-3 p-3 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 transition-all"
                  >
                    <div className="w-10 h-10 rounded-lg bg-[#A8B5FF]/10 flex items-center justify-center">
                      <MessageCircle className="w-5 h-5 text-[#A8B5FF]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#2D3748]">Telegram-чат поддержки</p>
                      <p className="text-sm text-[#718096]">Анонимная помощь онлайн</p>
                    </div>
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Additional Info */}
      <section className="px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8"
          >
            <h3 className="text-lg sm:text-xl font-semibold text-[#2D3748] mb-4">
              Полезно знать
            </h3>
            <div className="space-y-4 text-sm sm:text-base text-[#718096]">
              <div>
                <p className="font-medium text-[#2D3748] mb-1">Как отвечать на вопросы?</p>
                <p className="leading-relaxed">
                  Отвечайте честно, основываясь на том, как вы чувствовали себя за последние 2 недели. 
                  Нет правильных или неправильных ответов.
                </p>
              </div>
              <div>
                <p className="font-medium text-[#2D3748] mb-1">Можно ли проходить тест повторно?</p>
                <p className="leading-relaxed">
                  Да, вы можете проходить тест регулярно, чтобы отслеживать изменения. Рекомендуется 
                  делать это не чаще 1 раза в 2 недели.
                </p>
              </div>
              <div>
                <p className="font-medium text-[#2D3748] mb-1">Что делать с результатами?</p>
                <p className="leading-relaxed">
                  После теста вы получите рекомендации и ресурсы. При высоких показателях мы 
                  рекомендуем обратиться к специалисту.
                </p>
              </div>
            </div>
            <a
              href="#"
              className="inline-flex items-center gap-2 text-sm font-medium text-[#A8B5FF] hover:underline mt-4"
            >
              Подробнее о методике PHQ-9
              <ChevronRight className="w-4 h-4" />
            </a>
          </motion.div>
        </div>
      </section>

      {/* CTA Button - Fixed on Mobile */}
      <section className="px-4 sm:px-6 lg:px-8 pb-8 sm:pb-12">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="sticky bottom-0 sm:static bg-white sm:bg-transparent py-4 sm:py-0 -mx-4 px-4 sm:mx-0 sm:px-0 border-t sm:border-0 border-gray-100"
          >
            <button
              onClick={onStart}
              className="w-full px-8 py-4 rounded-xl bg-gradient-to-r from-[#A8B5FF] to-[#C8F5E8] text-white text-base sm:text-lg font-medium shadow-[0_8px_24px_-4px_rgba(168,181,255,0.4)] hover:shadow-[0_12px_32px_-4px_rgba(168,181,255,0.5)] active:scale-[0.98] transition-all"
            >
              Начать тест
            </button>
            <p className="text-xs text-center text-[#718096] mt-3">
              Нажимая кнопку, вы подтверждаете, что ознакомились с предупреждениями
            </p>
          </motion.div>
        </div>
      </section>
    </>
  );
}
