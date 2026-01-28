import { useState } from 'react';
import { motion } from 'motion/react';
import { Shield, ChevronRight, Calendar, Mail } from 'lucide-react';

export default function PrivacyPolicyPage() {
  const [activeSection, setActiveSection] = useState('general');

  const sections = [
    { id: 'general', title: 'Общие положения' },
    { id: 'data-collection', title: 'Какие данные собираем' },
    { id: 'data-usage', title: 'Как используем данные' },
    { id: 'data-storage', title: 'Хранение данных' },
    { id: 'third-party', title: 'Передача данных третьим лицам' },
    { id: 'your-rights', title: 'Ваши права' },
    { id: 'cookies', title: 'Cookies' },
    { id: 'contacts', title: 'Контакты' }
  ];

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      const offset = 100; // Header height + padding
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
        <div className="absolute inset-0 bg-gradient-to-b from-[#A8B5FF]/10 to-white -z-10" />
        
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#A8B5FF]/20 to-[#C8F5E8]/20 flex items-center justify-center mx-auto mb-6 shadow-[0_4px_16px_-4px_rgba(168,181,255,0.3)]">
              <Shield className="w-8 h-8 text-[#A8B5FF]" />
            </div>
            <h1 className="text-[30px] sm:text-4xl lg:text-5xl font-bold text-[#2D3748] mb-4 leading-tight">
              Политика конфиденциальности
            </h1>
            <p className="text-sm sm:text-base text-[#718096] mb-6">
              Последнее обновление: 28 января 2026
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#A8B5FF]/10 text-sm text-[#2D3748]">
              <Calendar className="w-4 h-4 text-[#A8B5FF]" />
              Вступает в силу: 1 февраля 2026
            </div>
          </motion.div>
        </div>
      </section>

      {/* Navigation Sections - Mobile: Horizontal scroll, Desktop: Sticky sidebar */}
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
                      ? 'bg-[#A8B5FF]/10 text-[#A8B5FF]'
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
          <div className="prose prose-slate max-w-none">
            {/* Section 1: General */}
            <section id="general" className="mb-16 sm:mb-20 scroll-mt-32">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-2xl sm:text-3xl font-semibold text-[#2D3748] mb-6 sm:mb-8 pb-4 border-b border-gray-200">
                  1. Общие положения
                </h2>
                <div className="space-y-4 text-[#718096] leading-relaxed">
                  <p className="text-sm sm:text-base">
                    Настоящая Политика конфиденциальности персональных данных (далее — Политика) действует 
                    в отношении всей информации, размещённой на сайте в сети Интернет по адресу 
                    <span className="font-medium text-[#2D3748]"> emotional-balance.ru</span>, которую пользователи 
                    могут получить о Пользователе во время использования сайта, его сервисов, программ и продуктов.
                  </p>
                  <p className="text-sm sm:text-base">
                    Использование сервисов платформы «Эмоциональный баланс» означает безоговорочное согласие 
                    Пользователя с настоящей Политикой и указанными в ней условиями обработки его персональной 
                    информации. В случае несогласия с этими условиями Пользователь должен воздержаться от 
                    использования сервисов.
                  </p>
                  <div className="bg-gradient-to-r from-[#A8B5FF]/5 to-[#C8F5E8]/5 rounded-2xl p-6 border border-[#A8B5FF]/10 my-6">
                    <p className="text-sm sm:text-base text-[#2D3748] font-medium mb-2">
                      Основные принципы обработки персональных данных:
                    </p>
                    <ul className="space-y-2 text-sm sm:text-base">
                      <li className="flex items-start gap-2">
                        <ChevronRight className="w-5 h-5 text-[#A8B5FF] flex-shrink-0 mt-0.5" />
                        <span>Обработка персональных данных осуществляется на законной и справедливой основе</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ChevronRight className="w-5 h-5 text-[#A8B5FF] flex-shrink-0 mt-0.5" />
                        <span>Персональные данные не раскрываются третьим лицам без согласия субъекта</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ChevronRight className="w-5 h-5 text-[#A8B5FF] flex-shrink-0 mt-0.5" />
                        <span>Определение конкретных законных целей до начала обработки персональных данных</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ChevronRight className="w-5 h-5 text-[#A8B5FF] flex-shrink-0 mt-0.5" />
                        <span>Обработка только тех персональных данных, которые необходимы для целей обработки</span>
                      </li>
                    </ul>
                  </div>
                  <p className="text-sm sm:text-base">
                    Администрация платформы принимает необходимые организационные и технические меры для защиты 
                    персональной информации Пользователя от неправомерного или случайного доступа, уничтожения, 
                    изменения, блокирования, копирования, распространения, а также от иных неправомерных действий 
                    третьих лиц.
                  </p>
                </div>
              </motion.div>
            </section>

            {/* Section 2: Data Collection */}
            <section id="data-collection" className="mb-16 sm:mb-20 scroll-mt-32">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-2xl sm:text-3xl font-semibold text-[#2D3748] mb-6 sm:mb-8 pb-4 border-b border-gray-200">
                  2. Какие данные мы собираем
                </h2>
                <div className="space-y-6 text-[#718096] leading-relaxed">
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-[#2D3748] mb-3">
                      2.1. Данные, предоставляемые при регистрации
                    </h3>
                    <p className="text-sm sm:text-base mb-3">
                      При создании учётной записи на платформе мы собираем следующую информацию:
                    </p>
                    <ul className="space-y-2 text-sm sm:text-base ml-6">
                      <li className="list-disc">Имя и фамилия (или псевдоним)</li>
                      <li className="list-disc">Адрес электронной почты</li>
                      <li className="list-disc">Номер телефона (опционально)</li>
                      <li className="list-disc">Дата рождения</li>
                      <li className="list-disc">Пароль в зашифрованном виде</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-[#2D3748] mb-3">
                      2.2. Данные, собираемые автоматически
                    </h3>
                    <p className="text-sm sm:text-base mb-3">
                      При использовании платформы автоматически собираются следующие данные:
                    </p>
                    <ul className="space-y-2 text-sm sm:text-base ml-6">
                      <li className="list-disc">IP-адрес</li>
                      <li className="list-disc">Информация об устройстве (тип, модель, операционная система)</li>
                      <li className="list-disc">Тип и версия браузера</li>
                      <li className="list-disc">Данные о посещённых страницах и времени посещения</li>
                      <li className="list-disc">Реферер (адрес страницы, с которой был осуществлён переход)</li>
                      <li className="list-disc">Cookies и аналогичные технологии отслеживания</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-[#2D3748] mb-3">
                      2.3. Данные о консультациях
                    </h3>
                    <p className="text-sm sm:text-base mb-3">
                      В процессе использования услуг психологической помощи мы собираем:
                    </p>
                    <ul className="space-y-2 text-sm sm:text-base ml-6">
                      <li className="list-disc">Информация о записи на консультации (дата, время, специалист)</li>
                      <li className="list-disc">Заметки специалиста (хранятся в зашифрованном виде)</li>
                      <li className="list-disc">Результаты тестов и опросников (если вы их проходили)</li>
                      <li className="list-disc">История платежей</li>
                    </ul>
                  </div>

                  <div className="bg-gradient-to-r from-[#FFD4B5]/5 to-[#FFC97F]/5 rounded-2xl p-6 border border-[#FFD4B5]/10">
                    <p className="text-sm sm:text-base text-[#2D3748] font-medium mb-2">
                      ⚠️ Важно знать:
                    </p>
                    <p className="text-sm sm:text-base text-[#718096]">
                      Мы НЕ записываем аудио или видео консультаций без вашего явного письменного согласия. 
                      Запись консультации может производиться только в образовательных целях и только после 
                      получения вашего согласия в письменной форме.
                    </p>
                  </div>
                </div>
              </motion.div>
            </section>

            {/* Section 3: Data Usage */}
            <section id="data-usage" className="mb-16 sm:mb-20 scroll-mt-32">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-2xl sm:text-3xl font-semibold text-[#2D3748] mb-6 sm:mb-8 pb-4 border-b border-gray-200">
                  3. Как мы используем ваши данные
                </h2>
                <div className="space-y-6 text-[#718096] leading-relaxed">
                  <p className="text-sm sm:text-base">
                    Персональные данные пользователей используются исключительно в следующих целях:
                  </p>

                  <div className="space-y-4">
                    <div className="bg-white border border-gray-200 rounded-xl p-5">
                      <h4 className="text-base sm:text-lg font-semibold text-[#2D3748] mb-2">
                        Предоставление услуг
                      </h4>
                      <p className="text-sm sm:text-base">
                        Для организации и проведения онлайн-консультаций, предоставления доступа к интерактивным 
                        инструментам и ресурсам платформы.
                      </p>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-xl p-5">
                      <h4 className="text-base sm:text-lg font-semibold text-[#2D3748] mb-2">
                        Связь с пользователем
                      </h4>
                      <p className="text-sm sm:text-base">
                        Для отправки уведомлений о предстоящих консультациях, ответов на ваши вопросы, 
                        предоставления технической поддержки.
                      </p>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-xl p-5">
                      <h4 className="text-base sm:text-lg font-semibold text-[#2D3748] mb-2">
                        Улучшение сервиса
                      </h4>
                      <p className="text-sm sm:text-base">
                        Для анализа использования платформы, выявления и устранения ошибок, улучшения 
                        функциональности и пользовательского опыта.
                      </p>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-xl p-5">
                      <h4 className="text-base sm:text-lg font-semibold text-[#2D3748] mb-2">
                        Безопасность
                      </h4>
                      <p className="text-sm sm:text-base">
                        Для предотвращения мошенничества, выявления и пред��твращения технических неполадок, 
                        защиты прав и безопасности пользователей.
                      </p>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-xl p-5">
                      <h4 className="text-base sm:text-lg font-semibold text-[#2D3748] mb-2">
                        Выполнение юридических обязательств
                      </h4>
                      <p className="text-sm sm:text-base">
                        Для соблюдения применимого законодательства, включая налоговое и бухгалтерское 
                        законодательство.
                      </p>
                    </div>
                  </div>

                  <p className="text-sm sm:text-base pt-4">
                    Мы <span className="font-medium text-[#2D3748]">не используем</span> ваши персональные данные 
                    для рекламных рассылок без вашего явного согласия. Вы можете отказаться от получения 
                    информационных пи��ем в любой момент, кликнув на ссылку «Отписаться» в письме.
                  </p>
                </div>
              </motion.div>
            </section>

            {/* Section 4: Data Storage */}
            <section id="data-storage" className="mb-16 sm:mb-20 scroll-mt-32">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-2xl sm:text-3xl font-semibold text-[#2D3748] mb-6 sm:mb-8 pb-4 border-b border-gray-200">
                  4. Хранение данных
                </h2>
                <div className="space-y-6 text-[#718096] leading-relaxed">
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-[#2D3748] mb-3">
                      4.1. Место хранения
                    </h3>
                    <p className="text-sm sm:text-base">
                      Персональные данные пользователей хранятся на защищённых серверах, расположенных на 
                      территории Российской Федерации. Мы используем надёжных хостинг-провайдеров, 
                      соответствующих требованиям Федерального закона № 152-ФЗ «О персональных данных».
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-[#2D3748] mb-3">
                      4.2. Сроки хранения
                    </h3>
                    <div className="space-y-3 text-sm sm:text-base">
                      <p>Мы храним ваши персональные данные в течение следующих сроков:</p>
                      <ul className="space-y-2 ml-6">
                        <li className="list-disc">
                          <span className="font-medium text-[#2D3748]">Учётная запись:</span> до момента её удаления
                        </li>
                        <li className="list-disc">
                          <span className="font-medium text-[#2D3748]">История консультаций:</span> 5 лет с момента 
                          последней консультации (в соответствии с профессиональными стандартами психологов)
                        </li>
                        <li className="list-disc">
                          <span className="font-medium text-[#2D3748]">Платёжная информация:</span> 3 года 
                          (для соблюдения налогового законодательства)
                        </li>
                        <li className="list-disc">
                          <span className="font-medium text-[#2D3748]">Логи доступа:</span> 6 месяцев
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-[#2D3748] mb-3">
                      4.3. Меры безопасности
                    </h3>
                    <p className="text-sm sm:text-base mb-3">
                      Для защиты ваших данных мы применяем следующие меры:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-gradient-to-br from-[#A8B5FF]/5 to-transparent rounded-xl p-4 border border-[#A8B5FF]/10">
                        <p className="text-sm font-medium text-[#2D3748] mb-1">🔒 Шифрование</p>
                        <p className="text-xs sm:text-sm text-[#718096]">
                          SSL/TLS шифрование всех передаваемых данных
                        </p>
                      </div>
                      <div className="bg-gradient-to-br from-[#C8F5E8]/5 to-transparent rounded-xl p-4 border border-[#C8F5E8]/10">
                        <p className="text-sm font-medium text-[#2D3748] mb-1">🛡️ Защита паролей</p>
                        <p className="text-xs sm:text-sm text-[#718096]">
                          Хеширование паролей с использованием bcrypt
                        </p>
                      </div>
                      <div className="bg-gradient-to-br from-[#FFD4B5]/5 to-transparent rounded-xl p-4 border border-[#FFD4B5]/10">
                        <p className="text-sm font-medium text-[#2D3748] mb-1">🔐 Контроль доступа</p>
                        <p className="text-xs sm:text-sm text-[#718096]">
                          Ограниченный доступ сотрудников к данным
                        </p>
                      </div>
                      <div className="bg-gradient-to-br from-[#7FD99A]/5 to-transparent rounded-xl p-4 border border-[#7FD99A]/10">
                        <p className="text-sm font-medium text-[#2D3748] mb-1">💾 Резервное копирование</p>
                        <p className="text-xs sm:text-sm text-[#718096]">
                          Регулярное создание зашифрованных бэкапов
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </section>

            {/* Section 5: Third Party */}
            <section id="third-party" className="mb-16 sm:mb-20 scroll-mt-32">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-2xl sm:text-3xl font-semibold text-[#2D3748] mb-6 sm:mb-8 pb-4 border-b border-gray-200">
                  5. Передача данных третьим лицам
                </h2>
                <div className="space-y-6 text-[#718096] leading-relaxed">
                  <p className="text-sm sm:text-base">
                    Мы <span className="font-medium text-[#2D3748]">не продаём и не ��ередаём</span> ваши персональные 
                    данные третьим лицам за исключением случаев, описанных ниже:
                  </p>

                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-[#2D3748] mb-3">
                      5.1. Сервис-провайдеры
                    </h3>
                    <p className="text-sm sm:text-base mb-3">
                      Мы можем передавать данные компаниям, которые помогают нам предоставлять услуги:
                    </p>
                    <ul className="space-y-2 text-sm sm:text-base ml-6">
                      <li className="list-disc">Хостинг-провайдеры (для хранения данных)</li>
                      <li className="list-disc">Платёжные системы (для обработки платежей)</li>
                      <li className="list-disc">Сервисы видеосвязи (для проведения онлайн-консультаций)</li>
                      <li className="list-disc">Email-сервисы (для отправки уведомлений)</li>
                    </ul>
                    <p className="text-sm sm:text-base mt-3">
                      Все эти компании обязаны соблюдать конфиденциальность и могут использовать данные только 
                      для предоставления услуг нашей платформе.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-[#2D3748] mb-3">
                      5.2. Юридические требования
                    </h3>
                    <p className="text-sm sm:text-base">
                      Мы можем раскрыть вашу информацию, если это требуется по закону, по решению суда, 
                      по запросу правоохранительных органов или для защиты прав и безопасности нашей платформы 
                      и пользователей.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-[#2D3748] mb-3">
                      5.3. С вашего согласия
                    </h3>
                    <p className="text-sm sm:text-base">
                      В иных случаях мы можем передавать ваши данные третьим лицам только с вашего явного 
                      письменного согласия.
                    </p>
                  </div>

                  <div className="bg-gradient-to-r from-[#C8F5E8]/5 to-[#7FD99A]/5 rounded-2xl p-6 border border-[#C8F5E8]/10">
                    <p className="text-sm sm:text-base text-[#2D3748] font-medium mb-2">
                      ✅ Гарантия конфиденциальности:
                    </p>
                    <p className="text-sm sm:text-base text-[#718096]">
                      Информация о содержании ваших консультаций с психологом является строго конфиденциальной 
                      и не передаётся никому, кроме вашего психолога. Это защищено профессиональной тайной психолога.
                    </p>
                  </div>
                </div>
              </motion.div>
            </section>

            {/* Section 6: Your Rights */}
            <section id="your-rights" className="mb-16 sm:mb-20 scroll-mt-32">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-2xl sm:text-3xl font-semibold text-[#2D3748] mb-6 sm:mb-8 pb-4 border-b border-gray-200">
                  6. Ваши права
                </h2>
                <div className="space-y-6 text-[#718096] leading-relaxed">
                  <p className="text-sm sm:text-base">
                    В соответствии с законодательством о защите персональных данных вы имеете следующие права:
                  </p>

                  <div className="grid grid-cols-1 gap-4">
                    <div className="bg-white border-2 border-[#A8B5FF]/20 rounded-2xl p-5 hover:border-[#A8B5FF]/40 transition-colors">
                      <h4 className="text-base sm:text-lg font-semibold text-[#2D3748] mb-2 flex items-center gap-2">
                        <span className="text-[#A8B5FF]">📋</span> Право на доступ
                      </h4>
                      <p className="text-sm sm:text-base">
                        Вы можете запросить копию всех персональных данных, которые мы храним о вас. 
                        Мы предоставим эту информацию в течение 30 дней.
                      </p>
                    </div>

                    <div className="bg-white border-2 border-[#FFD4B5]/20 rounded-2xl p-5 hover:border-[#FFD4B5]/40 transition-colors">
                      <h4 className="text-base sm:text-lg font-semibold text-[#2D3748] mb-2 flex items-center gap-2">
                        <span className="text-[#FFD4B5]">✏️</span> Право на исправление
                      </h4>
                      <p className="text-sm sm:text-base">
                        Вы можете исправить неточные или неполные данные. Большинство данных можно изменить 
                        в настройках профиля.
                      </p>
                    </div>

                    <div className="bg-white border-2 border-[#C8F5E8]/20 rounded-2xl p-5 hover:border-[#C8F5E8]/40 transition-colors">
                      <h4 className="text-base sm:text-lg font-semibold text-[#2D3748] mb-2 flex items-center gap-2">
                        <span className="text-[#7FD99A]">🗑️</span> Право ��а удаление
                      </h4>
                      <p className="text-sm sm:text-base">
                        Вы можете удалить свою учётную запись и персональные данные в любой момент. 
                        Обратите внимание, что некоторые данные мы обязаны хранить по закону (например, 
                        историю платежей).
                      </p>
                    </div>

                    <div className="bg-white border-2 border-[#FFC97F]/20 rounded-2xl p-5 hover:border-[#FFC97F]/40 transition-colors">
                      <h4 className="text-base sm:text-lg font-semibold text-[#2D3748] mb-2 flex items-center gap-2">
                        <span className="text-[#FFC97F]">⏸️</span> Право на ограничение обработки
                      </h4>
                      <p className="text-sm sm:text-base">
                        Вы можете запросить временное ограничение обработки ваших данных в определённых ситуациях.
                      </p>
                    </div>

                    <div className="bg-white border-2 border-[#A8B5FF]/20 rounded-2xl p-5 hover:border-[#A8B5FF]/40 transition-colors">
                      <h4 className="text-base sm:text-lg font-semibold text-[#2D3748] mb-2 flex items-center gap-2">
                        <span className="text-[#A8B5FF]">📤</span> Право на переносимость данных
                      </h4>
                      <p className="text-sm sm:text-base">
                        Вы можете получить свои данные в структурированном, машиночитаемом формате 
                        для передачи другому поставщику услуг.
                      </p>
                    </div>

                    <div className="bg-white border-2 border-[#FFD4B5]/20 rounded-2xl p-5 hover:border-[#FFD4B5]/40 transition-colors">
                      <h4 className="text-base sm:text-lg font-semibold text-[#2D3748] mb-2 flex items-center gap-2">
                        <span className="text-[#FFD4B5]">🚫</span> Право на возражение
                      </h4>
                      <p className="text-sm sm:text-base">
                        Вы можете возразить против обработки ваших данных в маркетинговых целях в любое время.
                      </p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-[#A8B5FF]/10 to-[#C8F5E8]/10 rounded-2xl p-6 border border-[#A8B5FF]/20 mt-6">
                    <p className="text-sm sm:text-base text-[#2D3748] font-medium mb-2">
                      Как реализовать свои права:
                    </p>
                    <p className="text-sm sm:text-base text-[#718096] mb-3">
                      Для реализации любого из перечисленных прав отправьте запрос на email:{' '}
                      <a href="mailto:privacy@emotional-balance.ru" className="text-[#A8B5FF] hover:underline">
                        privacy@emotional-balance.ru
                      </a>
                    </p>
                    <p className="text-sm text-[#718096]">
                      Мы ответим на ваш запрос в течение 30 дней. В некоторых случаях мы можем попросить 
                      вас подтвердить вашу личность перед выполнением запроса.
                    </p>
                  </div>
                </div>
              </motion.div>
            </section>

            {/* Section 7: Cookies */}
            <section id="cookies" className="mb-16 sm:mb-20 scroll-mt-32">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-2xl sm:text-3xl font-semibold text-[#2D3748] mb-6 sm:mb-8 pb-4 border-b border-gray-200">
                  7. Cookies и похожие технологии
                </h2>
                <div className="space-y-6 text-[#718096] leading-relaxed">
                  <p className="text-sm sm:text-base">
                    Мы используем cookies и аналогичные технологии отслеживания для улучшения работы платформы 
                    и анализа использования сервисов.
                  </p>

                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-[#2D3748] mb-3">
                      7.1. Что такое cookies
                    </h3>
                    <p className="text-sm sm:text-base">
                      Cookies — это небольшие текстовые файлы, которые сохраня��тся на вашем устройстве при 
                      посещении сайта. Они помогают сайту запомнить информацию о вашем визите.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-[#2D3748] mb-3">
                      7.2. Какие cookies мы используем
                    </h3>
                    <div className="space-y-3">
                      <div className="bg-white border border-gray-200 rounded-xl p-4">
                        <h4 className="text-sm sm:text-base font-semibold text-[#2D3748] mb-1">
                          Необходимые cookies
                        </h4>
                        <p className="text-sm text-[#718096]">
                          Требуются для базовой работы сайта (авторизация, корзина, безопасность). 
                          Эти cookies нельзя отключить.
                        </p>
                      </div>

                      <div className="bg-white border border-gray-200 rounded-xl p-4">
                        <h4 className="text-sm sm:text-base font-semibold text-[#2D3748] mb-1">
                          Функциональные cookies
                        </h4>
                        <p className="text-sm text-[#718096]">
                          Запоминают ваши предпочтения (язык, регион, настройки). Улучшают ваш опыт использования.
                        </p>
                      </div>

                      <div className="bg-white border border-gray-200 rounded-xl p-4">
                        <h4 className="text-sm sm:text-base font-semibold text-[#2D3748] mb-1">
                          Аналитические cookies
                        </h4>
                        <p className="text-sm text-[#718096]">
                          Помогают понять, как пользователи взаимодействуют с сайтом. Мы используем Google Analytics.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-[#2D3748] mb-3">
                      7.3. Управление cookies
                    </h3>
                    <p className="text-sm sm:text-base mb-3">
                      Вы можете управлять cookies через настройки браузера. Обратите внимание, что отключение 
                      cookies может ограничить функциональность платформы.
                    </p>
                    <p className="text-sm sm:text-base">
                      Инструкции по управлению cookies в популярных браузерах:{' '}
                      <a href="https://support.google.com/chrome" target="_blank" rel="noopener noreferrer" className="text-[#A8B5FF] hover:underline">Chrome</a>,{' '}
                      <a href="https://support.mozilla.org" target="_blank" rel="noopener noreferrer" className="text-[#A8B5FF] hover:underline">Firefox</a>,{' '}
                      <a href="https://support.apple.com/safari" target="_blank" rel="noopener noreferrer" className="text-[#A8B5FF] hover:underline">Safari</a>,{' '}
                      <a href="https://support.microsoft.com/edge" target="_blank" rel="noopener noreferrer" className="text-[#A8B5FF] hover:underline">Edge</a>
                    </p>
                  </div>
                </div>
              </motion.div>
            </section>

            {/* Section 8: Contacts */}
            <section id="contacts" className="mb-16 sm:mb-20 scroll-mt-32">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-2xl sm:text-3xl font-semibold text-[#2D3748] mb-6 sm:mb-8 pb-4 border-b border-gray-200">
                  8. Контакты
                </h2>
                <div className="space-y-6 text-[#718096] leading-relaxed">
                  <p className="text-sm sm:text-base">
                    Если у вас есть вопросы о настоящей Политике конфиденциальности, обработке ваших персональных 
                    данных или вы хотите реализовать свои права, свяжитесь с нами:
                  </p>

                  <div className="bg-gradient-to-br from-[#A8B5FF]/5 via-[#FFD4B5]/5 to-[#C8F5E8]/5 rounded-2xl p-6 sm:p-8 border border-gray-200">
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-[#718096] mb-1">Организация:</p>
                        <p className="text-base sm:text-lg font-semibold text-[#2D3748]">
                          ООО «Эмоциональный баланс»
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-[#718096] mb-1">Email для вопросов о конфиденциальности:</p>
                        <a 
                          href="mailto:privacy@emotional-balance.ru" 
                          className="text-base sm:text-lg font-medium text-[#A8B5FF] hover:underline flex items-center gap-2"
                        >
                          <Mail className="w-5 h-5" />
                          privacy@emotional-balance.ru
                        </a>
                      </div>

                      <div>
                        <p className="text-sm text-[#718096] mb-1">Общий email:</p>
                        <a 
                          href="mailto:help@emotional-balance.ru" 
                          className="text-base sm:text-lg font-medium text-[#A8B5FF] hover:underline flex items-center gap-2"
                        >
                          <Mail className="w-5 h-5" />
                          help@emotional-balance.ru
                        </a>
                      </div>

                      <div>
                        <p className="text-sm text-[#718096] mb-1">Адрес:</p>
                        <p className="text-base text-[#2D3748]">
                          123456, г. Москва, ул. Примерная, д. 1, офис 101
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-[#718096] mb-1">ИНН:</p>
                        <p className="text-base text-[#2D3748]">1234567890</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-[#FFD4B5]/5 to-[#FFC97F]/5 rounded-2xl p-6 border border-[#FFD4B5]/10">
                    <p className="text-sm sm:text-base text-[#2D3748] font-medium mb-2">
                      Обновления Политики конфиденциальности:
                    </p>
                    <p className="text-sm sm:text-base text-[#718096]">
                      Мы можем периодически обновлять эту Политику. При внесении существенных изменений мы 
                      уведомим вас по email или через уведомление на платформе за 30 дней до вступления изменений 
                      в силу. Рекомендуем периодически проверять эту страницу для ознакомления с актуальной версией.
                    </p>
                  </div>
                </div>
              </motion.div>
            </section>
          </div>

          {/* Bottom Navigation */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-sm text-[#718096] text-center mb-6">
              Последнее обновление: 28 января 2026 • Версия 1.0
            </p>
            <div className="flex justify-center">
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#A8B5FF] to-[#C8F5E8] text-white font-medium shadow-[0_4px_12px_-2px_rgba(168,181,255,0.4)] hover:shadow-[0_6px_16px_-2px_rgba(168,181,255,0.5)] active:scale-[0.98] transition-all"
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
