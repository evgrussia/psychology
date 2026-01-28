import { motion } from 'motion/react';
import { Heart, Phone, MessageCircle, Mail, ExternalLink, Shield, Zap, Home } from 'lucide-react';

interface QuizCrisisPageProps {
  onBackToHome?: () => void;
}

export default function QuizCrisisPage({ onBackToHome }: QuizCrisisPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFB5C5]/10 to-white">
      {/* Hero Section */}
      <section className="px-4 sm:px-6 lg:px-8 pt-32 sm:pt-36 lg:pt-40 pb-12 sm:pb-16">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#FFB5C5] to-[#FFD4B5] flex items-center justify-center mx-auto mb-6 shadow-[0_8px_24px_-4px_rgba(255,181,197,0.5)]">
              <Heart className="w-10 h-10 text-white" fill="white" />
            </div>
            
            <h1 className="text-[32px] sm:text-4xl lg:text-5xl font-bold text-[#2D3748] mb-4 leading-tight">
              Мы заботимся о вашей безопасности
            </h1>
            
            <p className="text-lg sm:text-xl text-[#718096] max-w-2xl mx-auto leading-relaxed">
              Судя по вашим ответам, вам может требоваться немедленная помощь. Вы не одиноки, 
              и есть люди, готовые вас поддержать прямо сейчас.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Emergency Contacts - PRIORITY */}
      <section className="px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="bg-gradient-to-r from-[#FF9A9A]/10 to-[#FFC97F]/10 border-2 border-[#FF9A9A]/40 rounded-2xl p-6 sm:p-8 mb-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-[#FF9A9A]/20 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-[#FF9A9A]" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-[#2D3748]">
                  Экстренная помощь
                </h2>
              </div>
              <p className="text-base text-[#718096] mb-6 leading-relaxed">
                Если вы думаете о причинении вреда себе или другим, пожалуйста, немедленно 
                свяжитесь с одной из этих служб. Они работают круглосуточно и анонимно.
              </p>

              <div className="space-y-4">
                {/* Phone Hotline */}
                <a
                  href="tel:88002000122"
                  className="group flex items-center gap-4 p-5 sm:p-6 rounded-xl bg-white border-2 border-[#FF9A9A]/30 hover:border-[#FF9A9A] hover:shadow-lg transition-all"
                >
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#FF9A9A] to-[#FFC97F] flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <Phone className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[#718096] mb-1">
                      Телефон доверия (бесплатно)
                    </p>
                    <p className="text-2xl sm:text-3xl font-bold text-[#FF9A9A] mb-1">
                      8 (800) 2000-122
                    </p>
                    <p className="text-xs text-[#718096]">
                      Круглосуточно • Анонимно • Бесплатно
                    </p>
                  </div>
                  <ExternalLink className="w-5 h-5 text-[#718096] group-hover:text-[#FF9A9A] transition-colors" />
                </a>

                {/* Emergency Services */}
                <a
                  href="tel:112"
                  className="group flex items-center gap-4 p-5 rounded-xl bg-white border-2 border-[#FF9A9A]/30 hover:border-[#FF9A9A] hover:shadow-lg transition-all"
                >
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#FF9A9A] to-[#FFC97F] flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <Zap className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[#718096] mb-1">
                      Единый номер экстренных служб
                    </p>
                    <p className="text-2xl sm:text-3xl font-bold text-[#FF9A9A]">
                      112
                    </p>
                  </div>
                  <ExternalLink className="w-5 h-5 text-[#718096] group-hover:text-[#FF9A9A] transition-colors" />
                </a>

                {/* Telegram Chat */}
                <a
                  href="https://t.me/your_crisis_chat"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-4 p-5 rounded-xl bg-white border border-gray-200 hover:border-[#A8B5FF] hover:shadow-sm transition-all"
                >
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#A8B5FF] to-[#C8F5E8] flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <MessageCircle className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[#718096] mb-1">
                      Telegram-чат поддержки
                    </p>
                    <p className="text-lg font-semibold text-[#2D3748]">
                      Анонимная помощь онлайн
                    </p>
                    <p className="text-xs text-[#718096]">
                      Круглосуточно • Анонимно
                    </p>
                  </div>
                  <ExternalLink className="w-5 h-5 text-[#718096] group-hover:text-[#A8B5FF] transition-colors" />
                </a>

                {/* Email Support */}
                <a
                  href="mailto:crisis@emotional-balance.ru"
                  className="group flex items-center gap-4 p-5 rounded-xl bg-white border border-gray-200 hover:border-[#7FD99A] hover:shadow-sm transition-all"
                >
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#7FD99A] to-[#C8F5E8] flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <Mail className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[#718096] mb-1">
                      Написать на email
                    </p>
                    <p className="text-lg font-semibold text-[#2D3748]">
                      crisis@emotional-balance.ru
                    </p>
                    <p className="text-xs text-[#718096]">
                      Ответим в течение 24 часов
                    </p>
                  </div>
                  <ExternalLink className="w-5 h-5 text-[#718096] group-hover:text-[#7FD99A] transition-colors" />
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Support Message */}
      <section className="px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-[#C8F5E8]/10 to-[#7FD99A]/10 border border-[#C8F5E8]/30 rounded-2xl p-8 sm:p-10 text-center"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-[#2D3748] mb-4">
              Вы не одни
            </h2>
            <p className="text-base sm:text-lg text-[#718096] leading-relaxed mb-6">
              Многие люди проходят через трудные времена и чувствуют себя подавленными. 
              Обращение за помощью — это не признак слабости, а признак силы и мужества. 
              Специалисты готовы выслушать вас без осуждения.
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#7FD99A]/10 text-sm font-medium text-[#2D3748]">
              <Heart className="w-4 h-4 text-[#7FD99A]" fill="currentColor" />
              Мы здесь, чтобы помочь
            </div>
          </motion.div>
        </div>
      </section>

      {/* Immediate Actions */}
      <section className="px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-[#2D3748] mb-6">
              Что можно сделать прямо сейчас
            </h2>

            <div className="space-y-4">
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-[#2D3748] mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#A8B5FF]/10 flex items-center justify-center text-sm font-bold text-[#A8B5FF]">
                    1
                  </span>
                  Обеспечьте свою безопасность
                </h3>
                <p className="text-sm sm:text-base text-[#718096] leading-relaxed ml-8">
                  Если у вас есть доступ к средствам самоповреждения, отдалите их от себя или 
                  попросите кого-то убрать их. Переместитесь в безопасное место.
                </p>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-[#2D3748] mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#7FD99A]/10 flex items-center justify-center text-sm font-bold text-[#7FD99A]">
                    2
                  </span>
                  Свяжитесь с кем-то
                </h3>
                <p className="text-sm sm:text-base text-[#718096] leading-relaxed ml-8">
                  Позвоните человеку, которому доверяете — другу, члену семьи, или на линию доверия. 
                  Не оставайтесь наедине со своими мыслями.
                </p>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-[#2D3748] mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#FFD4B5]/10 flex items-center justify-center text-sm font-bold text-[#FFD4B5]">
                    3
                  </span>
                  Техника заземления «5-4-3-2-1»
                </h3>
                <p className="text-sm sm:text-base text-[#718096] leading-relaxed ml-8 mb-3">
                  Эта техника поможет вернуться в настоящий момент:
                </p>
                <ul className="ml-8 space-y-2 text-sm sm:text-base text-[#718096]">
                  <li className="flex items-start gap-2">
                    <span className="text-[#FFD4B5] mt-1">•</span>
                    <span>Назовите 5 вещей, которые вы видите</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#FFD4B5] mt-1">•</span>
                    <span>4 вещи, которые вы можете потрогать</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#FFD4B5] mt-1">•</span>
                    <span>3 звука, которые вы слышите</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#FFD4B5] mt-1">•</span>
                    <span>2 запаха, которые вы чувствуете</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#FFD4B5] mt-1">•</span>
                    <span>1 вкус во рту</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-[#2D3748] mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#C8F5E8]/10 flex items-center justify-center text-sm font-bold text-[#7FD99A]">
                    4
                  </span>
                  Дышите медленно
                </h3>
                <p className="text-sm sm:text-base text-[#718096] leading-relaxed ml-8">
                  Глубокое дыхание: вдох на 4 счёта, задержка на 4, выдох на 6. Повторите 5 раз. 
                  Это активирует систему успокоения.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Remember */}
      <section className="px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16 lg:pb-20">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-[#FFB5C5]/10 via-[#FFD4B5]/10 to-[#C8F5E8]/10 rounded-2xl sm:rounded-3xl p-8 sm:p-12 border border-[#FFB5C5]/20"
          >
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#FFB5C5] to-[#FFD4B5] flex items-center justify-center mx-auto mb-4 shadow-[0_8px_24px_-4px_rgba(255,181,197,0.4)]">
                <Heart className="w-8 h-8 text-white" fill="white" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#2D3748] mb-4">
                Помните
              </h2>
            </div>

            <div className="space-y-4 text-base sm:text-lg text-[#718096] leading-relaxed">
              <p>
                💙 Кризисные чувства временны. То, что вы чувствуете сейчас, пройдёт.
              </p>
              <p>
                💙 Вы важны. Ваша жизнь имеет ценность, даже если сейчас это трудно увидеть.
              </p>
              <p>
                💙 Помощь доступна. Вам не нужно справляться с этим в одиночку.
              </p>
              <p>
                💙 Обращение за помощью — это сила, а не слабость.
              </p>
            </div>

            {onBackToHome && (
              <div className="mt-8 pt-8 border-t border-gray-200">
                <button
                  onClick={onBackToHome}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-[#A8B5FF]/30 text-[#2D3748] font-medium hover:bg-[#A8B5FF]/5 transition-all"
                >
                  <Home className="w-4 h-4" />
                  На главную
                </button>
              </div>
            )}
          </motion.div>
        </div>
      </section>
    </div>
  );
}
