import { motion } from 'motion/react';
import {
  Heart,
  Shield,
  Lock,
  Users,
  BookOpen,
  Award,
  Clock,
  CheckCircle2,
  XCircle,
  Sparkles,
  Target,
  Lightbulb,
  Globe
} from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/app/components/ui/accordion';

const ABOUT_FAQ = [
  { question: 'В каком подходе вы работаете?', answer: 'Я работаю в интегративном подходе, используя методы КПТ (когнитивно-поведенческая терапия), гештальт-терапии и схема-терапии. Это позволяет подобрать наиболее эффективные инструменты под ваши задачи.' },
  { question: 'Как быстро будет результат?', answer: 'Это зависит от вашего запроса. Некоторые техники работы с тревогой дают облегчение уже после 2-3 встреч. Глубинная работа с самооценкой или паттернами требует 20-30 сессий. На первой встрече мы обсудим примерные сроки.' },
  { question: 'Вы даёте советы и рекомендации?', answer: 'Моя роль — не давать советы, а помогать вам найти свои решения. Я задаю вопросы, предлагаю посмотреть на ситуацию под другим углом, обучаю техникам работы с эмоциями. Решения принимаете вы сами.' },
  { question: 'Нужно ли делать домашние задания?', answer: 'Да, в КПТ подходе практика между сессиями важна для закрепления навыков. Но задания всегда простые и занимают 10-15 минут в день. Если у вас нет времени или сил, мы адаптируем программу.' },
  { question: 'Можно ли работать онлайн?', answer: 'Да, я работаю только онлайн. Исследования показывают, что онлайн-терапия так же эффективна, как очная. К тому же, это экономит ваше время и позволяет работать из комфортной обстановки.' },
  { question: 'Что если мне не подойдёт?', answer: 'Это нормально. Важен контакт между психологом и клиентом. Если после первой встречи вы поймёте, что мы не подходим друг другу, я помогу найти другого специалиста и верну оплату за первую сессию.' }
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Mobile First */}
      <section className="relative px-4 sm:px-6 lg:px-8 pt-32 sm:pt-36 lg:pt-40 pb-16 sm:pb-20 overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#A8B5FF]/20 via-[#FFD4B5]/15 to-white -z-10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,#A8B5FF25,transparent_50%),radial-gradient(circle_at_70%_60%,#FFD4B525,transparent_50%)] -z-10" />

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
              <Heart className="w-4 h-4 text-[#A8B5FF]" />
              <span className="text-sm text-[#2D3748]">Создано с заботой о вас</span>
            </motion.div>

            {/* Heading */}
            <h1 className="text-[30px] sm:text-4xl lg:text-5xl font-bold text-[#2D3748] mb-4 sm:mb-6 leading-tight">
              О проекте
            </h1>

            {/* Introduction */}
            <p className="text-base sm:text-lg lg:text-xl text-[#718096] leading-relaxed px-2">
              «Эмоциональный баланс» — это не просто платформа для психологической помощи. 
              Это тёплое онлайн-пространство, где каждый может найти поддержку, понимание 
              и инструменты для работы с эмоциями.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission & Principles Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-[1440px] mx-auto">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10 sm:mb-14"
          >
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-[#2D3748] mb-4">
              Наша миссия
            </h2>
            <p className="text-base sm:text-lg text-[#718096] max-w-3xl mx-auto leading-relaxed">
              Сделать психологическую помощь доступной, безопасной и понятной для каждого, 
              кто в ней нуждается
            </p>
          </motion.div>

          {/* Principles Cards - Mobile: 1 column, Desktop: 3 columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {/* Principle 1: Care */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="backdrop-blur-xl bg-gradient-to-br from-white/80 to-white/60 border border-white/40 rounded-[20px] p-6 sm:p-8 shadow-[0_8px_24px_-8px_rgba(168,181,255,0.3)]"
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#A8B5FF]/20 to-[#C8F5E8]/20 flex items-center justify-center mb-5 shadow-[0_4px_12px_-2px_rgba(168,181,255,0.2)]">
                <Heart className="w-7 h-7 text-[#A8B5FF]" />
              </div>
              <h3 className="text-xl font-semibold text-[#2D3748] mb-3">
                Бережность
              </h3>
              <p className="text-sm sm:text-base text-[#718096] leading-relaxed">
                Мы работаем с уважением к вашим чувствам, темпу и границам. 
                Никакого давления или обесценивания.
              </p>
            </motion.div>

            {/* Principle 2: Confidentiality */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="backdrop-blur-xl bg-gradient-to-br from-white/80 to-white/60 border border-white/40 rounded-[20px] p-6 sm:p-8 shadow-[0_8px_24px_-8px_rgba(255,212,181,0.3)]"
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FFD4B5]/20 to-[#FFC97F]/20 flex items-center justify-center mb-5 shadow-[0_4px_12px_-2px_rgba(255,212,181,0.2)]">
                <Lock className="w-7 h-7 text-[#FFD4B5]" />
              </div>
              <h3 className="text-xl font-semibold text-[#2D3748] mb-3">
                Конфиденциальность
              </h3>
              <p className="text-sm sm:text-base text-[#718096] leading-relaxed">
                Всё, что вы говорите, остаётся между вами и психологом. 
                Ваши данные надёжно защищены.
              </p>
            </motion.div>

            {/* Principle 3: Ethics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="backdrop-blur-xl bg-gradient-to-br from-white/80 to-white/60 border border-white/40 rounded-[20px] p-6 sm:p-8 shadow-[0_8px_24px_-8px_rgba(200,245,232,0.3)]"
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#C8F5E8]/20 to-[#7FD99A]/20 flex items-center justify-center mb-5 shadow-[0_4px_12px_-2px_rgba(200,245,232,0.2)]">
                <Shield className="w-7 h-7 text-[#7FD99A]" />
              </div>
              <h3 className="text-xl font-semibold text-[#2D3748] mb-3">
                Профессиональная этика
              </h3>
              <p className="text-sm sm:text-base text-[#718096] leading-relaxed">
                Мы следуем этическому кодексу психолога и работаем в рамках 
                профессиональных стандартов.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Approach Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 bg-gradient-to-b from-white to-[#A8B5FF]/5">
        <div className="max-w-[1440px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <div className="backdrop-blur-xl bg-gradient-to-br from-white/80 to-white/60 border border-white/40 rounded-[24px] p-6 sm:p-10 shadow-[0_12px_40px_-12px_rgba(168,181,255,0.3)]">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-[#A8B5FF]/20 to-[#C8F5E8]/20 flex items-center justify-center flex-shrink-0">
                  <Target className="w-6 h-6 sm:w-7 sm:h-7 text-[#A8B5FF]" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl sm:text-3xl font-semibold text-[#2D3748] mb-4">
                    Наш подход
                  </h2>
                  <div className="space-y-4 text-sm sm:text-base text-[#718096] leading-relaxed">
                    <p>
                      Мы работаем в интегративном подходе, сочетая методы когнитивно-поведенческой 
                      терапии (КПТ), гештальт-терапии и схема-терапии. Это значит, что мы адаптируем 
                      методы под ваши задачи и особенности.
                    </p>
                    <p>
                      В нашей работе мы опираемся на научно обоснованные методы, но при этом 
                      остаёмся гибкими и человечными. Терапия — это не только техники, 
                      но и безопасные отношения, в которых вы можете быть собой.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Education & Experience Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-[1440px] mx-auto">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10 sm:mb-14"
          >
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-[#2D3748] mb-4">
              Образование и опыт
            </h2>
            <p className="text-base sm:text-lg text-[#718096] max-w-3xl mx-auto leading-relaxed">
              Квалифицированный психолог с подтверждённым образованием
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto space-y-6">
            {/* Education Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="backdrop-blur-xl bg-gradient-to-br from-white/80 to-white/60 border border-white/40 rounded-[20px] p-6 sm:p-8 shadow-[0_8px_24px_-8px_rgba(168,181,255,0.3)]"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#A8B5FF]/20 to-[#C8F5E8]/20 flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-6 h-6 text-[#A8B5FF]" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg sm:text-xl font-semibold text-[#2D3748] mb-4">
                    Образование
                  </h3>
                  <div className="space-y-4">
                    <div className="pl-4 border-l-2 border-[#A8B5FF]/30">
                      <p className="text-sm text-[#718096] mb-1">2018 — 2023</p>
                      <p className="text-base font-medium text-[#2D3748] mb-1">
                        Московский государственный университет
                      </p>
                      <p className="text-sm text-[#718096]">
                        Магистратура, клиническая психология
                      </p>
                    </div>
                    <div className="pl-4 border-l-2 border-[#FFD4B5]/30">
                      <p className="text-sm text-[#718096] mb-1">2020 — 2022</p>
                      <p className="text-base font-medium text-[#2D3748] mb-1">
                        Институт практической психологии
                      </p>
                      <p className="text-sm text-[#718096]">
                        Программа повышения квалификации по КПТ
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Certifications Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="backdrop-blur-xl bg-gradient-to-br from-white/80 to-white/60 border border-white/40 rounded-[20px] p-6 sm:p-8 shadow-[0_8px_24px_-8px_rgba(255,212,181,0.3)]"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FFD4B5]/20 to-[#FFC97F]/20 flex items-center justify-center flex-shrink-0">
                  <Award className="w-6 h-6 text-[#FFD4B5]" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg sm:text-xl font-semibold text-[#2D3748] mb-4">
                    Сертификаты
                  </h3>
                  <ul className="space-y-3">
                    {[
                      'Сертификат практикующего психолога',
                      'Специализация: когнитивно-поведенческая терапия',
                      'Тренинг по работе с тревожными расстройствами',
                      'Супервизия и личная терапия (обязательная практика)'
                    ].map((cert, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-[#7FD99A] flex-shrink-0 mt-0.5" />
                        <span className="text-sm sm:text-base text-[#718096]">{cert}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>

            {/* Experience Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="backdrop-blur-xl bg-gradient-to-br from-white/80 to-white/60 border border-white/40 rounded-[20px] p-6 sm:p-8 shadow-[0_8px_24px_-8px_rgba(200,245,232,0.3)]"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#C8F5E8]/20 to-[#7FD99A]/20 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-6 h-6 text-[#7FD99A]" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg sm:text-xl font-semibold text-[#2D3748] mb-3">
                    Опыт работы
                  </h3>
                  <p className="text-sm sm:text-base text-[#718096] leading-relaxed mb-4">
                    Более 5 лет практической работы с клиентами. Провела более 2000 консультаций, 
                    помогая людям справляться с тревогой, стрессом, выгоранием и другими сложностями.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-[#A8B5FF]/5 to-[#C8F5E8]/5 rounded-xl p-4 border border-[#A8B5FF]/10">
                      <p className="text-2xl font-bold text-[#A8B5FF] mb-1">2000+</p>
                      <p className="text-sm text-[#718096]">Консультаций проведено</p>
                    </div>
                    <div className="bg-gradient-to-br from-[#FFD4B5]/5 to-[#FFC97F]/5 rounded-xl p-4 border border-[#FFD4B5]/10">
                      <p className="text-2xl font-bold text-[#FFD4B5] mb-1">5+ лет</p>
                      <p className="text-sm text-[#718096]">Практического опыта</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Ethics & Boundaries Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 bg-gradient-to-b from-white to-[#C8F5E8]/5">
        <div className="max-w-[1440px] mx-auto">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10 sm:mb-14"
          >
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-[#2D3748] mb-4">
              Этика и границы
            </h2>
            <p className="text-base sm:text-lg text-[#718096] max-w-3xl mx-auto leading-relaxed">
              Прозрачность и честность в нашей работе
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-5xl mx-auto">
            {/* Data Privacy */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="backdrop-blur-xl bg-gradient-to-br from-white/80 to-white/60 border border-white/40 rounded-[20px] p-6 sm:p-8 shadow-[0_8px_24px_-8px_rgba(168,181,255,0.3)]"
            >
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#A8B5FF]/20 to-[#C8F5E8]/20 flex items-center justify-center mb-5">
                <Lock className="w-6 h-6 text-[#A8B5FF]" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-[#2D3748] mb-3">
                Конфиденциальность данных
              </h3>
              <ul className="space-y-3">
                {[
                  'Все данные хранятся в зашифрованном виде',
                  'Мы не передаём информацию третьим лицам',
                  'Вы можете запросить удаление всех данных в любой момент',
                  'Аудио и видео не записываются без вашего согласия'
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#A8B5FF] flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-[#718096]">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Therapeutic Boundaries */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="backdrop-blur-xl bg-gradient-to-br from-white/80 to-white/60 border border-white/40 rounded-[20px] p-6 sm:p-8 shadow-[0_8px_24px_-8px_rgba(255,212,181,0.3)]"
            >
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FFD4B5]/20 to-[#FFC97F]/20 flex items-center justify-center mb-5">
                <Shield className="w-6 h-6 text-[#FFD4B5]" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-[#2D3748] mb-3">
                Терапевтические границы
              </h3>
              <ul className="space-y-3">
                {[
                  'Встречи только в рамках сессий',
                  'Отношения остаются профессиональными',
                  'Нет дружбы или романтических отношений с клиентами',
                  'Чёткий контракт и оплата услуг'
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#FFD4B5] flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-[#718096]">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Ethics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="backdrop-blur-xl bg-gradient-to-br from-white/80 to-white/60 border border-white/40 rounded-[20px] p-6 sm:p-8 shadow-[0_8px_24px_-8px_rgba(200,245,232,0.3)]"
            >
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#C8F5E8]/20 to-[#7FD99A]/20 flex items-center justify-center mb-5">
                <Users className="w-6 h-6 text-[#7FD99A]" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-[#2D3748] mb-3">
                Этический кодекс
              </h3>
              <ul className="space-y-3">
                {[
                  'Уважение к вашим ценностям и убеждениям',
                  'Никакого осуждения или навязывания мнений',
                  'Работа в ваших интересах',
                  'Честность о возможностях и ограничениях терапии'
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#7FD99A] flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-[#718096]">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Supervision */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="backdrop-blur-xl bg-gradient-to-br from-white/80 to-white/60 border border-white/40 rounded-[20px] p-6 sm:p-8 shadow-[0_8px_24px_-8px_rgba(255,201,127,0.3)]"
            >
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FFC97F]/20 to-[#FFD4B5]/20 flex items-center justify-center mb-5">
                <Lightbulb className="w-6 h-6 text-[#FFC97F]" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-[#2D3748] mb-3">
                Супервизия и развитие
              </h3>
              <ul className="space-y-3">
                {[
                  'Регулярные супервизии с опытными коллегами',
                  'Личная терапия психолога',
                  'Обучение и повышение квалификации',
                  'Участие в профессиональном сообществе'
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#FFC97F] flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-[#718096]">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Who is it for / not for Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-[1440px] mx-auto">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10 sm:mb-14"
          >
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-[#2D3748] mb-4">
              Кому подойдёт работа со мной
            </h2>
            <p className="text-base sm:text-lg text-[#718096] max-w-3xl mx-auto leading-relaxed">
              Честно о том, когда стоит обратиться и когда лучше выбрать другого специалиста
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 max-w-6xl mx-auto">
            {/* Suitable For */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="backdrop-blur-xl bg-gradient-to-br from-[#7FD99A]/10 to-[#C8F5E8]/10 border border-[#7FD99A]/20 rounded-[24px] p-6 sm:p-8 shadow-[0_8px_24px_-8px_rgba(127,217,154,0.3)]"
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-7 h-7 text-[#7FD99A]" />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-semibold text-[#2D3748] mb-2">
                    Вам подойдёт
                  </h3>
                  <p className="text-sm text-[#718096]">
                    Если вы столкнулись с этими сложностями
                  </p>
                </div>
              </div>

              <ul className="space-y-4">
                {[
                  {
                    title: 'Тревога и паника',
                    desc: 'Постоянное беспокойство, панические атак��, страхи'
                  },
                  {
                    title: 'Выгорание и усталость',
                    desc: 'Эмоциональное истощение, потеря мотивации'
                  },
                  {
                    title: 'Низкая самооценка',
                    desc: 'Неуверенность, самокритика, сложности с самопринятием'
                  },
                  {
                    title: 'Проблемы в отношениях',
                    desc: 'Конфликты, сложности с границами, созависимость'
                  },
                  {
                    title: 'Кризисы и переходы',
                    desc: 'Развод, потеря, смена работы, переезд'
                  },
                  {
                    title: 'Самопознание',
                    desc: 'Желание лучше понять себя и свои паттерны'
                  }
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3 bg-white/60 backdrop-blur-sm rounded-xl p-4">
                    <CheckCircle2 className="w-5 h-5 text-[#7FD99A] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-base font-medium text-[#2D3748] mb-1">{item.title}</p>
                      <p className="text-sm text-[#718096]">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Not Suitable For */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="backdrop-blur-xl bg-gradient-to-br from-[#FF9A9A]/10 to-[#FFC97F]/10 border border-[#FF9A9A]/20 rounded-[24px] p-6 sm:p-8 shadow-[0_8px_24px_-8px_rgba(255,154,154,0.3)]"
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center flex-shrink-0">
                  <XCircle className="w-7 h-7 text-[#FF9A9A]" />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-semibold text-[#2D3748] mb-2">
                    Вам не подойдёт
                  </h3>
                  <p className="text-sm text-[#718096]">
                    Лучше обратиться к другому специалисту
                  </p>
                </div>
              </div>

              <ul className="space-y-4">
                {[
                  {
                    title: 'Психические расстройства',
                    desc: 'Шизофрения, БАР, тяжёлая депрессия — нужен психиатр'
                  },
                  {
                    title: 'Зависимости',
                    desc: 'Алкогольная или наркотическая зависимость — нужен нарколог'
                  },
                  {
                    title: 'Детская психология',
                    desc: 'Работаю только со взрослыми (18+)'
                  },
                  {
                    title: 'Суицидальные мысли',
                    desc: 'При активных планах — сначала обратитесь к психиатру'
                  },
                  {
                    title: 'Нет запроса',
                    desc: 'Если вас отправили родственники против вашего желания'
                  },
                  {
                    title: 'Нужен совет',
                    desc: 'Если нужен конкретный совет, а не работа с эмоциями'
                  }
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3 bg-white/60 backdrop-blur-sm rounded-xl p-4">
                    <XCircle className="w-5 h-5 text-[#FF9A9A] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-base font-medium text-[#2D3748] mb-1">{item.title}</p>
                      <p className="text-sm text-[#718096]">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          {/* Note */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto mt-8"
          >
            <div className="bg-gradient-to-r from-[#A8B5FF]/5 to-[#C8F5E8]/5 rounded-2xl p-6 border border-[#A8B5FF]/10">
              <p className="text-sm sm:text-base text-[#718096] leading-relaxed text-center">
                <span className="font-medium text-[#2D3748]">Важно:</span> Если вы не уверены, 
                подойдёт ли вам моя помощь, запишитесь на бесплатную первую встречу. 
                Мы обсудим ваш запрос и решим, могу ли я вам помочь.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section — ui/accordion с aria-expanded и role="region" */}
      <section
        className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 bg-gradient-to-b from-white to-[#A8B5FF]/5"
        role="region"
        aria-labelledby="about-faq-heading"
      >
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10 sm:mb-12"
          >
            <h2 id="about-faq-heading" className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-[#2D3748] mb-4">
              Частые вопросы о работе
            </h2>
            <p className="text-base sm:text-lg text-[#718096]">
              Ответы на вопросы о моём подходе и методах
            </p>
          </motion.div>

          <Accordion type="single" collapsible className="space-y-4">
            {ABOUT_FAQ.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`about-faq-${index}`}
                className="backdrop-blur-xl bg-white/80 border border-white/60 rounded-[20px] overflow-hidden shadow-[0_4px_16px_-4px_rgba(168,181,255,0.2)] px-6 border-b-0"
              >
                <AccordionTrigger className="hover:bg-[#A8B5FF]/5 hover:no-underline py-5 [&[data-state=open]>svg]:rotate-180">
                  <span className="text-base sm:text-lg font-medium text-[#2D3748] flex-1 pr-2 text-left">
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

      {/* CTA Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="backdrop-blur-xl bg-gradient-to-br from-[#A8B5FF]/10 via-[#FFD4B5]/10 to-[#C8F5E8]/10 border border-white/40 rounded-[24px] p-6 sm:p-10 text-center shadow-[0_12px_40px_-12px_rgba(168,181,255,0.3)]"
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#A8B5FF] via-[#FFD4B5] to-[#C8F5E8] flex items-center justify-center mx-auto mb-6 shadow-[0_8px_24px_-8px_rgba(168,181,255,0.5)]">
              <Heart className="w-8 h-8 text-white" fill="white" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-semibold text-[#2D3748] mb-4">
              Готовы начать?
            </h2>
            <p className="text-base sm:text-lg text-[#718096] mb-8 leading-relaxed max-w-2xl mx-auto">
              Запишитесь на бесплатную первую встречу. Мы познакомимся, обсудим ваш запрос 
              и решим, могу ли я вам помочь.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileTap={{ scale: 0.97 }}
                className="h-12 sm:h-14 px-8 rounded-2xl bg-gradient-to-r from-[#A8B5FF] to-[#C8F5E8] text-white font-medium shadow-[0_8px_16px_-4px_rgba(168,181,255,0.4)] hover:shadow-[0_12px_24px_-4px_rgba(168,181,255,0.5)] active:shadow-[0_4px_12px_-2px_rgba(168,181,255,0.4)] transition-all"
              >
                Записаться на консультацию
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.97 }}
                className="h-12 sm:h-14 px-8 rounded-2xl border-2 border-[#A8B5FF]/30 text-[#2D3748] font-medium hover:bg-white/80 active:bg-white transition-all"
              >
                Задать вопрос
              </motion.button>
            </div>
            <p className="text-xs sm:text-sm text-[#718096] mt-6">
              Первая консультация бесплатная • Без обязательств
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
