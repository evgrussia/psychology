import { useState } from 'react';
import { motion } from 'motion/react';
import { FileText, ChevronRight, Calendar, Mail, CheckCircle2, AlertCircle, Info } from 'lucide-react';

export default function TermsPage() {
  const [activeSection, setActiveSection] = useState('subject');

  const sections = [
    { id: 'subject', title: 'Предмет договора' },
    { id: 'rights-obligations', title: 'Права и обязанности' },
    { id: 'services-prices', title: 'Услуги и цены' },
    { id: 'payment', title: 'Порядок оплаты' },
    { id: 'cancellation', title: 'Отмена и перенос' },
    { id: 'confidentiality', title: 'Конфиденциальность' },
    { id: 'liability', title: 'Ответственность' },
    { id: 'disputes', title: 'Разрешение споров' },
    { id: 'changes', title: 'Изменение условий' },
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
        <div className="absolute inset-0 bg-gradient-to-b from-[#FFD4B5]/10 to-white -z-10" />
        
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#FFD4B5]/20 to-[#FFC97F]/20 flex items-center justify-center mx-auto mb-6 shadow-[0_4px_16px_-4px_rgba(255,212,181,0.3)]">
              <FileText className="w-8 h-8 text-[#FFD4B5]" />
            </div>
            <h1 className="text-[30px] sm:text-4xl lg:text-5xl font-bold text-[#2D3748] mb-4 leading-tight">
              Публичная оферта<br className="sm:hidden" /> пользовательское соглашение
            </h1>
            <p className="text-sm sm:text-base text-[#718096] mb-6">
              Последнее обновление: 28 января 2026
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FFD4B5]/10 text-sm text-[#2D3748]">
              <Calendar className="w-4 h-4 text-[#FFD4B5]" />
              Вступает в силу: 1 февраля 2026
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
                      ? 'bg-[#FFD4B5]/10 text-[#FFD4B5]'
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
            {/* Introduction */}
            <div className="mb-12 sm:mb-16 bg-gradient-to-r from-[#FFD4B5]/5 to-[#FFC97F]/5 rounded-2xl p-6 sm:p-8 border border-[#FFD4B5]/20">
              <p className="text-sm sm:text-base text-[#718096] leading-relaxed mb-4">
                Настоящее пользовательское соглашение (далее — Соглашение) является публичной офертой 
                в соответствии со ст. 437 Гражданского кодекса РФ и определяет условия использования 
                онлайн-платформы «Эмоциональный баланс» и получения услуг психологической помощи.
              </p>
              <p className="text-sm sm:text-base text-[#2D3748] font-medium">
                Начало использования платформы означает полное и безоговорочное принятие условий 
                настоящего Соглашения.
              </p>
            </div>

            {/* Section 1: Subject */}
            <section id="subject" className="mb-16 sm:mb-20 scroll-mt-32">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-2xl sm:text-3xl font-semibold text-[#2D3748] mb-6 sm:mb-8 pb-4 border-b border-gray-200">
                  1. Предмет договора
                </h2>
                <div className="space-y-6 text-[#718096] leading-relaxed">
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-[#2D3748] mb-3">
                      1.1. Стороны договора
                    </h3>
                    <div className="space-y-3 text-sm sm:text-base">
                      <p>
                        <span className="font-medium text-[#2D3748]">Исполнитель:</span> ООО «Эмоциональный баланс» 
                        (далее — Платформа) предоставляет услуги онлайн-консультаций с психологами через 
                        интернет-платформу emotional-balance.ru.
                      </p>
                      <p>
                        <span className="font-medium text-[#2D3748]">Заказчик:</span> физическое лицо, акцептовавшее 
                        настоящую оферту путём регистрации на Платформе и/или оплаты услуг (далее — Пользователь).
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-[#2D3748] mb-3">
                      1.2. Услуги платформы
                    </h3>
                    <p className="text-sm sm:text-base mb-3">
                      Платформа предоставляет следующие услуги:
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-start gap-3 bg-white border border-gray-200 rounded-xl p-4">
                        <CheckCircle2 className="w-5 h-5 text-[#FFD4B5] flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm sm:text-base font-medium text-[#2D3748] mb-1">
                            Онлайн-консультации с психологами
                          </p>
                          <p className="text-sm text-[#718096]">
                            Индивидуальные видео-сессии с квалифицированными специалистами
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 bg-white border border-gray-200 rounded-xl p-4">
                        <CheckCircle2 className="w-5 h-5 text-[#FFD4B5] flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm sm:text-base font-medium text-[#2D3748] mb-1">
                            Доступ к интерактивным инструментам
                          </p>
                          <p className="text-sm text-[#718096]">
                            Упражнения, тесты, дневники эмоций и другие материалы
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 bg-white border border-gray-200 rounded-xl p-4">
                        <CheckCircle2 className="w-5 h-5 text-[#FFD4B5] flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm sm:text-base font-medium text-[#2D3748] mb-1">
                            Образовательные материалы
                          </p>
                          <p className="text-sm text-[#718096]">
                            Статьи, видео и аудио-материалы по психологии и саморазвитию
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-[#2D3748] mb-3">
                      1.3. Момент заключения договора
                    </h3>
                    <p className="text-sm sm:text-base">
                      Договор считается заключённым с момента акцепта настоящей оферты, который происходит 
                      при совершении одного из следующих действий:
                    </p>
                    <ul className="space-y-2 text-sm sm:text-base ml-6 mt-3">
                      <li className="list-disc">Регистрация на Платформе</li>
                      <li className="list-disc">Оплата любой услуги</li>
                      <li className="list-disc">Запись на консультацию</li>
                      <li className="list-disc">Использование платных функций Платформы</li>
                    </ul>
                  </div>

                  <div className="bg-gradient-to-r from-[#A8B5FF]/5 to-[#C8F5E8]/5 rounded-2xl p-6 border border-[#A8B5FF]/10">
                    <div className="flex items-start gap-3">
                      <Info className="w-6 h-6 text-[#A8B5FF] flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm sm:text-base text-[#2D3748] font-medium mb-2">
                          Важно понимать:
                        </p>
                        <p className="text-sm sm:text-base text-[#718096]">
                          Услуги психологической помощи не являются медицинскими услугами. Психологи 
                          Платформы не ставят диагнозы и не назначают лечение. При наличии психических 
                          расстройств необходимо обратиться к психиатру или психотерапевту.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </section>

            {/* Section 2: Rights and Obligations */}
            <section id="rights-obligations" className="mb-16 sm:mb-20 scroll-mt-32">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-2xl sm:text-3xl font-semibold text-[#2D3748] mb-6 sm:mb-8 pb-4 border-b border-gray-200">
                  2. Права и обязанности сторон
                </h2>
                <div className="space-y-6 text-[#718096] leading-relaxed">
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-[#2D3748] mb-4">
                      2.1. Платформа обязуется:
                    </h3>
                    <div className="space-y-3">
                      {[
                        'Предоставить доступ к онлайн-консультациям с квалифицированными психологами',
                        'Обеспечить работоспособность Платформы в режиме 24/7 (за исключением технических работ)',
                        'Сохранять конфиденциальность персональных данных Пользователя',
                        'Предоставить техническую поддержку по вопросам использования Платформы',
                        'Информировать о предстоящих консультациях и изменениях в расписании',
                        'Обеспечить качество предоставляемых услуг в соответствии с профессиональными стандартами'
                      ].map((item, index) => (
                        <div key={index} className="flex items-start gap-2 text-sm sm:text-base">
                          <span className="w-6 h-6 rounded-lg bg-[#FFD4B5]/10 flex items-center justify-center text-[#FFD4B5] text-xs font-semibold flex-shrink-0 mt-0.5">
                            {index + 1}
                          </span>
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-[#2D3748] mb-4">
                      2.2. Платформа имеет право:
                    </h3>
                    <ul className="space-y-2 text-sm sm:text-base ml-6">
                      <li className="list-disc">
                        Изменять условия настоящего Соглашения с уведомлением Пользователей за 7 дней
                      </li>
                      <li className="list-disc">
                        Приостанавливать работу Платформы для проведения технических работ с предварительным 
                        уведомлением
                      </li>
                      <li className="list-disc">
                        Отказать в предоставлении услуг при нарушении Пользователем условий Соглашения
                      </li>
                      <li className="list-disc">
                        Блокировать учётную запись при выявлении мошенничества или деструктивного поведения
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-[#2D3748] mb-4">
                      2.3. Пользователь обязуется:
                    </h3>
                    <div className="space-y-3">
                      {[
                        'Предоставлять достоверную информацию при регистрации',
                        'Своевременно оплачивать услуги в соответствии с выбранным тарифом',
                        'Являться на консультации вовремя или предупреждать об отмене заранее',
                        'Соблюдать этические нормы общения с психологами и сотрудниками Платформы',
                        'Не распространять конфиденциальную информацию о других пользователях',
                        'Использовать Платформу только в законных целях'
                      ].map((item, index) => (
                        <div key={index} className="flex items-start gap-2 text-sm sm:text-base">
                          <span className="w-6 h-6 rounded-lg bg-[#C8F5E8]/10 flex items-center justify-center text-[#7FD99A] text-xs font-semibold flex-shrink-0 mt-0.5">
                            {index + 1}
                          </span>
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-[#2D3748] mb-4">
                      2.4. Пользователь имеет право:
                    </h3>
                    <ul className="space-y-2 text-sm sm:text-base ml-6">
                      <li className="list-disc">
                        Получать качественные психологические услуги в соответствии с выбранным тарифом
                      </li>
                      <li className="list-disc">
                        Выбирать психолога и менять его при необходимости
                      </li>
                      <li className="list-disc">
                        Отменять или переносить консультации в соответствии с п. 5 настоящего Соглашения
                      </li>
                      <li className="list-disc">
                        Требовать возврата средств в случаях, предусмотренных настоящим Соглашением
                      </li>
                      <li className="list-disc">
                        Удалить свою учётную запись в любое время
                      </li>
                    </ul>
                  </div>
                </div>
              </motion.div>
            </section>

            {/* Section 3: Services and Prices */}
            <section id="services-prices" className="mb-16 sm:mb-20 scroll-mt-32">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-2xl sm:text-3xl font-semibold text-[#2D3748] mb-6 sm:mb-8 pb-4 border-b border-gray-200">
                  3. Услуги и цены
                </h2>
                <div className="space-y-6 text-[#718096] leading-relaxed">
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-[#2D3748] mb-4">
                      3.1. Виды услуг
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-gradient-to-br from-[#FFD4B5]/5 to-transparent rounded-xl p-5 border border-[#FFD4B5]/10">
                        <h4 className="text-base sm:text-lg font-semibold text-[#2D3748] mb-2">
                          Индивидуальные консультации
                        </h4>
                        <p className="text-sm text-[#718096] mb-3">
                          Видео-сессии продолжительностью 50 минут
                        </p>
                        <p className="text-lg font-bold text-[#2D3748]">
                          от 2 500 ₽
                        </p>
                      </div>

                      <div className="bg-gradient-to-br from-[#C8F5E8]/5 to-transparent rounded-xl p-5 border border-[#C8F5E8]/10">
                        <h4 className="text-base sm:text-lg font-semibold text-[#2D3748] mb-2">
                          Пакетные программы
                        </h4>
                        <p className="text-sm text-[#718096] mb-3">
                          4, 8 или 12 консультаций со скидкой
                        </p>
                        <p className="text-lg font-bold text-[#2D3748]">
                          от 8 900 ₽
                        </p>
                      </div>

                      <div className="bg-gradient-to-br from-[#A8B5FF]/5 to-transparent rounded-xl p-5 border border-[#A8B5FF]/10">
                        <h4 className="text-base sm:text-lg font-semibold text-[#2D3748] mb-2">
                          Первая консультация
                        </h4>
                        <p className="text-sm text-[#718096] mb-3">
                          Знакомство с психологом (30 минут)
                        </p>
                        <p className="text-lg font-bold text-[#2D3748]">
                          1 500 ₽
                        </p>
                      </div>

                      <div className="bg-gradient-to-br from-[#FFC97F]/5 to-transparent rounded-xl p-5 border border-[#FFC97F]/10">
                        <h4 className="text-base sm:text-lg font-semibold text-[#2D3748] mb-2">
                          Подписка
                        </h4>
                        <p className="text-sm text-[#718096] mb-3">
                          Неограниченный доступ к материалам
                        </p>
                        <p className="text-lg font-bold text-[#2D3748]">
                          990 ₽/мес
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-[#2D3748] mb-3">
                      3.2. Ценовая политика
                    </h3>
                    <ul className="space-y-2 text-sm sm:text-base ml-6">
                      <li className="list-disc">
                        Цены указаны в российских рублях и включают НДС (при наличии)
                      </li>
                      <li className="list-disc">
                        Стоимость услуг может варьироваться в зависимости от квалификации и опыта психолога
                      </li>
                      <li className="list-disc">
                        Платформа оставляет за собой право изменять цены с уведомлением за 14 дней
                      </li>
                      <li className="list-disc">
                        Изменение цен не распространяется на уже оплаченные услуги и действующие пакеты
                      </li>
                      <li className="list-disc">
                        Периодически могут проводиться акции и специальные предложения
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-[#2D3748] mb-3">
                      3.3. Что входит в стоимость консультации
                    </h3>
                    <div className="bg-white border border-gray-200 rounded-xl p-5">
                      <ul className="space-y-2 text-sm sm:text-base">
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-5 h-5 text-[#7FD99A] flex-shrink-0 mt-0.5" />
                          <span>Видео-сессия с психологом через защищённое соединение</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-5 h-5 text-[#7FD99A] flex-shrink-0 mt-0.5" />
                          <span>Заметки психолога после консультации (по запросу)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-5 h-5 text-[#7FD99A] flex-shrink-0 mt-0.5" />
                          <span>Домашние задания и упражнения</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-5 h-5 text-[#7FD99A] flex-shrink-0 mt-0.5" />
                          <span>Техническая поддержка во время сессии</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-5 h-5 text-[#7FD99A] flex-shrink-0 mt-0.5" />
                          <span>Доступ к образовательным материалам платформы</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </motion.div>
            </section>

            {/* Section 4: Payment */}
            <section id="payment" className="mb-16 sm:mb-20 scroll-mt-32">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-2xl sm:text-3xl font-semibold text-[#2D3748] mb-6 sm:mb-8 pb-4 border-b border-gray-200">
                  4. Порядок оплаты
                </h2>
                <div className="space-y-6 text-[#718096] leading-relaxed">
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-[#2D3748] mb-3">
                      4.1. Способы оплаты
                    </h3>
                    <p className="text-sm sm:text-base mb-4">
                      Платформа принимает оплату следующими способами:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        { name: 'Банковские карты', desc: 'Visa, Mastercard, МИР' },
                        { name: 'СБП', desc: 'Система быстрых платежей' },
                        { name: 'Электронные кошельки', desc: 'ЮMoney, QIWI' },
                        { name: 'Банковский перевод', desc: 'По реквизитам компании' }
                      ].map((method, index) => (
                        <div key={index} className="bg-white border border-gray-200 rounded-xl p-4">
                          <p className="text-sm sm:text-base font-medium text-[#2D3748]">{method.name}</p>
                          <p className="text-xs sm:text-sm text-[#718096]">{method.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-[#2D3748] mb-3">
                      4.2. Момент оплаты
                    </h3>
                    <ul className="space-y-2 text-sm sm:text-base ml-6">
                      <li className="list-disc">
                        Оплата индивидуальных консультаций производится не позднее чем за 24 часа до начала сессии
                      </li>
                      <li className="list-disc">
                        Оплата пакетных программ производится единовременно при покупке пакета
                      </li>
                      <li className="list-disc">
                        Подписка оплачивается ежемесячно с автоматическим продлением
                      </li>
                      <li className="list-disc">
                        При отсутствии оплаты консультация может быть отменена
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-[#2D3748] mb-3">
                      4.3. Подтверждение оплаты
                    </h3>
                    <p className="text-sm sm:text-base">
                      После успешной оплаты Пользователь получает:
                    </p>
                    <ul className="space-y-2 text-sm sm:text-base ml-6 mt-3">
                      <li className="list-disc">Электронный чек на email</li>
                      <li className="list-disc">Уведомление в личном кабинете</li>
                      <li className="list-disc">SMS-подтверждение (опционально)</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-[#2D3748] mb-3">
                      4.4. Возврат средств
                    </h3>
                    <div className="bg-gradient-to-r from-[#FFD4B5]/5 to-[#FFC97F]/5 rounded-2xl p-6 border border-[#FFD4B5]/10">
                      <p className="text-sm sm:text-base mb-3">
                        Возврат средств возможен в следующих случаях:
                      </p>
                      <ul className="space-y-2 text-sm sm:text-base">
                        <li className="flex items-start gap-2">
                          <ChevronRight className="w-5 h-5 text-[#FFD4B5] flex-shrink-0 mt-0.5" />
                          <span>
                            Отмена консультации по инициативе Платформы — 100% возврат
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <ChevronRight className="w-5 h-5 text-[#FFD4B5] flex-shrink-0 mt-0.5" />
                          <span>
                            Отмена за 24+ часа до начала — 100% возврат или перенос
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <ChevronRight className="w-5 h-5 text-[#FFD4B5] flex-shrink-0 mt-0.5" />
                          <span>
                            Отмена за 12-24 часа — 50% возврат
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <ChevronRight className="w-5 h-5 text-[#FFD4B5] flex-shrink-0 mt-0.5" />
                          <span>
                            Отмена менее чем за 12 часов — возврат не производится
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <ChevronRight className="w-5 h-5 text-[#FFD4B5] flex-shrink-0 mt-0.5" />
                          <span>
                            Неиспользованные консультации из пакета — пропорциональный возврат в течение 14 дней
                          </span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-[#A8B5FF]/5 to-[#C8F5E8]/5 rounded-2xl p-6 border border-[#A8B5FF]/10">
                    <p className="text-sm sm:text-base text-[#2D3748] font-medium mb-2">
                      Срок возврата:
                    </p>
                    <p className="text-sm sm:text-base text-[#718096]">
                      Возврат средств осуществляется на банковскую карту или счёт, с которого была произведена 
                      оплата, в течение 5-10 рабочих дней с момента одобрения заявки на возврат.
                    </p>
                  </div>
                </div>
              </motion.div>
            </section>

            {/* Section 5: Cancellation */}
            <section id="cancellation" className="mb-16 sm:mb-20 scroll-mt-32">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-2xl sm:text-3xl font-semibold text-[#2D3748] mb-6 sm:mb-8 pb-4 border-b border-gray-200">
                  5. Отмена и перенос встреч
                </h2>
                <div className="space-y-6 text-[#718096] leading-relaxed">
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-[#2D3748] mb-4">
                      5.1. Правила отмены и переноса
                    </h3>
                    <div className="space-y-4">
                      <div className="bg-white border-2 border-[#C8F5E8]/30 rounded-2xl p-5">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#C8F5E8]/20 to-[#7FD99A]/20 flex items-center justify-center flex-shrink-0">
                            <span className="text-lg font-bold text-[#7FD99A]">24+</span>
                          </div>
                          <div className="flex-1">
                            <h4 className="text-base sm:text-lg font-semibold text-[#2D3748] mb-2">
                              За 24 часа и более
                            </h4>
                            <p className="text-sm sm:text-base">
                              Бесплатная отмена или перенос на любое удобное время. Полный возврат средств 
                              или сохранение оплаты для будущей консультации.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white border-2 border-[#FFD4B5]/30 rounded-2xl p-5">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FFD4B5]/20 to-[#FFC97F]/20 flex items-center justify-center flex-shrink-0">
                            <span className="text-lg font-bold text-[#FFD4B5]">12-24</span>
                          </div>
                          <div className="flex-1">
                            <h4 className="text-base sm:text-lg font-semibold text-[#2D3748] mb-2">
                              За 12-24 часа
                            </h4>
                            <p className="text-sm sm:text-base">
                              Перенос возможен с удержанием 50% стоимости. Возврат средств — 50% от оплаченной суммы.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white border-2 border-[#FF9A9A]/30 rounded-2xl p-5">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FF9A9A]/20 to-[#FFC97F]/20 flex items-center justify-center flex-shrink-0">
                            <span className="text-lg font-bold text-[#FF9A9A]">&lt;12</span>
                          </div>
                          <div className="flex-1">
                            <h4 className="text-base sm:text-lg font-semibold text-[#2D3748] mb-2">
                              Менее 12 часов
                            </h4>
                            <p className="text-sm sm:text-base">
                              Отмена или перенос невозможны. Консультация считается проведённой, 
                              возврат средств не производится.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-[#2D3748] mb-3">
                      5.2. Как отменить или перенести консультацию
                    </h3>
                    <div className="bg-gradient-to-r from-[#A8B5FF]/5 to-[#C8F5E8]/5 rounded-2xl p-6 border border-[#A8B5FF]/10">
                      <ol className="space-y-3 text-sm sm:text-base">
                        <li className="flex items-start gap-3">
                          <span className="w-7 h-7 rounded-lg bg-[#A8B5FF]/10 flex items-center justify-center text-[#A8B5FF] text-sm font-semibold flex-shrink-0">
                            1
                          </span>
                          <span>Войдите в личный кабинет на Платформе</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="w-7 h-7 rounded-lg bg-[#A8B5FF]/10 flex items-center justify-center text-[#A8B5FF] text-sm font-semibold flex-shrink-0">
                            2
                          </span>
                          <span>Перейдите в раздел «Мои консультации»</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="w-7 h-7 rounded-lg bg-[#A8B5FF]/10 flex items-center justify-center text-[#A8B5FF] text-sm font-semibold flex-shrink-0">
                            3
                          </span>
                          <span>Выберите консультацию и нажмите «Отменить» или «Перенести»</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="w-7 h-7 rounded-lg bg-[#A8B5FF]/10 flex items-center justify-center text-[#A8B5FF] text-sm font-semibold flex-shrink-0">
                            4
                          </span>
                          <span>Подтвердите действие и получите уведомление</span>
                        </li>
                      </ol>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-[#2D3748] mb-3">
                      5.3. Отмена со стороны психолога
                    </h3>
                    <p className="text-sm sm:text-base mb-3">
                      Если психолог отменяет консультацию по объективным причинам:
                    </p>
                    <ul className="space-y-2 text-sm sm:text-base ml-6">
                      <li className="list-disc">Вам предложат перенос на другое время с тем же специалистом</li>
                      <li className="list-disc">Или консультацию с другим психологом в удобное для вас время</li>
                      <li className="list-disc">Или полный возврат средств</li>
                      <li className="list-disc">
                        В качестве извинений за неудобства вы получите скидку 10% на следующую консультацию
                      </li>
                    </ul>
                  </div>

                  <div className="bg-gradient-to-r from-[#FFC97F]/5 to-[#FFD4B5]/5 rounded-2xl p-6 border border-[#FFC97F]/10">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-6 h-6 text-[#FFC97F] flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm sm:text-base text-[#2D3748] font-medium mb-2">
                          Важно:
                        </p>
                        <p className="text-sm sm:text-base text-[#718096]">
                          При систематических пропусках консультаций (более 3 раз без предупреждения) 
                          Платформа оставляет за собой право ограничить возможность записи или 
                          потребовать предоплату.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </section>

            {/* Section 6: Confidentiality */}
            <section id="confidentiality" className="mb-16 sm:mb-20 scroll-mt-32">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-2xl sm:text-3xl font-semibold text-[#2D3748] mb-6 sm:mb-8 pb-4 border-b border-gray-200">
                  6. Конфиденциальность
                </h2>
                <div className="space-y-6 text-[#718096] leading-relaxed">
                  <p className="text-sm sm:text-base">
                    Вся информация, полученная в ходе консультаций, является строго конфиденциальной 
                    и защищена профессиональной тайной психолога.
                  </p>

                  <div className="bg-gradient-to-r from-[#A8B5FF]/5 to-[#C8F5E8]/5 rounded-2xl p-6 sm:p-8 border border-[#A8B5FF]/10">
                    <h3 className="text-lg sm:text-xl font-semibold text-[#2D3748] mb-4">
                      Гарантии конфиденциальности:
                    </h3>
                    <ul className="space-y-3 text-sm sm:text-base">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-[#A8B5FF] flex-shrink-0 mt-0.5" />
                        <span>
                          Все консультации проводятся через защищённое соединение с шифрованием
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-[#A8B5FF] flex-shrink-0 mt-0.5" />
                        <span>
                          Записи и заметки психолога хранятся в зашифрованном виде
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-[#A8B5FF] flex-shrink-0 mt-0.5" />
                        <span>
                          Доступ к информации имеет только ваш психолог
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-[#A8B5FF] flex-shrink-0 mt-0.5" />
                        <span>
                          Видео и аудио консультаций не записываются без вашего письменного согласия
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-[#A8B5FF] flex-shrink-0 mt-0.5" />
                        <span>
                          Персональные данные обрабатываются в соответствии с ФЗ-152
                        </span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-[#2D3748] mb-3">
                      Исключения из правила конфиденциальности
                    </h3>
                    <p className="text-sm sm:text-base mb-3">
                      Психолог может нарушить конфиденциальность только в следующих случаях:
                    </p>
                    <ul className="space-y-2 text-sm sm:text-base ml-6">
                      <li className="list-disc">
                        При наличии угрозы жизни или здоровью клиента или третьих лиц
                      </li>
                      <li className="list-disc">
                        По требованию суда или правоохранительных органов в рамках уголовного дела
                      </li>
                      <li className="list-disc">
                        С письменного согласия клиента на раскрытие информации
                      </li>
                    </ul>
                  </div>
                </div>
              </motion.div>
            </section>

            {/* Section 7: Liability */}
            <section id="liability" className="mb-16 sm:mb-20 scroll-mt-32">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-2xl sm:text-3xl font-semibold text-[#2D3748] mb-6 sm:mb-8 pb-4 border-b border-gray-200">
                  7. Ответственность сторон
                </h2>
                <div className="space-y-6 text-[#718096] leading-relaxed">
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-[#2D3748] mb-3">
                      7.1. Ответственность Платформы
                    </h3>
                    <p className="text-sm sm:text-base mb-3">
                      Платформа несёт ответственность за:
                    </p>
                    <ul className="space-y-2 text-sm sm:text-base ml-6">
                      <li className="list-disc">
                        Обеспечение работоспособности технической инфраструктуры
                      </li>
                      <li className="list-disc">
                        Сохранность персональных данных пользователей
                      </li>
                      <li className="list-disc">
                        Соответствие психологов заявленной квалификации
                      </li>
                      <li className="list-disc">
                        Своевременное информирование об изменениях в работе сервиса
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-[#2D3748] mb-3">
                      7.2. Ограничение ответственности
                    </h3>
                    <div className="bg-gradient-to-r from-[#FF9A9A]/5 to-[#FFC97F]/5 rounded-2xl p-6 border border-[#FF9A9A]/10">
                      <p className="text-sm sm:text-base mb-3">
                        Платформа не несёт ответственности за:
                      </p>
                      <ul className="space-y-2 text-sm sm:text-base">
                        <li className="flex items-start gap-2">
                          <ChevronRight className="w-5 h-5 text-[#FF9A9A] flex-shrink-0 mt-0.5" />
                          <span>
                            Результаты психологических консультаций (результат зависит от множества факторов)
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <ChevronRight className="w-5 h-5 text-[#FF9A9A] flex-shrink-0 mt-0.5" />
                          <span>
                            Технические проблемы на стороне пользователя (интернет-соединение, устройство)
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <ChevronRight className="w-5 h-5 text-[#FF9A9A] flex-shrink-0 mt-0.5" />
                          <span>
                            Действия третьих лиц, приведшие к нарушению работы сервиса (хакерские атаки, DDoS)
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <ChevronRight className="w-5 h-5 text-[#FF9A9A] flex-shrink-0 mt-0.5" />
                          <span>
                            Форс-мажорные обстоятельства (стихийные бедствия, войны, изменения законодательства)
                          </span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-[#2D3748] mb-3">
                      7.3. Ответственность пользователя
                    </h3>
                    <p className="text-sm sm:text-base mb-3">
                      Пользователь несёт ответственность за:
                    </p>
                    <ul className="space-y-2 text-sm sm:text-base ml-6">
                      <li className="list-disc">
                        Достоверность предоставленных при регистрации данных
                      </li>
                      <li className="list-disc">
                        Сохранность своих учётных данных (логин, пароль)
                      </li>
                      <li className="list-disc">
                        Соблюдение этических норм при общении с психологами и другими пользователями
                      </li>
                      <li className="list-disc">
                        Своевременную оплату услуг
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-[#2D3748] mb-3">
                      7.4. Санкции
                    </h3>
                    <p className="text-sm sm:text-base">
                      При нарушении условий настоящего Соглашения Платформа имеет право:
                    </p>
                    <ul className="space-y-2 text-sm sm:text-base ml-6 mt-3">
                      <li className="list-disc">Направить предупреждение пользователю</li>
                      <li className="list-disc">Временно заблокировать учётную запись</li>
                      <li className="list-disc">Удалить учётную запись без возврата средств за неиспользованные услуги</li>
                      <li className="list-disc">Обратиться в правоохранительные органы (при нарушении законодательства)</li>
                    </ul>
                  </div>
                </div>
              </motion.div>
            </section>

            {/* Section 8: Disputes */}
            <section id="disputes" className="mb-16 sm:mb-20 scroll-mt-32">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-2xl sm:text-3xl font-semibold text-[#2D3748] mb-6 sm:mb-8 pb-4 border-b border-gray-200">
                  8. Порядок разрешения споров
                </h2>
                <div className="space-y-6 text-[#718096] leading-relaxed">
                  <p className="text-sm sm:text-base">
                    Стороны обязуются решать все возникающие споры путём переговоров. 
                    Претензионный порядок разрешения спора обязателен.
                  </p>

                  <div className="bg-gradient-to-r from-[#C8F5E8]/5 to-[#7FD99A]/5 rounded-2xl p-6 sm:p-8 border border-[#C8F5E8]/10">
                    <h3 className="text-lg sm:text-xl font-semibold text-[#2D3748] mb-4">
                      Процедура подачи претензии:
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <span className="w-8 h-8 rounded-lg bg-[#C8F5E8]/20 flex items-center justify-center text-[#7FD99A] font-semibold flex-shrink-0">
                          1
                        </span>
                        <div className="flex-1">
                          <p className="text-sm sm:text-base font-medium text-[#2D3748] mb-1">
                            Направьте претензию на email
                          </p>
                          <p className="text-sm text-[#718096]">
                            Отправьте письменную претензию на адрес:{' '}
                            <a href="mailto:support@emotional-balance.ru" className="text-[#7FD99A] hover:underline">
                              support@emotional-balance.ru
                            </a>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <span className="w-8 h-8 rounded-lg bg-[#C8F5E8]/20 flex items-center justify-center text-[#7FD99A] font-semibold flex-shrink-0">
                          2
                        </span>
                        <div className="flex-1">
                          <p className="text-sm sm:text-base font-medium text-[#2D3748] mb-1">
                            Укажите детали
                          </p>
                          <p className="text-sm text-[#718096]">
                            В претензии укажите суть проблемы, дату происшествия, ваши требования и контакты
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <span className="w-8 h-8 rounded-lg bg-[#C8F5E8]/20 flex items-center justify-center text-[#7FD99A] font-semibold flex-shrink-0">
                          3
                        </span>
                        <div className="flex-1">
                          <p className="text-sm sm:text-base font-medium text-[#2D3748] mb-1">
                            Ожидайте ответ
                          </p>
                          <p className="text-sm text-[#718096]">
                            Мы рассмотрим претензию в течение 10 рабочих дней и направим мотивированный ответ
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-[#2D3748] mb-3">
                      Судебный порядок
                    </h3>
                    <p className="text-sm sm:text-base">
                      Если спор не был урегулирован в досудебном порядке, он подлежит рассмотрению 
                      в суде по месту нахождения Платформы в соответствии с законодательством 
                      Российской Федерации.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-[#2D3748] mb-3">
                      Альтернативное разрешение споров
                    </h3>
                    <p className="text-sm sm:text-base">
                      Стороны могут по взаимному согласию передать спор на рассмотрение в 
                      третейский суд или воспользоваться услугами медиатора.
                    </p>
                  </div>
                </div>
              </motion.div>
            </section>

            {/* Section 9: Changes */}
            <section id="changes" className="mb-16 sm:mb-20 scroll-mt-32">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-2xl sm:text-3xl font-semibold text-[#2D3748] mb-6 sm:mb-8 pb-4 border-b border-gray-200">
                  9. Изменение условий соглашения
                </h2>
                <div className="space-y-6 text-[#718096] leading-relaxed">
                  <p className="text-sm sm:text-base">
                    Платформа оставляет за собой право изменять условия настоящего Соглашения в одностороннем 
                    порядке.
                  </p>

                  <div className="bg-gradient-to-r from-[#FFD4B5]/5 to-[#FFC97F]/5 rounded-2xl p-6 border border-[#FFD4B5]/10">
                    <h3 className="text-base sm:text-lg font-semibold text-[#2D3748] mb-3">
                      Порядок внесения изменений:
                    </h3>
                    <ul className="space-y-2 text-sm sm:text-base">
                      <li className="flex items-start gap-2">
                        <ChevronRight className="w-5 h-5 text-[#FFD4B5] flex-shrink-0 mt-0.5" />
                        <span>
                          Новая редакция Соглашения публикуется на сайте Платформы
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ChevronRight className="w-5 h-5 text-[#FFD4B5] flex-shrink-0 mt-0.5" />
                        <span>
                          Пользователи уведомляются по email за 7 дней до вступления изменений в силу
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ChevronRight className="w-5 h-5 text-[#FFD4B5] flex-shrink-0 mt-0.5" />
                        <span>
                          В личном кабинете появляется уведомление о необходимости ознакомиться с изменениями
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ChevronRight className="w-5 h-5 text-[#FFD4B5] flex-shrink-0 mt-0.5" />
                        <span>
                          Продолжение использования Платформы после вступления изменений в силу означает 
                          согласие с новыми условиями
                        </span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-[#2D3748] mb-3">
                      Право отказа от услуг
                    </h3>
                    <p className="text-sm sm:text-base">
                      Если вы не согласны с новыми условиями, вы имеете право отказаться от использования 
                      Платформы и удалить свою учётную запись до вступления изменений в силу. 
                      В этом случае неиспользованные средства будут возвращены пропорционально.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-[#2D3748] mb-3">
                      Актуальная версия
                    </h3>
                    <p className="text-sm sm:text-base">
                      Актуальная версия Соглашения всегда доступна по адресу:{' '}
                      <span className="font-medium text-[#2D3748]">emotional-balance.ru/terms</span>
                    </p>
                  </div>
                </div>
              </motion.div>
            </section>

            {/* Section 10: Contacts */}
            <section id="contacts" className="mb-16 sm:mb-20 scroll-mt-32">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-2xl sm:text-3xl font-semibold text-[#2D3748] mb-6 sm:mb-8 pb-4 border-b border-gray-200">
                  10. Контактная информация
                </h2>
                <div className="space-y-6 text-[#718096] leading-relaxed">
                  <div className="bg-gradient-to-br from-[#FFD4B5]/5 via-[#FFC97F]/5 to-[#A8B5FF]/5 rounded-2xl p-6 sm:p-8 border border-gray-200">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <p className="text-sm text-[#718096] mb-2">Полное наименование:</p>
                        <p className="text-base font-semibold text-[#2D3748]">
                          Общество с ограниченной ответственностью «Эмоциональный баланс»
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-[#718096] mb-2">Сокращённое наименование:</p>
                        <p className="text-base font-semibold text-[#2D3748]">
                          ООО «Эмоциональный баланс»
                        </p>
                      </div>

                      <div className="sm:col-span-2">
                        <p className="text-sm text-[#718096] mb-2">Юридический адрес:</p>
                        <p className="text-base text-[#2D3748]">
                          123456, г. Москва, ул. Примерная, д. 1, офис 101
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-[#718096] mb-2">ИНН:</p>
                        <p className="text-base text-[#2D3748] font-mono">1234567890</p>
                      </div>

                      <div>
                        <p className="text-sm text-[#718096] mb-2">ОГРН:</p>
                        <p className="text-base text-[#2D3748] font-mono">1234567890123</p>
                      </div>

                      <div>
                        <p className="text-sm text-[#718096] mb-2">КПП:</p>
                        <p className="text-base text-[#2D3748] font-mono">123456789</p>
                      </div>

                      <div>
                        <p className="text-sm text-[#718096] mb-2">Расчётный счёт:</p>
                        <p className="text-base text-[#2D3748] font-mono">40702810400000000000</p>
                      </div>
                    </div>

                    <div className="pt-6 mt-6 border-t border-gray-200">
                      <p className="text-sm text-[#718096] mb-3">Контакты для связи:</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <a 
                          href="mailto:support@emotional-balance.ru" 
                          className="flex items-center gap-2 text-base font-medium text-[#FFD4B5] hover:underline"
                        >
                          <Mail className="w-5 h-5" />
                          support@emotional-balance.ru
                        </a>
                        <a 
                          href="mailto:legal@emotional-balance.ru" 
                          className="flex items-center gap-2 text-base font-medium text-[#FFD4B5] hover:underline"
                        >
                          <Mail className="w-5 h-5" />
                          legal@emotional-balance.ru
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </section>
          </div>

          {/* Bottom Navigation */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="bg-gradient-to-r from-[#A8B5FF]/5 to-[#C8F5E8]/5 rounded-2xl p-6 mb-6">
              <p className="text-sm sm:text-base text-[#2D3748] font-medium mb-2">
                Акцепт оферты:
              </p>
              <p className="text-sm sm:text-base text-[#718096]">
                Регистрируясь на Платформе или используя её услуги, вы подтверждаете, что ознакомлены 
                с условиями настоящего Соглашения, понимаете их и принимаете полностью и безоговорочно.
              </p>
            </div>

            <p className="text-sm text-[#718096] text-center mb-6">
              Последнее обновление: 28 января 2026 • Версия 1.0
            </p>
            <div className="flex justify-center">
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#FFD4B5] to-[#FFC97F] text-white font-medium shadow-[0_4px_12px_-2px_rgba(255,212,181,0.4)] hover:shadow-[0_6px_16px_-2px_rgba(255,212,181,0.5)] active:scale-[0.98] transition-all"
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
