import { useState } from 'react';
import { motion } from 'motion/react';
import { Cookie, ChevronRight, Calendar, Mail, Info, Settings, CheckCircle2, XCircle, Chrome, AlertCircle } from 'lucide-react';

export default function CookiesPolicyPage() {
  const [activeSection, setActiveSection] = useState('what-are-cookies');

  const sections = [
    { id: 'what-are-cookies', title: 'Что такое cookies' },
    { id: 'types', title: 'Типы cookies' },
    { id: 'why-use', title: 'Зачем нужны cookies' },
    { id: 'necessary', title: 'Необходимые cookies' },
    { id: 'functional', title: 'Функциональные cookies' },
    { id: 'analytical', title: 'Аналитические cookies' },
    { id: 'manage', title: 'Как управлять cookies' },
    { id: 'updates', title: 'Обновления политики' },
    { id: 'contacts', title: 'Контакты' }
  ];

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <>
      {/* Hero Section */}
      <section className="relative px-4 sm:px-6 lg:px-8 pt-32 sm:pt-36 lg:pt-40 pb-12 sm:pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#7FD99A]/10 to-white -z-10" />
        
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#7FD99A]/20 to-[#C8F5E8]/20 flex items-center justify-center mx-auto mb-6 shadow-[0_4px_16px_-4px_rgba(127,217,154,0.3)]">
              <Cookie className="w-8 h-8 text-[#7FD99A]" />
            </div>
            <h1 className="text-[30px] sm:text-4xl lg:text-5xl font-bold text-[#2D3748] mb-4 leading-tight">
              Политика использования cookies
            </h1>
            <p className="text-sm sm:text-base text-[#718096] mb-6">
              Прозрачность о том, как мы используем cookies на нашей платформе
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#7FD99A]/10 text-sm text-[#2D3748]">
              <Calendar className="w-4 h-4 text-[#7FD99A]" />
              Последнее обновление: 28 января 2026
            </div>
          </motion.div>
        </div>
      </section>

      {/* Navigation Sections */}
      <section className="sticky top-16 sm:top-20 z-40 bg-white/95 backdrop-blur-xl border-b border-gray-100 px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-6xl mx-auto">
          <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
            <div className="flex gap-2 sm:flex-wrap min-w-max sm:min-w-0">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                    activeSection === section.id
                      ? 'bg-[#7FD99A]/10 text-[#7FD99A]'
                      : 'text-[#718096] hover:bg-gray-50 active:bg-gray-100'
                  }`}
                >
                  {section.title}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="max-w-4xl mx-auto">
          {/* Introduction */}
          <div className="mb-12 sm:mb-16 bg-gradient-to-r from-[#C8F5E8]/5 to-[#7FD99A]/5 rounded-2xl p-6 sm:p-8 border border-[#C8F5E8]/20">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#7FD99A]/10 flex items-center justify-center flex-shrink-0">
                <Info className="w-6 h-6 text-[#7FD99A]" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg sm:text-xl font-semibold text-[#2D3748] mb-3">
                  О cookies на нашей платформе
                </h2>
                <p className="text-sm sm:text-base text-[#718096] leading-relaxed">
                  Мы используем cookies для улучшения вашего опыта на платформе «Эмоциональный баланс». 
                  Эта страница объясняет, какие cookies мы используем, почему они нужны и как вы можете 
                  ими управлять.
                </p>
              </div>
            </div>
          </div>

          <div className="prose prose-slate max-w-none">
            {/* Section 1: What are Cookies */}
            <section id="what-are-cookies" className="mb-16 sm:mb-20 scroll-mt-32">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-2xl sm:text-3xl font-semibold text-[#2D3748] mb-6 sm:mb-8 pb-4 border-b border-gray-200">
                  1. Что такое cookies?
                </h2>
                <div className="space-y-6 text-[#718096] leading-relaxed">
                  <p className="text-sm sm:text-base">
                    Cookies (куки) — это небольшие текстовые файлы, которые веб-сайт сохраняет на вашем 
                    устройстве (компьютере, смартфоне, планшете) при посещении. Они помогают сайту 
                    «запомнить» информацию о вашем визите.
                  </p>

                  <div className="bg-white border-2 border-[#7FD99A]/20 rounded-2xl p-6">
                    <h3 className="text-base sm:text-lg font-semibold text-[#2D3748] mb-4">
                      Простыми словами:
                    </h3>
                    <p className="text-sm sm:text-base mb-4">
                      Представьте, что вы впервые зашли в кафе. В следующий раз бариста не помнит ваш 
                      любимый напиток. Но если бы у него была «записная книжка» (cookies), он бы запомнил 
                      ваши предпочтения.
                    </p>
                    <p className="text-sm sm:text-base text-[#7FD99A] font-medium">
                      💡 Cookies работают точно так же — помогают сайту запоминать ваши настройки и 
                      предпочтения.
                    </p>
                  </div>

                  <div className="bg-gradient-to-r from-[#A8B5FF]/5 to-[#C8F5E8]/5 rounded-2xl p-6 border border-[#A8B5FF]/10">
                    <h3 className="text-base sm:text-lg font-semibold text-[#2D3748] mb-3">
                      Что НЕ являются cookies:
                    </h3>
                    <ul className="space-y-2 text-sm sm:text-base">
                      <li className="flex items-start gap-2">
                        <XCircle className="w-5 h-5 text-[#A8B5FF] flex-shrink-0 mt-0.5" />
                        <span>Cookies — это НЕ вирусы и не могут заразить ваше устройство</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <XCircle className="w-5 h-5 text-[#A8B5FF] flex-shrink-0 mt-0.5" />
                        <span>Они НЕ могут получить доступ к файлам на вашем компьютере</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <XCircle className="w-5 h-5 text-[#A8B5FF] flex-shrink-0 mt-0.5" />
                        <span>Они НЕ содержат личной информации без вашего ведома</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </motion.div>
            </section>

            {/* Section 2: Types */}
            <section id="types" className="mb-16 sm:mb-20 scroll-mt-32">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-2xl sm:text-3xl font-semibold text-[#2D3748] mb-6 sm:mb-8 pb-4 border-b border-gray-200">
                  2. Типы cookies
                </h2>
                <div className="space-y-6 text-[#718096] leading-relaxed">
                  <p className="text-sm sm:text-base">
                    Существуют разные типы cookies в зависимости от их назначения и срока действия.
                  </p>

                  <div className="space-y-4">
                    <div className="bg-gradient-to-br from-[#7FD99A]/5 to-transparent rounded-2xl p-5 border-2 border-[#7FD99A]/20">
                      <h3 className="text-base sm:text-lg font-semibold text-[#2D3748] mb-3 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-[#7FD99A]/10 flex items-center justify-center">
                          <CheckCircle2 className="w-4 h-4 text-[#7FD99A]" />
                        </div>
                        Сессионные cookies (Session Cookies)
                      </h3>
                      <p className="text-sm sm:text-base mb-2">
                        <span className="font-medium text-[#2D3748]">Что это:</span> Временные cookies, 
                        которые удаляются после закрытия браузера.
                      </p>
                      <p className="text-sm sm:text-base">
                        <span className="font-medium text-[#2D3748]">Зачем:</span> Запоминают ваши действия 
                        во время одного визита (например, что вы добавили в корзину).
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-[#A8B5FF]/5 to-transparent rounded-2xl p-5 border-2 border-[#A8B5FF]/20">
                      <h3 className="text-base sm:text-lg font-semibold text-[#2D3748] mb-3 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-[#A8B5FF]/10 flex items-center justify-center">
                          <CheckCircle2 className="w-4 h-4 text-[#A8B5FF]" />
                        </div>
                        Постоянные cookies (Persistent Cookies)
                      </h3>
                      <p className="text-sm sm:text-base mb-2">
                        <span className="font-medium text-[#2D3748]">Что это:</span> Cookies, которые 
                        остаются на устройстве до истечения срока действия или удаления.
                      </p>
                      <p className="text-sm sm:text-base">
                        <span className="font-medium text-[#2D3748]">Зачем:</span> Запоминают ваши 
                        предпочтения между визитами (например, язык интерфейса).
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-[#FFD4B5]/5 to-transparent rounded-2xl p-5 border-2 border-[#FFD4B5]/20">
                      <h3 className="text-base sm:text-lg font-semibold text-[#2D3748] mb-3 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-[#FFD4B5]/10 flex items-center justify-center">
                          <CheckCircle2 className="w-4 h-4 text-[#FFD4B5]" />
                        </div>
                        Собственные cookies (First-party Cookies)
                      </h3>
                      <p className="text-sm sm:text-base mb-2">
                        <span className="font-medium text-[#2D3748]">Что это:</span> Cookies, установленные 
                        непосредственно нашим сайтом.
                      </p>
                      <p className="text-sm sm:text-base">
                        <span className="font-medium text-[#2D3748]">Зачем:</span> Обеспечивают базовую 
                        функциональность платформы.
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-[#FFC97F]/5 to-transparent rounded-2xl p-5 border-2 border-[#FFC97F]/20">
                      <h3 className="text-base sm:text-lg font-semibold text-[#2D3748] mb-3 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-[#FFC97F]/10 flex items-center justify-center">
                          <CheckCircle2 className="w-4 h-4 text-[#FFC97F]" />
                        </div>
                        Сторонние cookies (Third-party Cookies)
                      </h3>
                      <p className="text-sm sm:text-base mb-2">
                        <span className="font-medium text-[#2D3748]">Что это:</span> Cookies от внешних 
                        сервисов (например, Google Analytics).
                      </p>
                      <p className="text-sm sm:text-base">
                        <span className="font-medium text-[#2D3748]">Зачем:</span> Помогают анализировать 
                        посещаемость и улучшать сайт.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </section>

            {/* Section 3: Why Use */}
            <section id="why-use" className="mb-16 sm:mb-20 scroll-mt-32">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-2xl sm:text-3xl font-semibold text-[#2D3748] mb-6 sm:mb-8 pb-4 border-b border-gray-200">
                  3. Зачем мы используем cookies?
                </h2>
                <div className="space-y-6 text-[#718096] leading-relaxed">
                  <p className="text-sm sm:text-base">
                    Мы используем cookies для улучшения вашего опыта на платформе и обеспечения её 
                    корректной работы.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      {
                        icon: '🔐',
                        title: 'Безопасность',
                        desc: 'Защита вашей учётной записи и предотвращение мошенничества'
                      },
                      {
                        icon: '⚙️',
                        title: 'Функциональность',
                        desc: 'Запоминание ваших настроек и предпочтений'
                      },
                      {
                        icon: '📊',
                        title: 'Аналитика',
                        desc: 'Понимание, как вы используете платформу для её улучшения'
                      },
                      {
                        icon: '🎯',
                        title: 'Персонализация',
                        desc: 'Показ релевантного контента и рекомендаций'
                      },
                      {
                        icon: '🔧',
                        title: 'Оптимизация',
                        desc: 'Улучшение производительности и скорости загрузки'
                      },
                      {
                        icon: '📱',
                        title: 'Удобство',
                        desc: 'Упрощение навигации и использования функций'
                      }
                    ].map((item, index) => (
                      <div key={index} className="bg-white border border-gray-200 rounded-xl p-5">
                        <div className="text-2xl mb-2">{item.icon}</div>
                        <h4 className="text-sm sm:text-base font-semibold text-[#2D3748] mb-1">
                          {item.title}
                        </h4>
                        <p className="text-sm text-[#718096]">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </section>

            {/* Section 4: Necessary Cookies */}
            <section id="necessary" className="mb-16 sm:mb-20 scroll-mt-32">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-2xl sm:text-3xl font-semibold text-[#2D3748] mb-6 sm:mb-8 pb-4 border-b border-gray-200">
                  4. Необходимые cookies
                </h2>
                <div className="space-y-6 text-[#718096] leading-relaxed">
                  <div className="bg-gradient-to-r from-[#FF9A9A]/5 to-[#FFC97F]/5 rounded-2xl p-6 border border-[#FF9A9A]/10">
                    <div className="flex items-start gap-3 mb-4">
                      <AlertCircle className="w-6 h-6 text-[#FF9A9A] flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm sm:text-base text-[#2D3748] font-medium mb-2">
                          Важно:
                        </p>
                        <p className="text-sm sm:text-base text-[#718096]">
                          Эти cookies необходимы для работы платформы и не могут быть отключены. 
                          Без них сайт не сможет функционировать должным образом.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-white border-2 border-[#7FD99A]/20 rounded-xl p-5">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-10 h-10 rounded-lg bg-[#7FD99A]/10 flex items-center justify-center flex-shrink-0">
                          <CheckCircle2 className="w-5 h-5 text-[#7FD99A]" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-base sm:text-lg font-semibold text-[#2D3748] mb-1">
                            Аутентификация и авторизация
                          </h4>
                          <p className="text-sm sm:text-base text-[#718096] mb-2">
                            Позволяют вам войти в учётную запись и оставаться авторизованными.
                          </p>
                          <div className="flex flex-wrap gap-2">
                            <span className="text-xs px-2 py-1 rounded bg-[#7FD99A]/10 text-[#7FD99A] font-mono">
                              session_id
                            </span>
                            <span className="text-xs px-2 py-1 rounded bg-[#7FD99A]/10 text-[#7FD99A] font-mono">
                              auth_token
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white border-2 border-[#A8B5FF]/20 rounded-xl p-5">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-10 h-10 rounded-lg bg-[#A8B5FF]/10 flex items-center justify-center flex-shrink-0">
                          <CheckCircle2 className="w-5 h-5 text-[#A8B5FF]" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-base sm:text-lg font-semibold text-[#2D3748] mb-1">
                            Безопасность
                          </h4>
                          <p className="text-sm sm:text-base text-[#718096] mb-2">
                            Защищают от CSRF-атак и других угроз безопасности.
                          </p>
                          <div className="flex flex-wrap gap-2">
                            <span className="text-xs px-2 py-1 rounded bg-[#A8B5FF]/10 text-[#A8B5FF] font-mono">
                              csrf_token
                            </span>
                            <span className="text-xs px-2 py-1 rounded bg-[#A8B5FF]/10 text-[#A8B5FF] font-mono">
                              security_hash
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white border-2 border-[#C8F5E8]/20 rounded-xl p-5">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-10 h-10 rounded-lg bg-[#C8F5E8]/10 flex items-center justify-center flex-shrink-0">
                          <CheckCircle2 className="w-5 h-5 text-[#7FD99A]" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-base sm:text-lg font-semibold text-[#2D3748] mb-1">
                            Балансировка нагрузки
                          </h4>
                          <p className="text-sm sm:text-base text-[#718096] mb-2">
                            Распределяют запросы между серверами для стабильной работы.
                          </p>
                          <div className="flex flex-wrap gap-2">
                            <span className="text-xs px-2 py-1 rounded bg-[#C8F5E8]/10 text-[#7FD99A] font-mono">
                              server_id
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm sm:text-base">
                    <span className="font-medium text-[#2D3748]">Срок действия:</span> Большинство необходимых 
                    cookies удаляются после закрытия браузера (сессионные), некоторые хранятся до 1 года.
                  </p>
                </div>
              </motion.div>
            </section>

            {/* Section 5: Functional Cookies */}
            <section id="functional" className="mb-16 sm:mb-20 scroll-mt-32">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-2xl sm:text-3xl font-semibold text-[#2D3748] mb-6 sm:mb-8 pb-4 border-b border-gray-200">
                  5. Функциональные cookies
                </h2>
                <div className="space-y-6 text-[#718096] leading-relaxed">
                  <p className="text-sm sm:text-base">
                    Эти cookies повышают удобство использования платформы, запоминая ваши предпочтения. 
                    Вы можете отключить их, но это может ухудшить ваш опыт.
                  </p>

                  <div className="space-y-4">
                    <div className="bg-gradient-to-br from-[#FFD4B5]/5 to-transparent rounded-xl p-5 border border-[#FFD4B5]/10">
                      <h4 className="text-base sm:text-lg font-semibold text-[#2D3748] mb-3">
                        Что запоминают функциональные cookies:
                      </h4>
                      <ul className="space-y-2 text-sm sm:text-base">
                        <li className="flex items-start gap-2">
                          <ChevronRight className="w-5 h-5 text-[#FFD4B5] flex-shrink-0 mt-0.5" />
                          <span>Язык интерфейса (русский, английский и др.)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <ChevronRight className="w-5 h-5 text-[#FFD4B5] flex-shrink-0 mt-0.5" />
                          <span>Регион и часовой пояс</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <ChevronRight className="w-5 h-5 text-[#FFD4B5] flex-shrink-0 mt-0.5" />
                          <span>Настройки отображения (размер текста, тема оформления)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <ChevronRight className="w-5 h-5 text-[#FFD4B5] flex-shrink-0 mt-0.5" />
                          <span>Просмотренные материалы и прогресс</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <ChevronRight className="w-5 h-5 text-[#FFD4B5] flex-shrink-0 mt-0.5" />
                          <span>Предпочитаемый способ связи</span>
                        </li>
                      </ul>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-xl p-5">
                      <h4 className="text-base sm:text-lg font-semibold text-[#2D3748] mb-3">
                        Примеры функциональных cookies:
                      </h4>
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <div className="text-lg">⚙️</div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-[#2D3748] mb-1">
                              <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">language</span>
                            </p>
                            <p className="text-sm text-[#718096]">Хранит выбранный язык интерфейса</p>
                            <p className="text-xs text-[#718096] mt-1">Срок: 1 год</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="text-lg">🌍</div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-[#2D3748] mb-1">
                              <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">timezone</span>
                            </p>
                            <p className="text-sm text-[#718096]">Сохраняет ваш часовой пояс</p>
                            <p className="text-xs text-[#718096] mt-1">Срок: 6 месяцев</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="text-lg">🎨</div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-[#2D3748] mb-1">
                              <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">theme</span>
                            </p>
                            <p className="text-sm text-[#718096]">Запоминает тему оформления (светлая/тёмная)</p>
                            <p className="text-xs text-[#718096] mt-1">Срок: 1 год</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </section>

            {/* Section 6: Analytical Cookies */}
            <section id="analytical" className="mb-16 sm:mb-20 scroll-mt-32">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-2xl sm:text-3xl font-semibold text-[#2D3748] mb-6 sm:mb-8 pb-4 border-b border-gray-200">
                  6. Аналитические cookies
                </h2>
                <div className="space-y-6 text-[#718096] leading-relaxed">
                  <p className="text-sm sm:text-base">
                    Эти cookies помогают нам понять, как посетители используют платформу, чтобы мы могли 
                    улучшать её работу. Данные собираются в обезличенном виде.
                  </p>

                  <div className="bg-gradient-to-r from-[#A8B5FF]/5 to-[#C8F5E8]/5 rounded-2xl p-6 border border-[#A8B5FF]/10">
                    <h4 className="text-base sm:text-lg font-semibold text-[#2D3748] mb-3">
                      Что мы анализируем:
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        'Количество посетителей',
                        'Популярные страницы',
                        'Время на сайте',
                        'Источники трафика',
                        'Ошибки и проблемы',
                        'Эффективность функций'
                      ].map((item, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm sm:text-base">
                          <div className="w-6 h-6 rounded-lg bg-[#A8B5FF]/10 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs text-[#A8B5FF] font-semibold">{index + 1}</span>
                          </div>
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg sm:text-xl font-semibold text-[#2D3748] mb-4">
                      Сервисы аналитики, которые мы используем:
                    </h4>
                    
                    <div className="space-y-4">
                      <div className="bg-white border-2 border-gray-200 rounded-xl p-5">
                        <div className="flex items-start gap-4 mb-3">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FFC97F]/20 to-[#FFD4B5]/20 flex items-center justify-center flex-shrink-0">
                            <span className="text-2xl">📊</span>
                          </div>
                          <div className="flex-1">
                            <h5 className="text-base sm:text-lg font-semibold text-[#2D3748] mb-2">
                              Google Analytics
                            </h5>
                            <p className="text-sm sm:text-base text-[#718096] mb-3">
                              Веб-аналитика от Google для отслеживания и анализа посещаемости сайта.
                            </p>
                            <div className="space-y-2 text-sm">
                              <p>
                                <span className="font-medium text-[#2D3748]">Cookies:</span>{' '}
                                <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">_ga</span>,{' '}
                                <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">_gid</span>,{' '}
                                <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">_gat</span>
                              </p>
                              <p>
                                <span className="font-medium text-[#2D3748]">Срок:</span> до 2 лет
                              </p>
                              <p>
                                <span className="font-medium text-[#2D3748]">Провайдер:</span> Google LLC
                              </p>
                            </div>
                            <a
                              href="https://policies.google.com/privacy"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-sm text-[#A8B5FF] hover:underline mt-3"
                            >
                              Политика конфиденциальности Google
                              <ChevronRight className="w-4 h-4" />
                            </a>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white border-2 border-gray-200 rounded-xl p-5">
                        <div className="flex items-start gap-4 mb-3">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#7FD99A]/20 to-[#C8F5E8]/20 flex items-center justify-center flex-shrink-0">
                            <span className="text-2xl">📈</span>
                          </div>
                          <div className="flex-1">
                            <h5 className="text-base sm:text-lg font-semibold text-[#2D3748] mb-2">
                              Яндекс.Метрика
                            </h5>
                            <p className="text-sm sm:text-base text-[#718096] mb-3">
                              Сервис веб-аналитики от Яндекса для российского рынка.
                            </p>
                            <div className="space-y-2 text-sm">
                              <p>
                                <span className="font-medium text-[#2D3748]">Cookies:</span>{' '}
                                <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">_ym_uid</span>,{' '}
                                <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">_ym_d</span>
                              </p>
                              <p>
                                <span className="font-medium text-[#2D3748]">Срок:</span> до 1 года
                              </p>
                              <p>
                                <span className="font-medium text-[#2D3748]">Провайдер:</span> ООО «Яндекс»
                              </p>
                            </div>
                            <a
                              href="https://yandex.ru/legal/confidential/"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-sm text-[#A8B5FF] hover:underline mt-3"
                            >
                              Политика конфиденциальности Яндекса
                              <ChevronRight className="w-4 h-4" />
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-[#C8F5E8]/5 to-[#7FD99A]/5 rounded-2xl p-6 border border-[#C8F5E8]/10">
                    <div className="flex items-start gap-3">
                      <Info className="w-6 h-6 text-[#7FD99A] flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm sm:text-base text-[#2D3748] font-medium mb-2">
                          Ваша конфиденциальность:
                        </p>
                        <p className="text-sm sm:text-base text-[#718096]">
                          Все данные собираются в обезличенном виде. Мы не можем идентифицировать вас 
                          по этим данным. Вы можете отключить аналитические cookies в настройках браузера.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </section>

            {/* Section 7: Manage Cookies */}
            <section id="manage" className="mb-16 sm:mb-20 scroll-mt-32">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-2xl sm:text-3xl font-semibold text-[#2D3748] mb-6 sm:mb-8 pb-4 border-b border-gray-200">
                  7. Как управлять cookies
                </h2>
                <div className="space-y-6 text-[#718096] leading-relaxed">
                  <p className="text-sm sm:text-base">
                    У вас есть полный контроль над использованием cookies. Вы можете управлять ими 
                    несколькими способами.
                  </p>

                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-[#2D3748] mb-4">
                      Настройки браузера
                    </h3>
                    <p className="text-sm sm:text-base mb-4">
                      Большинство браузеров автоматически принимают cookies, но вы можете изменить 
                      настройки для их блокировки или удаления.
                    </p>

                    <div className="space-y-3">
                      {[
                        {
                          name: 'Google Chrome',
                          icon: <Chrome className="w-5 h-5" />,
                          link: 'https://support.google.com/chrome/answer/95647'
                        },
                        {
                          name: 'Mozilla Firefox',
                          icon: <Settings className="w-5 h-5" />,
                          link: 'https://support.mozilla.org/kb/cookies-information-websites-store-on-your-computer'
                        },
                        {
                          name: 'Safari',
                          icon: <Settings className="w-5 h-5" />,
                          link: 'https://support.apple.com/guide/safari/manage-cookies-sfri11471/mac'
                        },
                        {
                          name: 'Microsoft Edge',
                          icon: <Settings className="w-5 h-5" />,
                          link: 'https://support.microsoft.com/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09'
                        }
                      ].map((browser, index) => (
                        <a
                          key={index}
                          href={browser.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl hover:border-[#A8B5FF] hover:shadow-sm transition-all group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-[#A8B5FF]/10 flex items-center justify-center text-[#A8B5FF]">
                              {browser.icon}
                            </div>
                            <span className="text-sm sm:text-base font-medium text-[#2D3748]">
                              {browser.name}
                            </span>
                          </div>
                          <ChevronRight className="w-5 h-5 text-[#718096] group-hover:text-[#A8B5FF] group-hover:translate-x-1 transition-all" />
                        </a>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-[#FFD4B5]/5 to-[#FFC97F]/5 rounded-2xl p-6 border border-[#FFD4B5]/10">
                    <h3 className="text-base sm:text-lg font-semibold text-[#2D3748] mb-3">
                      Общие инструкции по управлению cookies:
                    </h3>
                    <ol className="space-y-2 text-sm sm:text-base list-decimal ml-5">
                      <li>Откройте настройки вашего браузера</li>
                      <li>Найдите раздел «Конфиденциальность» или «Безопасность»</li>
                      <li>Выберите «Cookies» или «Файлы cookie»</li>
                      <li>Настройте параметры по своему усмотрению</li>
                    </ol>
                  </div>

                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-[#2D3748] mb-3">
                      Отказ от аналитических cookies
                    </h3>
                    <p className="text-sm sm:text-base mb-4">
                      Вы можете отключить отслеживание от конкретных сервисов:
                    </p>
                    <ul className="space-y-2 text-sm sm:text-base">
                      <li className="flex items-start gap-2">
                        <ChevronRight className="w-5 h-5 text-[#7FD99A] flex-shrink-0 mt-0.5" />
                        <span>
                          <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-[#A8B5FF] hover:underline">
                            Google Analytics Opt-out Browser Add-on
                          </a> — расширение для отключения Google Analytics
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ChevronRight className="w-5 h-5 text-[#7FD99A] flex-shrink-0 mt-0.5" />
                        <span>
                          <a href="https://yandex.ru/support/metrica/general/opt-out.html" target="_blank" rel="noopener noreferrer" className="text-[#A8B5FF] hover:underline">
                            Отказ от Яндекс.Метрики
                          </a> — настройки для отключения отслеживания
                        </span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-gradient-to-r from-[#FF9A9A]/5 to-[#FFC97F]/5 rounded-2xl p-6 border border-[#FF9A9A]/10">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-6 h-6 text-[#FF9A9A] flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm sm:text-base text-[#2D3748] font-medium mb-2">
                          Обратите внимание:
                        </p>
                        <p className="text-sm sm:text-base text-[#718096]">
                          Отключение cookies может привести к ограничению функциональности платформы. 
                          Некоторые функции могут работать некорректно или быть недоступны. Необходимые 
                          cookies нельзя отключить, так как они критически важны для работы сайта.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </section>

            {/* Section 8: Updates */}
            <section id="updates" className="mb-16 sm:mb-20 scroll-mt-32">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-2xl sm:text-3xl font-semibold text-[#2D3748] mb-6 sm:mb-8 pb-4 border-b border-gray-200">
                  8. Обновления политики cookies
                </h2>
                <div className="space-y-6 text-[#718096] leading-relaxed">
                  <p className="text-sm sm:text-base">
                    Мы можем периодически обновлять эту политику в связи с изменениями на платформе 
                    или законодательства.
                  </p>

                  <div className="bg-gradient-to-r from-[#A8B5FF]/5 to-[#C8F5E8]/5 rounded-2xl p-6 border border-[#A8B5FF]/10">
                    <h3 className="text-base sm:text-lg font-semibold text-[#2D3748] mb-3">
                      Как вы узнаете об изменениях:
                    </h3>
                    <ul className="space-y-2 text-sm sm:text-base">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-[#A8B5FF] flex-shrink-0 mt-0.5" />
                        <span>Уведомление на сайте при входе</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-[#A8B5FF] flex-shrink-0 mt-0.5" />
                        <span>Email-рассылка зарегистрированным пользователям</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-[#A8B5FF] flex-shrink-0 mt-0.5" />
                        <span>Обновление даты в начале документа</span>
                      </li>
                    </ul>
                  </div>

                  <p className="text-sm sm:text-base">
                    Рекомендуем периодически проверять эту страницу для ознакомления с актуальной версией 
                    политики cookies. Продолжая использовать платформу после внесения изменений, вы 
                    соглашаетесь с обновлённой политикой.
                  </p>

                  <div className="bg-white border border-gray-200 rounded-xl p-5">
                    <p className="text-sm sm:text-base">
                      <span className="font-medium text-[#2D3748]">Текущая версия:</span> 1.0
                      <br />
                      <span className="font-medium text-[#2D3748]">Дата вступления в силу:</span> 1 февраля 2026
                    </p>
                  </div>
                </div>
              </motion.div>
            </section>

            {/* Section 9: Contacts */}
            <section id="contacts" className="mb-16 sm:mb-20 scroll-mt-32">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-2xl sm:text-3xl font-semibold text-[#2D3748] mb-6 sm:mb-8 pb-4 border-b border-gray-200">
                  9. Контактная информация
                </h2>
                <div className="space-y-6 text-[#718096] leading-relaxed">
                  <p className="text-sm sm:text-base">
                    Если у вас есть вопросы о политике cookies или вы хотите воспользоваться своими 
                    правами, свяжитесь с нами:
                  </p>

                  <div className="bg-gradient-to-br from-[#7FD99A]/5 via-[#C8F5E8]/5 to-[#A8B5FF]/5 rounded-2xl p-6 sm:p-8 border border-gray-200">
                    <div className="space-y-5">
                      <div>
                        <p className="text-sm text-[#718096] mb-2">Организация:</p>
                        <p className="text-base sm:text-lg font-semibold text-[#2D3748]">
                          ООО «Эмоциональный баланс»
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-[#718096] mb-2">Email для вопросов:</p>
                          <a 
                            href="mailto:privacy@emotional-balance.ru" 
                            className="flex items-center gap-2 text-base font-medium text-[#7FD99A] hover:underline"
                          >
                            <Mail className="w-5 h-5" />
                            privacy@emotional-balance.ru
                          </a>
                        </div>

                        <div>
                          <p className="text-sm text-[#718096] mb-2">Общий email:</p>
                          <a 
                            href="mailto:help@emotional-balance.ru" 
                            className="flex items-center gap-2 text-base font-medium text-[#7FD99A] hover:underline"
                          >
                            <Mail className="w-5 h-5" />
                            help@emotional-balance.ru
                          </a>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm text-[#718096] mb-1">Адрес:</p>
                        <p className="text-base text-[#2D3748]">
                          123456, г. Москва, ул. Примерная, д. 1, офис 101
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </section>
          </div>

          {/* Bottom Navigation */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="bg-gradient-to-r from-[#7FD99A]/10 to-[#C8F5E8]/10 rounded-2xl p-6 mb-6 border border-[#7FD99A]/20">
              <p className="text-sm sm:text-base text-[#2D3748] font-medium mb-2">
                Ваш выбор важен:
              </p>
              <p className="text-sm sm:text-base text-[#718096]">
                Мы уважаем ваше право на конфиденциальность и хотим, чтобы вы понимали, как используются 
                cookies. Если у вас есть вопросы, мы всегда готовы помочь.
              </p>
            </div>

            <p className="text-sm text-[#718096] text-center mb-6">
              Последнее обновление: 28 января 2026 • Версия 1.0
            </p>
            <div className="flex justify-center">
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#7FD99A] to-[#C8F5E8] text-white font-medium shadow-[0_4px_12px_-2px_rgba(127,217,154,0.4)] hover:shadow-[0_6px_16px_-2px_rgba(127,217,154,0.5)] active:scale-[0.98] transition-all"
              >
                Вернуться наверх
              </button>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
