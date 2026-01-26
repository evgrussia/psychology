import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Alert, AlertDescription } from './ui/alert';
import { 
  ArrowRight, Clock, Play, Pause, RotateCcw, 
  CheckCircle2, Music, Volume2, VolumeX, Info
} from 'lucide-react';

interface RitualFlowProps {
  viewport: 'mobile' | 'desktop';
}

export function RitualFlow({ viewport }: RitualFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(180); // 3 minutes in seconds
  const [audioEnabled, setAudioEnabled] = useState(false);

  const totalSteps = 4;
  const initialTime = 180;

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isTimerRunning && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isTimerRunning, timeRemaining]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleTimerToggle = () => {
    setIsTimerRunning(!isTimerRunning);
  };

  const handleTimerReset = () => {
    setIsTimerRunning(false);
    setTimeRemaining(initialTime);
  };

  return (
    <>
      {/* Screen: Rituals / [slug] - Intro */}
      <section>
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-foreground mb-2">
            Start / Rituals / [slug] — Intro — {viewport === 'mobile' ? 'Mobile (375px)' : 'Desktop (1440px)'}
          </h2>
          <p className="text-sm text-muted-foreground">
            Вводная информация перед началом ритуала
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
              <h3 className="font-semibold text-foreground">5-4-3-2-1: Заземление</h3>
              <div className="w-[44px]" />
            </div>
          ) : (
            <div className="flex items-center justify-between px-12 py-4 border-b border-border bg-card">
              <Button variant="ghost" className="gap-2">
                <ArrowRight className="w-4 h-4 rotate-180" />
                Назад к списку
              </Button>
              <h3 className="font-bold text-xl text-foreground">Эмоциональный баланс</h3>
              <div className="w-32" />
            </div>
          )}

          {/* Content */}
          <div className={viewport === 'mobile' ? 'p-6 py-8' : 'p-12'}>
            <div className={viewport === 'mobile' ? '' : 'max-w-3xl mx-auto'}>
              {/* Title */}
              <div className="mb-6">
                <h1 className={`font-bold text-foreground mb-3 ${viewport === 'mobile' ? 'text-2xl' : 'text-3xl'}`}>
                  5-4-3-2-1: Заземление
                </h1>
                <p className="text-muted-foreground">
                  Техника для быстрого возвращения в настоящий момент
                </p>
              </div>

              {/* Why Card */}
              <Card className="mb-6 border-2">
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center flex-shrink-0">
                      <Info className="w-5 h-5 text-info" />
                    </div>
                    <CardTitle className="text-lg">Зачем это нужно?</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Эта техника работает с механизмом концентрации внимания. Когда вы переживаете тревогу 
                    или паническую атаку, ваш мозг "застревает" в потоке негативных мыслей о прошлом или будущем.
                  </p>
                  <p className="text-muted-foreground">
                    Переключая внимание на конкретные сенсорные ощущения здесь и сейчас, вы буквально 
                    "заземляете" себя в реальности и прерываете цикл тревожных мыслей.
                  </p>
                </CardContent>
              </Card>

              {/* Meta info */}
              <div className="flex flex-wrap gap-3 mb-8">
                <Badge variant="outline" className="gap-2 py-2 px-3">
                  <Clock className="w-4 h-4" />
                  ~3 минуты
                </Badge>
                <Badge variant="outline" className="gap-2 py-2 px-3">
                  <CheckCircle2 className="w-4 h-4" />
                  {totalSteps} шага
                </Badge>
              </div>

              {/* CTA */}
              <Button 
                size="lg" 
                className={`gap-2 ${viewport === 'mobile' ? 'w-full' : ''}`}
                onClick={() => setCurrentStep(1)}
              >
                Начать ритуал
                <Play className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Screen: Rituals / [slug] - Step (Timer) */}
      <section>
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-foreground mb-2">
            Start / Rituals / [slug] — Step (Timer) — {viewport === 'mobile' ? 'Mobile (375px)' : 'Desktop (1440px)'}
          </h2>
          <p className="text-sm text-muted-foreground">
            Шаг с таймером
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
              <h3 className="font-semibold text-foreground">5-4-3-2-1</h3>
              <div className="w-[44px]" />
            </div>
          ) : (
            <div className="flex items-center justify-between px-12 py-4 border-b border-border bg-card">
              <Button variant="ghost" className="gap-2">
                <ArrowRight className="w-4 h-4 rotate-180" />
                Назад к списку
              </Button>
              <h3 className="font-bold text-xl text-foreground">Эмоциональный баланс</h3>
              <div className="w-32" />
            </div>
          )}

          {/* Progress Header */}
          <div className={`border-b border-border bg-card ${viewport === 'mobile' ? 'p-4' : 'px-12 py-6'}`}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-semibold text-foreground">Шаг 2 из {totalSteps}</p>
                <p className="text-xs text-muted-foreground">Дыхание и осознанность</p>
              </div>
              <Badge variant="secondary">С таймером</Badge>
            </div>
            <Progress value={(2 / totalSteps) * 100} className="h-2" />
          </div>

          {/* Content */}
          <div className={viewport === 'mobile' ? 'p-6 py-8' : 'p-12'}>
            <div className={viewport === 'mobile' ? '' : 'max-w-3xl mx-auto'}>
              {/* Audio Panel */}
              <Alert className="mb-6 border-2 bg-gradient-to-r from-accent/5 to-primary/5">
                <Music className="h-5 w-5 text-primary" />
                <AlertDescription>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-foreground mb-1">Фоновое сопровождение</p>
                      <p className="text-sm text-muted-foreground">Успокаивающая музыка для медитации</p>
                    </div>
                    <Button
                      variant={audioEnabled ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setAudioEnabled(!audioEnabled)}
                      className="gap-2 ml-4 flex-shrink-0"
                    >
                      {audioEnabled ? (
                        <>
                          <VolumeX className="w-4 h-4" />
                          Остановить
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-4 h-4" />
                          Включить
                        </>
                      )}
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>

              {/* Step Content Card */}
              <Card className="border-2 mb-6">
                <CardHeader>
                  <CardTitle className={viewport === 'mobile' ? 'text-xl' : 'text-2xl'}>
                    Глубокое дыхание
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Prose text */}
                  <div className="prose prose-sm max-w-none text-foreground">
                    <p className="text-muted-foreground leading-relaxed">
                      Сядьте или встаньте удобно. Закройте глаза, если вам комфортно. 
                      Сделайте глубокий вдох через нос на счёт 4, задержите дыхание на 4 счёта, 
                      затем медленно выдохните через рот на 6 счётов.
                    </p>
                    <p className="text-muted-foreground leading-relaxed">
                      Повторяйте этот цикл в течение 3 минут. Если мысли отвлекают вас — это нормально. 
                      Просто мягко возвращайте внимание к дыханию.
                    </p>
                  </div>

                  {/* Timer Widget */}
                  <div className="bg-gradient-to-br from-primary/5 to-accent/10 rounded-xl p-8 text-center">
                    <div className={`font-bold text-foreground mb-6 tabular-nums ${viewport === 'mobile' ? 'text-6xl' : 'text-7xl'}`}>
                      {formatTime(timeRemaining)}
                    </div>
                    <div className="flex gap-3 justify-center">
                      <Button
                        variant={isTimerRunning ? 'default' : 'outline'}
                        size="lg"
                        onClick={handleTimerToggle}
                        className="gap-2"
                      >
                        {isTimerRunning ? (
                          <>
                            <Pause className="w-5 h-5" />
                            Пауза
                          </>
                        ) : (
                          <>
                            <Play className="w-5 h-5" />
                            Продолжить
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={handleTimerReset}
                        className="gap-2"
                      >
                        <RotateCcw className="w-5 h-5" />
                        Сброс
                      </Button>
                    </div>
                  </div>

                  {/* Navigation */}
                  <div className={`flex gap-3 pt-4 ${viewport === 'mobile' ? 'flex-col-reverse' : 'flex-row'}`}>
                    <Button 
                      variant="ghost" 
                      size="lg"
                      className={`gap-2 ${viewport === 'mobile' ? 'w-full' : 'flex-1'}`}
                    >
                      <ArrowRight className="w-4 h-4 rotate-180" />
                      Назад
                    </Button>
                    <Button 
                      size="lg"
                      className={`gap-2 ${viewport === 'mobile' ? 'w-full' : 'flex-1'}`}
                    >
                      Далее
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Screen: Rituals / [slug] - Step (No Timer) */}
      <section>
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-foreground mb-2">
            Start / Rituals / [slug] — Step (No Timer) — {viewport === 'mobile' ? 'Mobile (375px)' : 'Desktop (1440px)'}
          </h2>
          <p className="text-sm text-muted-foreground">
            Шаг без таймера
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
              <h3 className="font-semibold text-foreground">5-4-3-2-1</h3>
              <div className="w-[44px]" />
            </div>
          ) : (
            <div className="flex items-center justify-between px-12 py-4 border-b border-border bg-card">
              <Button variant="ghost" className="gap-2">
                <ArrowRight className="w-4 h-4 rotate-180" />
                Назад к списку
              </Button>
              <h3 className="font-bold text-xl text-foreground">Эмоциональный баланс</h3>
              <div className="w-32" />
            </div>
          )}

          {/* Progress Header */}
          <div className={`border-b border-border bg-card ${viewport === 'mobile' ? 'p-4' : 'px-12 py-6'}`}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-semibold text-foreground">Шаг 3 из {totalSteps}</p>
                <p className="text-xs text-muted-foreground">Техника заземления</p>
              </div>
            </div>
            <Progress value={(3 / totalSteps) * 100} className="h-2" />
          </div>

          {/* Content */}
          <div className={viewport === 'mobile' ? 'p-6 py-8' : 'p-12'}>
            <div className={viewport === 'mobile' ? '' : 'max-w-3xl mx-auto'}>
              {/* Audio Panel */}
              <Alert className="mb-6 border-2 bg-gradient-to-r from-accent/5 to-primary/5">
                <Music className="h-5 w-5 text-primary" />
                <AlertDescription>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-foreground mb-1">Фоновое сопровождение</p>
                      <p className="text-sm text-muted-foreground">Успокаивающая музыка для медитации</p>
                    </div>
                    <Button
                      variant="default"
                      size="sm"
                      className="gap-2 ml-4 flex-shrink-0"
                    >
                      <VolumeX className="w-4 h-4" />
                      Остановить
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>

              {/* Step Content Card */}
              <Card className="border-2 mb-6">
                <CardHeader>
                  <CardTitle className={viewport === 'mobile' ? 'text-xl' : 'text-2xl'}>
                    Назовите вслух или про себя
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Prose text */}
                  <div className="prose prose-sm max-w-none text-foreground space-y-4">
                    <div className="p-4 bg-primary/5 rounded-lg border-l-4 border-primary">
                      <p className="font-semibold text-foreground mb-2">5 вещей, которые вы видите</p>
                      <p className="text-sm text-muted-foreground">
                        Например: "Я вижу окно, стол, лампу, книгу, свою руку"
                      </p>
                    </div>

                    <div className="p-4 bg-info/5 rounded-lg border-l-4 border-info">
                      <p className="font-semibold text-foreground mb-2">4 вещи, которые вы можете потрогать</p>
                      <p className="text-sm text-muted-foreground">
                        Например: "Я чувствую ткань одежды, твёрдость стула, гладкость телефона, тепло кружки"
                      </p>
                    </div>

                    <div className="p-4 bg-success/5 rounded-lg border-l-4 border-success">
                      <p className="font-semibold text-foreground mb-2">3 звука, которые вы слышите</p>
                      <p className="text-sm text-muted-foreground">
                        Например: "Я слышу тиканье часов, шум улицы, своё дыхание"
                      </p>
                    </div>

                    <div className="p-4 bg-warning/5 rounded-lg border-l-4 border-warning">
                      <p className="font-semibold text-foreground mb-2">2 запаха, которые вы чувствуете</p>
                      <p className="text-sm text-muted-foreground">
                        Например: "Я чувствую запах кофе, аромат своего крема для рук"
                      </p>
                    </div>

                    <div className="p-4 bg-danger/5 rounded-lg border-l-4 border-danger">
                      <p className="font-semibold text-foreground mb-2">1 вкус, который вы ощущаете</p>
                      <p className="text-sm text-muted-foreground">
                        Например: "Я ощущаю вкус мяты от зубной пасты" (или просто вкус во рту)
                      </p>
                    </div>
                  </div>

                  <Alert className="bg-muted/30 border-muted">
                    <Info className="h-4 w-4" />
                    <AlertDescription className="text-sm text-muted-foreground">
                      Выполняйте упражнение в своём темпе. Не торопитесь. Цель — полностью сосредоточиться 
                      на сенсорных ощущениях, а не на скорости.
                    </AlertDescription>
                  </Alert>

                  {/* Navigation */}
                  <div className={`flex gap-3 pt-4 ${viewport === 'mobile' ? 'flex-col-reverse' : 'flex-row'}`}>
                    <Button 
                      variant="ghost" 
                      size="lg"
                      className={`gap-2 ${viewport === 'mobile' ? 'w-full' : 'flex-1'}`}
                    >
                      <ArrowRight className="w-4 h-4 rotate-180" />
                      Назад
                    </Button>
                    <Button 
                      size="lg"
                      className={`gap-2 ${viewport === 'mobile' ? 'w-full' : 'flex-1'}`}
                    >
                      Завершить
                      <CheckCircle2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Screen: Rituals / [slug] - Completed */}
      <section>
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-foreground mb-2">
            Start / Rituals / [slug] — Completed — {viewport === 'mobile' ? 'Mobile (375px)' : 'Desktop (1440px)'}
          </h2>
          <p className="text-sm text-muted-foreground">
            Экран завершения ритуала
          </p>
        </div>

        <div className={`mx-auto border-2 border-border rounded-xl overflow-hidden bg-background ${
          viewport === 'mobile' ? 'max-w-[375px]' : 'max-w-full'
        }`}>
          {/* Top Navigation */}
          {viewport === 'mobile' ? (
            <div className="flex items-center justify-between p-4 border-b border-border bg-card">
              <div className="w-[44px]" />
              <h3 className="font-semibold text-foreground">Завершено</h3>
              <div className="w-[44px]" />
            </div>
          ) : (
            <div className="flex items-center justify-between px-12 py-4 border-b border-border bg-card">
              <div className="w-32" />
              <h3 className="font-bold text-xl text-foreground">Эмоциональный баланс</h3>
              <div className="w-32" />
            </div>
          )}

          {/* Content */}
          <div className={`flex items-center justify-center ${viewport === 'mobile' ? 'p-6 min-h-[600px]' : 'p-12 min-h-[700px]'}`}>
            <div className={viewport === 'mobile' ? 'w-full' : 'max-w-2xl w-full'}>
              <Card className="border-2 shadow-lg bg-gradient-to-br from-success/5 via-background to-primary/5">
                <CardContent className={viewport === 'mobile' ? 'p-8 text-center' : 'p-12 text-center'}>
                  {/* Success Icon */}
                  <div className="flex justify-center mb-6">
                    <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center relative">
                      <CheckCircle2 className="w-10 h-10 text-success" />
                      <div className="absolute inset-0 rounded-full bg-success/20 animate-ping" />
                    </div>
                  </div>

                  {/* Title */}
                  <h2 className={`font-bold text-foreground mb-4 ${viewport === 'mobile' ? 'text-2xl' : 'text-3xl'}`}>
                    Ритуал завершён!
                  </h2>

                  {/* Description */}
                  <div className="space-y-4 mb-8">
                    <p className="text-muted-foreground text-base">
                      Отличная работа! Вы прошли полный цикл техники заземления 5-4-3-2-1.
                    </p>
                    <p className="text-muted-foreground text-base">
                      Регулярная практика этой техники поможет вам быстрее и эффективнее справляться 
                      с тревогой и возвращаться в состояние спокойствия.
                    </p>
                  </div>

                  {/* Stats */}
                  <div className={`grid gap-4 mb-8 ${viewport === 'mobile' ? 'grid-cols-2' : 'grid-cols-3'}`}>
                    <div className="p-4 bg-card rounded-lg border border-border">
                      <div className="text-2xl font-bold text-primary mb-1">3 мин</div>
                      <div className="text-xs text-muted-foreground">Потрачено времени</div>
                    </div>
                    <div className="p-4 bg-card rounded-lg border border-border">
                      <div className="text-2xl font-bold text-success mb-1">{totalSteps}</div>
                      <div className="text-xs text-muted-foreground">Шагов пройдено</div>
                    </div>
                    {viewport === 'desktop' && (
                      <div className="p-4 bg-card rounded-lg border border-border">
                        <div className="text-2xl font-bold text-info mb-1">1</div>
                        <div className="text-xs text-muted-foreground">Раз сегодня</div>
                      </div>
                    )}
                  </div>

                  {/* CTA */}
                  <div className="space-y-3">
                    <Button 
                      size="lg" 
                      className={`gap-2 ${viewport === 'mobile' ? 'w-full' : ''}`}
                    >
                      Вернуться в библиотеку
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="lg" 
                      variant="outline"
                      className={`gap-2 ${viewport === 'mobile' ? 'w-full' : ''}`}
                    >
                      <RotateCcw className="w-4 h-4" />
                      Пройти ещё раз
                    </Button>
                  </div>

                  {/* Tip */}
                  <Alert className="mt-8 bg-primary/5 border-primary/20 text-left">
                    <Info className="h-4 w-4 text-primary" />
                    <AlertDescription className="text-sm text-foreground">
                      <span className="font-semibold">Совет:</span> Добавьте этот ритуал в избранное, 
                      чтобы быстро найти его в момент тревоги.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
