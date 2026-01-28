import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Heart,
  Sparkles,
  Calendar,
  MessageCircle,
  Target,
  TrendingUp,
  CheckCircle2,
  ChevronDown,
  AlertCircle,
  BookOpen,
  Brain,
  Users,
  Zap,
  Shield,
  Clock,
  Phone
} from 'lucide-react';

export default function HowItWorksPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <>
      {/* Hero Section - Mobile First */}
      <section className="relative px-4 sm:px-6 lg:px-8 pt-32 sm:pt-36 lg:pt-40 pb-16 sm:pb-20 overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#A8B5FF]/20 via-[#C8F5E8]/15 to-white -z-10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,#A8B5FF25,transparent_50%),radial-gradient(circle_at_70%_60%,#C8F5E825,transparent_50%)] -z-10" />

        <div className="max-w-[1440px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 backdrop-blur-sm border border-[#A8B5FF]/20 mb-6 sm:mb-8 shadow-[0_2px_8px_-2px_rgba(168,181,255,0.2)]"
            >
              <Sparkles className="w-4 h-4 text-[#A8B5FF]" />
              <span className="text-sm text-[#2D3748]">Простой и понятный процесс</span>
            </motion.div>

            {/* Heading */}
            <h1 className="text-[30px] sm:text-4xl lg:text-5xl font-bold text-[#2D3748] mb-4 sm:mb-6 leading-tight">
              Как это работает
            </h1>

            {/* Subheading */}
            <p className="text-base sm:text-lg lg:text-xl text-[#718096] leading-relaxed px-2">
              Всего 4 простых шага отделяют вас от первой консультации. Никаких сложных процедур — только забота о вашем комфорте.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Step-by-Step Process - Mobile First Timeline */}
      <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-4xl mx-auto">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12 sm:mb-16"
          >
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-[#2D3748] mb-4">
              Ваш путь к балансу
            </h2>
            <p className="text-base sm:text-lg text-[#718096] max-w-2xl mx-auto">
              От первого знакомства до регулярной поддержки
            </p>
          </motion.div>

          {/* Steps Timeline */}
          <div className="space-y-8 sm:space-y-12">
            {/* Step 1 */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              {/* Vertical Line (hidden on last step) */}
              <div className="absolute left-6 sm:left-8 top-16 sm:top-20 bottom-0 w-0.5 bg-gradient-to-b from-[#A8B5FF] to-[#A8B5FF]/20 -z-10" />
              
              <div className="flex gap-4 sm:gap-6">
                {/* Step Number Icon */}
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-[#A8B5FF]/20 to-[#C8F5E8]/20 flex items-center justify-center shadow-[0_4px_16px_-4px_rgba(168,181,255,0.3)] backdrop-blur-sm border border-white/60">
                    <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-[#A8B5FF]" />
                  </div>
                </div>

                {/* Step Content */}
                <div className="flex-1 backdrop-blur-xl bg-gradient-to-br from-white/80 to-white/60 border border-white/40 rounded-[20px] p-6 sm:p-8 shadow-[0_8px_24px_-8px_rgba(168,181,255,0.3)]">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-sm font-semibold text-[#A8B5FF] px-3 py-1 rounded-full bg-[#A8B5FF]/10">
                      Шаг 1
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-semibold text-[#2D3748] mb-3">
                    Изучите платформу
                  </h3>
                  <p className="text-sm sm:text-base text-[#718096] leading-relaxed mb-4">
                    Познакомьтесь с интерактивными инструментами, почитайте статьи или сразу запишитесь на консультацию. Вы можете начать с того, что вам комфортнее.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1.5 rounded-lg bg-[#A8B5FF]/5 text-xs sm:text-sm text-[#718096] border border-[#A8B5FF]/10">
                      ⏱ 2-5 минут
                    </span>
                    <span className="px-3 py-1.5 rounded-lg bg-[#A8B5FF]/5 text-xs sm:text-sm text-[#718096] border border-[#A8B5FF]/10">
                      📱 Любое устройство
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Step 2 */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="relative"
            >
              {/* Vertical Line */}
              <div className="absolute left-6 sm:left-8 top-16 sm:top-20 bottom-0 w-0.5 bg-gradient-to-b from-[#FFD4B5] to-[#FFD4B5]/20 -z-10" />
              
              <div className="flex gap-4 sm:gap-6">
                {/* Step Number Icon */}
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-[#FFD4B5]/20 to-[#FFC97F]/20 flex items-center justify-center shadow-[0_4px_16px_-4px_rgba(255,212,181,0.3)] backdrop-blur-sm border border-white/60">
                    <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-[#FFD4B5]" />
                  </div>
                </div>

                {/* Step Content */}
                <div className="flex-1 backdrop-blur-xl bg-gradient-to-br from-white/80 to-white/60 border border-white/40 rounded-[20px] p-6 sm:p-8 shadow-[0_8px_24px_-8px_rgba(255,212,181,0.3)]">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-sm font-semibold text-[#FFD4B5] px-3 py-1 rounded-full bg-[#FFD4B5]/10">
                      Шаг 2
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-semibold text-[#2D3748] mb-3">
                    Запишитесь на первую встречу
                  </h3>
                  <p className="text-sm sm:text-base text-[#718096] leading-relaxed mb-4">
                    Выберите удобное время в календаре. Первая консультация длится 30 минут и проходит бесплатно. Это знакомство — вы сможете понять, подходим ли мы друг другу.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1.5 rounded-lg bg-[#FFD4B5]/5 text-xs sm:text-sm text-[#718096] border border-[#FFD4B5]/10">
                      🎁 Бесплатно
                    </span>
                    <span className="px-3 py-1.5 rounded-lg bg-[#FFD4B5]/5 text-xs sm:text-sm text-[#718096] border border-[#FFD4B5]/10">
                      ⏱ 30 минут
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Step 3 */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="relative"
            >
              {/* Vertical Line */}
              <div className="absolute left-6 sm:left-8 top-16 sm:top-20 bottom-0 w-0.5 bg-gradient-to-b from-[#C8F5E8] to-[#C8F5E8]/20 -z-10" />
              
              <div className="flex gap-4 sm:gap-6">
                {/* Step Number Icon */}
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-[#C8F5E8]/20 to-[#7FD99A]/20 flex items-center justify-center shadow-[0_4px_16px_-4px_rgba(200,245,232,0.3)] backdrop-blur-sm border border-white/60">
                    <MessageCircle className="w-6 h-6 sm:w-8 sm:h-8 text-[#7FD99A]" />
                  </div>
                </div>

                {/* Step Content */}
                <div className="flex-1 backdrop-blur-xl bg-gradient-to-br from-white/80 to-white/60 border border-white/40 rounded-[20px] p-6 sm:p-8 shadow-[0_8px_24px_-8px_rgba(200,245,232,0.3)]">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-sm font-semibold text-[#7FD99A] px-3 py-1 rounded-full bg-[#7FD99A]/10">
                      Шаг 3
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-semibold text-[#2D3748] mb-3">
                    Первая встреча онлайн
                  </h3>
                  <p className="text-sm sm:text-base text-[#718096] leading-relaxed mb-4">
                    Мы встретимся в видеозвонке. Вы расскажете, что вас привело, а я расскажу, как мы можем работать. Вместе решим, подходим ли мы друг другу и какой формат работы будет оптимальным.
                  </p>
                  <div className="bg-gradient-to-r from-[#C8F5E8]/10 to-[#7FD99A]/10 rounded-xl p-4 border border-[#C8F5E8]/20">
                    <p className="text-xs sm:text-sm text-[#718096] leading-relaxed">
                      <span className="font-medium text-[#2D3748]">Без давления:</span> Если после встречи поймёте, что мы не подходим друг другу — это нормально. Я помогу найти другого специалиста.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Step 4 */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="relative"
            >
              <div className="flex gap-4 sm:gap-6">
                {/* Step Number Icon */}
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-[#FFC97F]/20 to-[#FFD4B5]/20 flex items-center justify-center shadow-[0_4px_16px_-4px_rgba(255,201,127,0.3)] backdrop-blur-sm border border-white/60">
                    <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-[#FFC97F]" />
                  </div>
                </div>

                {/* Step Content */}
                <div className="flex-1 backdrop-blur-xl bg-gradient-to-br from-white/80 to-white/60 border border-white/40 rounded-[20px] p-6 sm:p-8 shadow-[0_8px_24px_-8px_rgba(255,201,127,0.3)]">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-sm font-semibold text-[#FFC97F] px-3 py-1 rounded-full bg-[#FFC97F]/10">
                      Шаг 4
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-semibold text-[#2D3748] mb-3">
                    Работа и поддержка
                  </h3>
                  <p className="text-sm sm:text-base text-[#718096] leading-relaxed mb-4">
                    Мы встречаемся регулярно (обычно 1 раз в неделю), работаем с вашими запросами, изучаем новые инструменты. Между сессиями вы можете использовать интерактивные упражнения на платформе.
                  </p>
                  <ul className="space-y-2">
                    {[
                      'Регулярные встречи в удобное время',
                      'Домашние практики и упражнения',
                      'Поддержка через платформу 24/7',
                      'Гибкий темп работы под ваши возможности'
                    ].map((item, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-[#FFC97F] flex-shrink-0 mt-0.5" />
                        <span className="text-xs sm:text-sm text-[#718096]">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          </div>

          {/* CTA After Steps */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-12 sm:mt-16"
          >
            <button className="h-12 sm:h-14 px-8 rounded-2xl bg-gradient-to-r from-[#A8B5FF] to-[#C8F5E8] text-white font-medium shadow-[0_8px_16px_-4px_rgba(168,181,255,0.4)] hover:shadow-[0_12px_24px_-4px_rgba(168,181,255,0.5)] active:scale-[0.98] transition-all inline-flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Записаться на первую встречу
            </button>
            <p className="text-xs sm:text-sm text-[#718096] mt-4">
              Первая консультация бесплатная • Без обязательств
            </p>
          </motion.div>
        </div>
      </section>

      {/* Methods Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 bg-gradient-to-b from-white to-[#A8B5FF]/5">
        <div className="max-w-[1440px] mx-auto">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10 sm:mb-14"
          >
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-[#2D3748] mb-4">
              Методы работы
            </h2>
            <p className="text-base sm:text-lg text-[#718096] max-w-3xl mx-auto leading-relaxed">
              Я использую научно обоснованные подходы, которые доказали свою эффективность
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Method 1: CBT */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="backdrop-blur-xl bg-gradient-to-br from-white/80 to-white/60 border border-white/40 rounded-[20px] p-6 sm:p-8 shadow-[0_8px_24px_-8px_rgba(168,181,255,0.3)]"
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#A8B5FF]/20 to-[#C8F5E8]/20 flex items-center justify-center mb-5 shadow-[0_4px_12px_-2px_rgba(168,181,255,0.2)]">
                <Brain className="w-7 h-7 text-[#A8B5FF]" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-[#2D3748] mb-3">
                КПТ (Когнитивно-поведенческая терапия)
              </h3>
              <p className="text-sm sm:text-base text-[#718096] leading-relaxed mb-4">
                Работа с мыслями и убеждениями, которые влияют на ваши эмоции и поведение. 
                Отлично подходит для работы с тревогой и депрессией.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-[#A8B5FF]/10 text-xs text-[#A8B5FF] font-medium">
                  Тревога
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-[#A8B5FF]/10 text-xs text-[#A8B5FF] font-medium">
                  Стресс
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-[#A8B5FF]/10 text-xs text-[#A8B5FF] font-medium">
                  Депрессия
                </span>
              </div>
            </motion.div>

            {/* Method 2: Gestalt */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="backdrop-blur-xl bg-gradient-to-br from-white/80 to-white/60 border border-white/40 rounded-[20px] p-6 sm:p-8 shadow-[0_8px_24px_-8px_rgba(255,212,181,0.3)]"
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FFD4B5]/20 to-[#FFC97F]/20 flex items-center justify-center mb-5 shadow-[0_4px_12px_-2px_rgba(255,212,181,0.2)]">
                <Heart className="w-7 h-7 text-[#FFD4B5]" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-[#2D3748] mb-3">
                Гештальт-терапия
              </h3>
              <p className="text-sm sm:text-base text-[#718096] leading-relaxed mb-4">
                Работа с эмоциями "здесь и сейчас", осознавание себя и своих потребностей. 
                Помогает завершить незавершённые ситуации из прошлого.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-[#FFD4B5]/10 text-xs text-[#FFD4B5] font-medium">
                  Эмоции
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-[#FFD4B5]/10 text-xs text-[#FFD4B5] font-medium">
                  Отношения
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-[#FFD4B5]/10 text-xs text-[#FFD4B5] font-medium">
                  Осознанность
                </span>
              </div>
            </motion.div>

            {/* Method 3: Schema Therapy */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="backdrop-blur-xl bg-gradient-to-br from-white/80 to-white/60 border border-white/40 rounded-[20px] p-6 sm:p-8 shadow-[0_8px_24px_-8px_rgba(200,245,232,0.3)]"
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#C8F5E8]/20 to-[#7FD99A]/20 flex items-center justify-center mb-5 shadow-[0_4px_12px_-2px_rgba(200,245,232,0.2)]">
                <Target className="w-7 h-7 text-[#7FD99A]" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-[#2D3748] mb-3">
                Схема-терапия
              </h3>
              <p className="text-sm sm:text-base text-[#718096] leading-relaxed mb-4">
                Работа с глубинными убеждениями и паттернами, которые сформировались в детстве. 
                Помогает изменить устойчивые негативные схемы.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-[#7FD99A]/10 text-xs text-[#7FD99A] font-medium">
                  Самооценка
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-[#7FD99A]/10 text-xs text-[#7FD99A] font-medium">
                  Паттерны
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-[#7FD99A]/10 text-xs text-[#7FD99A] font-medium">
                  Убеждения
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-3xl mx-auto">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10 sm:mb-12"
          >
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-[#2D3748] mb-4">
              Частые вопросы о процессе
            </h2>
            <p className="text-base sm:text-lg text-[#718096]">
              Ответы на вопросы о том, как проходит работа
            </p>
          </motion.div>

          <div className="space-y-4">
            {[
              {
                question: 'Что нужно для онлайн-консультации?',
                answer: 'Вам понадобится устройство с камерой и микрофоном (компьютер, планшет или смартфон) и стабильный интернет. Мы используем защищённую видеосвязь — ссылку на встречу вы получите за день до консультации.'
              },
              {
                question: 'Как часто нужно встречаться?',
                answer: 'Обычно встречи проходят 1 раз в неделю. Это оптимальная частота для большинства запросов. В начале работы возможны встречи 2 раза в неделю, а когда состояние стабилизируется — можно перейти на 1 раз в 2 недели.'
              },
              {
                question: 'Сколько времени займёт терапия?',
                answer: 'Это очень индивидуально. Работа с конкретной проблемой (например, панические атаки) может занять 10-15 встреч. Более глубинная работа (самооценка, паттерны отношений) — от 20 до 50 сессий. На первой встрече мы обсудим примерные сроки для вашего запроса.'
              },
              {
                question: 'Можно ли пропустить встречу?',
                answer: 'Да, но важно предупредить минимум за 24 часа. Если вы отменяете встречу позже, её придётся оплатить. Это правило помогает нам обоим ценить время и поддерживать регулярность.'
              },
              {
                question: 'Что делать между встречами?',
                answer: 'Между сессиями вы можете выполнять простые практики (обычно 10-15 минут в день), вести дневник эмоций или использовать интерактивные инструменты на платформе. Но если у вас нет времени или сил — ничего страшного, мы адаптируем программу.'
              },
              {
                question: 'Будет ли результат, если я не делаю домашние задания?',
                answer: 'Да, результат будет. Домашние практики ускоряют процесс, но они не обязательны. Главное — это то, что происходит на самих встречах. Мы подберём формат, который подходит именно вам.'
              }
            ].map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="backdrop-blur-xl bg-white/80 border border-white/60 rounded-[20px] overflow-hidden shadow-[0_4px_16px_-4px_rgba(168,181,255,0.2)]"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full px-6 py-5 flex items-start justify-between gap-4 text-left hover:bg-[#A8B5FF]/5 transition-colors"
                >
                  <span className="text-base sm:text-lg font-medium text-[#2D3748] flex-1 pr-2">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-[#718096] flex-shrink-0 transition-transform ${
                      openFaq === index ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                <AnimatePresence>
                  {openFaq === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-5 pt-0">
                        <p className="text-sm sm:text-base text-[#718096] leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Disclaimer Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 bg-gradient-to-b from-white to-[#FF9A9A]/5">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="backdrop-blur-xl bg-gradient-to-br from-[#FF9A9A]/10 to-[#FFC97F]/10 border border-[#FF9A9A]/20 rounded-[24px] p-6 sm:p-10 shadow-[0_8px_24px_-8px_rgba(255,154,154,0.3)]"
          >
            <div className="flex flex-col sm:flex-row items-start gap-5">
              <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
                <AlertCircle className="w-7 h-7 text-[#FF9A9A]" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl sm:text-2xl font-semibold text-[#2D3748] mb-4">
                  Важная информация
                </h3>
                <div className="space-y-3 text-sm sm:text-base text-[#718096] leading-relaxed">
                  <p>
                    <span className="font-medium text-[#2D3748]">Это не экстренная помощь.</span> 
                    {' '}Если вы в кризисном состоянии, испытываете суицидальные мысли или нуждаетесь 
                    в немедленной помощи, пожалуйста, обратитесь:
                  </p>
                  <ul className="space-y-2 ml-4">
                    <li className="flex items-start gap-2">
                      <span className="text-[#FF9A9A] mt-1">•</span>
                      <span>
                        <span className="font-medium text-[#2D3748]">Телефон доверия:</span> 8-800-2000-122 (бесплатно, круглосуточно)
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#FF9A9A] mt-1">•</span>
                      <span>
                        <span className="font-medium text-[#2D3748]">Скорая психиатрическая помощь:</span> 112
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#FF9A9A] mt-1">•</span>
                      <span>
                        <span className="font-medium text-[#2D3748]">Чат поддержки:</span> Telegram @chatcare
                      </span>
                    </li>
                  </ul>
                  <p className="pt-2">
                    Онлайн-консультации подходят для работы с тревогой, стрессом, выгоранием, 
                    отношениями и самооценкой. При тяжёлых психических расстройствах необходима 
                    помощь психиатра.
                  </p>
                </div>
                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  <button className="h-12 px-6 rounded-2xl bg-white text-[#2D3748] font-medium shadow-sm hover:shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                    <Phone className="w-5 h-5" />
                    Экстренная помощь
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="backdrop-blur-xl bg-gradient-to-br from-[#A8B5FF]/10 via-[#FFD4B5]/10 to-[#C8F5E8]/10 border border-white/40 rounded-[24px] p-6 sm:p-10 text-center shadow-[0_12px_40px_-12px_rgba(168,181,255,0.3)]"
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#A8B5FF] via-[#FFD4B5] to-[#C8F5E8] flex items-center justify-center mx-auto mb-6 shadow-[0_8px_24px_-8px_rgba(168,181,255,0.5)]">
              <Heart className="w-8 h-8 text-white" fill="white" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-semibold text-[#2D3748] mb-4">
              Готовы сделать первый шаг?
            </h2>
            <p className="text-base sm:text-lg text-[#718096] mb-8 leading-relaxed max-w-2xl mx-auto">
              Запишитесь на бесплатную первую встречу. Это знакомство без обязательств — 
              вы просто узнаете, как всё устроено.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileTap={{ scale: 0.97 }}
                className="h-12 sm:h-14 px-8 rounded-2xl bg-gradient-to-r from-[#A8B5FF] to-[#C8F5E8] text-white font-medium shadow-[0_8px_16px_-4px_rgba(168,181,255,0.4)] hover:shadow-[0_12px_24px_-4px_rgba(168,181,255,0.5)] active:shadow-[0_4px_12px_-2px_rgba(168,181,255,0.4)] transition-all flex items-center justify-center gap-2"
              >
                <Calendar className="w-5 h-5" />
                Записаться на первую встречу
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.97 }}
                className="h-12 sm:h-14 px-8 rounded-2xl border-2 border-[#A8B5FF]/30 text-[#2D3748] font-medium hover:bg-white/80 active:bg-white transition-all"
              >
                Задать вопрос
              </motion.button>
            </div>
            <p className="text-xs sm:text-sm text-[#718096] mt-6">
              30 минут • Бесплатно • Без обязательств
            </p>
          </motion.div>
        </div>
      </section>
    </>
  );
}
