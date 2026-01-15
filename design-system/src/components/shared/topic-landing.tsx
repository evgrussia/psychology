import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { TrustBlocks } from './trust-blocks';
import { 
  ArrowRight, AlertCircle, Calendar, Play, 
  BookOpen, CheckCircle, Zap, Heart, User
} from 'lucide-react';
import type { ReactElement } from 'react';

interface TopicLandingProps {
  viewport: 'mobile' | 'desktop';
}

interface Material {
  id: string;
  type: 'interactive' | 'article';
  title: string;
  description: string;
  duration?: string;
  category?: string;
}

const materials: Material[] = [
  {
    id: '1',
    type: 'interactive',
    title: 'Навигатор тревоги',
    description: 'Интерактивный помощник поможет определить тип тревоги и подберёт техники работы',
    duration: '5-7 мин',
    category: 'Диагностика'
  },
  {
    id: '2',
    type: 'interactive',
    title: 'Техника заземления 5-4-3-2-1',
    description: 'Быстрое упражнение для снижения тревоги через осознанность',
    duration: '3 мин',
    category: 'Практика'
  },
  {
    id: '3',
    type: 'article',
    title: 'Как отличить тревогу от тревожного расстройства',
    description: 'Разбираемся, когда нормальное беспокойство становится проблемой',
    duration: '8 мин',
    category: 'Статья'
  },
  {
    id: '4',
    type: 'interactive',
    title: 'Дневник тревожных мыслей',
    description: 'Инструмент для отслеживания и анализа паттернов тревоги',
    duration: '10 мин',
    category: 'Инструмент'
  },
  {
    id: '5',
    type: 'article',
    title: 'Физиология тревоги: что происходит в теле',
    description: 'Понимание биологических механизмов помогает справляться с симптомами',
    duration: '6 мин',
    category: 'Статья'
  },
  {
    id: '6',
    type: 'article',
    title: 'Работа с катастрофическим мышлением',
    description: 'Как останавливать каскад негативных предположений',
    duration: '7 мин',
    category: 'Статья'
  }
];

export function TopicLanding({ viewport }: TopicLandingProps): ReactElement {
  return (
    <section>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-foreground mb-2">
          Topic Landing (/s-chem-ya-pomogayu/[slug]) — Default — {viewport === 'mobile' ? 'Mobile (375px)' : 'Desktop (1440px)'}
        </h2>
        <p className="text-sm text-muted-foreground">
          Лендинг отдельной темы: "Тревога и беспокойство"
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
            <h3 className="font-semibold text-foreground">Тревога</h3>
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
                <a href="#" className="text-sm font-medium text-primary">Темы</a>
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
        <div className={viewport === 'mobile' ? '' : ''}>
          {/* Hero Section */}
          <div className={`bg-gradient-to-br from-warning/10 via-background to-primary/5 border-b border-border ${
            viewport === 'mobile' ? 'px-6 py-10' : 'px-12 py-16'
          }`}>
            <div className={viewport === 'mobile' ? '' : 'max-w-4xl mx-auto'}>
              {/* Breadcrumb */}
              <div className="flex items-center gap-2 mb-6 text-sm text-muted-foreground">
                <span className="hover:text-primary cursor-pointer transition-colors">С чем я помогаю</span>
                <ArrowRight className="w-3.5 h-3.5" />
                <span className="text-foreground font-medium">Тревога и беспокойство</span>
              </div>

              {/* Icon + Badge */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-16 h-16 rounded-xl bg-warning/15 text-warning flex items-center justify-center">
                  <AlertCircle className="w-8 h-8" />
                </div>
                <Badge className="bg-primary text-white">Популярная тема</Badge>
              </div>

              {/* Title */}
              <h1 className={`font-bold text-foreground mb-4 ${viewport === 'mobile' ? 'text-3xl' : 'text-4xl'}`}>
                Тревога и беспокойство
              </h1>

              {/* Description */}
              <p className={`text-muted-foreground mb-8 leading-relaxed ${viewport === 'mobile' ? 'text-base' : 'text-lg max-w-3xl'}`}>
                Постоянное напряжение, навязчивые мысли о будущем, страх потерять контроль. 
                Тревога — это нормальная реакция организма, но когда она становится хронической, 
                это серьёзно влияет на качество жизни.
              </p>

              {/* CTAs */}
              <div className={`space-y-3 ${viewport === 'mobile' ? '' : 'flex gap-4 space-y-0'}`}>
                <Button size="lg" className={`gap-2 ${viewport === 'mobile' ? 'w-full' : ''}`}>
                  <Play className="w-5 h-5" />
                  Попробовать сейчас: Навигатор тревоги
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  className={`gap-2 ${viewport === 'mobile' ? 'w-full' : ''}`}
                >
                  <Calendar className="w-5 h-5" />
                  Записаться на сессию
                </Button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className={viewport === 'mobile' ? 'px-6 py-10' : 'px-12 py-16'}>
            <div className={viewport === 'mobile' ? '' : 'max-w-4xl mx-auto'}>
              {/* Signs and Symptoms */}
              <div className="mb-16">
                <h2 className={`font-bold text-foreground mb-6 ${viewport === 'mobile' ? 'text-2xl' : 'text-3xl'}`}>
                  Признаки и симптомы
                </h2>
                
                <div className="prose prose-sm max-w-none text-muted-foreground">
                  <p className="text-base leading-relaxed mb-4">
                    Тревога проявляется на нескольких уровнях одновременно. Важно научиться распознавать 
                    эти сигналы, чтобы вовремя применять техники саморегуляции.
                  </p>

                  <div className="space-y-6 mt-6">
                    {/* Physical symptoms */}
                    <Card className="border-2">
                      <CardContent className="p-5">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-lg bg-danger/10 flex items-center justify-center flex-shrink-0">
                            <Heart className="w-5 h-5 text-danger" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-foreground mb-2">Физические симптомы</h4>
                            <ul className="space-y-1.5 text-sm text-muted-foreground">
                              <li className="flex items-start gap-2">
                                <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                                <span>Учащённое сердцебиение, ощущение сдавленности в груди</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                                <span>Поверхностное дыхание, нехватка воздуха</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                                <span>Мышечное напряжение, боли в шее и плечах</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                                <span>Потливость, дрожь, головокружение</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                                <span>Нарушения пищеварения, тошнота</span>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Cognitive symptoms */}
                    <Card className="border-2">
                      <CardContent className="p-5">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center flex-shrink-0">
                            <AlertCircle className="w-5 h-5 text-warning" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-foreground mb-2">Ментальные симптомы</h4>
                            <ul className="space-y-1.5 text-sm text-muted-foreground">
                              <li className="flex items-start gap-2">
                                <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                                <span>Навязчивые мысли, постоянное прокручивание сценариев</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                                <span>Катастрофизация: «что если случится худшее»</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                                <span>Сложности с концентрацией и принятием решений</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                                <span>Ощущение потери контроля над ситуацией</span>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Behavioral symptoms */}
                    <Card className="border-2">
                      <CardContent className="p-5">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center flex-shrink-0">
                            <Zap className="w-5 h-5 text-info" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-foreground mb-2">Поведенческие симптомы</h4>
                            <ul className="space-y-1.5 text-sm text-muted-foreground">
                              <li className="flex items-start gap-2">
                                <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                                <span>Избегание ситуаций, вызывающих тревогу</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                                <span>Компульсивные проверки и перестраховки</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                                <span>Прокрастинация из-за страха неудачи</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                                <span>Социальная изоляция, отмена планов</span>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>

              {/* Main Content */}
              <div className="mb-16">
                <div className="prose prose-sm max-w-none">
                  <h2 className={`font-bold text-foreground mb-6 ${viewport === 'mobile' ? 'text-2xl' : 'text-3xl'}`}>
                    Почему возникает тревога
                  </h2>
                  
                  <div className="text-base leading-relaxed text-muted-foreground space-y-4">
                    <p>
                      Тревога — это <strong className="text-foreground font-semibold">эволюционный механизм</strong>, 
                      который помогал нашим предкам выживать в опасных ситуациях. Проблема в том, 
                      что современный мир редко требует реакции «бей или беги», но наш мозг продолжает 
                      работать по старым программам.
                    </p>

                    <p>
                      <strong className="text-foreground font-semibold">Основные причины хронической тревоги:</strong>
                    </p>

                    <ul className="space-y-2 ml-6 list-disc marker:text-primary">
                      <li>
                        <strong className="text-foreground">Генетическая предрасположенность</strong> — 
                        наследуемые особенности работы нейромедиаторов
                      </li>
                      <li>
                        <strong className="text-foreground">Травматический опыт</strong> — 
                        события, которые сформировали паттерн гипербдительности
                      </li>
                      <li>
                        <strong className="text-foreground">Хронический стресс</strong> — 
                        длительная перегрузка нервной системы без восстановления
                      </li>
                      <li>
                        <strong className="text-foreground">Когнитивные искажения</strong> — 
                        автоматические паттерны мышления, усиливающие тревогу
                      </li>
                      <li>
                        <strong className="text-foreground">Физиологические факторы</strong> — 
                        нарушения сна, питания, гормональный дисбаланс
                      </li>
                    </ul>

                    <p>
                      Важно понимать: тревога — это не слабость и не личный недостаток. 
                      Это состояние, с которым можно научиться работать.
                    </p>
                  </div>
                </div>
              </div>

              {/* How I Work With This */}
              <div className="mb-16">
                <div className="prose prose-sm max-w-none">
                  <h2 className={`font-bold text-foreground mb-6 ${viewport === 'mobile' ? 'text-2xl' : 'text-3xl'}`}>
                    Как я работаю с этим
                  </h2>
                  
                  <div className="text-base leading-relaxed text-muted-foreground space-y-4">
                    <p>
                      Моя работа с тревогой основана на <strong className="text-foreground font-semibold">доказательных подходах</strong>: 
                      когнитивно-поведенческой терапии (КПТ), терапии принятия и ответственности (ACT), 
                      и практиках осознанности.
                    </p>

                    <Card className="border-l-4 border-l-primary bg-primary/5 my-6">
                      <CardContent className="p-5">
                        <h4 className="font-semibold text-foreground mb-3">Трёхуровневая система работы:</h4>
                        <div className="space-y-4">
                          <div>
                            <h5 className="font-semibold text-foreground text-sm mb-1">1. Экстренная помощь</h5>
                            <p className="text-sm text-muted-foreground">
                              Быстрые техники снижения острой тревоги: дыхательные упражнения, 
                              заземление, работа с телом. Работают здесь и сейчас.
                            </p>
                          </div>
                          <div>
                            <h5 className="font-semibold text-foreground text-sm mb-1">2. Средний уровень</h5>
                            <p className="text-sm text-muted-foreground">
                              Работа с мыслями: выявление когнитивных искажений, проверка реалистичности 
                              опасений, развитие альтернативных способов мышления.
                            </p>
                          </div>
                          <div>
                            <h5 className="font-semibold text-foreground text-sm mb-1">3. Глубинный уровень</h5>
                            <p className="text-sm text-muted-foreground">
                              Исследование корней тревоги, работа с базовыми убеждениями, 
                              трансформация отношений с неопределённостью.
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <p>
                      На платформе вы найдёте <strong className="text-foreground font-semibold">интерактивные инструменты</strong>, 
                      которые помогут самостоятельно работать с тревогой, а также возможность 
                      записаться на индивидуальные сессии для более глубокой работы.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Trust Blocks */}
          <div className="border-y border-border bg-muted/30">
            <div className={viewport === 'mobile' ? 'px-6 py-10' : 'px-12 py-12'}>
              <div className={viewport === 'mobile' ? '' : 'max-w-6xl mx-auto'}>
                <TrustBlocks viewport={viewport} compact={true} />
              </div>
            </div>
          </div>

          {/* Materials Section */}
          <div className={viewport === 'mobile' ? 'px-6 py-10' : 'px-12 py-16'}>
            <div className={viewport === 'mobile' ? '' : 'max-w-6xl mx-auto'}>
              <div className="mb-8">
                <h2 className={`font-bold text-foreground mb-3 ${viewport === 'mobile' ? 'text-2xl' : 'text-3xl'}`}>
                  Полезные материалы по теме «Тревога»
                </h2>
                <p className="text-muted-foreground">
                  Интерактивные инструменты и статьи для самостоятельной работы
                </p>
              </div>

              <div className={`grid gap-4 ${viewport === 'mobile' ? 'grid-cols-1' : 'grid-cols-2 lg:grid-cols-3'}`}>
                {materials.map((material) => (
                  <Card 
                    key={material.id}
                    className="border-2 hover:shadow-lg transition-all cursor-pointer group"
                  >
                    <CardContent className="p-5">
                      {/* Badge + Duration */}
                      <div className="flex items-center justify-between mb-4">
                        <Badge 
                          variant={material.type === 'interactive' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {material.category}
                        </Badge>
                        {material.duration && (
                          <span className="text-xs text-muted-foreground">
                            {material.duration}
                          </span>
                        )}
                      </div>

                      {/* Icon */}
                      <div className={`w-12 h-12 rounded-lg mb-4 flex items-center justify-center ${
                        material.type === 'interactive' 
                          ? 'bg-primary/10 text-primary' 
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {material.type === 'interactive' ? (
                          <Play className="w-6 h-6" />
                        ) : (
                          <BookOpen className="w-6 h-6" />
                        )}
                      </div>

                      {/* Title */}
                      <h3 className="font-semibold text-foreground text-base mb-2 group-hover:text-primary transition-colors">
                        {material.title}
                      </h3>

                      {/* Description */}
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {material.description}
                      </p>

                      {/* CTA */}
                      <Button 
                        variant={material.type === 'interactive' ? 'default' : 'outline'}
                        size="sm"
                        className="w-full gap-2"
                      >
                        {material.type === 'interactive' ? (
                          <>
                            <Play className="w-4 h-4" />
                            Запустить
                          </>
                        ) : (
                          <>
                            <ArrowRight className="w-4 h-4" />
                            Читать далее
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* Final CTA Block */}
          <div className="border-t border-border bg-gradient-to-br from-primary/5 to-accent/5">
            <div className={viewport === 'mobile' ? 'px-6 py-12' : 'px-12 py-16'}>
              <div className={`text-center ${viewport === 'mobile' ? '' : 'max-w-3xl mx-auto'}`}>
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  <Heart className="w-8 h-8 text-primary" />
                </div>
                
                <h2 className={`font-bold text-foreground mb-4 ${viewport === 'mobile' ? 'text-2xl' : 'text-3xl'}`}>
                  Готовы начать работу с тревогой?
                </h2>
                
                <p className={`text-muted-foreground mb-8 leading-relaxed ${viewport === 'mobile' ? 'text-base' : 'text-lg'}`}>
                  Запустите интерактивный навигатор, чтобы понять, что именно происходит, 
                  и получить персонализированный план действий. Или запишитесь на индивидуальную 
                  сессию для глубокой работы.
                </p>

                <div className={`space-y-3 ${viewport === 'mobile' ? '' : 'flex gap-4 justify-center space-y-0'}`}>
                  <Button size="lg" className={`gap-2 ${viewport === 'mobile' ? 'w-full' : ''}`}>
                    <Play className="w-5 h-5" />
                    Запустить навигатор тревоги
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg"
                    className={`gap-2 ${viewport === 'mobile' ? 'w-full' : ''}`}
                  >
                    <Calendar className="w-5 h-5" />
                    Записаться на сессию
                  </Button>
                </div>

                <p className="text-sm text-muted-foreground mt-6">
                  Все инструменты бесплатны • Конфиденциально • Без регистрации
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
