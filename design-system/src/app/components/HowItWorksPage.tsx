import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { 
  ArrowRight, User, Compass, CheckCircle2, 
  PlayCircle, Calendar, Sparkles, BookOpen,
  AlertCircle, ChevronDown
} from 'lucide-react';
import { useState } from 'react';

interface HowItWorksPageProps {
  viewport: 'mobile' | 'desktop';
}

function FAQItem({ question, answer, isOpen, onToggle, viewport }: { 
  question: string; 
  answer: string; 
  isOpen: boolean; 
  onToggle: () => void;
  viewport: 'mobile' | 'desktop';
}) {
  return (
    <Card className="border-2">
      <CardContent className="p-0">
        <button
          onClick={onToggle}
          className="w-full p-5 text-left flex items-start justify-between gap-4 hover:bg-muted/50 transition-colors"
        >
          <span className={`font-semibold text-foreground leading-snug ${viewport === 'mobile' ? 'text-sm' : 'text-base'}`}>
            {question}
          </span>
          <ChevronDown 
            className={`w-5 h-5 text-muted-foreground flex-shrink-0 transition-transform mt-0.5 ${
              isOpen ? 'rotate-180' : ''
            }`} 
          />
        </button>
        {isOpen && (
          <div className="px-5 pb-5 pt-0">
            <p className="text-sm text-muted-foreground leading-relaxed">
              {answer}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function HowItWorksPage({ viewport }: HowItWorksPageProps) {
  const [openFAQ, setOpenFAQ] = useState<number | null>(0);

  const faqs = [
    {
      question: 'Нужно ли мне регистрироваться?',
      answer: 'Базовые материалы и инструменты доступны без регистрации. Для сохранения прогресса в практиках, доступа к персональным рекомендациям и истории прохождения упражнений потребуется создать аккаунт. Регистрация бесплатная и занимает меньше минуты.'
    },
    {
      question: 'Сколько времени нужно уделять практикам?',
      answer: 'Это зависит от вас. Некоторые техники занимают 2-3 минуты (например, дыхательные упражнения), другие — 15-20 минут (медитации, письменные практики). Мы рекомендуем начать с 10-15 минут в день и постепенно находить комфортный для вас ритм.'
    },
    {
      question: 'Как быстро я увижу результаты?',
      answer: 'Это очень индивидуально. Некоторые техники (например, дыхательные упражнения) дают почти мгновенный эффект снижения тревоги. Для более глубоких изменений в паттернах мышления обычно требуется несколько недель регулярной практики. Исследования показывают, что заметные улучшения появляются через 4-8 недель систематической работы.'
    },
    {
      question: 'Могу ли я использовать это вместо психотерапии?',
      answer: 'Платформа может быть полезным дополнением к терапии или инструментом для самостоятельной работы при лёгких и умеренных эмоциональных трудностях. Однако она не заменяет профессиональную помощь при серьёзных состояниях, таких как клиническая депрессия, тревожные расстройства, травма или суицидальные мысли. В таких случаях необходима работа с квалифицированным специалистом.'
    },
    {
      question: 'Как вы защищаете мои личные данные?',
      answer: 'Мы используем шифрование данных, не передаём вашу информацию третьим лицам и следуем лучшим практикам информационной безопасности. Результаты самодиагностики и записи из дневника эмоций видны только вам. Подробнее — в Политике конфиденциальности.'
    },
    {
      question: 'Можно ли использовать платформу на смартфоне?',
      answer: 'Да, платформа полностью адаптирована для мобильных устройств. Вы можете использовать её через браузер на любом смартфоне или планшете. Мобильное приложение находится в разработке.'
    },
    {
      question: 'Что делать, если техника не помогает?',
      answer: 'Это нормально — не все методы одинаково эффективны для всех людей. Попробуйте другие инструменты из навигатора. Если вы систематически практикуете в течение 2-3 недель и не замечаете улучшений, возможно, стоит обратиться к психологу для более персонализированной помощи.'
    },
    {
      question: 'Есть ли противопоказания к использованию?',
      answer: 'Некоторые практики осознанности могут быть не рекомендованы при острых психотических состояниях или недавней тяжёлой травме без поддержки специалиста. При наличии диагностированных психических расстройств проконсультируйтесь с вашим лечащим врачом перед началом самостоятельной работы.'
    }
  ];

  return (
    <section>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-foreground mb-2">
          How it works (/how-it-works) — Content + FAQ — {viewport === 'mobile' ? 'Mobile (375px)' : 'Desktop (1440px)'}
        </h2>
        <p className="text-sm text-muted-foreground">
          Как это работает с FAQ и дисклеймером
        </p>
      </div>

      <div className={`mx-auto border-2 border-border rounded-xl overflow-hidden bg-background ${
        viewport === 'mobile' ? 'max-w-[375px]' : 'max-w-full'
      }`}>
        {/* Top Navigation */}
        {viewport === 'mobile' ? (
          <div className="flex items-center justify-between p-4 border-b border-border bg-card">
            <button className="p-2 hover:bg-muted rounded-lg min-w-[44px] min-h-[44px]">
              <ArrowRight className="w-5 h-5 text-foreground rotate-180" />
            </button>
            <h3 className="font-semibold text-foreground">Как это работает</h3>
            <button className="p-2 hover:bg-muted rounded-lg relative min-w-[44px] min-h-[44px]">
              <User className="w-5 h-5 text-foreground" />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between px-12 py-4 border-b border-border bg-card">
            <div className="flex items-center gap-8">
              <h3 className="font-bold text-xl text-foreground">Эмоциональный баланс</h3>
              <nav className="flex gap-6">
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Начало</a>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Навигатор</a>
                <a href="#" className="text-sm font-medium text-primary">Как работает</a>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Профиль</a>
              </nav>
            </div>
            <Button variant="ghost" size="sm">
              <User className="w-4 h-4 mr-2" />
              Профиль
            </Button>
          </div>
        )}

        {/* Content */}
        <div className={viewport === 'mobile' ? 'p-6 py-8' : 'p-12 py-16'}>
          <div className={viewport === 'mobile' ? '' : 'max-w-4xl mx-auto'}>
            {/* Header */}
            <div className={`mb-10 ${viewport === 'mobile' ? '' : 'text-center'}`}>
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Compass className="w-6 h-6 text-primary" />
                </div>
              </div>
              <h1 className={`font-bold text-foreground mb-3 ${viewport === 'mobile' ? 'text-2xl' : 'text-3xl'}`}>
                Как работает платформа
              </h1>
              <p className={`text-muted-foreground leading-relaxed ${viewport === 'mobile' ? 'text-sm' : 'text-base max-w-2xl mx-auto'}`}>
                Простой и структурированный подход к развитию эмоциональной осознанности 
                и психологической гибкости.
              </p>
            </div>

            {/* Prose Content */}
            <div className="prose prose-sm max-w-none">
              <div className="text-base leading-relaxed text-muted-foreground space-y-6">
                <h2 className={`font-bold text-foreground mt-0 mb-4 ${viewport === 'mobile' ? 'text-xl' : 'text-2xl'}`}>
                  Четыре шага к эмоциональному балансу
                </h2>

                <p>
                  Мы разработали простой процесс, который поможет вам последовательно развивать 
                  навыки работы с эмоциями — от первого знакомства с методами до регулярной 
                  самостоятельной практики.
                </p>

                {/* Step Cards */}
                <div className="space-y-5 my-8">
                  {/* Step 1 */}
                  <Card className="border-2 border-primary/20 bg-primary/5">
                    <CardContent className="p-5">
                      <div className="flex gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-bold text-lg">1</span>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground text-base mb-2 flex items-center gap-2">
                            <Compass className="w-5 h-5 text-primary" />
                            Пройдите интерактивный навигатор
                          </h3>
                          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                            Ответьте на короткие вопросы о вашем текущем состоянии, целях и 
                            предпочтениях. Навигатор поможет определить, какие инструменты 
                            и практики будут наиболее полезны именно вам.
                          </p>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">
                              5-7 минут
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              Персональные рекомендации
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Step 2 */}
                  <Card className="border-2">
                    <CardContent className="p-5">
                      <div className="flex gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-bold text-lg">2</span>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground text-base mb-2 flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-primary" />
                            Изучите базовые материалы
                          </h3>
                          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                            Познакомьтесь с научными основами методов через статьи, видео и 
                            аудио-материалы. Понимание того, <em className="text-foreground">как</em> и <em className="text-foreground">почему</em> работают 
                            техники, значительно повышает их эффективность.
                          </p>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              Статьи
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              Видео
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              Глоссарий
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Step 3 */}
                  <Card className="border-2">
                    <CardContent className="p-5">
                      <div className="flex gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-bold text-lg">3</span>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground text-base mb-2 flex items-center gap-2">
                            <PlayCircle className="w-5 h-5 text-primary" />
                            Практикуйте регулярно
                          </h3>
                          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                            Выберите 2-3 практики из рекомендованных и включите их в свой 
                            распорядок дня. Начните с коротких упражнений (5-10 минут) и 
                            постепенно увеличивайте продолжительность по мере привыкания.
                          </p>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              Дыхательные техники
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              Медитации
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              Ритуалы
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Step 4 */}
                  <Card className="border-2">
                    <CardContent className="p-5">
                      <div className="flex gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-bold text-lg">4</span>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground text-base mb-2 flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-primary" />
                            Отслеживайте прогресс
                          </h3>
                          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                            Используйте дневник эмоций для отслеживания изменений в вашем 
                            состоянии. Периодически проходите навигатор заново, чтобы 
                            корректировать набор практик под актуальные потребности.
                          </p>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              Дневник эмоций
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              Трекинг практик
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="border-l-4 border-l-primary bg-primary/5 my-6">
                  <CardContent className="p-5">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      <strong className="text-foreground font-semibold">Важный принцип:</strong> Эффективность 
                      любой практики зависит от регулярности, а не от интенсивности. Лучше 
                      10 минут каждый день, чем час раз в неделю. Постепенность и постоянство — 
                      ключ к устойчивым изменениям.
                    </p>
                  </CardContent>
                </Card>

                <h2 className={`font-bold text-foreground mt-10 mb-4 ${viewport === 'mobile' ? 'text-xl' : 'text-2xl'}`}>
                  Что входит в платформу
                </h2>

                <div className="grid grid-cols-1 gap-4 my-6">
                  <Card className="border-2">
                    <CardContent className="p-5">
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Compass className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground text-base mb-1">
                            Интерактивный навигатор
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Адаптивная система рекомендаций на основе вашего текущего состояния, 
                            целей и предпочтений.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-2">
                    <CardContent className="p-5">
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <BookOpen className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground text-base mb-1">
                            Образовательные ресурсы
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Статьи, видео, подкасты и глоссарий терминов по КПТ, осознанности 
                            и нейробиологии эмоций.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-2">
                    <CardContent className="p-5">
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <PlayCircle className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground text-base mb-1">
                            Библиотека практик
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Управляемые медитации, дыхательные упражнения, когнитивные техники 
                            и ритуалы для ежедневной практики.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-2">
                    <CardContent className="p-5">
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <CheckCircle2 className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground text-base mb-1">
                            Инструменты отслеживания
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Дневник эмоций, трекер практик и инструменты самодиагностики для 
                            мониторинга прогресса.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-2">
                    <CardContent className="p-5">
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Calendar className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground text-base mb-1">
                            База специалистов
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Проверенные психологи и психотерапевты для тех, кто готов к работе 
                            с профессионалом.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="border-t border-border bg-muted/30">
          <div className={viewport === 'mobile' ? 'px-6 py-10' : 'px-12 py-16'}>
            <div className={viewport === 'mobile' ? '' : 'max-w-4xl mx-auto'}>
              <h2 className={`font-bold text-foreground mb-6 ${viewport === 'mobile' ? 'text-xl' : 'text-2xl'}`}>
                Частые вопросы
              </h2>

              <div className="space-y-3">
                {faqs.map((faq, index) => (
                  <FAQItem
                    key={index}
                    question={faq.question}
                    answer={faq.answer}
                    isOpen={openFAQ === index}
                    onToggle={() => setOpenFAQ(openFAQ === index ? null : index)}
                    viewport={viewport}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Disclaimer Section */}
        <div className="border-t border-border">
          <div className={viewport === 'mobile' ? 'px-6 py-10' : 'px-12 py-16'}>
            <div className={viewport === 'mobile' ? '' : 'max-w-4xl mx-auto'}>
              <Card className="border-2 border-warning/40 bg-warning/5">
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-warning/20 flex items-center justify-center">
                        <AlertCircle className="w-5 h-5 text-warning" />
                      </div>
                    </div>
                    <div>
                      <h3 className={`font-bold text-foreground mb-3 ${viewport === 'mobile' ? 'text-base' : 'text-lg'}`}>
                        Важная информация и ограничения
                      </h3>
                      <div className="text-sm text-muted-foreground leading-relaxed space-y-3">
                        <p>
                          <strong className="text-foreground">Платформа не является медицинской услугой.</strong> Материалы 
                          и инструменты предназначены для самопомощи и образовательных целей. 
                          Они не заменяют профессиональную диагностику, лечение или психотерапию.
                        </p>
                        <p>
                          <strong className="text-foreground">Когда необходима профессиональная помощь:</strong> Если 
                          вы испытываете суицидальные мысли, тяжёлую депрессию, симптомы психоза, 
                          последствия травмы или другие серьёзные психические расстройства, 
                          пожалуйста, обратитесь к квалифицированному специалисту.
                        </p>
                        <p>
                          <strong className="text-foreground">Экстренная помощь:</strong> В кризисных ситуациях 
                          звоните на горячую линию психологической помощи: <span className="font-mono text-foreground">8-800-2000-122</span> (бесплатно, круглосуточно).
                        </p>
                        <p>
                          Используя платформу, вы подтверждаете, что понимаете эти ограничения 
                          и несёте ответственность за решение о применении предложенных методов.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="border-t border-border bg-gradient-to-br from-primary/5 to-accent/5">
          <div className={viewport === 'mobile' ? 'px-6 py-10' : 'px-12 py-12'}>
            <div className={`text-center ${viewport === 'mobile' ? '' : 'max-w-2xl mx-auto'}`}>
              <p className="text-base text-muted-foreground mb-6 leading-relaxed">
                Всё ещё есть вопросы? Начните с прохождения навигатора — 
                это поможет вам лучше понять возможности платформы.
              </p>
              <div className={`space-y-3 ${viewport === 'mobile' ? '' : 'flex gap-4 justify-center space-y-0'}`}>
                <Button size="lg" className={`gap-2 ${viewport === 'mobile' ? 'w-full' : ''}`}>
                  <Sparkles className="w-5 h-5" />
                  Начать с навигатора
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  className={`gap-2 ${viewport === 'mobile' ? 'w-full' : ''}`}
                >
                  <BookOpen className="w-5 h-5" />
                  Читать о проекте
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
