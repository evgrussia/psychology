import { useEffect } from 'react';
import { motion } from 'motion/react';
import { trackEvent } from '@/api/endpoints/tracking';
import { 
  Heart, 
  Phone, 
  MessageCircle, 
  Calendar, 
  Sparkles, 
  BookOpen, 
  ChevronRight,
  Shield,
  Clock,
  Lock,
  CheckCircle2,
  Star,
  ClipboardList,
  Compass
} from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/app/components/ui/accordion';

interface HomePageProps {
  onNavigateToQuiz?: () => void;
  onNavigateToNavigator?: () => void;
}

const HOME_FAQ = [
  {
    question: 'Как понять, нужна ли мне консультация психолога?',
    answer: 'Если вы чувствуете, что не справляетесь с эмоциями, испытываете постоянную тревогу, усталость или просто хотите разобраться в себе — это уже достаточный повод обратиться к психологу. Вам не нужно ждать кризиса.'
  },
  {
    question: 'Сколько длится одна консультация?',
    answer: 'Стандартная консультация длится 50-60 минут. Это оптимальное время для продуктивной работы. Первая встреча может быть короче (30 минут) и проходит бесплатно.'
  },
  {
    question: 'Как проходят онлайн-консультации?',
    answer: 'Мы используем защищенную видеосвязь. Вам понадобится только устройство с камерой и стабильный интернет. Все очень просто и конфиденциально.'
  },
  {
    question: 'Конфиденциальны ли консультации?',
    answer: 'Да, абсолютно. Все, что вы говорите психологу, остается между вами. Это профессиональная этика и законодательное требование. Ваши данные защищены.'
  }
];

export default function HomePage({ onNavigateToQuiz, onNavigateToNavigator }: HomePageProps) {
  useEffect(() => {
    trackEvent('page_view', { page: 'home' });
  }, []);

  return (
    <>
      {/* Hero Section - Mobile First */}
      <section className="relative px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 lg:pt-24 pb-16 sm:pb-20 lg:pb-24 overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#A8B5FF]/15 via-[#FFD4B5]/15 to-[#C8F5E8]/15 -z-10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,#A8B5FF20,transparent_40%),radial-gradient(circle_at_80%_70%,#C8F5E820,transparent_40%)] -z-10" />

        <div className="max-w-[1440px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl mx-auto text-center"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 backdrop-blur-sm border border-[#A8B5FF]/20 mb-6 sm:mb-8 shadow-[0_2px_8px_-2px_rgba(168,181,255,0.2)]"
            >
              <Sparkles className="w-4 h-4 text-[#A8B5FF]" />
              <span className="text-sm text-[#2D3748]">Безопасное пространство поддержки</span>
            </motion.div>

            {/* Main Heading - Mobile Optimized */}
            <h1 className="text-[30px] sm:text-4xl lg:text-5xl font-bold text-[#2D3748] mb-4 sm:mb-6 leading-tight px-2">
              Эмоциональный баланс
            </h1>

            {/* Subheading */}
            <p className="text-base sm:text-lg lg:text-xl text-[#718096] mb-8 sm:mb-10 leading-relaxed px-2">
              Первый шаг к эмоциональному балансу
            </p>

            {/* CTA Buttons - Mobile First */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-4 max-w-md mx-auto">
              <motion.button
                whileTap={{ scale: 0.97 }}
                className="w-full sm:flex-1 h-12 sm:h-14 px-6 rounded-2xl bg-gradient-to-r from-[#A8B5FF] to-[#C8F5E8] text-white font-medium shadow-[0_8px_16px_-4px_rgba(168,181,255,0.4)] active:shadow-[0_4px_12px_-2px_rgba(168,181,255,0.4)] transition-all text-base"
              >
                Записаться на консультацию
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.97 }}
                className="w-full sm:flex-1 h-12 sm:h-14 px-6 rounded-2xl border-2 border-[#A8B5FF]/30 text-[#2D3748] font-medium hover:bg-[#A8B5FF]/5 active:bg-[#A8B5FF]/10 transition-all text-base"
              >
                С чем я помогаю
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Help Block - 3 Glassmorphism Cards - Mobile First */}
      <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="max-w-[1440px] mx-auto">
          {/* Cards Grid - Mobile: 1 column, Desktop: 3 columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {/* Card 1: Interactive Tools */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="relative backdrop-blur-xl bg-gradient-to-br from-white/80 to-white/60 border border-white/40 rounded-[20px] p-6 sm:p-8 shadow-[0_8px_24px_-8px_rgba(168,181,255,0.3)] hover:shadow-[0_12px_32px_-8px_rgba(168,181,255,0.4)] transition-all"
            >
              {/* Icon */}
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#A8B5FF]/20 to-[#C8F5E8]/20 flex items-center justify-center mb-6 shadow-[0_4px_12px_-2px_rgba(168,181,255,0.2)]">
                <Sparkles className="w-7 h-7 text-[#A8B5FF]" />
              </div>

              {/* Content */}
              <h3 className="text-xl sm:text-2xl font-semibold text-[#2D3748] mb-3">
                Интерактивные инструменты
              </h3>
              <p className="text-base text-[#718096] mb-6 leading-relaxed">
                Квизы для самопознания, навигатор эмоционального состояния и дневник чувств
              </p>

              {/* CTA Buttons - Quiz & Navigator */}
              <div className="flex flex-col gap-3">
                <button
                  onClick={onNavigateToQuiz}
                  className="w-full h-12 px-6 rounded-2xl bg-gradient-to-r from-[#A8B5FF] to-[#C8F5E8] text-white font-medium shadow-[0_4px_12px_-2px_rgba(168,181,255,0.3)] hover:shadow-[0_6px_16px_-2px_rgba(168,181,255,0.4)] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  <ClipboardList className="w-4 h-4" />
                  Пройти квиз (PHQ-9)
                </button>
                <button
                  onClick={onNavigateToNavigator}
                  className="w-full h-12 px-6 rounded-2xl border-2 border-[#A8B5FF]/30 text-[#2D3748] font-medium hover:bg-[#A8B5FF]/5 active:bg-[#A8B5FF]/10 transition-all flex items-center justify-center gap-2"
                >
                  <Compass className="w-4 h-4" />
                  Подобрать практики
                </button>
              </div>
            </motion.div>

            {/* Card 2: Consultations */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="relative backdrop-blur-xl bg-gradient-to-br from-white/80 to-white/60 border border-white/40 rounded-[20px] p-6 sm:p-8 shadow-[0_8px_24px_-8px_rgba(255,212,181,0.3)] hover:shadow-[0_12px_32px_-8px_rgba(255,212,181,0.4)] transition-all"
            >
              {/* Icon */}
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FFD4B5]/20 to-[#FFC97F]/20 flex items-center justify-center mb-6 shadow-[0_4px_12px_-2px_rgba(255,212,181,0.2)]">
                <MessageCircle className="w-7 h-7 text-[#FFD4B5]" />
              </div>

              {/* Content */}
              <h3 className="text-xl sm:text-2xl font-semibold text-[#2D3748] mb-3">
                Консультации
              </h3>
              <p className="text-base text-[#718096] mb-6 leading-relaxed">
                Онлайн-встречи с психологом в удобное время. Первая консультация бесплатно
              </p>

              {/* CTA Button - Touch Friendly */}
              <button className="w-full h-12 px-6 rounded-2xl bg-gradient-to-r from-[#FFD4B5] to-[#FFC97F] text-white font-medium shadow-[0_4px_12px_-2px_rgba(255,212,181,0.3)] hover:shadow-[0_6px_16px_-2px_rgba(255,212,181,0.4)] active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                Записаться
                <Calendar className="w-4 h-4" />
              </button>
            </motion.div>

            {/* Card 3: Resources */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative backdrop-blur-xl bg-gradient-to-br from-white/80 to-white/60 border border-white/40 rounded-[20px] p-6 sm:p-8 shadow-[0_8px_24px_-8px_rgba(200,245,232,0.3)] hover:shadow-[0_12px_32px_-8px_rgba(200,245,232,0.4)] transition-all"
            >
              {/* Icon */}
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#C8F5E8]/20 to-[#7FD99A]/20 flex items-center justify-center mb-6 shadow-[0_4px_12px_-2px_rgba(200,245,232,0.2)]">
                <BookOpen className="w-7 h-7 text-[#C8F5E8]" />
              </div>

              {/* Content */}
              <h3 className="text-xl sm:text-2xl font-semibold text-[#2D3748] mb-3">
                Ресурсы
              </h3>
              <p className="text-base text-[#718096] mb-6 leading-relaxed">
                Статьи, упражнения и материалы для самостоятельной работы с эмоциями
              </p>

              {/* CTA Button - Touch Friendly */}
              <button className="w-full h-12 px-6 rounded-2xl bg-gradient-to-r from-[#C8F5E8] to-[#7FD99A] text-white font-medium shadow-[0_4px_12px_-2px_rgba(200,245,232,0.3)] hover:shadow-[0_6px_16px_-2px_rgba(200,245,232,0.4)] active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                Читать
                <BookOpen className="w-4 h-4" />
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Topics Section - Mobile First */}
      <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 bg-gradient-to-b from-white to-[#A8B5FF]/5">
        <div className="max-w-[1440px] mx-auto">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10 sm:mb-12"
          >
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-[#2D3748] mb-3 sm:mb-4">
              С чем я помогаю
            </h2>
            <p className="text-base sm:text-lg text-[#718096] max-w-2xl mx-auto">
              Выберите тему, которая вас беспокоит
            </p>
          </motion.div>

          {/* Topics Grid - Mobile: 1 column, Desktop: 4 columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
            {/* Topic 1: Anxiety */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="group relative overflow-hidden rounded-[16px] p-6 sm:p-7 bg-gradient-to-br from-[#A8B5FF]/15 to-[#A8B5FF]/5 border border-[#A8B5FF]/20 shadow-[0_4px_16px_-4px_rgba(168,181,255,0.2)] hover:shadow-[0_8px_24px_-4px_rgba(168,181,255,0.3)] transition-all"
            >
              <h3 className="text-lg sm:text-xl font-semibold text-[#2D3748] mb-2">
                Тревога и стресс
              </h3>
              <p className="text-sm sm:text-base text-[#718096] mb-4 leading-relaxed">
                Работа с острыми состояниями, паническими атаками и постоянным беспокойством
              </p>
              <a
                href="#"
                className="inline-flex items-center gap-2 text-[#A8B5FF] font-medium hover:gap-3 transition-all touch-target"
              >
                <span className="text-sm sm:text-base">Узнать больше</span>
                <ChevronRight className="w-4 h-4" />
              </a>
            </motion.div>

            {/* Topic 2: Burnout */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="group relative overflow-hidden rounded-[16px] p-6 sm:p-7 bg-gradient-to-br from-[#FFD4B5]/15 to-[#FFD4B5]/5 border border-[#FFD4B5]/20 shadow-[0_4px_16px_-4px_rgba(255,212,181,0.2)] hover:shadow-[0_8px_24px_-4px_rgba(255,212,181,0.3)] transition-all"
            >
              <h3 className="text-lg sm:text-xl font-semibold text-[#2D3748] mb-2">
                Выгорание
              </h3>
              <p className="text-sm sm:text-base text-[#718096] mb-4 leading-relaxed">
                Восстановление энергии, баланс работы и жизни, профилактика истощения
              </p>
              <a
                href="#"
                className="inline-flex items-center gap-2 text-[#FFD4B5] font-medium hover:gap-3 transition-all touch-target"
              >
                <span className="text-sm sm:text-base">Узнать больше</span>
                <ChevronRight className="w-4 h-4" />
              </a>
            </motion.div>

            {/* Topic 3: Relationships */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="group relative overflow-hidden rounded-[16px] p-6 sm:p-7 bg-gradient-to-br from-[#C8F5E8]/15 to-[#C8F5E8]/5 border border-[#C8F5E8]/20 shadow-[0_4px_16px_-4px_rgba(200,245,232,0.2)] hover:shadow-[0_8px_24px_-4px_rgba(200,245,232,0.3)] transition-all"
            >
              <h3 className="text-lg sm:text-xl font-semibold text-[#2D3748] mb-2">
                Отношения
              </h3>
              <p className="text-sm sm:text-base text-[#718096] mb-4 leading-relaxed">
                Улучшение коммуникации, установление границ, разрешение конфликтов
              </p>
              <a
                href="#"
                className="inline-flex items-center gap-2 text-[#7FD99A] font-medium hover:gap-3 transition-all touch-target"
              >
                <span className="text-sm sm:text-base">Узнать больше</span>
                <ChevronRight className="w-4 h-4" />
              </a>
            </motion.div>

            {/* Topic 4: Self-Esteem */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="group relative overflow-hidden rounded-[16px] p-6 sm:p-7 bg-gradient-to-br from-[#FFC97F]/15 to-[#FFC97F]/5 border border-[#FFC97F]/20 shadow-[0_4px_16px_-4px_rgba(255,201,127,0.2)] hover:shadow-[0_8px_24px_-4px_rgba(255,201,127,0.3)] transition-all"
            >
              <h3 className="text-lg sm:text-xl font-semibold text-[#2D3748] mb-2">
                Самооценка
              </h3>
              <p className="text-sm sm:text-base text-[#718096] mb-4 leading-relaxed">
                Повышение уверенности, принятие себя, работа с внутренним критиком
              </p>
              <a
                href="#"
                className="inline-flex items-center gap-2 text-[#FFC97F] font-medium hover:gap-3 transition-all touch-target"
              >
                <span className="text-sm sm:text-base">Узнать больше</span>
                <ChevronRight className="w-4 h-4" />
              </a>
            </motion.div>
          </div>

          {/* All Topics Button */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-8 sm:mt-10"
          >
            <button className="h-12 sm:h-14 px-8 rounded-2xl border-2 border-transparent bg-gradient-to-r from-[#A8B5FF]/10 to-[#C8F5E8]/10 hover:from-[#A8B5FF]/20 hover:to-[#C8F5E8]/20 text-[#2D3748] font-medium transition-all active:scale-[0.98] inline-flex items-center gap-2">
              Все темы
              <ChevronRight className="w-4 h-4" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* How It Works - Trust Block */}
      <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="max-w-[1440px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10 sm:mb-12"
          >
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-[#2D3748] mb-3 sm:mb-4">
              Как проходит консультация
            </h2>
            <p className="text-base sm:text-lg text-[#718096] max-w-2xl mx-auto">
              Простой и безопасный процесс
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="backdrop-blur-xl bg-gradient-to-br from-white/80 to-white/60 border border-white/40 rounded-[24px] p-6 sm:p-10 shadow-[0_12px_40px_-12px_rgba(168,181,255,0.3)]"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10">
              {/* Step 1 */}
              <div className="text-center md:text-left">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#A8B5FF]/20 to-[#C8F5E8]/20 flex items-center justify-center mb-4 mx-auto md:mx-0">
                  <span className="text-xl font-bold text-[#A8B5FF]">1</span>
                </div>
                <h3 className="text-lg font-semibold text-[#2D3748] mb-2">
                  Запишитесь онлайн
                </h3>
                <p className="text-sm text-[#718096] leading-relaxed">
                  Выберите удобное время через календарь. Это займет 2 минуты.
                </p>
              </div>

              {/* Step 2 */}
              <div className="text-center md:text-left">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FFD4B5]/20 to-[#FFC97F]/20 flex items-center justify-center mb-4 mx-auto md:mx-0">
                  <span className="text-xl font-bold text-[#FFD4B5]">2</span>
                </div>
                <h3 className="text-lg font-semibold text-[#2D3748] mb-2">
                  Встреча онлайн
                </h3>
                <p className="text-sm text-[#718096] leading-relaxed">
                  Комфортная видеоконсультация в безопасной обстановке.
                </p>
              </div>

              {/* Step 3 */}
              <div className="text-center md:text-left">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#C8F5E8]/20 to-[#7FD99A]/20 flex items-center justify-center mb-4 mx-auto md:mx-0">
                  <span className="text-xl font-bold text-[#7FD99A]">3</span>
                </div>
                <h3 className="text-lg font-semibold text-[#2D3748] mb-2">
                  Начните путь к балансу
                </h3>
                <p className="text-sm text-[#718096] leading-relaxed">
                  Получите поддержку и практические инструменты для изменений.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ Accordion — ui/accordion с aria-expanded и role="region" */}
      <section
        className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 bg-gradient-to-b from-white to-[#C8F5E8]/5"
        role="region"
        aria-labelledby="faq-heading"
      >
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10 sm:mb-12"
          >
            <h2 id="faq-heading" className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-[#2D3748] mb-3 sm:mb-4">
              Частые вопросы
            </h2>
            <p className="text-base sm:text-lg text-[#718096]">
              Ответы на самые популярные вопросы
            </p>
          </motion.div>

          <Accordion type="single" collapsible className="space-y-4">
            {HOME_FAQ.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`home-faq-${index}`}
                className="backdrop-blur-xl bg-white/80 border border-white/60 rounded-[20px] overflow-hidden shadow-[0_4px_16px_-4px_rgba(168,181,255,0.2)] px-6 border-b-0"
              >
                <AccordionTrigger className="hover:bg-[#A8B5FF]/5 hover:no-underline py-5 [&[data-state=open]>svg]:rotate-180">
                  <span className="text-base sm:text-lg font-medium text-[#2D3748] flex-1 text-left pr-2">
                    {faq.question}
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-sm sm:text-base text-[#718096] leading-relaxed pb-5">
                    {faq.answer}
                  </p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Trust - Privacy Card */}
      <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="backdrop-blur-xl bg-gradient-to-br from-white/80 to-white/60 border border-white/40 rounded-[24px] p-6 sm:p-10 shadow-[0_12px_40px_-12px_rgba(168,181,255,0.3)]"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              {/* Privacy */}
              <div className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#A8B5FF]/20 to-[#C8F5E8]/20 flex items-center justify-center mb-4 mx-auto">
                  <Lock className="w-7 h-7 text-[#A8B5FF]" />
                </div>
                <h3 className="text-lg font-semibold text-[#2D3748] mb-2">
                  Конфиденциальность
                </h3>
                <p className="text-sm text-[#718096] leading-relaxed">
                  Ваши данные надежно защищены и никогда не передаются третьим лицам
                </p>
              </div>

              {/* Security */}
              <div className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FFD4B5]/20 to-[#FFC97F]/20 flex items-center justify-center mb-4 mx-auto">
                  <Shield className="w-7 h-7 text-[#FFD4B5]" />
                </div>
                <h3 className="text-lg font-semibold text-[#2D3748] mb-2">
                  Безопасность
                </h3>
                <p className="text-sm text-[#718096] leading-relaxed">
                  Защищенное соединение и сертифицированные специалисты
                </p>
              </div>

              {/* Support */}
              <div className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#C8F5E8]/20 to-[#7FD99A]/20 flex items-center justify-center mb-4 mx-auto">
                  <Clock className="w-7 h-7 text-[#7FD99A]" />
                </div>
                <h3 className="text-lg font-semibold text-[#2D3748] mb-2">
                  Доступность
                </h3>
                <p className="text-sm text-[#718096] leading-relaxed">
                  Инструменты доступны 24/7, консультации — в удобное время
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Emergency Help Banner */}
      <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative overflow-hidden backdrop-blur-xl bg-gradient-to-br from-[#FF9A9A]/10 to-[#FFC97F]/10 border border-[#FF9A9A]/20 rounded-[24px] p-6 sm:p-8 shadow-[0_8px_24px_-8px_rgba(255,154,154,0.3)]"
          >
            <div className="flex flex-col sm:flex-row items-start gap-5">
              <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
                <Phone className="w-7 h-7 text-[#FF9A9A]" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl sm:text-2xl font-semibold text-[#2D3748] mb-3">
                  Нужна срочная помощь?
                </h3>
                <p className="text-sm sm:text-base text-[#718096] mb-5 leading-relaxed">
                  Если вы в кризисном состоянии, не оставайтесь наедине с этим. Мы здесь, чтобы поддержать вас прямо сейчас.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button className="h-12 px-6 rounded-2xl bg-white text-[#2D3748] font-medium shadow-sm hover:shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                    <Phone className="w-5 h-5" />
                    Экстренная линия
                  </button>
                  <button className="h-12 px-6 rounded-2xl border-2 border-white/60 text-[#2D3748] font-medium hover:bg-white/50 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                    <MessageCircle className="w-5 h-5" />
                    Чат поддержки
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
