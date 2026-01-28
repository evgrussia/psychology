import { motion } from 'motion/react';
import { Phone, MessageCircle, Heart, Zap, Shield, ExternalLink, Info, CheckCircle2 } from 'lucide-react';

export default function EmergencyHelpPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative px-4 sm:px-6 lg:px-8 pt-32 sm:pt-36 lg:pt-40 pb-8 sm:pb-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#FFB5C5]/10 via-[#FFD4B5]/5 to-white -z-10" />
        
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#FFB5C5] to-[#FFD4B5] flex items-center justify-center mx-auto mb-6 shadow-[0_12px_32px_-4px_rgba(255,181,197,0.5)]">
              <Heart className="w-10 h-10 text-white" fill="white" />
            </div>
            
            <h1 className="text-[36px] sm:text-5xl lg:text-6xl font-bold text-[#2D3748] mb-4 leading-tight">
              Экстренная помощь
            </h1>
            
            <p className="text-lg sm:text-xl text-[#718096] max-w-2xl mx-auto leading-relaxed">
              Если вам нужна немедленная поддержка, здесь вы найдёте контакты служб помощи
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Hotline - PRIORITY */}
      <section className="px-4 sm:px-6 lg:px-8 pb-8 sm:pb-12">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-[#FF9A9A]/10 via-[#FFD4B5]/10 to-[#FFC97F]/5 border-2 border-[#FFD4B5]/40 rounded-3xl p-6 sm:p-10 shadow-[0_8px_32px_-4px_rgba(255,212,181,0.3)]"
          >
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FFD4B5]/20 text-sm font-medium text-[#2D3748] mb-4">
                <Phone className="w-4 h-4 text-[#FFD4B5]" />
                Главная линия помощи
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#2D3748] mb-2">
                Телефон доверия
              </h2>
              <p className="text-base sm:text-lg text-[#718096]">
                Бесплатно • Анонимно • Круглосуточно
              </p>
            </div>

            <a
              href="tel:88002000122"
              className="group block mb-6"
            >
              <div className="bg-white rounded-2xl p-8 sm:p-10 border-2 border-[#FFD4B5]/30 hover:border-[#FFD4B5] hover:shadow-[0_12px_40px_-8px_rgba(255,212,181,0.4)] transition-all">
                <div className="text-center">
                  <div className="text-5xl sm:text-6xl lg:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#FFD4B5] to-[#FFC97F] mb-4 tracking-wide">
                    8 800 2000 122
                  </div>
                  <div className="flex items-center justify-center gap-2 text-[#718096] group-hover:text-[#FFD4B5] transition-colors">
                    <Phone className="w-5 h-5" />
                    <span className="text-base font-medium">Нажмите, чтобы позвонить</span>
                  </div>
                </div>
              </div>
            </a>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center text-sm text-[#718096]">
              <div className="flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#7FD99A]" />
                <span>Бесплатно по всей России</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#7FD99A]" />
                <span>Работает 24/7</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#7FD99A]" />
                <span>Полная конфиденциальность</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Emergency Services */}
      <section className="px-4 sm:px-6 lg:px-8 pb-8 sm:pb-12">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-[#2D3748] mb-6 text-center">
              Экстренные службы
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* 112 */}
              <a
                href="tel:112"
                className="group bg-white border-2 border-[#FF9A9A]/30 rounded-2xl p-6 hover:border-[#FF9A9A] hover:shadow-lg transition-all"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#FF9A9A] to-[#FFC97F] flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Zap className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[#718096] mb-1">
                      Единый номер экстренных служб
                    </p>
                    <p className="text-4xl font-bold text-[#FF9A9A]">
                      112
                    </p>
                  </div>
                </div>
                <p className="text-sm text-[#718096] leading-relaxed">
                  Полиция, скорая помощь, пожарная охрана, МЧС
                </p>
              </a>

              {/* 103 */}
              <a
                href="tel:103"
                className="group bg-white border-2 border-[#A8B5FF]/30 rounded-2xl p-6 hover:border-[#A8B5FF] hover:shadow-lg transition-all"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#A8B5FF] to-[#C8F5E8] flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Shield className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[#718096] mb-1">
                      Скорая медицинская помощь
                    </p>
                    <p className="text-4xl font-bold text-[#A8B5FF]">
                      103
                    </p>
                  </div>
                </div>
                <p className="text-sm text-[#718096] leading-relaxed">
                  Срочная медицинская помощь при угрозе жизни
                </p>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Crisis Chats */}
      <section className="px-4 sm:px-6 lg:px-8 pb-8 sm:pb-12">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-[#2D3748] mb-6 text-center">
              Кризисные чаты
            </h2>

            <div className="space-y-4">
              {[
                {
                  name: 'Твоя территория онлайн',
                  description: 'Психологическая помощь подросткам и молодёжи',
                  url: 'https://твоятерритория.онлайн',
                  hours: 'Пн-Пт 9:00-18:00'
                },
                {
                  name: 'Помощь рядом',
                  description: 'Профессиональные психологи в Telegram',
                  url: 'https://t.me/help_nearby',
                  hours: 'Круглосуточно'
                },
                {
                  name: 'Ясное утро',
                  description: 'Поддержка при депрессии и тревоге',
                  url: 'https://t.me/clear_morning',
                  hours: 'Ежедневно 10:00-22:00'
                }
              ].map((chat, index) => (
                <a
                  key={index}
                  href={chat.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-4 p-5 sm:p-6 bg-white border border-gray-200 rounded-xl hover:border-[#A8B5FF]/30 hover:shadow-sm transition-all"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#A8B5FF] to-[#C8F5E8] flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <MessageCircle className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg font-semibold text-[#2D3748] mb-1">
                      {chat.name}
                    </h3>
                    <p className="text-sm text-[#718096] mb-1">
                      {chat.description}
                    </p>
                    <p className="text-xs text-[#718096]">
                      {chat.hours}
                    </p>
                  </div>
                  <ExternalLink className="w-5 h-5 text-[#718096] group-hover:text-[#A8B5FF] transition-colors flex-shrink-0" />
                </a>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* You're Not Alone */}
      <section className="px-4 sm:px-6 lg:px-8 pb-8 sm:pb-12">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-[#C8F5E8]/10 to-[#7FD99A]/10 border border-[#C8F5E8]/30 rounded-2xl sm:rounded-3xl p-8 sm:p-10 text-center"
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#7FD99A] to-[#C8F5E8] flex items-center justify-center mx-auto mb-6 shadow-[0_8px_24px_-4px_rgba(127,217,154,0.4)]">
              <Heart className="w-8 h-8 text-white" fill="white" />
            </div>
            
            <h2 className="text-2xl sm:text-3xl font-bold text-[#2D3748] mb-4">
              Вы не одни
            </h2>
            
            <div className="space-y-3 text-base sm:text-lg text-[#718096] leading-relaxed max-w-2xl mx-auto">
              <p>
                💚 Обращение за помощью — это признак силы, а не слабости.
              </p>
              <p>
                💚 То, что вы чувствуете сейчас, имеет значение, и ваши переживания важны.
              </p>
              <p>
                💚 Профессионалы готовы выслушать вас без осуждения в любое время.
              </p>
              <p>
                💚 Кризис временен. Помощь доступна, и лучшие дни впереди.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Immediate Help */}
      <section className="px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-[#2D3748] mb-6 text-center">
              Что можно сделать прямо сейчас
            </h2>

            <div className="space-y-4">
              {/* Technique 1 */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#A8B5FF] to-[#C8F5E8] flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-lg">1</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg sm:text-xl font-semibold text-[#2D3748] mb-3">
                      ��ехника заземления 5-4-3-2-1
                    </h3>
                    <p className="text-sm sm:text-base text-[#718096] mb-4 leading-relaxed">
                      Эта техника помогает вернуться в настоящий момент при тревоге или панике:
                    </p>
                    <div className="space-y-2">
                      {[
                        'Назовите 5 вещей, которые вы видите вокруг себя',
                        'Назовите 4 вещи, которые вы можете потрогать',
                        'Назовите 3 звука, которые вы слышите',
                        'Назовите 2 запаха, которые вы чувствуете',
                        'Назовите 1 вкус во рту'
                      ].map((step, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-lg bg-[#A8B5FF]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-xs font-semibold text-[#A8B5FF]">{i + 1}</span>
                          </div>
                          <p className="text-sm sm:text-base text-[#718096]">{step}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Technique 2 */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#7FD99A] to-[#C8F5E8] flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-lg">2</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg sm:text-xl font-semibold text-[#2D3748] mb-3">
                      Дыхание по квадрату
                    </h3>
                    <p className="text-sm sm:text-base text-[#718096] mb-4 leading-relaxed">
                      Простая техника дыхания для быстрого успокоения:
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { step: '1', text: 'Вдох на 4 счёта' },
                        { step: '2', text: 'Задержка на 4 счёта' },
                        { step: '3', text: 'Выдох на 4 счёта' },
                        { step: '4', text: 'Задержка на 4 счёта' }
                      ].map((item) => (
                        <div key={item.step} className="flex items-center gap-3 p-3 rounded-xl bg-[#7FD99A]/5 border border-[#7FD99A]/20">
                          <div className="w-8 h-8 rounded-lg bg-[#7FD99A]/20 flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-bold text-[#7FD99A]">{item.step}</span>
                          </div>
                          <span className="text-sm text-[#2D3748]">{item.text}</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-sm text-[#718096] mt-4">
                      Повторите 5-10 циклов. Дышите через нос, если возможно.
                    </p>
                  </div>
                </div>
              </div>

              {/* Technique 3 */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FFD4B5] to-[#FFC97F] flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-lg">3</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg sm:text-xl font-semibold text-[#2D3748] mb-3">
                      Обеспечьте свою безопасность
                    </h3>
                    <ul className="space-y-3 text-sm sm:text-base text-[#718096]">
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-[#FFD4B5] flex-shrink-0 mt-0.5" />
                        <span>Переместитесь в безопасное, спокойное место</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-[#FFD4B5] flex-shrink-0 mt-0.5" />
                        <span>Если есть мысли о самоповреждении, уберите опасные предметы подальше</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-[#FFD4B5] flex-shrink-0 mt-0.5" />
                        <span>Свяжитесь с человеком, которому доверяете, или позвоните на горячую линию</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-[#FFD4B5] flex-shrink-0 mt-0.5" />
                        <span>Не оставайтесь наедине со своими мыслями</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Resources */}
      <section className="px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16 lg:pb-20">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-[#2D3748] mb-6 text-center">
              Дополнительные ресурсы
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  title: 'Статьи о кризисе',
                  description: 'Как пережить трудные моменты',
                  icon: Info,
                  color: 'from-[#A8B5FF] to-[#C8F5E8]'
                },
                {
                  title: 'Техники самопомощи',
                  description: 'Практики для снижения тревоги',
                  icon: Heart,
                  color: 'from-[#7FD99A] to-[#C8F5E8]'
                },
                {
                  title: 'Найти специалиста',
                  description: 'Профессиональная помощь',
                  icon: Shield,
                  color: 'from-[#FFD4B5] to-[#FFC97F]'
                },
                {
                  title: 'Группы поддержки',
                  description: 'Сообщество людей с похожим опытом',
                  icon: MessageCircle,
                  color: 'from-[#FFB5C5] to-[#FFD4B5]'
                }
              ].map((resource, index) => (
                <button
                  key={index}
                  className="group bg-white border border-gray-200 rounded-xl p-5 text-left hover:border-[#A8B5FF]/30 hover:shadow-sm transition-all"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${resource.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <resource.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-[#2D3748] mb-1">
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

      {/* Important Note */}
      <section className="px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-[#FFD4B5]/10 to-[#FFC97F]/10 border border-[#FFD4B5]/30 rounded-2xl p-6 sm:p-8"
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#FFD4B5]/20 flex items-center justify-center flex-shrink-0">
                <Info className="w-6 h-6 text-[#FFD4B5]" />
              </div>
              <div className="flex-1">
                <h3 className="text-base sm:text-lg font-semibold text-[#2D3748] mb-2">
                  Помните
                </h3>
                <p className="text-sm sm:text-base text-[#718096] leading-relaxed">
                  Все службы работают конфиденциально и анонимно. Вам не нужно называть своё имя 
                  или любую другую информацию, если вы этого не хотите. Ваша безопасность и 
                  благополучие — главный приоритет.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
