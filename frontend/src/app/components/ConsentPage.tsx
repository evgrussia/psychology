import { useState } from 'react';
import { motion } from 'motion/react';
import { FileCheck, ChevronRight, Calendar, Mail, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ConsentPage() {
  const [activeSection, setActiveSection] = useState('general');

  const sections = [
    { id: 'general', title: 'Общие положения' },
    { id: 'purposes', title: 'Цели обработки данных' },
    { id: 'data-list', title: 'Перечень данных' },
    { id: 'processing-terms', title: 'Сроки обработки' },
    { id: 'processing-methods', title: 'Способы обработки' },
    { id: 'subject-rights', title: 'Права субъекта' },
    { id: 'withdrawal', title: 'Отзыв согласия' },
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
        <div className="absolute inset-0 bg-gradient-to-b from-[#C8F5E8]/10 to-white -z-10" />
        
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#C8F5E8]/20 to-[#7FD99A]/20 flex items-center justify-center mx-auto mb-6 shadow-[0_4px_16px_-4px_rgba(200,245,232,0.3)]">
              <FileCheck className="w-8 h-8 text-[#7FD99A]" />
            </div>
            <h1 className="text-[30px] sm:text-4xl lg:text-5xl font-bold text-[#2D3748] mb-4 leading-tight">
              Согласие на обработку<br />персональных данных
            </h1>
            <p className="text-sm sm:text-base text-[#718096] mb-6">
              Последнее обновление: 28 января 2026
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#7FD99A]/10 text-sm text-[#2D3748]">
              <Calendar className="w-4 h-4 text-[#7FD99A]" />
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
          <div className="prose prose-slate max-w-none">
            {/* Introduction */}
            <div className="mb-12 sm:mb-16 bg-gradient-to-r from-[#C8F5E8]/5 to-[#7FD99A]/5 rounded-2xl p-6 sm:p-8 border border-[#C8F5E8]/20">
              <p className="text-sm sm:text-base text-[#718096] leading-relaxed mb-4">
                Настоящим в соответствии с Федеральным законом № 152-ФЗ «О персональных данных» 
                от 27.07.2006 года свободно, своей волей и в своём интересе выражаю своё безусловное 
                согласие на обработку моих персональных данных ООО «Эмоциональный баланс» (далее — Оператор), 
                зарегистрированным по адресу: 123456, г. Москва, ул. Примерная, д. 1, офис 101.
              </p>
              <p className="text-sm sm:text-base text-[#2D3748] font-medium">
                Персональные данные — любая информация, относящаяся к определённому или определяемому 
                на основании такой информации физическому лицу.
              </p>
            </div>

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
                    Настоящее согласие на обработку персональных данных (далее — Согласие) действует с момента 
                    его предоставления и до момента его отзыва субъектом персональных данных.
                  </p>
                  <p className="text-sm sm:text-base">
                    Оператор обрабатывает персональные данные субъекта в следующих целях:
                  </p>
                  <div className="bg-white border border-gray-200 rounded-xl p-5 my-6">
                    <ul className="space-y-2 text-sm sm:text-base">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-[#7FD99A] flex-shrink-0 mt-0.5" />
                        <span>Предоставление психологических консультаций и сопутствующих услуг</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-[#7FD99A] flex-shrink-0 mt-0.5" />
                        <span>Ведение учёта клиентов и консультаций</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-[#7FD99A] flex-shrink-0 mt-0.5" />
                        <span>Информирование о предстоящих встречах и изменениях в расписании</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-[#7FD99A] flex-shrink-0 mt-0.5" />
                        <span>Обработка платёжных операций</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-[#7FD99A] flex-shrink-0 mt-0.5" />
                        <span>Улучшение качества услуг и сервиса</span>
                      </li>
                    </ul>
                  </div>
                  <p className="text-sm sm:text-base">
                    Субъект персональных данных осознаёт, что обработка его персональных данных необходима 
                    для получения услуг психологической помощи и соглашается с такой обработкой.
                  </p>
                </div>
              </motion.div>
            </section>

            {/* Section 2: Purposes */}
            <section id="purposes" className="mb-16 sm:mb-20 scroll-mt-32">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-2xl sm:text-3xl font-semibold text-[#2D3748] mb-6 sm:mb-8 pb-4 border-b border-gray-200">
                  2. Цели обработки персональных данных
                </h2>
                <div className="space-y-6 text-[#718096] leading-relaxed">
                  <p className="text-sm sm:text-base">
                    Настоящим даю согласие на обработку Оператором моих персональных данных в следующих целях:
                  </p>

                  <div className="space-y-4">
                    <div className="bg-gradient-to-br from-[#C8F5E8]/5 to-transparent rounded-xl p-5 border border-[#C8F5E8]/10">
                      <h4 className="text-base sm:text-lg font-semibold text-[#2D3748] mb-2">
                        2.1. Предоставление услуг психологической помощи
                      </h4>
                      <p className="text-sm sm:text-base">
                        Организация и проведение онлайн-консультаций, ведение записей о встречах, 
                        составление рекомендаций, отслеживание динамики работы.
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-[#7FD99A]/5 to-transparent rounded-xl p-5 border border-[#7FD99A]/10">
                      <h4 className="text-base sm:text-lg font-semibold text-[#2D3748] mb-2">
                        2.2. Коммуникация с клиентом
                      </h4>
                      <p className="text-sm sm:text-base">
                        Отправка уведомлений о предстоящих консультациях, напоминаний, ответов на вопросы, 
                        предоставление информации об услугах и изменениях в работе платформы.
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-[#FFD4B5]/5 to-transparent rounded-xl p-5 border border-[#FFD4B5]/10">
                      <h4 className="text-base sm:text-lg font-semibold text-[#2D3748] mb-2">
                        2.3. Выполнение договорных обязательств
                      </h4>
                      <p className="text-sm sm:text-base">
                        Оформление и исполнение договора на оказание психологических услуг, обработка платежей, 
                        ведение бухгалтерского учёта.
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-[#A8B5FF]/5 to-transparent rounded-xl p-5 border border-[#A8B5FF]/10">
                      <h4 className="text-base sm:text-lg font-semibold text-[#2D3748] mb-2">
                        2.4. Обеспечение безопасности и защиты прав
                      </h4>
                      <p className="text-sm sm:text-base">
                        Предотвращение мошенничества, обеспечение технической поддержки, защита прав 
                        и законных интересов Оператора и клиентов.
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-[#FFC97F]/5 to-transparent rounded-xl p-5 border border-[#FFC97F]/10">
                      <h4 className="text-base sm:text-lg font-semibold text-[#2D3748] mb-2">
                        2.5. Улучшение качества услуг
                      </h4>
                      <p className="text-sm sm:text-base">
                        Анализ использования платформы, выявление потребностей клиентов, разработка 
                        новых функций и улучшение существующих.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </section>

            {/* Section 3: Data List */}
            <section id="data-list" className="mb-16 sm:mb-20 scroll-mt-32">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-2xl sm:text-3xl font-semibold text-[#2D3748] mb-6 sm:mb-8 pb-4 border-b border-gray-200">
                  3. Перечень персональных данных
                </h2>
                <div className="space-y-6 text-[#718096] leading-relaxed">
                  <p className="text-sm sm:text-base">
                    Настоящим даю согласие на обработку следующих персональных данных:
                  </p>

                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-[#2D3748] mb-4">
                      3.1. Общие персональные данные
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="bg-white border border-gray-200 rounded-xl p-4">
                        <p className="text-sm font-medium text-[#2D3748]">Фамилия, имя, отчество</p>
                      </div>
                      <div className="bg-white border border-gray-200 rounded-xl p-4">
                        <p className="text-sm font-medium text-[#2D3748]">Дата рождения</p>
                      </div>
                      <div className="bg-white border border-gray-200 rounded-xl p-4">
                        <p className="text-sm font-medium text-[#2D3748]">Пол</p>
                      </div>
                      <div className="bg-white border border-gray-200 rounded-xl p-4">
                        <p className="text-sm font-medium text-[#2D3748]">Гражданство</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-[#2D3748] mb-4">
                      3.2. Контактные данные
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="bg-white border border-gray-200 rounded-xl p-4">
                        <p className="text-sm font-medium text-[#2D3748]">Адрес электронной почты</p>
                      </div>
                      <div className="bg-white border border-gray-200 rounded-xl p-4">
                        <p className="text-sm font-medium text-[#2D3748]">Номер телефона</p>
                      </div>
                      <div className="bg-white border border-gray-200 rounded-xl p-4">
                        <p className="text-sm font-medium text-[#2D3748]">Город проживания</p>
                      </div>
                      <div className="bg-white border border-gray-200 rounded-xl p-4">
                        <p className="text-sm font-medium text-[#2D3748]">Часовой пояс</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-[#2D3748] mb-4">
                      3.3. Данные об услугах
                    </h3>
                    <ul className="space-y-2 text-sm sm:text-base ml-6">
                      <li className="list-disc">История консультаций (дата, время, специалист)</li>
                      <li className="list-disc">Заметки психолога (в зашифрованном виде)</li>
                      <li className="list-disc">Результаты тестов и опросников</li>
                      <li className="list-disc">Информация о запросе клиента</li>
                      <li className="list-disc">Домашние задания и их результаты</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-[#2D3748] mb-4">
                      3.4. Платёжные данные
                    </h3>
                    <ul className="space-y-2 text-sm sm:text-base ml-6">
                      <li className="list-disc">История платежей</li>
                      <li className="list-disc">Способ оплаты (без полных реквизитов карты)</li>
                      <li className="list-disc">Счета и квитанции</li>
                    </ul>
                  </div>

                  <div className="bg-gradient-to-r from-[#FF9A9A]/5 to-[#FFC97F]/5 rounded-2xl p-6 border border-[#FF9A9A]/10">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-6 h-6 text-[#FF9A9A] flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm sm:text-base text-[#2D3748] font-medium mb-2">
                          Специальные категории персональных данных:
                        </p>
                        <p className="text-sm sm:text-base text-[#718096]">
                          Информация о состоянии здоровья (психологическом состоянии) обрабатывается только 
                          с письменного согласия субъекта и только в целях оказания психологической помощи. 
                          Такие данные хранятся с повышенными мерами защиты.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </section>

            {/* Section 4: Processing Terms */}
            <section id="processing-terms" className="mb-16 sm:mb-20 scroll-mt-32">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-2xl sm:text-3xl font-semibold text-[#2D3748] mb-6 sm:mb-8 pb-4 border-b border-gray-200">
                  4. Сроки обработки персональных данных
                </h2>
                <div className="space-y-6 text-[#718096] leading-relaxed">
                  <p className="text-sm sm:text-base">
                    Настоящим даю согласие на обработку персональных данных в течение следующих сроков:
                  </p>

                  <div className="space-y-4">
                    <div className="bg-white border-2 border-[#C8F5E8]/30 rounded-2xl p-5 hover:border-[#C8F5E8]/50 transition-colors">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#C8F5E8]/20 to-[#7FD99A]/20 flex items-center justify-center flex-shrink-0">
                          <span className="text-lg font-bold text-[#7FD99A]">∞</span>
                        </div>
                        <div className="flex-1">
                          <h4 className="text-base sm:text-lg font-semibold text-[#2D3748] mb-2">
                            До отзыва согласия
                          </h4>
                          <p className="text-sm sm:text-base">
                            Обработка персональных данных осуществляется с момента получения согласия 
                            и до момента его отзыва субъектом персональных данных, если иное не предусмотрено 
                            законодательством.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white border-2 border-[#A8B5FF]/30 rounded-2xl p-5 hover:border-[#A8B5FF]/50 transition-colors">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#A8B5FF]/20 to-[#C8F5E8]/20 flex items-center justify-center flex-shrink-0">
                          <span className="text-lg font-bold text-[#A8B5FF]">5</span>
                        </div>
                        <div className="flex-1">
                          <h4 className="text-base sm:text-lg font-semibold text-[#2D3748] mb-2">
                            История консультаций — 5 лет
                          </h4>
                          <p className="text-sm sm:text-base">
                            Записи о консультациях хранятся в течение 5 лет с момента последней встречи 
                            в соответствии с профессиональными стандартами психологов и требованиями 
                            законодательства.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white border-2 border-[#FFD4B5]/30 rounded-2xl p-5 hover:border-[#FFD4B5]/50 transition-colors">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FFD4B5]/20 to-[#FFC97F]/20 flex items-center justify-center flex-shrink-0">
                          <span className="text-lg font-bold text-[#FFD4B5]">3</span>
                        </div>
                        <div className="flex-1">
                          <h4 className="text-base sm:text-lg font-semibold text-[#2D3748] mb-2">
                            Платёжные данные — 3 года
                          </h4>
                          <p className="text-sm sm:text-base">
                            Информация о платежах хранится в течение 3 лет для соблюдения требований 
                            налогового и бухгалтерского законодательства Российской Федерации.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-[#C8F5E8]/10 to-[#7FD99A]/10 rounded-2xl p-6 border border-[#C8F5E8]/20 mt-6">
                    <p className="text-sm sm:text-base text-[#2D3748] font-medium mb-2">
                      Важно:
                    </p>
                    <p className="text-sm sm:text-base text-[#718096]">
                      По истечении указанных сроков персональные данные подлежат уничтожению, если иное 
                      не предусмотрено федеральным законом. Уничтожение производится таким образом, 
                      что восстановление содержания персональных данных становится невозможным.
                    </p>
                  </div>
                </div>
              </motion.div>
            </section>

            {/* Section 5: Processing Methods */}
            <section id="processing-methods" className="mb-16 sm:mb-20 scroll-mt-32">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-2xl sm:text-3xl font-semibold text-[#2D3748] mb-6 sm:mb-8 pb-4 border-b border-gray-200">
                  5. Способы обработки персональных данных
                </h2>
                <div className="space-y-6 text-[#718096] leading-relaxed">
                  <p className="text-sm sm:text-base">
                    Настоящим даю согласие на обработку персональных данных следующими способами:
                  </p>

                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-[#2D3748] mb-4">
                      5.1. Действия с персональными данными
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        'Сбор', 'Запись', 'Систематизация', 'Накопление',
                        'Хранение', 'Уточнение (обновление, изменение)',
                        'Извлечение', 'Использование', 'Передача',
                        'Обезличивание', 'Блокирование', 'Удаление', 'Уничтожение'
                      ].map((action) => (
                        <div key={action} className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl p-4">
                          <ChevronRight className="w-4 h-4 text-[#7FD99A] flex-shrink-0" />
                          <span className="text-sm font-medium text-[#2D3748]">{action}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-[#2D3748] mb-4">
                      5.2. Способы обработки
                    </h3>
                    <div className="space-y-3">
                      <div className="bg-gradient-to-r from-[#A8B5FF]/5 to-transparent rounded-xl p-5 border border-[#A8B5FF]/10">
                        <h4 className="text-sm sm:text-base font-semibold text-[#2D3748] mb-1">
                          Автоматизированная обработка
                        </h4>
                        <p className="text-sm text-[#718096]">
                          С использованием средств вычислительной техники, программного обеспечения 
                          и баз данных.
                        </p>
                      </div>
                      <div className="bg-gradient-to-r from-[#C8F5E8]/5 to-transparent rounded-xl p-5 border border-[#C8F5E8]/10">
                        <h4 className="text-sm sm:text-base font-semibold text-[#2D3748] mb-1">
                          Неавтоматизированная обработка
                        </h4>
                        <p className="text-sm text-[#718096]">
                          На бумажных носителях без использования средств автоматизации 
                          (если это необходимо для оказания услуг).
                        </p>
                      </div>
                      <div className="bg-gradient-to-r from-[#FFD4B5]/5 to-transparent rounded-xl p-5 border border-[#FFD4B5]/10">
                        <h4 className="text-sm sm:text-base font-semibold text-[#2D3748] mb-1">
                          Смешанная обработка
                        </h4>
                        <p className="text-sm text-[#718096]">
                          Комбинация автоматизированной и неавтоматизированной обработки.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-[#2D3748] mb-4">
                      5.3. Передача персональных данных
                    </h3>
                    <p className="text-sm sm:text-base mb-3">
                      Даю согласие на передачу моих персональных данных:
                    </p>
                    <ul className="space-y-2 text-sm sm:text-base ml-6">
                      <li className="list-disc">
                        Третьим лицам, привлекаемым Оператором для оказания услуг (хостинг-провайдеры, 
                        платёжные системы, сервисы видеосвязи)
                      </li>
                      <li className="list-disc">
                        В государственные органы при наличии законного требования
                      </li>
                      <li className="list-disc">
                        Другим лицам только с моего письменного согласия
                      </li>
                    </ul>
                  </div>
                </div>
              </motion.div>
            </section>

            {/* Section 6: Subject Rights */}
            <section id="subject-rights" className="mb-16 sm:mb-20 scroll-mt-32">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-2xl sm:text-3xl font-semibold text-[#2D3748] mb-6 sm:mb-8 pb-4 border-b border-gray-200">
                  6. Права субъекта персональных данных
                </h2>
                <div className="space-y-6 text-[#718096] leading-relaxed">
                  <p className="text-sm sm:text-base">
                    Я проинформирован(а) о своих правах как субъекта персональных данных:
                  </p>

                  <div className="grid grid-cols-1 gap-4">
                    <div className="bg-white border-2 border-[#A8B5FF]/20 rounded-2xl p-5">
                      <h4 className="text-base sm:text-lg font-semibold text-[#2D3748] mb-2 flex items-center gap-2">
                        <span className="w-8 h-8 rounded-lg bg-[#A8B5FF]/10 flex items-center justify-center text-[#A8B5FF] flex-shrink-0">
                          1
                        </span>
                        Право на получение информации
                      </h4>
                      <p className="text-sm sm:text-base ml-10">
                        Вы имеете право получить подтверждение факта обработки ваших персональных данных, 
                        а также информацию о целях, способах и сроках обработки.
                      </p>
                    </div>

                    <div className="bg-white border-2 border-[#C8F5E8]/20 rounded-2xl p-5">
                      <h4 className="text-base sm:text-lg font-semibold text-[#2D3748] mb-2 flex items-center gap-2">
                        <span className="w-8 h-8 rounded-lg bg-[#C8F5E8]/10 flex items-center justify-center text-[#7FD99A] flex-shrink-0">
                          2
                        </span>
                        Право на доступ к данным
                      </h4>
                      <p className="text-sm sm:text-base ml-10">
                        Вы можете получить копию своих персональных данных в течение 30 дней с момента запроса.
                      </p>
                    </div>

                    <div className="bg-white border-2 border-[#FFD4B5]/20 rounded-2xl p-5">
                      <h4 className="text-base sm:text-lg font-semibold text-[#2D3748] mb-2 flex items-center gap-2">
                        <span className="w-8 h-8 rounded-lg bg-[#FFD4B5]/10 flex items-center justify-center text-[#FFD4B5] flex-shrink-0">
                          3
                        </span>
                        Право на уточнение данных
                      </h4>
                      <p className="text-sm sm:text-base ml-10">
                        Вы можете требовать уточнения, блокирования или уничтожения неполных, устаревших, 
                        неточных или незаконно полученных данных.
                      </p>
                    </div>

                    <div className="bg-white border-2 border-[#FFC97F]/20 rounded-2xl p-5">
                      <h4 className="text-base sm:text-lg font-semibold text-[#2D3748] mb-2 flex items-center gap-2">
                        <span className="w-8 h-8 rounded-lg bg-[#FFC97F]/10 flex items-center justify-center text-[#FFC97F] flex-shrink-0">
                          4
                        </span>
                        Право на отзыв согласия
                      </h4>
                      <p className="text-sm sm:text-base ml-10">
                        Вы имеете право отозвать настоящее согласие в любой момент путём направления 
                        письменного заявления Оператору.
                      </p>
                    </div>

                    <div className="bg-white border-2 border-[#7FD99A]/20 rounded-2xl p-5">
                      <h4 className="text-base sm:text-lg font-semibold text-[#2D3748] mb-2 flex items-center gap-2">
                        <span className="w-8 h-8 rounded-lg bg-[#7FD99A]/10 flex items-center justify-center text-[#7FD99A] flex-shrink-0">
                          5
                        </span>
                        Право на обжалование
                      </h4>
                      <p className="text-sm sm:text-base ml-10">
                        Вы имеете право обжаловать действия или бездействие Оператора в уполномоченный орган 
                        по защите прав субъектов персональных данных или в судебном порядке.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </section>

            {/* Section 7: Withdrawal */}
            <section id="withdrawal" className="mb-16 sm:mb-20 scroll-mt-32">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-2xl sm:text-3xl font-semibold text-[#2D3748] mb-6 sm:mb-8 pb-4 border-b border-gray-200">
                  7. Порядок отзыва согласия на обработку персональных данных
                </h2>
                <div className="space-y-6 text-[#718096] leading-relaxed">
                  <p className="text-sm sm:text-base">
                    Настоящее согласие может быть отозвано субъектом персональных данных в любое время.
                  </p>

                  <div className="bg-gradient-to-br from-[#A8B5FF]/5 via-[#C8F5E8]/5 to-[#7FD99A]/5 rounded-2xl p-6 sm:p-8 border border-gray-200">
                    <h3 className="text-lg sm:text-xl font-semibold text-[#2D3748] mb-4">
                      Как отозвать согласие:
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#A8B5FF]/20 to-[#C8F5E8]/20 flex items-center justify-center flex-shrink-0">
                          <span className="text-lg font-bold text-[#A8B5FF]">1</span>
                        </div>
                        <div className="flex-1">
                          <h4 className="text-base font-semibold text-[#2D3748] mb-1">
                            Направить письменное заявление
                          </h4>
                          <p className="text-sm">
                            Отправьте заявление об отзыве согласия на адрес электронной почты:{' '}
                            <a href="mailto:privacy@emotional-balance.ru" className="text-[#A8B5FF] hover:underline">
                              privacy@emotional-balance.ru
                            </a>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#C8F5E8]/20 to-[#7FD99A]/20 flex items-center justify-center flex-shrink-0">
                          <span className="text-lg font-bold text-[#7FD99A]">2</span>
                        </div>
                        <div className="flex-1">
                          <h4 className="text-base font-semibold text-[#2D3748] mb-1">
                            Через личный кабинет
                          </h4>
                          <p className="text-sm">
                            Воспользуйтесь функцией «Удалить учётную запись» в настройках профиля на платформе
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FFD4B5]/20 to-[#FFC97F]/20 flex items-center justify-center flex-shrink-0">
                          <span className="text-lg font-bold text-[#FFD4B5]">3</span>
                        </div>
                        <div className="flex-1">
                          <h4 className="text-base font-semibold text-[#2D3748] mb-1">
                            Почтой России
                          </h4>
                          <p className="text-sm">
                            Направьте заказное письмо с уведомлением о вручении по адресу: 
                            123456, г. Москва, ул. Примерная, д. 1, офис 101
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-[#FFC97F]/5 to-[#FFD4B5]/5 rounded-2xl p-6 border border-[#FFC97F]/10">
                    <p className="text-sm sm:text-base text-[#2D3748] font-medium mb-2">
                      Последствия отзыва согласия:
                    </p>
                    <ul className="space-y-2 text-sm sm:text-base">
                      <li className="flex items-start gap-2">
                        <ChevronRight className="w-5 h-5 text-[#FFC97F] flex-shrink-0 mt-0.5" />
                        <span>
                          Обработка ваших персональных данных будет прекращена в течение 30 дней с момента 
                          получения заявления
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ChevronRight className="w-5 h-5 text-[#FFC97F] flex-shrink-0 mt-0.5" />
                        <span>
                          Предоставление услуг психологической помощи будет невозможно
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ChevronRight className="w-5 h-5 text-[#FFC97F] flex-shrink-0 mt-0.5" />
                        <span>
                          Некоторые данные могут быть сохранены в соответствии с требованиями законодательства 
                          (например, данные о платежах для налоговой отчётности)
                        </span>
                      </li>
                    </ul>
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
                  8. Контакты оператора персональных данных
                </h2>
                <div className="space-y-6 text-[#718096] leading-relaxed">
                  <div className="bg-gradient-to-br from-[#C8F5E8]/5 via-[#7FD99A]/5 to-[#A8B5FF]/5 rounded-2xl p-6 sm:p-8 border border-gray-200">
                    <div className="space-y-5">
                      <div>
                        <p className="text-sm text-[#718096] mb-2">Полное наименование:</p>
                        <p className="text-base sm:text-lg font-semibold text-[#2D3748]">
                          Общество с ограниченной ответственностью «Эмоциональный баланс»
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-[#718096] mb-1">Юридический адрес:</p>
                          <p className="text-sm sm:text-base text-[#2D3748]">
                            123456, г. Москва,<br />ул. Примерная, д. 1, офис 101
                          </p>
                        </div>

                        <div>
                          <p className="text-sm text-[#718096] mb-1">ОГРН:</p>
                          <p className="text-sm sm:text-base text-[#2D3748] font-mono">
                            1234567890123
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-[#718096] mb-1">ИНН:</p>
                          <p className="text-sm sm:text-base text-[#2D3748] font-mono">
                            1234567890
                          </p>
                        </div>

                        <div>
                          <p className="text-sm text-[#718096] mb-1">КПП:</p>
                          <p className="text-sm sm:text-base text-[#2D3748] font-mono">
                            123456789
                          </p>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-gray-200">
                        <p className="text-sm text-[#718096] mb-3">Контакты для вопросов о персональных данных:</p>
                        <div className="space-y-2">
                          <a 
                            href="mailto:privacy@emotional-balance.ru" 
                            className="flex items-center gap-2 text-base font-medium text-[#7FD99A] hover:underline"
                          >
                            <Mail className="w-5 h-5" />
                            privacy@emotional-balance.ru
                          </a>
                          <a 
                            href="mailto:help@emotional-balance.ru" 
                            className="flex items-center gap-2 text-base font-medium text-[#7FD99A] hover:underline"
                          >
                            <Mail className="w-5 h-5" />
                            help@emotional-balance.ru
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-[#A8B5FF]/5 to-[#C8F5E8]/5 rounded-2xl p-6 border border-[#A8B5FF]/10">
                    <p className="text-sm sm:text-base text-[#2D3748] font-medium mb-3">
                      Подтверждение согласия:
                    </p>
                    <p className="text-sm sm:text-base text-[#718096] leading-relaxed">
                      Продолжая использование сервисов платформы «Эмоциональный баланс», вы подтверждаете, 
                      что ознакомлены с настоящим Согласием на обработку персональных данных, понимаете его 
                      содержание и даёте согласие на обработку своих персональных данных на указанных условиях.
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
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#C8F5E8] to-[#7FD99A] text-white font-medium shadow-[0_4px_12px_-2px_rgba(200,245,232,0.4)] hover:shadow-[0_6px_16px_-2px_rgba(200,245,232,0.5)] active:scale-[0.98] transition-all"
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
