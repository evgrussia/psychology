import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { QuizCard } from './domain/QuizCard';
import { MoodCheckIn } from './domain/MoodCheckIn';
import { ContentModuleTile } from './domain/ContentModuleTile';
import { BookingSlot } from './domain/BookingSlot';
import { ModerationQueueItem } from './domain/ModerationQueueItem';
import { 
  Smartphone, Monitor, ArrowRight, Star, CheckCircle2, 
  Search, Filter, BookOpen, Clock, Target, Heart,
  ChevronRight, Play, Calendar, Award
} from 'lucide-react';

export function Templates() {
  return (
    <div className="max-w-7xl mx-auto p-6 md:p-8 space-y-12">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Templates</h1>
        <p className="text-muted-foreground">
          Готовые шаблоны страниц и доменных компонентов для быстрого старта
        </p>
      </div>

      <Tabs defaultValue="page-templates" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="page-templates">
            <Monitor className="w-4 h-4 mr-2" />
            Шаблоны страниц
          </TabsTrigger>
          <TabsTrigger value="domain">
            <Smartphone className="w-4 h-4 mr-2" />
            Доменные компоненты
          </TabsTrigger>
        </TabsList>

        {/* Page Templates */}
        <TabsContent value="page-templates" className="space-y-12 mt-8">
          {/* Template 1: Marketing/Content Page */}
          <section>
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-foreground mb-2">
                Template 1 — Marketing / Content Page
              </h2>
              <p className="text-sm text-muted-foreground">
                Hero Section + Content/Prose + CTA Block
              </p>
            </div>

            <Card className="border-2 border-primary/20">
              <CardContent className="p-0">
                {/* Hero Section */}
                <div className="bg-gradient-to-br from-primary/10 via-accent/5 to-secondary/10 p-8 md:p-12 text-center border-b border-border">
                  <Badge className="mb-3">Новая программа</Badge>
                  <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                    Ваш путь к эмоциональному балансу
                  </h1>
                  <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
                    Пройдите персонализированные тесты, отслеживайте настроение и получайте рекомендации от профессионалов
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button size="lg" className="gap-2">
                      Начать тестирование
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                    <Button size="lg" variant="outline">
                      Узнать больше
                    </Button>
                  </div>
                  <div className="flex items-center justify-center gap-6 pt-6 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-success" />
                      <span>10,000+ пользователей</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 fill-primary text-primary" />
                      <span>4.8 рейтинг</span>
                    </div>
                  </div>
                </div>

                {/* Content/Prose Section */}
                <div className="p-8 md:p-12 max-w-4xl mx-auto space-y-8">
                  <div className="grid md:grid-cols-3 gap-6">
                    {[
                      { 
                        icon: Target, 
                        title: 'Персонализация', 
                        description: 'Индивидуальные рекомендации на основе ваших ответов',
                        color: 'text-primary bg-primary/10'
                      },
                      { 
                        icon: Award, 
                        title: 'Профессионалы', 
                        description: 'Доступ к проверенным специалистам',
                        color: 'text-success bg-success/10'
                      },
                      { 
                        icon: Calendar, 
                        title: 'Отслеживание', 
                        description: 'Визуализация изменений со временем',
                        color: 'text-warning bg-warning/10'
                      },
                    ].map((feature, idx) => (
                      <div key={idx} className="text-center">
                        <div className={`w-16 h-16 rounded-xl ${feature.color} flex items-center justify-center mx-auto mb-4`}>
                          <feature.icon className="w-8 h-8" />
                        </div>
                        <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                        <p className="text-sm text-muted-foreground">{feature.description}</p>
                      </div>
                    ))}
                  </div>

                  <div className="prose prose-slate max-w-none">
                    <h2 className="text-2xl font-semibold text-foreground mb-4">
                      Как это работает?
                    </h2>
                    <p className="text-muted-foreground mb-4">
                      Emotional Balance — это комплексная платформа для улучшения эмоционального здоровья. 
                      Мы используем научно обоснованные методики и профессиональные инструменты оценки.
                    </p>
                    <ul className="space-y-3">
                      {[
                        'Пройдите первичное тестирование для оценки текущего состояния',
                        'Получите персонализированные рекомендации и план действий',
                        'Отслеживайте динамику настроения с помощью ежедневных чек-инов',
                        'Запишитесь на консультацию со специалистом при необходимости',
                      ].map((step, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-foreground">{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Testimonials */}
                  <div className="grid md:grid-cols-2 gap-6 pt-4">
                    {[
                      {
                        text: 'Приложение помогло мне лучше понять свои эмоции. Рекомендую!',
                        author: 'Анна М.',
                        role: 'Пользователь 6 месяцев',
                      },
                      {
                        text: 'Очень удобные тесты и понятные рекомендации.',
                        author: 'Дмитрий К.',
                        role: 'Пользователь 3 месяца',
                      },
                    ].map((testimonial, idx) => (
                      <Card key={idx} className="bg-gradient-to-br from-secondary/30 to-accent/20">
                        <CardContent className="p-6">
                          <div className="flex gap-1 mb-3">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                            ))}
                          </div>
                          <p className="text-foreground mb-4 italic text-sm">"{testimonial.text}"</p>
                          <div>
                            <p className="font-semibold text-foreground text-sm">{testimonial.author}</p>
                            <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* CTA Section */}
                <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-8 md:p-12 border-t border-border">
                  <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl font-bold text-foreground mb-4">
                      Готовы начать путь к балансу?
                    </h2>
                    <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                      Присоединяйтесь к тысячам пользователей, которые уже улучшили качество своей жизни
                    </p>
                    <Button size="lg" className="gap-2">
                      Начать сейчас
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Template 2: Catalog/List Page */}
          <section>
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-foreground mb-2">
                Template 2 — Catalog / List Page
              </h2>
              <p className="text-sm text-muted-foreground">
                Header + Filters/Tags + Grid/List of Cards
              </p>
            </div>

            <Card className="border-2 border-primary/20">
              <CardContent className="p-0">
                {/* Header Section */}
                <div className="p-8 border-b border-border">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h1 className="text-3xl font-bold text-foreground mb-2">Тесты и опросники</h1>
                      <p className="text-muted-foreground">Выберите тест для оценки вашего состояния</p>
                    </div>
                    <Button variant="outline" className="gap-2">
                      <Filter className="w-4 h-4" />
                      Фильтры
                    </Button>
                  </div>
                  
                  {/* Search */}
                  <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input placeholder="Поиск тестов..." className="pl-10" />
                  </div>
                </div>

                {/* Filters/Tags Section */}
                <div className="p-6 bg-muted/30 border-b border-border">
                  <div className="flex flex-wrap gap-2">
                    <button className="px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium">
                      Все тесты
                    </button>
                    <button className="px-4 py-2 rounded-full bg-background text-foreground text-sm hover:bg-muted">
                      Тревожность
                    </button>
                    <button className="px-4 py-2 rounded-full bg-background text-foreground text-sm hover:bg-muted">
                      Депрессия
                    </button>
                    <button className="px-4 py-2 rounded-full bg-background text-foreground text-sm hover:bg-muted">
                      Стресс
                    </button>
                    <button className="px-4 py-2 rounded-full bg-background text-foreground text-sm hover:bg-muted">
                      Эмоции
                    </button>
                    <button className="px-4 py-2 rounded-full bg-background text-foreground text-sm hover:bg-muted">
                      Самооценка
                    </button>
                  </div>
                </div>

                {/* Grid of Cards */}
                <div className="p-8">
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                      {
                        title: 'Оценка уровня тревожности',
                        description: 'Определите уровень тревоги по шкале GAD-7',
                        duration: '5 мин',
                        questions: 7,
                        badge: 'Популярное',
                        icon: Target,
                        color: 'bg-primary/10 text-primary'
                      },
                      {
                        title: 'Шкала депрессии Бека',
                        description: 'Стандартизированный тест для оценки депрессии',
                        duration: '10 мин',
                        questions: 21,
                        badge: null,
                        icon: Heart,
                        color: 'bg-success/10 text-success'
                      },
                      {
                        title: 'Уровень стресса',
                        description: 'Оцените ваш текущий уровень стресса',
                        duration: '3 мин',
                        questions: 10,
                        badge: 'Новое',
                        icon: BookOpen,
                        color: 'bg-warning/10 text-warning'
                      },
                      {
                        title: 'Эмоциональное выгорание',
                        description: 'Проверьте признаки профессионального выгорания',
                        duration: '8 мин',
                        questions: 15,
                        badge: null,
                        icon: Target,
                        color: 'bg-danger/10 text-danger'
                      },
                      {
                        title: 'Качество сна',
                        description: 'Оцените качество вашего сна и отдыха',
                        duration: '4 мин',
                        questions: 8,
                        badge: null,
                        icon: Clock,
                        color: 'bg-info/10 text-info'
                      },
                      {
                        title: 'Самооценка',
                        description: 'Определите уровень самооценки и уверенности',
                        duration: '6 мин',
                        questions: 12,
                        badge: null,
                        icon: Award,
                        color: 'bg-accent/50 text-primary'
                      },
                    ].map((quiz, idx) => (
                      <Card key={idx} className="hover:shadow-lg transition-shadow cursor-pointer group">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between gap-4 mb-4">
                            <div className={`w-12 h-12 rounded-lg ${quiz.color} flex items-center justify-center flex-shrink-0`}>
                              <quiz.icon className="w-6 h-6" />
                            </div>
                            {quiz.badge && (
                              <Badge variant="secondary">{quiz.badge}</Badge>
                            )}
                          </div>
                          <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                            {quiz.title}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                            {quiz.description}
                          </p>
                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                <span>{quiz.duration}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <BookOpen className="w-4 h-4" />
                                <span>{quiz.questions}</span>
                              </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Template 3: Interactive Flow */}
          <section>
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-foreground mb-2">
                Template 3 — Interactive Flow
              </h2>
              <p className="text-sm text-muted-foreground">
                Start → Progress → Result (Quiz/Test Flow)
              </p>
            </div>

            <div className="space-y-6">
              {/* Start Screen */}
              <Card className="border-2 border-primary/20">
                <CardHeader className="border-b border-border">
                  <CardTitle className="text-lg">Шаг 1: Start Screen</CardTitle>
                </CardHeader>
                <CardContent className="p-8 md:p-12">
                  <div className="max-w-2xl mx-auto text-center space-y-6">
                    <div className="w-20 h-20 rounded-xl bg-primary/10 flex items-center justify-center mx-auto">
                      <BookOpen className="w-10 h-10 text-primary" />
                    </div>
                    <div>
                      <Badge className="mb-3">5 минут · 7 вопросов</Badge>
                      <h2 className="text-3xl font-bold text-foreground mb-4">
                        Оценка уровня тревожности
                      </h2>
                      <p className="text-muted-foreground mb-6">
                        Этот тест поможет определить уровень тревожности по стандартизированной шкале GAD-7. 
                        Ответьте честно на все вопросы для получения точного результата.
                      </p>
                    </div>
                    
                    <div className="bg-muted/50 rounded-xl p-6 text-left">
                      <h3 className="font-semibold text-foreground mb-3">Что вы получите:</h3>
                      <ul className="space-y-2">
                        {[
                          'Точную оценку уровня тревожности',
                          'Персонализированные рекомендации',
                          'Советы по снижению тревоги',
                          'Доступ к релевантным материалам',
                        ].map((item, idx) => (
                          <li key={idx} className="flex items-center gap-3">
                            <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
                            <span className="text-sm text-foreground">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                      <Button size="lg" className="gap-2">
                        Начать тестирование
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                      <Button size="lg" variant="outline">
                        Подробнее о тесте
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Progress Screen */}
              <Card className="border-2 border-primary/20">
                <CardHeader className="border-b border-border">
                  <CardTitle className="text-lg">Шаг 2: Progress Screen</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {/* Progress Header */}
                  <div className="p-6 border-b border-border">
                    <div className="flex items-center justify-between mb-4">
                      <Button variant="ghost" size="sm">← Назад</Button>
                      <span className="text-sm text-muted-foreground">Вопрос 3 из 7</span>
                    </div>
                    <Progress value={42.8} className="h-2" />
                  </div>

                  {/* Question Card */}
                  <div className="p-8 flex items-center justify-center min-h-[500px]">
                    <QuizCard variant="single-choice" />
                  </div>
                </CardContent>
              </Card>

              {/* Result Screen */}
              <Card className="border-2 border-primary/20">
                <CardHeader className="border-b border-border">
                  <CardTitle className="text-lg">Шаг 3: Result Screen</CardTitle>
                </CardHeader>
                <CardContent className="p-8 md:p-12">
                  <div className="max-w-2xl mx-auto space-y-8">
                    {/* Success Header */}
                    <div className="text-center">
                      <div className="w-24 h-24 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="w-12 h-12 text-success" />
                      </div>
                      <h2 className="text-4xl font-bold text-foreground mb-3">
                        Тест завершён!
                      </h2>
                      <p className="text-muted-foreground">
                        Спасибо за ваши ответы. Вот результаты оценки вашего состояния
                      </p>
                    </div>

                    {/* Score Display */}
                    <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
                      <CardContent className="p-8 text-center">
                        <p className="text-sm text-muted-foreground mb-2">Ваш результат</p>
                        <div className="text-6xl font-bold text-primary mb-2">7.5</div>
                        <p className="text-sm text-muted-foreground mb-4">из 10 баллов</p>
                        <Badge className="bg-success text-success-foreground">Низкий уровень тревожности</Badge>
                      </CardContent>
                    </Card>

                    {/* Interpretation */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Интерпретация результатов</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                          Ваш результат указывает на низкий уровень тревожности. Это хороший показатель, 
                          свидетельствующий о том, что вы эффективно справляетесь со стрессовыми ситуациями.
                        </p>
                      </CardContent>
                    </Card>

                    {/* Recommendations */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Рекомендации</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <ul className="space-y-3">
                          {[
                            'Продолжайте практиковать техники релаксации',
                            'Поддерживайте регулярный режим сна',
                            'Уделяйте время физической активности',
                          ].map((rec, idx) => (
                            <li key={idx} className="flex items-start gap-3">
                              <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                              <span className="text-sm text-foreground">{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button className="flex-1">Сохранить результат</Button>
                      <Button variant="outline" className="flex-1">Пройти ещё раз</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>
        </TabsContent>

        {/* Domain Components */}
        <TabsContent value="domain" className="space-y-12 mt-8">
          {/* Quiz Cards */}
          <section>
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-foreground mb-2">Quiz Question Cards</h2>
              <p className="text-sm text-muted-foreground">
                Карточки вопросов для тестирований и опросов
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-foreground mb-4">Single Choice (Одиночный выбор)</h3>
                <div className="flex justify-center">
                  <QuizCard variant="single-choice" />
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-foreground mb-4">Multi Choice (Множественный выбор)</h3>
                <div className="flex justify-center">
                  <QuizCard variant="multi-choice" />
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-foreground mb-4">Scale (Шкала)</h3>
                <div className="flex justify-center">
                  <QuizCard variant="scale" />
                </div>
              </div>
            </div>
          </section>

          {/* Mood Check-in */}
          <section>
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-foreground mb-2">Mood Check-in</h2>
              <p className="text-sm text-muted-foreground">
                Компонент для ежедневной фиксации настроения
              </p>
            </div>
            <div className="flex justify-center">
              <MoodCheckIn />
            </div>
          </section>

          {/* Content Module Tiles */}
          <section>
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-foreground mb-2">Content Module Tiles</h2>
              <p className="text-sm text-muted-foreground">
                Карточки образовательных модулей и контента
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <ContentModuleTile
                title="Введение в осознанность"
                description="Узнайте основы практики осознанности и её влияние на эмоциональное состояние"
                duration="15 мин"
                status="available"
                category="Медитация"
                imageUrl="https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=300&fit=crop"
              />
              <ContentModuleTile
                title="Управление стрессом"
                description="Эффективные техники снижения стресса в повседневной жизни"
                duration="20 мин"
                status="in-progress"
                progress={45}
                category="Стресс-менеджмент"
                imageUrl="https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=400&h=300&fit=crop"
              />
              <ContentModuleTile
                title="Дыхательные практики"
                description="Простые упражнения для успокоения нервной системы"
                duration="10 мин"
                status="completed"
                category="Дыхание"
                imageUrl="https://images.unsplash.com/photo-1593811167562-9cef47bfc4a7?w=400&h=300&fit=crop"
              />
              <ContentModuleTile
                title="Продвинутая медитация"
                description="Глубокие практики для опытных практикующих"
                duration="30 мин"
                status="locked"
                category="Медитация"
                imageUrl="https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=400&h=300&fit=crop"
              />
            </div>
          </section>

          {/* Booking Slots */}
          <section>
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-foreground mb-2">Booking Slots</h2>
              <p className="text-sm text-muted-foreground">
                Слоты для записи к специалистам
              </p>
            </div>
            <div className="space-y-4 max-w-2xl">
              <BookingSlot
                specialist={{
                  name: "Анна Петрова",
                  title: "Психолог, КПТ-терапевт",
                  avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop"
                }}
                date="15 января"
                time="14:00"
                duration="50 мин"
                type="online"
                price="3 500 ₽"
                available={true}
              />
              <BookingSlot
                specialist={{
                  name: "Михаил Соколов",
                  title: "Клинический психолог",
                  avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop"
                }}
                date="15 января"
                time="16:00"
                duration="50 мин"
                type="offline"
                price="4 000 ₽"
                available={false}
                location="ул. Ленина, 12"
              />
              <BookingSlot
                specialist={{
                  name: "Елена Иванова",
                  title: "Семейный психотерапевт",
                  avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop"
                }}
                date="16 января"
                time="10:00"
                duration="90 мин"
                type="online"
                price="5 500 ₽"
                available={true}
              />
            </div>
          </section>

          {/* Moderation Queue */}
          <section>
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-foreground mb-2">Moderation Queue Item</h2>
              <p className="text-sm text-muted-foreground">
                Элемент очереди модерации UGC-контента (для админ-панели)
              </p>
            </div>
            <div className="space-y-4 max-w-3xl">
              <ModerationQueueItem
                author={{
                  name: "Александр К.",
                  avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop"
                }}
                content="Хочу поделиться своим опытом! После месяца практики медитации я заметил значительное улучшение сна и снижение тревожности. Особенно помогла техника осознанного дыхания перед сном. Всем рекомендую попробовать!"
                type="post"
                timestamp="2 часа назад"
                flags={[]}
                status="pending"
              />
              <ModerationQueueItem
                author={{
                  name: "Мария С.",
                  avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop"
                }}
                content="Это полная ерунда! Никакая медитация не помогает, все это обман и выкачивание денег. Лучше сходите к нормальному врачу, а не тратьте время на эту чушь!"
                type="comment"
                timestamp="30 минут назад"
                flags={["Оскорбления", "Негатив"]}
                status="pending"
              />
              <ModerationQueueItem
                author={{
                  name: "Дмитрий Л.",
                  avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop"
                }}
                content="Отличный курс по управлению стрессом! Все упражнения понятны и эффективны. Спасибо команде за качественный контент."
                type="review"
                timestamp="1 день назад"
                flags={[]}
                status="approved"
              />
            </div>
          </section>
        </TabsContent>
      </Tabs>
    </div>
  );
}