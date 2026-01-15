import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Alert, AlertDescription } from './ui/alert';
import { 
  ArrowRight, Brain, Clock, BookOpen, Shield, CheckCircle2,
  Zap, Calendar, AlertCircle, Send, Phone
} from 'lucide-react';

interface QuizScreensProps {
  viewport: 'mobile' | 'desktop';
}

export function QuizScreens({ viewport }: QuizScreensProps) {
  return (
    <>
      {/* Screen: Start / Quizzes / [slug] - Start */}
      <section>
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-foreground mb-2">
            Start / Quizzes / [slug] — Start — {viewport === 'mobile' ? 'Mobile (375px)' : 'Desktop (1440px)'}
          </h2>
          <p className="text-sm text-muted-foreground">
            Стартовая страница теста с описанием
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
              <h3 className="font-semibold text-foreground">Тест</h3>
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

          {/* Content */}
          <div className={`flex items-center justify-center ${viewport === 'mobile' ? 'p-6 min-h-[500px]' : 'p-12 min-h-[600px]'}`}>
            <div className={viewport === 'mobile' ? 'w-full' : 'max-w-2xl w-full'}>
              <Card className="border-2">
                <CardContent className={viewport === 'mobile' ? 'p-6' : 'p-8'}>
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                      <Brain className="w-8 h-8 text-primary" />
                    </div>
                    <h1 className={`font-bold text-foreground mb-4 ${viewport === 'mobile' ? 'text-2xl' : 'text-3xl'}`}>
                      Тест на уровень тревожности
                    </h1>
                    <p className="text-muted-foreground mb-6">
                      Опросник GAD-7 поможет оценить уровень общей тревожности за последние две недели
                    </p>
                  </div>

                  <div className="space-y-4 mb-8">
                    <div className="flex items-start gap-3 text-sm">
                      <Clock className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-foreground">5 минут</p>
                        <p className="text-muted-foreground">Среднее время прохождения</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 text-sm">
                      <BookOpen className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-foreground">7 вопросов</p>
                        <p className="text-muted-foreground">Простые вопросы о вашем самочувствии</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 text-sm">
                      <Shield className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-foreground">Конфиденциально</p>
                        <p className="text-muted-foreground">Ваши ответы видите только вы</p>
                      </div>
                    </div>
                  </div>

                  <Button size="lg" className="w-full gap-2">
                    Начать тест
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Screen: Start / Quizzes / [slug] - Progress */}
      <section>
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-foreground mb-2">
            Start / Quizzes / [slug] — Progress — {viewport === 'mobile' ? 'Mobile (375px)' : 'Desktop (1440px)'}
          </h2>
          <p className="text-sm text-muted-foreground">
            Процесс прохождения теста с вопросами
          </p>
        </div>

        <div className={`mx-auto border-2 border-border rounded-xl overflow-hidden bg-background ${
          viewport === 'mobile' ? 'max-w-[375px]' : 'max-w-full'
        }`}>
          {/* Header with Progress */}
          <div className={`border-b border-border bg-card ${viewport === 'mobile' ? 'p-4' : 'px-12 py-6'}`}>
            <div className="flex items-center justify-between mb-4">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowRight className="w-4 h-4 rotate-180" />
                {viewport === 'desktop' && 'Назад'}
              </Button>
              <span className="text-sm font-medium text-foreground">Вопрос 3 из 7</span>
              <div className={viewport === 'mobile' ? 'w-[60px]' : 'w-20'} />
            </div>
            <Progress value={42.8} className="h-2" />
          </div>

          {/* Content */}
          <div className={`flex items-center justify-center ${viewport === 'mobile' ? 'p-6 min-h-[500px]' : 'p-12 min-h-[600px]'}`}>
            <div className={viewport === 'mobile' ? 'w-full' : 'max-w-3xl w-full'}>
              <Card className="border-2">
                <CardContent className={viewport === 'mobile' ? 'p-6' : 'p-8'}>
                  <h2 className={`font-semibold text-foreground mb-6 ${viewport === 'mobile' ? 'text-xl' : 'text-2xl'}`}>
                    Как часто за последние две недели вы испытывали беспокойство или тревогу?
                  </h2>

                  <div className="space-y-3">
                    {[
                      { label: 'Ни разу', value: 0 },
                      { label: 'Несколько дней', value: 1 },
                      { label: 'Больше половины дней', value: 2 },
                      { label: 'Почти каждый день', value: 3 },
                    ].map((option, idx) => (
                      <button
                        key={idx}
                        className={`w-full text-left p-4 rounded-lg border-2 transition-all min-h-[56px] ${
                          idx === 1
                            ? 'border-primary bg-primary/5 font-medium'
                            : 'border-border hover:border-primary/50 hover:bg-muted'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-foreground">{option.label}</span>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            idx === 1
                              ? 'border-primary bg-primary'
                              : 'border-border'
                          }`}>
                            {idx === 1 && (
                              <div className="w-2 h-2 bg-white rounded-full" />
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className={`flex gap-3 mt-8 ${viewport === 'mobile' ? 'flex-col' : 'justify-between'}`}>
                    <Button variant="outline" className={viewport === 'mobile' ? 'w-full' : ''}>
                      Назад
                    </Button>
                    <Button className={`gap-2 ${viewport === 'mobile' ? 'w-full' : ''}`}>
                      Следующий вопрос
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Screen: Start / Quizzes / [slug] - Result */}
      <section>
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-foreground mb-2">
            Start / Quizzes / [slug] — Result — {viewport === 'mobile' ? 'Mobile (375px)' : 'Desktop (1440px)'}
          </h2>
          <p className="text-sm text-muted-foreground">
            Результаты теста с рекомендациями
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
              <h3 className="font-semibold text-foreground">Результат</h3>
              <div className="w-[44px]" />
            </div>
          ) : (
            <div className="flex items-center justify-between px-12 py-4 border-b border-border bg-card">
              <Button variant="ghost" className="gap-2">
                <ArrowRight className="w-4 h-4 rotate-180" />
                К списку тестов
              </Button>
              <h3 className="font-bold text-xl text-foreground">Эмоциональный баланс</h3>
              <div className="w-32" />
            </div>
          )}

          {/* Content */}
          <div className={viewport === 'mobile' ? 'p-6 py-8 space-y-8' : 'p-12 space-y-10'}>
            <div className={viewport === 'mobile' ? '' : 'max-w-4xl mx-auto'}>
              {/* Result Card Header */}
              <div className="text-center mb-8">
                <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-10 h-10 text-success" />
                </div>
                <h1 className={`font-bold text-foreground mb-3 ${viewport === 'mobile' ? 'text-2xl' : 'text-3xl'}`}>
                  Тест завершён
                </h1>
                <p className="text-muted-foreground mb-6">
                  Ваш результат готов. Вот что мы выявили
                </p>
              </div>

              {/* Score Card */}
              <Card className="bg-gradient-to-br from-success/10 to-accent/10 border-success/20 mb-8">
                <CardContent className={`text-center ${viewport === 'mobile' ? 'p-6' : 'p-8'}`}>
                  <p className="text-sm text-muted-foreground mb-2">Ваш балл по шкале GAD-7</p>
                  <div className="text-6xl font-bold text-success mb-2">5</div>
                  <p className="text-sm text-muted-foreground mb-4">из 21 балла</p>
                  <Badge className="bg-success text-white">Низкий уровень тревожности</Badge>
                </CardContent>
              </Card>

              {/* Result Description */}
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Что это значит?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground mb-4">
                    Ваш результат указывает на <strong>низкий уровень общей тревожности</strong>. 
                    Вы справляетесь с повседневными переживаниями и стрессом в целом хорошо.
                  </p>
                  <p className="text-muted-foreground text-sm">
                    Это хороший знак! Однако помните, что забота о ментальном здоровье — это постоянный процесс.
                  </p>
                </CardContent>
              </Card>

              {/* Recommendations Blocks */}
              <div className="space-y-6 mb-8">
                <h2 className={`font-semibold text-foreground ${viewport === 'mobile' ? 'text-xl' : 'text-2xl'}`}>
                  Рекомендации
                </h2>

                {/* Прямо сейчас */}
                <Card className="border-l-4 border-l-primary">
                  <CardContent className={viewport === 'mobile' ? 'p-5' : 'p-6'}>
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Zap className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground mb-2">Прямо сейчас</h3>
                        <ul className="space-y-2 text-sm text-foreground">
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                            <span>Попробуйте 5-минутную дыхательную практику</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                            <span>Запишите 3 вещи, за которые вы благодарны сегодня</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* На этой неделе */}
                <Card className="border-l-4 border-l-success">
                  <CardContent className={viewport === 'mobile' ? 'p-5' : 'p-6'}>
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center flex-shrink-0">
                        <Calendar className="w-5 h-5 text-success" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground mb-2">На этой неделе</h3>
                        <ul className="space-y-2 text-sm text-foreground">
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                            <span>Установите режим дня с фиксированным временем сна</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                            <span>Включите в расписание 30 минут физической активности</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                            <span>Начните вести дневник настроения</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Когда обратиться к специалисту */}
                <Card className="border-l-4 border-l-warning">
                  <CardContent className={viewport === 'mobile' ? 'p-5' : 'p-6'}>
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center flex-shrink-0">
                        <AlertCircle className="w-5 h-5 text-warning" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground mb-2">Когда обратиться к специалисту</h3>
                        <p className="text-sm text-foreground mb-3">
                          Несмотря на низкий уровень тревожности, консультация с психологом может быть полезна, если:
                        </p>
                        <ul className="space-y-2 text-sm text-foreground">
                          <li className="flex items-start gap-2">
                            <span className="text-warning flex-shrink-0">•</span>
                            <span>Вы чувствуете, что тревога мешает вашей повседневной жизни</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-warning flex-shrink-0">•</span>
                            <span>Есть конкретная ситуация, которая вызывает сильное беспокойство</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-warning flex-shrink-0">•</span>
                            <span>Вы хотите развить навыки управления стрессом</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* CTA Buttons */}
              <div className={`flex gap-3 mb-6 ${viewport === 'mobile' ? 'flex-col' : 'flex-row'}`}>
                <Button size="lg" className={`gap-2 ${viewport === 'mobile' ? 'w-full' : 'flex-1'}`}>
                  Записаться на консультацию
                  <Calendar className="w-4 h-4" />
                </Button>
                <Button size="lg" variant="outline" className={`gap-2 ${viewport === 'mobile' ? 'w-full' : 'flex-1'}`}>
                  Написать в Telegram
                  <Send className="w-4 h-4" />
                </Button>
              </div>

              {/* Back Link */}
              <div className="text-center">
                <Button variant="ghost" className="gap-2">
                  <ArrowRight className="w-4 h-4 rotate-180" />
                  Вернуться к списку тестов
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Screen: Start / Quizzes / [slug] - Result + CrisisBanner */}
      <section>
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-foreground mb-2">
            Start / Quizzes / [slug] — Result + CrisisBanner — {viewport === 'mobile' ? 'Mobile (375px)' : 'Desktop (1440px)'}
          </h2>
          <p className="text-sm text-muted-foreground">
            Результаты теста с кризисным баннером (высокий уровень тревоги)
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
              <h3 className="font-semibold text-foreground">Результат</h3>
              <div className="w-[44px]" />
            </div>
          ) : (
            <div className="flex items-center justify-between px-12 py-4 border-b border-border bg-card">
              <Button variant="ghost" className="gap-2">
                <ArrowRight className="w-4 h-4 rotate-180" />
                К списку тестов
              </Button>
              <h3 className="font-bold text-xl text-foreground">Эмоциональный баланс</h3>
              <div className="w-32" />
            </div>
          )}

          {/* Crisis Banner */}
          <div className={viewport === 'mobile' ? 'p-4' : 'px-12 pt-8'}>
            <Alert className="border-danger bg-danger/5">
              <AlertCircle className="h-5 w-5 text-danger" />
              <AlertDescription className="text-sm">
                <p className="font-semibold text-danger mb-3">Вам может потребоваться срочная помощь</p>
                <p className="text-foreground mb-4">
                  Результат теста указывает на высокий уровень тревожности. Мы настоятельно рекомендуем обратиться к специалисту.
                </p>
                <div className="space-y-2">
                  <p className="text-foreground font-medium">Горячие линии (круглосуточно, бесплатно):</p>
                  <div className="space-y-2">
                    <a 
                      href="tel:88002000122" 
                      className="flex items-center gap-2 p-3 bg-card rounded-lg hover:bg-muted transition-colors"
                    >
                      <Phone className="w-4 h-4 text-danger flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-foreground">8-800-2000-122</p>
                        <p className="text-xs text-muted-foreground">Психологическая помощь</p>
                      </div>
                    </a>
                    <a 
                      href="tel:88003333118" 
                      className="flex items-center gap-2 p-3 bg-card rounded-lg hover:bg-muted transition-colors"
                    >
                      <Phone className="w-4 h-4 text-danger flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-foreground">8-800-333-11-88</p>
                        <p className="text-xs text-muted-foreground">Скорая психиатрическая помощь</p>
                      </div>
                    </a>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          </div>

          {/* Content */}
          <div className={viewport === 'mobile' ? 'p-6 py-8 space-y-8' : 'p-12 space-y-10'}>
            <div className={viewport === 'mobile' ? '' : 'max-w-4xl mx-auto'}>
              {/* Result Card Header */}
              <div className="text-center mb-8">
                <div className="w-20 h-20 rounded-full bg-danger/10 flex items-center justify-center mx-auto mb-6">
                  <AlertCircle className="w-10 h-10 text-danger" />
                </div>
                <h1 className={`font-bold text-foreground mb-3 ${viewport === 'mobile' ? 'text-2xl' : 'text-3xl'}`}>
                  Тест завершён
                </h1>
                <p className="text-muted-foreground mb-6">
                  Ваш результат требует внимания
                </p>
              </div>

              {/* Score Card */}
              <Card className="bg-gradient-to-br from-danger/10 to-warning/10 border-danger/20 mb-8">
                <CardContent className={`text-center ${viewport === 'mobile' ? 'p-6' : 'p-8'}`}>
                  <p className="text-sm text-muted-foreground mb-2">Ваш балл по шкале GAD-7</p>
                  <div className="text-6xl font-bold text-danger mb-2">17</div>
                  <p className="text-sm text-muted-foreground mb-4">из 21 балла</p>
                  <Badge className="bg-danger text-white">Высокий уровень тревожности</Badge>
                </CardContent>
              </Card>

              {/* Result Description */}
              <Card className="mb-8 border-warning">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-warning" />
                    Что это значит?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground mb-4">
                    Ваш результат указывает на <strong>высокий уровень общей тревожности</strong>. 
                    Это означает, что тревога значительно влияет на вашу повседневную жизнь.
                  </p>
                  <p className="text-foreground font-medium mb-3">
                    Мы настоятельно рекомендуем обратиться к специалисту — психологу или психотерапевту.
                  </p>
                  <p className="text-muted-foreground text-sm">
                    Высокая тревожность — это не приговор. С правильной поддержкой и терапией можно значительно улучшить качество жизни.
                  </p>
                </CardContent>
              </Card>

              {/* Recommendations */}
              <div className="space-y-6 mb-8">
                <h2 className={`font-semibold text-foreground ${viewport === 'mobile' ? 'text-xl' : 'text-2xl'}`}>
                  Что делать
                </h2>

                {/* Срочно */}
                <Card className="border-l-4 border-l-danger">
                  <CardContent className={viewport === 'mobile' ? 'p-5' : 'p-6'}>
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-danger/10 flex items-center justify-center flex-shrink-0">
                        <Phone className="w-5 h-5 text-danger" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground mb-2">Срочно</h3>
                        <ul className="space-y-2 text-sm text-foreground">
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-danger flex-shrink-0 mt-0.5" />
                            <span>Запишитесь на консультацию к психологу или психотерапевту</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-danger flex-shrink-0 mt-0.5" />
                            <span>При острых приступах паники — позвоните на горячую линию</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-danger flex-shrink-0 mt-0.5" />
                            <span>Расскажите близкому человеку о своём состоянии</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* На этой неделе */}
                <Card className="border-l-4 border-l-warning">
                  <CardContent className={viewport === 'mobile' ? 'p-5' : 'p-6'}>
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center flex-shrink-0">
                        <Calendar className="w-5 h-5 text-warning" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground mb-2">Поддерживающие практики</h3>
                        <ul className="space-y-2 text-sm text-foreground">
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
                            <span>Практикуйте дыхательные техники несколько раз в день</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
                            <span>Ограничьте кофеин и установите режим сна</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
                            <span>Избегайте алкоголя как способа справиться с тревогой</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* CTA Buttons */}
              <div className={`flex gap-3 mb-6 ${viewport === 'mobile' ? 'flex-col' : 'flex-row'}`}>
                <Button size="lg" className={`gap-2 ${viewport === 'mobile' ? 'w-full' : 'flex-1'}`}>
                  Записаться на консультацию
                  <Calendar className="w-4 h-4" />
                </Button>
                <Button size="lg" variant="outline" className={`gap-2 ${viewport === 'mobile' ? 'w-full' : 'flex-1'}`}>
                  Написать в Telegram
                  <Send className="w-4 h-4" />
                </Button>
              </div>

              {/* Back Link */}
              <div className="text-center">
                <Button variant="ghost" className="gap-2">
                  <ArrowRight className="w-4 h-4 rotate-180" />
                  Вернуться к списку тестов
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
