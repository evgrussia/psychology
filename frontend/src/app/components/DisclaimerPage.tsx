import { useState } from 'react';
import { motion } from 'motion/react';
import { AlertTriangle, ChevronRight, Calendar, Mail, Shield, Phone, AlertCircle, Info, X } from 'lucide-react';

export default function DisclaimerPage() {
  const [activeSection, setActiveSection] = useState('general');

  const sections = [
    { id: 'general', title: 'Общие положения' },
    { id: 'emergency', title: 'Не экстренная помощь' },
    { id: 'medical', title: 'Не медицинская помощь' },
    { id: 'limitations', title: 'Ограничения услуг' },
    { id: 'technical', title: 'Технические ограничения' },
    { id: 'results', title: 'Результаты терапии' },
    { id: 'confidentiality', title: 'Конфиденциальность' },
    { id: 'information', title: 'Использование информации' },
    { id: 'links', title: 'Внешние ресурсы' },
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
        <div className="absolute inset-0 bg-gradient-to-b from-[#FFC97F]/10 to-white -z-10" />
        
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#FFC97F]/20 to-[#FFD4B5]/20 flex items-center justify-center mx-auto mb-6 shadow-[0_4px_16px_-4px_rgba(255,201,127,0.3)]">
              <AlertTriangle className="w-8 h-8 text-[#FFC97F]" />
            </div>
            <h1 className="text-[30px] sm:text-4xl lg:text-5xl font-bold text-[#2D3748] mb-4 leading-tight">
              Отказ от ответственности
            </h1>
            <p className="text-sm sm:text-base text-[#718096] mb-6">
              Важная информация перед использованием платформы
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FFC97F]/10 text-sm text-[#2D3748]">
              <Calendar className="w-4 h-4 text-[#FFC97F]" />
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
                      ? 'bg-[#FFC97F]/10 text-[#FFC97F]'
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
          {/* Important Notice */}
          <div className="mb-12 sm:mb-16">
            <div className="bg-gradient-to-r from-[#FFC97F]/10 to-[#FFD4B5]/10 rounded-2xl p-6 sm:p-8 border-2 border-[#FFC97F]/20">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#FFC97F]/10 flex items-center justify-center flex-shrink-0">
                  <Info className="w-6 h-6 text-[#FFC97F]" />
                </div>
                <div className="flex-1">
                  <h2 className="text-lg sm:text-xl font-semibold text-[#2D3748] mb-3">
                    Пожалуйста, внимательно ознакомьтесь с этой информацией
                  </h2>
                  <p className="text-sm sm:text-base text-[#718096] leading-relaxed">
                    Настоящий документ содержит важные ограничения и разъяснения относительно услуг платформы 
                    «Эмоциональный баланс». Использование платформы означает ваше согласие с условиями, 
                    изложенными ниже.
                  </p>
                </div>
              </div>
            </div>
          </div>

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
                <div className="space-y-6 text-[#718096] leading-relaxed">
                  <p className="text-sm sm:text-base">
                    Платформа «Эмоциональный баланс» предоставляет доступ к онлайн-консультациям с психологами 
                    и образовательным материалам по психологии. Используя наши услуги, вы понимаете и соглашаетесь 
                    со следующими ограничениями.
                  </p>

                  <div className="bg-gradient-to-r from-[#A8B5FF]/5 to-[#C8F5E8]/5 rounded-2xl p-6 border border-[#A8B5FF]/10">
                    <h3 className="text-base sm:text-lg font-semibold text-[#2D3748] mb-3">
                      Что такое психологическая помощь:
                    </h3>
                    <ul className="space-y-2 text-sm sm:text-base">
                      <li className="flex items-start gap-2">
                        <ChevronRight className="w-5 h-5 text-[#A8B5FF] flex-shrink-0 mt-0.5" />
                        <span>
                          Психологическая поддержка и консультирование по личным вопросам
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ChevronRight className="w-5 h-5 text-[#A8B5FF] flex-shrink-0 mt-0.5" />
                        <span>
                          Помощь в развитии навыков эмоциональной регуляции
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ChevronRight className="w-5 h-5 text-[#A8B5FF] flex-shrink-0 mt-0.5" />
                        <span>
                          Работа с жизненными трудностями, стрессом и межличностными отношениями
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ChevronRight className="w-5 h-5 text-[#A8B5FF] flex-shrink-0 mt-0.5" />
                        <span>
                          Поддержка в процессе личностного роста и саморазвития
                        </span>
                      </li>
                    </ul>
                  </div>

                  <p className="text-sm sm:text-base">
                    Психологи платформы имеют соответствующее образование и опыт, однако их работа 
                    осуществляется в рамках психологического консультирования, а не медицинской практики.
                  </p>
                </div>
              </motion.div>
            </section>

            {/* Section 2: Emergency */}
            <section id="emergency" className="mb-16 sm:mb-20 scroll-mt-32">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-2xl sm:text-3xl font-semibold text-[#2D3748] mb-6 sm:mb-8 pb-4 border-b border-gray-200">
                  2. Платформа НЕ предоставляет экстренную помощь
                </h2>
                <div className="space-y-6 text-[#718096] leading-relaxed">
                  <div className="bg-gradient-to-r from-[#FF9A9A]/10 to-[#FFC97F]/10 rounded-2xl p-6 sm:p-8 border-2 border-[#FF9A9A]/20">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-[#FF9A9A]/10 flex items-center justify-center flex-shrink-0">
                        <AlertTriangle className="w-6 h-6 text-[#FF9A9A]" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg sm:text-xl font-semibold text-[#2D3748] mb-2">
                          ВАЖНО: Если вы находитесь в кризисной ситуации
                        </h3>
                        <p className="text-sm sm:text-base text-[#718096]">
                          Наша платформа НЕ предназначена для экстренных случаев и не может обеспечить 
                          немедленную помощь 24/7.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3 mt-6">
                      <p className="text-sm sm:text-base font-medium text-[#2D3748]">
                        При наличии следующих состояний немедленно обратитесь в экстренные службы:
                      </p>
                      <ul className="space-y-2 text-sm sm:text-base ml-6">
                        <li className="list-disc text-[#718096]">Мысли о самоубийстве или причинении вреда себе</li>
                        <li className="list-disc text-[#718096]">Мысли о причинении вреда другим людям</li>
                        <li className="list-disc text-[#718096]">Острый психотический эпизод (галлюцинации, бред)</li>
                        <li className="list-disc text-[#718096]">Тяжёлая паническая атака или острое состояние тревоги</li>
                        <li className="list-disc text-[#718096]">Передозировка лекарствами или наркотиками</li>
                        <li className="list-disc text-[#718096]">Любая другая угрожающая жизни ситуация</li>
                      </ul>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-[#C8F5E8]/5 to-[#7FD99A]/5 rounded-2xl p-6 border border-[#C8F5E8]/10">
                    <h3 className="text-base sm:text-lg font-semibold text-[#2D3748] mb-4">
                      Куда обращаться в экстренных случаях:
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-white rounded-xl p-4 border border-gray-200">
                        <p className="text-sm font-medium text-[#2D3748] mb-1">Скорая помощь</p>
                        <a href="tel:103" className="text-lg font-bold text-[#7FD99A] flex items-center gap-2">
                          <Phone className="w-5 h-5" />
                          103
                        </a>
                      </div>
                      <div className="bg-white rounded-xl p-4 border border-gray-200">
                        <p className="text-sm font-medium text-[#2D3748] mb-1">Единый номер экстренных служб</p>
                        <a href="tel:112" className="text-lg font-bold text-[#7FD99A] flex items-center gap-2">
                          <Phone className="w-5 h-5" />
                          112
                        </a>
                      </div>
                      <div className="bg-white rounded-xl p-4 border border-gray-200 sm:col-span-2">
                        <p className="text-sm font-medium text-[#2D3748] mb-1">Телефон доверия (круглосуточно, анонимно)</p>
                        <a href="tel:88002000122" className="text-lg font-bold text-[#7FD99A] flex items-center gap-2">
                          <Phone className="w-5 h-5" />
                          8 (800) 2000-122
                        </a>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm sm:text-base">
                    Психологи платформы не могут оказать помощь в экстренных ситуациях. Консультации проводятся 
                    по предварительной записи и не заменяют экстренную медицинскую или психиатрическую помощь.
                  </p>
                </div>
              </motion.div>
            </section>

            {/* Section 3: Medical */}
            <section id="medical" className="mb-16 sm:mb-20 scroll-mt-32">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-2xl sm:text-3xl font-semibold text-[#2D3748] mb-6 sm:mb-8 pb-4 border-b border-gray-200">
                  3. Наши услуги НЕ заменяют медицинскую помощь
                </h2>
                <div className="space-y-6 text-[#718096] leading-relaxed">
                  <div className="bg-gradient-to-r from-[#FFD4B5]/5 to-[#FFC97F]/5 rounded-2xl p-6 border border-[#FFD4B5]/10">
                    <h3 className="text-base sm:text-lg font-semibold text-[#2D3748] mb-3">
                      Важно понимать разницу:
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-white rounded-xl p-5 border-2 border-[#7FD99A]/20">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-8 h-8 rounded-lg bg-[#7FD99A]/10 flex items-center justify-center">
                            <Shield className="w-4 h-4 text-[#7FD99A]" />
                          </div>
                          <h4 className="font-semibold text-[#2D3748]">Психолог</h4>
                        </div>
                        <ul className="space-y-2 text-sm">
                          <li className="flex items-start gap-2">
                            <ChevronRight className="w-4 h-4 text-[#7FD99A] flex-shrink-0 mt-0.5" />
                            <span>Работает со здоровыми людьми</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <ChevronRight className="w-4 h-4 text-[#7FD99A] flex-shrink-0 mt-0.5" />
                            <span>Не ставит диагнозы</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <ChevronRight className="w-4 h-4 text-[#7FD99A] flex-shrink-0 mt-0.5" />
                            <span>Не назначает лекарства</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <ChevronRight className="w-4 h-4 text-[#7FD99A] flex-shrink-0 mt-0.5" />
                            <span>Помогает с жизненными трудностями</span>
                          </li>
                        </ul>
                      </div>

                      <div className="bg-white rounded-xl p-5 border-2 border-[#A8B5FF]/20">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-8 h-8 rounded-lg bg-[#A8B5FF]/10 flex items-center justify-center">
                            <Shield className="w-4 h-4 text-[#A8B5FF]" />
                          </div>
                          <h4 className="font-semibold text-[#2D3748]">Психиатр / Психотерапевт</h4>
                        </div>
                        <ul className="space-y-2 text-sm">
                          <li className="flex items-start gap-2">
                            <ChevronRight className="w-4 h-4 text-[#A8B5FF] flex-shrink-0 mt-0.5" />
                            <span>Медицинский специалист</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <ChevronRight className="w-4 h-4 text-[#A8B5FF] flex-shrink-0 mt-0.5" />
                            <span>Ставит диагнозы</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <ChevronRight className="w-4 h-4 text-[#A8B5FF] flex-shrink-0 mt-0.5" />
                            <span>Назначает лечение</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <ChevronRight className="w-4 h-4 text-[#A8B5FF] flex-shrink-0 mt-0.5" />
                            <span>Лечит психические расстройства</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-[#2D3748] mb-3">
                      Когда нужно обратиться к психиатру или психотерапевту:
                    </h3>
                    <ul className="space-y-2 text-sm sm:text-base ml-6">
                      <li className="list-disc">Депрессия (особенно с суицидальными мыслями)</li>
                      <li className="list-disc">Биполярное расстройство</li>
                      <li className="list-disc">Шизофрения или другие психотические расстройства</li>
                      <li className="list-disc">Тяжёлые тревожные расстройства (ГТР, ОКР, ПТСР)</li>
                      <li className="list-disc">Расстройства пищевого поведения (анорексия, булимия)</li>
                      <li className="list-disc">Зависимости (алкогольная, наркотическая)</li>
                      <li className="list-disc">Любые состояния, требующие медикаментозного лечения</li>
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
                          Если вы принимаете психотропные препараты или проходите лечение у психиатра, 
                          не прекращайте его без консультации с лечащим врачом. Психологические консультации 
                          могут дополнять медицинское лечение, но не заменять его.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </section>

            {/* Section 4: Limitations */}
            <section id="limitations" className="mb-16 sm:mb-20 scroll-mt-32">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-2xl sm:text-3xl font-semibold text-[#2D3748] mb-6 sm:mb-8 pb-4 border-b border-gray-200">
                  4. Ограничения предоставляемых услуг
                </h2>
                <div className="space-y-6 text-[#718096] leading-relaxed">
                  <p className="text-sm sm:text-base">
                    Платформа может отказать в предоставлении услуг или рекомендовать обратиться к 
                    медицинскому специалисту в следующих случаях:
                  </p>

                  <div className="space-y-4">
                    <div className="bg-white border-2 border-gray-200 rounded-2xl p-5">
                      <h4 className="text-base sm:text-lg font-semibold text-[#2D3748] mb-3 flex items-center gap-2">
                        <X className="w-5 h-5 text-[#FF9A9A]" />
                        Психические расстройства
                      </h4>
                      <p className="text-sm sm:text-base">
                        При наличии диагностированных психических расстройств, требующих медикаментозного 
                        лечения или наблюдения психиатра.
                      </p>
                    </div>

                    <div className="bg-white border-2 border-gray-200 rounded-2xl p-5">
                      <h4 className="text-base sm:text-lg font-semibold text-[#2D3748] mb-3 flex items-center gap-2">
                        <X className="w-5 h-5 text-[#FF9A9A]" />
                        Суицидальные намерения
                      </h4>
                      <p className="text-sm sm:text-base">
                        При активных суицидальных мыслях или планах. В таких случаях необходима экстренная 
                        медицинская помощь.
                      </p>
                    </div>

                    <div className="bg-white border-2 border-gray-200 rounded-2xl p-5">
                      <h4 className="text-base sm:text-lg font-semibold text-[#2D3748] mb-3 flex items-center gap-2">
                        <X className="w-5 h-5 text-[#FF9A9A]" />
                        Несовершеннолетние без согласия родителей
                      </h4>
                      <p className="text-sm sm:text-base">
                        Для консультаций лиц младше 18 лет требуется письменное согласие родителей или 
                        законных представителей.
                      </p>
                    </div>

                    <div className="bg-white border-2 border-gray-200 rounded-2xl p-5">
                      <h4 className="text-base sm:text-lg font-semibold text-[#2D3748] mb-3 flex items-center gap-2">
                        <X className="w-5 h-5 text-[#FF9A9A]" />
                        Состояние опьянения
                      </h4>
                      <p className="text-sm sm:text-base">
                        Консультации не проводятся в состоянии алкогольного или наркотического опьянения.
                      </p>
                    </div>

                    <div className="bg-white border-2 border-gray-200 rounded-2xl p-5">
                      <h4 className="text-base sm:text-lg font-semibold text-[#2D3748] mb-3 flex items-center gap-2">
                        <X className="w-5 h-5 text-[#FF9A9A]" />
                        Юридические вопросы
                      </h4>
                      <p className="text-sm sm:text-base">
                        Психологи не дают юридических консультаций и не выступают экспертами в суде.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </section>

            {/* Section 5: Technical */}
            <section id="technical" className="mb-16 sm:mb-20 scroll-mt-32">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-2xl sm:text-3xl font-semibold text-[#2D3748] mb-6 sm:mb-8 pb-4 border-b border-gray-200">
                  5. Технические ограничения
                </h2>
                <div className="space-y-6 text-[#718096] leading-relaxed">
                  <p className="text-sm sm:text-base">
                    Платформа не несёт ответственности за технические проблемы, которые могут повлиять 
                    на качество консультаций:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { title: 'Интернет-соединение', desc: 'Качество связи зависит от вашего провайдера' },
                      { title: 'Устройство', desc: 'Убедитесь, что ваше устройство поддерживает видеосвязь' },
                      { title: 'Браузер', desc: 'Используйте актуальную версию браузера' },
                      { title: 'Технические сбои', desc: 'Возможны редкие технические работы на платформе' }
                    ].map((item, index) => (
                      <div key={index} className="bg-gradient-to-br from-[#A8B5FF]/5 to-transparent rounded-xl p-5 border border-[#A8B5FF]/10">
                        <h4 className="text-sm sm:text-base font-semibold text-[#2D3748] mb-1">
                          {item.title}
                        </h4>
                        <p className="text-sm text-[#718096]">{item.desc}</p>
                      </div>
                    ))}
                  </div>

                  <div className="bg-gradient-to-r from-[#C8F5E8]/5 to-[#7FD99A]/5 rounded-2xl p-6 border border-[#C8F5E8]/10">
                    <h3 className="text-base sm:text-lg font-semibold text-[#2D3748] mb-3">
                      Рекомендации для комфортной консультации:
                    </h3>
                    <ul className="space-y-2 text-sm sm:text-base">
                      <li className="flex items-start gap-2">
                        <ChevronRight className="w-5 h-5 text-[#7FD99A] flex-shrink-0 mt-0.5" />
                        <span>Используйте стабильное Wi-Fi соединение (скорость не менее 5 Мбит/с)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ChevronRight className="w-5 h-5 text-[#7FD99A] flex-shrink-0 mt-0.5" />
                        <span>Выберите тихое и приватное место для консультации</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ChevronRight className="w-5 h-5 text-[#7FD99A] flex-shrink-0 mt-0.5" />
                        <span>Проверьте камеру и микрофон перед началом сессии</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ChevronRight className="w-5 h-5 text-[#7FD99A] flex-shrink-0 mt-0.5" />
                        <span>Зарядите устройство или подключите его к питанию</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </motion.div>
            </section>

            {/* Section 6: Results */}
            <section id="results" className="mb-16 sm:mb-20 scroll-mt-32">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-2xl sm:text-3xl font-semibold text-[#2D3748] mb-6 sm:mb-8 pb-4 border-b border-gray-200">
                  6. Ответственность за результаты терапии
                </h2>
                <div className="space-y-6 text-[#718096] leading-relaxed">
                  <p className="text-sm sm:text-base">
                    Результаты психологического консультирования индивидуальны и зависят от множества факторов.
                  </p>

                  <div className="bg-gradient-to-r from-[#FFD4B5]/5 to-[#FFC97F]/5 rounded-2xl p-6 border border-[#FFD4B5]/10">
                    <h3 className="text-base sm:text-lg font-semibold text-[#2D3748] mb-3">
                      Платформа не гарантирует:
                    </h3>
                    <ul className="space-y-2 text-sm sm:text-base">
                      <li className="flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 text-[#FFD4B5] flex-shrink-0 mt-0.5" />
                        <span>Конкретных результатов или излечения за определённый срок</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 text-[#FFD4B5] flex-shrink-0 mt-0.5" />
                        <span>Решение всех жизненных проблем</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 text-[#FFD4B5] flex-shrink-0 mt-0.5" />
                        <span>Одинаковую эффективность для всех клиентов</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 text-[#FFD4B5] flex-shrink-0 mt-0.5" />
                        <span>Немедленное улучшение состояния</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-[#2D3748] mb-3">
                      От чего зависит эффективность:
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        'Ваша готовность к изменениям',
                        'Регулярность консультаций',
                        'Выполнение домашних заданий',
                        'Доверие к психологу',
                        'Сложность запроса',
                        'Внешние жизненные обстоятельства'
                      ].map((factor, index) => (
                        <div key={index} className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl p-4">
                          <div className="w-6 h-6 rounded-lg bg-[#7FD99A]/10 flex items-center justify-center text-[#7FD99A] text-xs font-semibold flex-shrink-0">
                            {index + 1}
                          </div>
                          <span className="text-sm sm:text-base text-[#2D3748]">{factor}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <p className="text-sm sm:text-base">
                    Психологическая работа — это совместный процесс. Ваша активная позиция и желание работать 
                    над собой являются ключевыми факторами успеха.
                  </p>
                </div>
              </motion.div>
            </section>

            {/* Section 7: Confidentiality */}
            <section id="confidentiality" className="mb-16 sm:mb-20 scroll-mt-32">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-2xl sm:text-3xl font-semibold text-[#2D3748] mb-6 sm:mb-8 pb-4 border-b border-gray-200">
                  7. Конфиденциальность и запись консультаций
                </h2>
                <div className="space-y-6 text-[#718096] leading-relaxed">
                  <div className="bg-gradient-to-r from-[#A8B5FF]/5 to-[#C8F5E8]/5 rounded-2xl p-6 border border-[#A8B5FF]/10">
                    <h3 className="text-base sm:text-lg font-semibold text-[#2D3748] mb-3">
                      Мы гарантируем конфиденциальность:
                    </h3>
                    <ul className="space-y-2 text-sm sm:text-base">
                      <li className="flex items-start gap-2">
                        <Shield className="w-5 h-5 text-[#A8B5FF] flex-shrink-0 mt-0.5" />
                        <span>Все консультации защищены профессиональной тайной психолога</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Shield className="w-5 h-5 text-[#A8B5FF] flex-shrink-0 mt-0.5" />
                        <span>Информация не передаётся третьим лицам без вашего согласия</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Shield className="w-5 h-5 text-[#A8B5FF] flex-shrink-0 mt-0.5" />
                        <span>Данные хранятся в зашифрованном виде</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-[#2D3748] mb-3">
                      Исключения из правила конфиденциальности:
                    </h3>
                    <p className="text-sm sm:text-base mb-3">
                      Психолог обязан нарушить конфиденциальность только в следующих случаях:
                    </p>
                    <ul className="space-y-2 text-sm sm:text-base ml-6">
                      <li className="list-disc">
                        При наличии реальной угрозы жизни или здоровью вам или другим людям
                      </li>
                      <li className="list-disc">
                        При выявлении случаев насилия над детьми
                      </li>
                      <li className="list-disc">
                        По требованию суда в рамках уголовного дела
                      </li>
                    </ul>
                  </div>

                  <div className="bg-gradient-to-r from-[#FF9A9A]/5 to-[#FFC97F]/5 rounded-2xl p-6 border border-[#FF9A9A]/10">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-6 h-6 text-[#FF9A9A] flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm sm:text-base text-[#2D3748] font-medium mb-2">
                          Важно о записи консультаций:
                        </p>
                        <p className="text-sm sm:text-base text-[#718096]">
                          Платформа НЕ записывает аудио или видео консультаций без вашего явного письменного 
                          согласия. Вам также запрещается записывать консультации без согласия психолога.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </section>

            {/* Section 8: Information */}
            <section id="information" className="mb-16 sm:mb-20 scroll-mt-32">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-2xl sm:text-3xl font-semibold text-[#2D3748] mb-6 sm:mb-8 pb-4 border-b border-gray-200">
                  8. Использование информации с платформы
                </h2>
                <div className="space-y-6 text-[#718096] leading-relaxed">
                  <p className="text-sm sm:text-base">
                    Все образовательные материалы, статьи, видео и другой контент на платформе предоставляются 
                    исключительно в информационных целях.
                  </p>

                  <div className="bg-gradient-to-r from-[#FFC97F]/5 to-[#FFD4B5]/5 rounded-2xl p-6 border border-[#FFC97F]/10">
                    <h3 className="text-base sm:text-lg font-semibold text-[#2D3748] mb-3">
                      Информация на платформе:
                    </h3>
                    <ul className="space-y-2 text-sm sm:text-base">
                      <li className="flex items-start gap-2">
                        <Info className="w-5 h-5 text-[#FFC97F] flex-shrink-0 mt-0.5" />
                        <span>НЕ является медицинской консультацией или диагностикой</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Info className="w-5 h-5 text-[#FFC97F] flex-shrink-0 mt-0.5" />
                        <span>НЕ заменяет личную консультацию со специалистом</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Info className="w-5 h-5 text-[#FFC97F] flex-shrink-0 mt-0.5" />
                        <span>Предназначена для общего образования и повышения осведомлённости</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Info className="w-5 h-5 text-[#FFC97F] flex-shrink-0 mt-0.5" />
                        <span>Может содержать мнения авторов, не обязательно отражающие позицию платформы</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-[#2D3748] mb-3">
                      Авторские права:
                    </h3>
                    <p className="text-sm sm:text-base">
                      Все материалы платформы защищены авторским правом. Запрещается:
                    </p>
                    <ul className="space-y-2 text-sm sm:text-base ml-6 mt-3">
                      <li className="list-disc">Копирование и распространение материалов без разрешения</li>
                      <li className="list-disc">Коммерческое использование контента</li>
                      <li className="list-disc">Изменение или переработка материалов</li>
                      <li className="list-disc">Выдача материалов за свои собственные</li>
                    </ul>
                  </div>
                </div>
              </motion.div>
            </section>

            {/* Section 9: Links */}
            <section id="links" className="mb-16 sm:mb-20 scroll-mt-32">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-2xl sm:text-3xl font-semibold text-[#2D3748] mb-6 sm:mb-8 pb-4 border-b border-gray-200">
                  9. Внешние ресурсы и ссылки
                </h2>
                <div className="space-y-6 text-[#718096] leading-relaxed">
                  <p className="text-sm sm:text-base">
                    Платформа может содержать ссылки на внешние сайты и ресурсы для дополнительной информации.
                  </p>

                  <div className="bg-gradient-to-r from-[#FFD4B5]/5 to-[#FFC97F]/5 rounded-2xl p-6 border border-[#FFD4B5]/10">
                    <h3 className="text-base sm:text-lg font-semibold text-[#2D3748] mb-3">
                      Важно знать:
                    </h3>
                    <ul className="space-y-2 text-sm sm:text-base">
                      <li className="flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 text-[#FFD4B5] flex-shrink-0 mt-0.5" />
                        <span>
                          Мы не контролируем содержание внешних сайтов
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 text-[#FFD4B5] flex-shrink-0 mt-0.5" />
                        <span>
                          Не несём ответственности за информацию на сторонних ресурсах
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 text-[#FFD4B5] flex-shrink-0 mt-0.5" />
                        <span>
                          Ссылки предоставляются исключительно для удобства
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 text-[#FFD4B5] flex-shrink-0 mt-0.5" />
                        <span>
                          Переход по внешним ссылкам осуществляется на ваш риск
                        </span>
                      </li>
                    </ul>
                  </div>

                  <p className="text-sm sm:text-base">
                    Перед использованием информации со сторонних сайтов рекомендуем проверять её актуальность 
                    и достоверность из нескольких источников.
                  </p>
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
                  <p className="text-sm sm:text-base">
                    Если у вас есть вопросы о данном отказе от ответственности или услугах платформы, 
                    свяжитесь с нами:
                  </p>

                  <div className="bg-gradient-to-br from-[#C8F5E8]/5 via-[#7FD99A]/5 to-[#A8B5FF]/5 rounded-2xl p-6 sm:p-8 border border-gray-200">
                    <div className="space-y-5">
                      <div>
                        <p className="text-sm text-[#718096] mb-2">Организация:</p>
                        <p className="text-base sm:text-lg font-semibold text-[#2D3748]">
                          ООО «Эмоциональный балан��»
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-[#718096] mb-2">Email для вопросов:</p>
                          <a 
                            href="mailto:support@emotional-balance.ru" 
                            className="flex items-center gap-2 text-base font-medium text-[#FFC97F] hover:underline"
                          >
                            <Mail className="w-5 h-5" />
                            support@emotional-balance.ru
                          </a>
                        </div>

                        <div>
                          <p className="text-sm text-[#718096] mb-2">Телефон поддержки:</p>
                          <a 
                            href="tel:+78001234567" 
                            className="flex items-center gap-2 text-base font-medium text-[#FFC97F] hover:underline"
                          >
                            <Phone className="w-5 h-5" />
                            8 (800) 123-45-67
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

                  <div className="bg-gradient-to-r from-[#A8B5FF]/5 to-[#C8F5E8]/5 rounded-2xl p-6 border border-[#A8B5FF]/10">
                    <p className="text-sm sm:text-base text-[#2D3748] font-medium mb-2">
                      Обновления документа:
                    </p>
                    <p className="text-sm sm:text-base text-[#718096]">
                      Мы можем периодически обновлять этот отказ от ответственности. Актуальная версия 
                      всегда доступна на нашем сайте. Рекомендуем периодически проверять эту страницу 
                      для ознакомления с изменениями.
                    </p>
                  </div>
                </div>
              </motion.div>
            </section>
          </div>

          {/* Bottom Notice */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="bg-gradient-to-r from-[#FFC97F]/10 to-[#FFD4B5]/10 rounded-2xl p-6 mb-6 border border-[#FFC97F]/20">
              <p className="text-sm sm:text-base text-[#2D3748] font-medium mb-2">
                Принятие условий:
              </p>
              <p className="text-sm sm:text-base text-[#718096]">
                Используя платформу «Эмоциональный баланс», вы подтверждаете, что прочитали и понимаете 
                настоящий отказ от ответственности и соглашаетесь с его условиями. Если вы не согласны 
                с какими-либо условиями, пожалуйста, прекратите использование платформы.
              </p>
            </div>

            <p className="text-sm text-[#718096] text-center mb-6">
              Последнее обновление: 28 января 2026 • Версия 1.0
            </p>
            <div className="flex justify-center">
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#FFC97F] to-[#FFD4B5] text-white font-medium shadow-[0_4px_12px_-2px_rgba(255,201,127,0.4)] hover:shadow-[0_6px_16px_-2px_rgba(255,201,127,0.5)] active:scale-[0.98] transition-all"
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
