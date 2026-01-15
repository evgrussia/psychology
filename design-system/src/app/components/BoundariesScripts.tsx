import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Alert, AlertDescription } from './ui/alert';
import { 
  ArrowRight, Shield, MessageCircle, Users, Briefcase,
  Heart, Coffee, Home, Phone, Copy, Check, AlertTriangle
} from 'lucide-react';

interface BoundariesScriptsProps {
  viewport: 'mobile' | 'desktop';
}

export function BoundariesScripts({ viewport }: BoundariesScriptsProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <>
      {/* Screen: Boundaries Scripts / [slug] - Scenario */}
      <section>
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-foreground mb-2">
            Start / Boundaries Scripts / [slug] — Scenario — {viewport === 'mobile' ? 'Mobile (375px)' : 'Desktop (1440px)'}
          </h2>
          <p className="text-sm text-muted-foreground">
            Выбор сценария для скриптов границ
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
              <h3 className="font-semibold text-foreground">Скрипты границ</h3>
              <div className="w-[44px]" />
            </div>
          ) : (
            <div className="flex items-center justify-between px-12 py-4 border-b border-border bg-card">
              <Button variant="ghost" className="gap-2">
                <ArrowRight className="w-4 h-4 rotate-180" />
                Назад
              </Button>
              <h3 className="font-bold text-xl text-foreground">Эмоциональный баланс</h3>
              <div className="w-20" />
            </div>
          )}

          {/* Progress Header */}
          <div className={`border-b border-border bg-card ${viewport === 'mobile' ? 'p-4' : 'px-12 py-6'}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Скрипты границ</h4>
                  <p className="text-xs text-muted-foreground">Шаг 1 из 4</p>
                </div>
              </div>
            </div>
            <Progress value={25} className="h-2" />
          </div>

          {/* Content */}
          <div className={viewport === 'mobile' ? 'p-6 py-8' : 'p-12'}>
            <div className={viewport === 'mobile' ? '' : 'max-w-5xl mx-auto'}>
              <div className="text-center mb-8">
                <h2 className={`font-bold text-foreground mb-3 ${viewport === 'mobile' ? 'text-xl' : 'text-2xl'}`}>
                  Выберите ситуацию
                </h2>
                <p className="text-muted-foreground text-sm">
                  В какой сфере вам нужна помощь с установлением границ?
                </p>
              </div>

              <div className={`grid gap-4 ${viewport === 'mobile' ? 'grid-cols-1' : 'grid-cols-2 lg:grid-cols-3'}`}>
                {[
                  {
                    icon: Briefcase,
                    name: 'Работа и коллеги',
                    description: 'Переработки, лишние задачи, профессиональные границы',
                    color: 'primary'
                  },
                  {
                    icon: Users,
                    name: 'Семья и родственники',
                    description: 'Советы, вмешательство, семейные конфликты',
                    color: 'info'
                  },
                  {
                    icon: Heart,
                    name: 'Партнёр и отношения',
                    description: 'Личное пространство, время для себя, ожидания',
                    color: 'danger'
                  },
                  {
                    icon: Coffee,
                    name: 'Друзья и знакомые',
                    description: 'Просьбы о помощи, токсичное общение, энергетические вампиры',
                    color: 'success'
                  },
                  {
                    icon: MessageCircle,
                    name: 'Соцсети и мессенджеры',
                    description: 'Постоянная доступность, нежелательные сообщения',
                    color: 'warning'
                  },
                  {
                    icon: Home,
                    name: 'Соседи и бытовые вопросы',
                    description: 'Шум, нарушение приватности, общие пространства',
                    color: 'accent'
                  },
                ].map((scenario, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentStep(2)}
                    className="text-left p-5 rounded-xl border-2 transition-all hover:border-primary hover:bg-primary/5 hover:shadow-md border-border group"
                  >
                    <div className={`w-12 h-12 rounded-lg bg-${scenario.color}/10 text-${scenario.color} flex items-center justify-center mb-4`}>
                      <scenario.icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                      {scenario.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {scenario.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Screen: Boundaries Scripts / [slug] - Tone */}
      <section>
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-foreground mb-2">
            Start / Boundaries Scripts / [slug] — Tone — {viewport === 'mobile' ? 'Mobile (375px)' : 'Desktop (1440px)'}
          </h2>
          <p className="text-sm text-muted-foreground">
            Выбор тона общения
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
              <h3 className="font-semibold text-foreground">Скрипты границ</h3>
              <div className="w-[44px]" />
            </div>
          ) : (
            <div className="flex items-center justify-between px-12 py-4 border-b border-border bg-card">
              <Button variant="ghost" className="gap-2">
                <ArrowRight className="w-4 h-4 rotate-180" />
                Назад
              </Button>
              <h3 className="font-bold text-xl text-foreground">Эмоциональный баланс</h3>
              <div className="w-20" />
            </div>
          )}

          {/* Progress Header */}
          <div className={`border-b border-border bg-card ${viewport === 'mobile' ? 'p-4' : 'px-12 py-6'}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Скрипты границ</h4>
                  <p className="text-xs text-muted-foreground">Шаг 2 из 4</p>
                </div>
              </div>
            </div>
            <Progress value={50} className="h-2" />
          </div>

          {/* Content */}
          <div className={`flex items-center justify-center ${viewport === 'mobile' ? 'p-6 min-h-[500px]' : 'p-12 min-h-[600px]'}`}>
            <div className={viewport === 'mobile' ? 'w-full' : 'max-w-2xl w-full'}>
              <div className="text-center mb-8">
                <h2 className={`font-bold text-foreground mb-3 ${viewport === 'mobile' ? 'text-xl' : 'text-2xl'}`}>
                  Выберите тон общения
                </h2>
                <p className="text-muted-foreground text-sm">
                  Как вы хотите донести свою границу?
                </p>
              </div>

              <div className="space-y-3">
                {[
                  {
                    tone: 'Мягко и деликатно',
                    description: 'Для близких людей, когда важно сохранить отношения. Использует "я-сообщения" и эмпатию',
                  },
                  {
                    tone: 'Уверенно и прямо',
                    description: 'Чёткая позиция без извинений. Подходит для повторных нарушений границ',
                  },
                  {
                    tone: 'Нейтрально и профессионально',
                    description: 'Для рабочих ситуаций. Вежливо, но без лишней эмоциональности',
                  },
                  {
                    tone: 'Твёрдо и категорично',
                    description: 'Для серьёзных нарушений. Без двусмысленностей, с чёткими последствиями',
                  },
                ].map((option, idx) => (
                  <Button
                    key={idx}
                    variant="secondary"
                    size="lg"
                    onClick={() => setCurrentStep(3)}
                    className="w-full text-left justify-start h-auto py-4 px-5"
                  >
                    <div className="flex-1">
                      <div className="font-semibold text-foreground mb-1">{option.tone}</div>
                      <div className="text-sm text-muted-foreground font-normal">
                        {option.description}
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground ml-4 flex-shrink-0" />
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Screen: Boundaries Scripts / [slug] - Goal */}
      <section>
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-foreground mb-2">
            Start / Boundaries Scripts / [slug] — Goal — {viewport === 'mobile' ? 'Mobile (375px)' : 'Desktop (1440px)'}
          </h2>
          <p className="text-sm text-muted-foreground">
            Выбор цели коммуникации
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
              <h3 className="font-semibold text-foreground">Скрипты границ</h3>
              <div className="w-[44px]" />
            </div>
          ) : (
            <div className="flex items-center justify-between px-12 py-4 border-b border-border bg-card">
              <Button variant="ghost" className="gap-2">
                <ArrowRight className="w-4 h-4 rotate-180" />
                Назад
              </Button>
              <h3 className="font-bold text-xl text-foreground">Эмоциональный баланс</h3>
              <div className="w-20" />
            </div>
          )}

          {/* Progress Header */}
          <div className={`border-b border-border bg-card ${viewport === 'mobile' ? 'p-4' : 'px-12 py-6'}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Скрипты границ</h4>
                  <p className="text-xs text-muted-foreground">Шаг 3 из 4</p>
                </div>
              </div>
            </div>
            <Progress value={75} className="h-2" />
          </div>

          {/* Content */}
          <div className={`flex items-center justify-center ${viewport === 'mobile' ? 'p-6 min-h-[500px]' : 'p-12 min-h-[600px]'}`}>
            <div className={viewport === 'mobile' ? 'w-full' : 'max-w-2xl w-full'}>
              <div className="text-center mb-8">
                <h2 className={`font-bold text-foreground mb-3 ${viewport === 'mobile' ? 'text-xl' : 'text-2xl'}`}>
                  Какова ваша цель?
                </h2>
                <p className="text-muted-foreground text-sm">
                  Что вы хотите донести через эту границу?
                </p>
              </div>

              <div className="space-y-3">
                {[
                  {
                    goal: 'Отказать в просьбе',
                    description: 'Вежливо сказать "нет", не чувствуя себя виноватым',
                  },
                  {
                    goal: 'Защитить своё время',
                    description: 'Сохранить время для себя, отдыха или важных дел',
                  },
                  {
                    goal: 'Остановить критику',
                    description: 'Прекратить нежелательные комментарии и советы',
                  },
                  {
                    goal: 'Сохранить личное пространство',
                    description: 'Защитить приватность и автономию',
                  },
                  {
                    goal: 'Обозначить последствия',
                    description: 'Чётко объяснить, что будет при нарушении границы',
                  },
                ].map((option, idx) => (
                  <Button
                    key={idx}
                    variant="secondary"
                    size="lg"
                    onClick={() => setCurrentStep(4)}
                    className="w-full text-left justify-start h-auto py-4 px-5"
                  >
                    <div className="flex-1">
                      <div className="font-semibold text-foreground mb-1">{option.goal}</div>
                      <div className="text-sm text-muted-foreground font-normal">
                        {option.description}
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground ml-4 flex-shrink-0" />
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Screen: Boundaries Scripts / [slug] - Result */}
      <section>
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-foreground mb-2">
            Start / Boundaries Scripts / [slug] — Result — {viewport === 'mobile' ? 'Mobile (375px)' : 'Desktop (1440px)'}
          </h2>
          <p className="text-sm text-muted-foreground">
            Готовые скрипты для установления границ
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
              <h3 className="font-semibold text-foreground">Результаты</h3>
              <div className="w-[44px]" />
            </div>
          ) : (
            <div className="flex items-center justify-between px-12 py-4 border-b border-border bg-card">
              <Button variant="ghost" className="gap-2">
                <ArrowRight className="w-4 h-4 rotate-180" />
                К выбору сценария
              </Button>
              <h3 className="font-bold text-xl text-foreground">Эмоциональный баланс</h3>
              <div className="w-32" />
            </div>
          )}

          {/* Progress Header */}
          <div className={`border-b border-border bg-card ${viewport === 'mobile' ? 'p-4' : 'px-12 py-6'}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
                  <Check className="w-5 h-5 text-success" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Скрипты готовы</h4>
                  <p className="text-xs text-muted-foreground">Шаг 4 из 4</p>
                </div>
              </div>
            </div>
            <Progress value={100} className="h-2" />
          </div>

          {/* Content */}
          <div className={viewport === 'mobile' ? 'p-6 py-8 space-y-8' : 'p-12 space-y-10'}>
            <div className={viewport === 'mobile' ? '' : 'max-w-4xl mx-auto'}>
              <div className="text-center mb-8">
                <h2 className={`font-bold text-foreground mb-3 ${viewport === 'mobile' ? 'text-xl' : 'text-2xl'}`}>
                  Ваши скрипты готовы
                </h2>
                <p className="text-muted-foreground text-sm">
                  Выберите наиболее подходящий вариант и адаптируйте под свою ситуацию
                </p>
              </div>

              {/* Script Cards */}
              <div className="space-y-4 mb-8">
                {[
                  {
                    variant: 'Вариант 1: Мягкий отказ',
                    script: '"Я очень ценю, что ты ко мне обратился, но сейчас у меня нет возможности помочь. Я надеюсь, ты понимаешь, что это не про тебя — мне просто важно сохранить время для своих дел."',
                    note: 'Подходит для близких людей и первого отказа'
                  },
                  {
                    variant: 'Вариант 2: Чёткая позиция',
                    script: '"Я понимаю, что это важно для тебя, но я не смогу этого сделать. Мне нужно расставлять приоритеты, и сейчас мои силы направлены на другие задачи."',
                    note: 'Хорошо работает для повторяющихся просьб'
                  },
                  {
                    variant: 'Вариант 3: С альтернативой',
                    script: '"Я не могу помочь с этим сейчас, но могу предложить [альтернативу]. Или, может быть, [другой человек] сможет помочь?"',
                    note: 'Смягчает отказ, предлагая другое решение'
                  },
                ].map((item, idx) => (
                  <Card key={idx} className="border-2">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <CardTitle className="text-lg">{item.variant}</CardTitle>
                        <Button
                          variant={copiedIndex === idx ? 'default' : 'outline'}
                          size="sm"
                          className="gap-2 flex-shrink-0"
                          onClick={() => handleCopy(item.script, idx)}
                        >
                          {copiedIndex === idx ? (
                            <>
                              <Check className="w-4 h-4" />
                              Скопировано!
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4" />
                              Скопировать
                            </>
                          )}
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <blockquote className="border-l-4 border-primary pl-4 py-2 mb-4 italic text-foreground">
                        {item.script}
                      </blockquote>
                      <p className="text-sm text-muted-foreground">
                        💡 {item.note}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Safety Block */}
              <Alert className="border-info bg-info/5 mb-8">
                <Shield className="h-5 w-5 text-info" />
                <AlertDescription>
                  <p className="font-semibold text-foreground mb-2">Важно помнить</p>
                  <ul className="space-y-2 text-sm text-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-info flex-shrink-0">•</span>
                      <span>Вы имеете право сказать "нет" без объяснения причин</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-info flex-shrink-0">•</span>
                      <span>Границы — это забота о себе, а не эгоизм</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-info flex-shrink-0">•</span>
                      <span>Люди могут не принять вашу границу — это нормально</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-info flex-shrink-0">•</span>
                      <span>Последовательность важнее идеального скрипта</span>
                    </li>
                  </ul>
                </AlertDescription>
              </Alert>

              {/* CTA Buttons */}
              <div className={`flex gap-3 ${viewport === 'mobile' ? 'flex-col' : 'flex-row'}`}>
                <Button size="lg" variant="outline" className={`gap-2 ${viewport === 'mobile' ? 'w-full' : 'flex-1'}`}>
                  <ArrowRight className="w-4 h-4 rotate-180" />
                  Попробовать другой сценарий
                </Button>
                <Button size="lg" className={`gap-2 ${viewport === 'mobile' ? 'w-full' : 'flex-1'}`}>
                  Сохранить в избранное
                  <Heart className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Screen: Boundaries Scripts / [slug] - Crisis */}
      <section>
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-foreground mb-2">
            Start / Boundaries Scripts / [slug] — Crisis — {viewport === 'mobile' ? 'Mobile (375px)' : 'Desktop (1440px)'}
          </h2>
          <p className="text-sm text-muted-foreground">
            Кризисный сценарий (насилие и угроза безопасности)
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
              <h3 className="font-semibold text-foreground">Кризисная ситуация</h3>
              <div className="w-[44px]" />
            </div>
          ) : (
            <div className="flex items-center justify-between px-12 py-4 border-b border-border bg-card">
              <Button variant="ghost" className="gap-2">
                <ArrowRight className="w-4 h-4 rotate-180" />
                К списку сценариев
              </Button>
              <h3 className="font-bold text-xl text-foreground">Эмоциональный баланс</h3>
              <div className="w-32" />
            </div>
          )}

          {/* Crisis Banner */}
          <div className={viewport === 'mobile' ? 'p-4' : 'px-12 pt-8'}>
            <Alert className="border-danger bg-danger/5">
              <AlertTriangle className="h-5 w-5 text-danger" />
              <AlertDescription>
                <p className="font-semibold text-danger mb-3">⚠️ Это ситуация, требующая особого внимания</p>
                <p className="text-foreground mb-4">
                  Если вы сталкиваетесь с физическим, эмоциональным или психологическим насилием, 
                  вербальные скрипты могут быть недостаточны или даже опасны. Ваша безопасность — приоритет.
                </p>
                
                <div className="space-y-4 mb-4">
                  <div>
                    <p className="font-semibold text-foreground mb-2">Признаки опасной ситуации:</p>
                    <ul className="space-y-2 text-sm text-foreground">
                      <li className="flex items-start gap-2">
                        <span className="text-danger flex-shrink-0">•</span>
                        <span>Физическое насилие (толчки, удары, удержание)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-danger flex-shrink-0">•</span>
                        <span>Угрозы расправой вам или близким</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-danger flex-shrink-0">•</span>
                        <span>Изоляция от друзей, семьи, работы</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-danger flex-shrink-0">•</span>
                        <span>Контроль всех аспектов жизни (деньги, передвижения, общение)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-danger flex-shrink-0">•</span>
                        <span>Постоянное унижение, обесценивание, газлайтинг</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <p className="font-semibold text-foreground mb-3">Горячие линии помощи (круглосуточно, бесплатно):</p>
                    <div className="space-y-2">
                      <a 
                        href="tel:88002000122" 
                        className="flex items-center gap-3 p-3 bg-card rounded-lg hover:bg-muted transition-colors"
                      >
                        <Phone className="w-5 h-5 text-danger flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-foreground">8-800-2000-122</p>
                          <p className="text-xs text-muted-foreground">Помощь женщинам в кризисной ситуации</p>
                        </div>
                      </a>
                      <a 
                        href="tel:88007007600" 
                        className="flex items-center gap-3 p-3 bg-card rounded-lg hover:bg-muted transition-colors"
                      >
                        <Phone className="w-5 h-5 text-danger flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-foreground">8-800-700-76-00</p>
                          <p className="text-xs text-muted-foreground">Горячая линия по вопросам насилия</p>
                        </div>
                      </a>
                      <a 
                        href="tel:112" 
                        className="flex items-center gap-3 p-3 bg-card rounded-lg hover:bg-muted transition-colors border-2 border-danger"
                      >
                        <Phone className="w-5 h-5 text-danger flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-foreground">112</p>
                          <p className="text-xs text-muted-foreground">Экстренные службы (при прямой угрозе)</p>
                        </div>
                      </a>
                    </div>
                  </div>

                  <div className="p-4 bg-warning/10 rounded-lg border border-warning/20">
                    <p className="font-semibold text-foreground mb-2">💡 План безопасности</p>
                    <ul className="space-y-2 text-sm text-foreground">
                      <li className="flex items-start gap-2">
                        <span className="text-warning flex-shrink-0">1.</span>
                        <span>Держите важные документы в доступном месте</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-warning flex-shrink-0">2.</span>
                        <span>Запомните номера телефонов помощи</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-warning flex-shrink-0">3.</span>
                        <span>Договоритесь с близкими о кодовом слове для опасности</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-warning flex-shrink-0">4.</span>
                        <span>Подумайте о безопасном месте, куда можно уйти</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          </div>

          {/* Content */}
          <div className={viewport === 'mobile' ? 'p-6 py-8' : 'p-12'}>
            <div className={viewport === 'mobile' ? '' : 'max-w-4xl mx-auto'}>
              <div className="text-center mb-8">
                <h2 className={`font-bold text-foreground mb-4 ${viewport === 'mobile' ? 'text-xl' : 'text-2xl'}`}>
                  В такой ситуации скрипты не помогут
                </h2>
                <p className="text-muted-foreground mb-6">
                  Вербальные границы работают только с людьми, которые уважают ваше "нет". 
                  При насилии нужна стратегия безопасности и профессиональная помощь.
                </p>
              </div>

              <div className="space-y-4 mb-8">
                <Card className="border-danger/20">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-foreground mb-3">Почему скрипты не работают при насилии</h3>
                    <ul className="space-y-3 text-sm text-foreground">
                      <li className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-danger flex-shrink-0 mt-0.5" />
                        <span>Абьюзер не реагирует на логику и просьбы — ему важен контроль, а не ваше мнение</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-danger flex-shrink-0 mt-0.5" />
                        <span>Попытка установить границу может спровоцировать эскалацию насилия</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-danger flex-shrink-0 mt-0.5" />
                        <span>Эмоциональная манипуляция ("Это из-за тебя", "Я изменюсь") — часть цикла насилия</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>

              {/* CTA */}
              <div className="text-center">
                <Button size="lg" variant="outline" className={`gap-2 mb-4 ${viewport === 'mobile' ? 'w-full' : ''}`}>
                  <ArrowRight className="w-4 h-4 rotate-180" />
                  Вернуться к выбору сценария
                </Button>
                <p className="text-sm text-muted-foreground">
                  Если ваша ситуация не связана с насилием, выберите другой сценарий
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
