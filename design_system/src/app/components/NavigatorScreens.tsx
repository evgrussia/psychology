import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { 
  ArrowRight, Menu, User, Target, Brain, Heart, 
  Zap, CheckCircle2, Calendar, Send, Sparkles
} from 'lucide-react';

interface NavigatorScreensProps {
  viewport: 'mobile' | 'desktop';
}

export function NavigatorScreens({ viewport }: NavigatorScreensProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  return (
    <>
      {/* Screen: Interactive / Navigator / [slug] - Shell + Flow */}
      <section>
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-foreground mb-2">
            Interactive / Navigator / [slug] — Shell + Flow — {viewport === 'mobile' ? 'Mobile (375px)' : 'Desktop (1440px)'}
          </h2>
          <p className="text-sm text-muted-foreground">
            Навигатор запроса с пошаговым flow
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
              <h3 className="font-semibold text-foreground">Навигатор</h3>
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
                  <a href="#" className="text-sm font-medium text-primary">Навигатор</a>
                  <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Библиотека</a>
                  <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Профиль</a>
                </nav>
              </div>
              <Button variant="outline" className="gap-2">
                Пропустить
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* Page Shell with soft background */}
          <div className="bg-gradient-to-br from-muted/30 via-background to-accent/5 min-h-[600px]">
            {/* Progress Header */}
            <div className={viewport === 'mobile' ? 'p-4 pt-6' : 'px-12 pt-8 pb-6'}>
              <div className={viewport === 'mobile' ? '' : 'max-w-4xl mx-auto'}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Target className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">Навигатор запроса</h4>
                      <p className="text-xs text-muted-foreground">Шаг {currentStep} из {totalSteps}</p>
                    </div>
                  </div>
                  {viewport === 'mobile' && (
                    <Button variant="ghost" size="sm">Пропустить</Button>
                  )}
                </div>
                <Progress value={(currentStep / totalSteps) * 100} className="h-2" />
              </div>
            </div>

            {/* Content Container */}
            <div className={`flex items-center justify-center ${viewport === 'mobile' ? 'p-6 pb-8' : 'px-12 pb-12'}`}>
              <div className={viewport === 'mobile' ? 'w-full' : 'max-w-4xl w-full'}>
                {/* Step 1: Main concern */}
                {currentStep === 1 && (
                  <Card className="border-2 shadow-lg">
                    <CardContent className={viewport === 'mobile' ? 'p-6' : 'p-8'}>
                      <div className="text-center mb-8">
                        <Badge variant="secondary" className="mb-4">Вопрос 1 из 3</Badge>
                        <h2 className={`font-bold text-foreground mb-3 ${viewport === 'mobile' ? 'text-xl' : 'text-2xl'}`}>
                          Что вас беспокоит больше всего?
                        </h2>
                        <p className="text-muted-foreground text-sm">
                          Выберите то, что сейчас вызывает наибольший дискомфорт
                        </p>
                      </div>

                      <div className="space-y-3 mb-8">
                        {[
                          {
                            icon: Brain,
                            title: 'Тревога и беспокойство',
                            description: 'Постоянное напряжение, навязчивые мысли, трудно расслабиться',
                            color: 'primary'
                          },
                          {
                            icon: Zap,
                            title: 'Усталость и выгорание',
                            description: 'Нет сил, эмоциональное истощение, апатия',
                            color: 'danger'
                          },
                          {
                            icon: Heart,
                            title: 'Сложности в отношениях',
                            description: 'Конфликты, непонимание, трудно выстраивать границы',
                            color: 'info'
                          },
                          {
                            icon: Sparkles,
                            title: 'Неуверенность в себе',
                            description: 'Низкая самооценка, самокритика, страх оценки',
                            color: 'warning'
                          },
                        ].map((option, idx) => (
                          <button
                            key={idx}
                            onClick={() => setCurrentStep(2)}
                            className={`w-full text-left p-4 rounded-xl border-2 transition-all min-h-[80px] hover:border-primary hover:bg-primary/5 hover:shadow-md ${
                              'border-border'
                            }`}
                          >
                            <div className="flex items-start gap-4">
                              <div className={`w-12 h-12 rounded-lg bg-${option.color}/10 text-${option.color} flex items-center justify-center flex-shrink-0`}>
                                <option.icon className="w-6 h-6" />
                              </div>
                              <div className="flex-1">
                                <h3 className="font-semibold text-foreground mb-1">{option.title}</h3>
                                <p className="text-sm text-muted-foreground">{option.description}</p>
                              </div>
                              <ArrowRight className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          </button>
                        ))}
                      </div>

                      {viewport === 'desktop' && (
                        <div className="text-center text-sm text-muted-foreground">
                          Не уверены? Это нормально. Выберите то, что кажется ближе всего
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Step 2: Intensity */}
                {currentStep === 2 && (
                  <Card className="border-2 shadow-lg">
                    <CardContent className={viewport === 'mobile' ? 'p-6' : 'p-8'}>
                      <div className="text-center mb-8">
                        <Badge variant="secondary" className="mb-4">Вопрос 2 из 3</Badge>
                        <h2 className={`font-bold text-foreground mb-3 ${viewport === 'mobile' ? 'text-xl' : 'text-2xl'}`}>
                          Как сильно это влияет на вашу жизнь?
                        </h2>
                        <p className="text-muted-foreground text-sm">
                          Оцените, насколько это мешает вашей повседневной активности
                        </p>
                      </div>

                      <div className="space-y-3 mb-8">
                        {[
                          {
                            level: 'Слабо',
                            description: 'Иногда замечаю, но в целом справляюсь',
                            intensity: 'low'
                          },
                          {
                            level: 'Умеренно',
                            description: 'Регулярно мешает, требуется усилие',
                            intensity: 'medium'
                          },
                          {
                            level: 'Сильно',
                            description: 'Значительно влияет на работу, отношения, сон',
                            intensity: 'high'
                          },
                          {
                            level: 'Очень сильно',
                            description: 'Практически парализует, не могу нормально функционировать',
                            intensity: 'critical'
                          },
                        ].map((option, idx) => (
                          <button
                            key={idx}
                            onClick={() => setCurrentStep(3)}
                            className="w-full text-left p-5 rounded-xl border-2 transition-all min-h-[72px] hover:border-primary hover:bg-primary/5 hover:shadow-md border-border"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h3 className="font-semibold text-foreground">{option.level}</h3>
                                  <div className="flex gap-1">
                                    {[...Array(4)].map((_, i) => (
                                      <div
                                        key={i}
                                        className={`w-2 h-2 rounded-full ${
                                          i <= idx ? 'bg-primary' : 'bg-muted'
                                        }`}
                                      />
                                    ))}
                                  </div>
                                </div>
                                <p className="text-sm text-muted-foreground">{option.description}</p>
                              </div>
                              <ArrowRight className="w-5 h-5 text-muted-foreground ml-4 flex-shrink-0" />
                            </div>
                          </button>
                        ))}
                      </div>

                      <Button 
                        variant="ghost" 
                        className="w-full gap-2"
                        onClick={() => setCurrentStep(1)}
                      >
                        <ArrowRight className="w-4 h-4 rotate-180" />
                        Назад
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {/* Step 3: Goal */}
                {currentStep === 3 && (
                  <Card className="border-2 shadow-lg">
                    <CardContent className={viewport === 'mobile' ? 'p-6' : 'p-8'}>
                      <div className="text-center mb-8">
                        <Badge variant="secondary" className="mb-4">Вопрос 3 из 3</Badge>
                        <h2 className={`font-bold text-foreground mb-3 ${viewport === 'mobile' ? 'text-xl' : 'text-2xl'}`}>
                          Что вы хотите получить?
                        </h2>
                        <p className="text-muted-foreground text-sm">
                          Выберите цель, которая для вас наиболее важна сейчас
                        </p>
                      </div>

                      <div className="space-y-3 mb-8">
                        {[
                          {
                            goal: 'Понять причины',
                            description: 'Разобраться, почему так происходит',
                            icon: Brain
                          },
                          {
                            goal: 'Научиться справляться',
                            description: 'Получить конкретные техники и инструменты',
                            icon: Target
                          },
                          {
                            goal: 'Улучшить самочувствие',
                            description: 'Снизить напряжение, чувствовать себя лучше',
                            icon: Heart
                          },
                          {
                            goal: 'Получить поддержку',
                            description: 'Быть услышанным, не справляться в одиночку',
                            icon: Sparkles
                          },
                        ].map((option, idx) => (
                          <button
                            key={idx}
                            className="w-full text-left p-5 rounded-xl border-2 transition-all min-h-[72px] hover:border-primary hover:bg-primary/5 hover:shadow-md border-border"
                          >
                            <div className="flex items-start gap-4">
                              <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                                <option.icon className="w-5 h-5" />
                              </div>
                              <div className="flex-1">
                                <h3 className="font-semibold text-foreground mb-1">{option.goal}</h3>
                                <p className="text-sm text-muted-foreground">{option.description}</p>
                              </div>
                              <ArrowRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                            </div>
                          </button>
                        ))}
                      </div>

                      <Button 
                        variant="ghost" 
                        className="w-full gap-2"
                        onClick={() => setCurrentStep(2)}
                      >
                        <ArrowRight className="w-4 h-4 rotate-180" />
                        Назад
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Screen: Interactive / Navigator / [slug] - Results */}
      <section>
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-foreground mb-2">
            Interactive / Navigator / [slug] — Results — {viewport === 'mobile' ? 'Mobile (375px)' : 'Desktop (1440px)'}
          </h2>
          <p className="text-sm text-muted-foreground">
            Результаты навигатора с рекомендациями
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
              <h3 className="font-semibold text-foreground">Рекомендации</h3>
              <div className="w-[44px]" />
            </div>
          ) : (
            <div className="flex items-center justify-between px-12 py-4 border-b border-border bg-card">
              <Button variant="ghost" className="gap-2">
                <ArrowRight className="w-4 h-4 rotate-180" />
                Вернуться к началу
              </Button>
              <h3 className="font-bold text-xl text-foreground">Эмоциональный баланс</h3>
              <div className="w-32" />
            </div>
          )}

          {/* Content */}
          <div className="bg-gradient-to-br from-muted/30 via-background to-accent/5">
            <div className={viewport === 'mobile' ? 'p-6 py-8 space-y-8' : 'p-12 space-y-10'}>
              <div className={viewport === 'mobile' ? '' : 'max-w-4xl mx-auto'}>
                {/* Results Header */}
                <div className="text-center mb-8">
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-10 h-10 text-primary" />
                  </div>
                  <h1 className={`font-bold text-foreground mb-3 ${viewport === 'mobile' ? 'text-2xl' : 'text-3xl'}`}>
                    Вот что мы вам рекомендуем
                  </h1>
                  <p className="text-muted-foreground">
                    На основе ваших ответов мы подобрали подходящие инструменты и материалы
                  </p>
                </div>

                {/* Recommended Tools */}
                <div className="space-y-6 mb-10">
                  <h2 className={`font-semibold text-foreground ${viewport === 'mobile' ? 'text-xl' : 'text-2xl'}`}>
                    Подходящие инструменты
                  </h2>

                  <div className="grid gap-4">
                    {[
                      {
                        title: 'Тест на уровень тревожности',
                        description: 'Получите точную оценку вашего состояния по шкале GAD-7',
                        time: '5 минут',
                        badge: 'Рекомендуем начать с этого',
                        icon: Brain,
                        color: 'primary'
                      },
                      {
                        title: 'Дыхательные практики',
                        description: '3 техники быстрого снижения тревоги для повседневного использования',
                        time: '10 минут',
                        badge: null,
                        icon: Heart,
                        color: 'success'
                      },
                      {
                        title: 'Дневник эмоций',
                        description: 'Отслеживайте триггеры и паттерны вашей тревожности',
                        time: 'Ежедневно',
                        badge: null,
                        icon: Target,
                        color: 'info'
                      },
                    ].map((tool, idx) => (
                      <Card key={idx} className="hover:shadow-lg transition-shadow cursor-pointer group">
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4">
                            <div className={`w-12 h-12 rounded-xl bg-${tool.color}/10 text-${tool.color} flex items-center justify-center flex-shrink-0`}>
                              <tool.icon className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                              {tool.badge && (
                                <Badge variant="secondary" className="mb-2">{tool.badge}</Badge>
                              )}
                              <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                                {tool.title}
                              </h3>
                              <p className="text-sm text-muted-foreground mb-3">{tool.description}</p>
                              <div className="flex items-center justify-between">
                                <Badge variant="outline">{tool.time}</Badge>
                                <Button variant="ghost" size="sm" className="gap-2 group">
                                  Попробовать
                                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Next Steps */}
                <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
                  <CardContent className={viewport === 'mobile' ? 'p-6' : 'p-8'}>
                    <h2 className="font-semibold text-foreground mb-4">Следующие шаги</h2>
                    <ul className="space-y-3 mb-6">
                      {[
                        'Начните с теста, чтобы понять ваш базовый уровень тревоги',
                        'Попробуйте дыхательные практики — они дают быстрый эффект',
                        'Заведите дневник эмоций для отслеживания динамики',
                        'Если тревога сильная — запишитесь на консультацию',
                      ].map((step, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-sm">
                          <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 font-semibold text-xs">
                            {idx + 1}
                          </div>
                          <span className="text-foreground pt-0.5">{step}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* CTA Section */}
                <div className="text-center pt-6">
                  <p className="text-sm text-muted-foreground mb-6">
                    Хотите работать с психологом индивидуально?
                  </p>
                  <div className={`flex gap-3 ${viewport === 'mobile' ? 'flex-col' : 'flex-row justify-center'}`}>
                    <Button size="lg" className={`gap-2 ${viewport === 'mobile' ? 'w-full' : ''}`}>
                      Записаться на консультацию
                      <Calendar className="w-4 h-4" />
                    </Button>
                    <Button size="lg" variant="outline" className={`gap-2 ${viewport === 'mobile' ? 'w-full' : ''}`}>
                      Написать в Telegram
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
