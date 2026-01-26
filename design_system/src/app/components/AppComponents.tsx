import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { 
  ArrowRight, Star, Users, Calendar, Clock, BookOpen, 
  Heart, TrendingUp, MessageCircle, ChevronRight, Play,
  CheckCircle2, Award, Target
} from 'lucide-react';

export function AppComponents() {
  return (
    <div className="max-w-7xl mx-auto p-6 md:p-8 space-y-12">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Components (App)</h1>
        <p className="text-muted-foreground">
          Прикладные компоненты для реальных экранов приложения
        </p>
      </div>

      {/* Hero Sections */}
      <section>
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-foreground mb-2">Hero Sections</h2>
          <p className="text-sm text-muted-foreground">
            Главные секции для лендингов и стартовых экранов
          </p>
        </div>

        <div className="space-y-6">
          {/* Hero - Primary */}
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="bg-gradient-to-br from-primary/10 via-accent/5 to-secondary/10 p-8 md:p-12 text-center">
                <div className="max-w-3xl mx-auto space-y-6">
                  <Badge className="mb-2">Новая функция</Badge>
                  <h1 className="text-4xl md:text-5xl font-bold text-foreground">
                    Ваш путь к эмоциональному балансу
                  </h1>
                  <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    Пройдите персонализированные тесты, отслеживайте настроение и получайте рекомендации от профессионалов
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
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
                      <Users className="w-4 h-4" />
                      <span>10,000+ пользователей</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 fill-primary text-primary" />
                      <span>4.8 рейтинг</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Hero - Compact */}
          <Card>
            <CardContent className="p-8 md:p-10">
              <div className="max-w-2xl">
                <h2 className="text-3xl font-bold text-foreground mb-4">
                  Добро пожаловать обратно!
                </h2>
                <p className="text-muted-foreground mb-6">
                  Продолжите отслеживать ваше эмоциональное состояние и работайте над улучшением качества жизни
                </p>
                <Button className="gap-2">
                  Проверить настроение
                  <Heart className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Feature Grid */}
      <section>
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-foreground mb-2">Feature Blocks</h2>
          <p className="text-sm text-muted-foreground">
            Блоки функций и преимуществ
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            { 
              icon: Target, 
              title: 'Персонализация', 
              description: 'Индивидуальные рекомендации на основе ваших ответов',
              color: 'text-primary bg-primary/10'
            },
            { 
              icon: TrendingUp, 
              title: 'Отслеживание прогресса', 
              description: 'Визуализация изменений настроения со временем',
              color: 'text-success bg-success/10'
            },
            { 
              icon: Award, 
              title: 'Профессиональная поддержка', 
              description: 'Доступ к проверенным специалистам',
              color: 'text-warning bg-warning/10'
            },
          ].map((feature, idx) => (
            <Card key={idx} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6 space-y-4">
                <div className={`w-12 h-12 rounded-lg ${feature.color} flex items-center justify-center`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Topic/Category Cards */}
      <section>
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-foreground mb-2">Topic Cards</h2>
          <p className="text-sm text-muted-foreground">
            Карточки тем, курсов и категорий контента
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Topic Card - Image */}
          <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
            <div className="aspect-video bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              <BookOpen className="w-12 h-12 text-primary" />
            </div>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                    Управление тревожностью
                  </h3>
                  <p className="text-sm text-muted-foreground">8 уроков · 45 минут</p>
                </div>
                <Badge variant="secondary">Новое</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Изучите эффективные техники для снижения уровня тревоги в повседневной жизни
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>1,234</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-primary text-primary" />
                    <span>4.9</span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </div>
            </CardContent>
          </Card>

          {/* Topic Card - Icon */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
            <CardContent className="p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center flex-shrink-0">
                  <Heart className="w-6 h-6 text-success" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                    Эмоциональный интеллект
                  </h3>
                  <p className="text-sm text-muted-foreground">12 уроков · 1 час 20 минут</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Развивайте навыки распознавания и управления эмоциями для улучшения отношений
              </p>
              <div className="flex items-center gap-2">
                <Progress value={35} className="flex-1" />
                <span className="text-sm text-muted-foreground">35%</span>
              </div>
              <Button variant="outline" size="sm" className="w-full mt-4">
                Продолжить обучение
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Content Cards */}
      <section>
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-foreground mb-2">Content Cards</h2>
          <p className="text-sm text-muted-foreground">
            Карточки для статей, видео и других материалов
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Article Card */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
            <CardContent className="p-6 space-y-4">
              <Badge variant="outline">Статья</Badge>
              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                5 способов справиться со стрессом
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-2">
                Практические советы для снижения стресса в повседневной жизни и улучшения общего самочувствия
              </p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t border-border">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>5 мин</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>2 дня назад</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Video Card */}
          <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
            <div className="aspect-video bg-gradient-to-br from-warning/20 to-danger/10 flex items-center justify-center relative">
              <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Play className="w-6 h-6 text-foreground ml-1" />
              </div>
              <Badge className="absolute top-2 right-2">12:34</Badge>
            </div>
            <CardContent className="p-6">
              <Badge variant="outline" className="mb-3">Видео</Badge>
              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors mb-2">
                Дыхательные практики для спокойствия
              </h3>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  <span>2.5k просмотров</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Course Card */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <Badge>Курс</Badge>
                <Badge variant="secondary" className="bg-success/10 text-success">Популярное</Badge>
              </div>
              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                Основы медитации
              </h3>
              <p className="text-sm text-muted-foreground">
                8 уроков для начинающих
              </p>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Прогресс</span>
                  <span className="text-foreground font-medium">3/8</span>
                </div>
                <Progress value={37.5} />
              </div>
              <Button size="sm" className="w-full gap-2">
                Продолжить
                <ArrowRight className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Stats Widgets */}
      <section>
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-foreground mb-2">Stats Widgets</h2>
          <p className="text-sm text-muted-foreground">
            Виджеты статистики и метрик
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          {[
            { label: 'Пройдено тестов', value: '12', icon: CheckCircle2, trend: '+3 за неделю', color: 'text-primary' },
            { label: 'Дней подряд', value: '7', icon: Calendar, trend: 'Текущая серия', color: 'text-success' },
            { label: 'Средний балл', value: '8.5', icon: Star, trend: '+0.5 к прошлой неделе', color: 'text-warning' },
            { label: 'Часов медитации', value: '4.5', icon: Clock, trend: 'В этом месяце', color: 'text-info' },
          ].map((stat, idx) => (
            <Card key={idx}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-muted-foreground">{stat.label}</span>
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                </div>
                <div className="text-3xl font-bold text-foreground mb-1">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.trend}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Blocks */}
      <section>
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-foreground mb-2">CTA Blocks</h2>
          <p className="text-sm text-muted-foreground">
            Блоки призыва к действию
          </p>
        </div>

        <div className="space-y-6">
          {/* CTA - Primary */}
          <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-2xl font-bold text-foreground mb-2">
                    Готовы начать путь к балансу?
                  </h3>
                  <p className="text-muted-foreground">
                    Присоединяйтесь к тысячам пользователей, которые уже улучшили качество своей жизни
                  </p>
                </div>
                <Button size="lg" className="gap-2 flex-shrink-0">
                  Начать сейчас
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* CTA - Secondary */}
          <Card className="border-2 border-border">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Нужна помощь специалиста?
              </h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
                Запишитесь на консультацию с профессиональным психологом
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button variant="outline">Подробнее</Button>
                <Button>Записаться на консультацию</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Testimonials */}
      <section>
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-foreground mb-2">Testimonials</h2>
          <p className="text-sm text-muted-foreground">
            Отзывы и рекомендации
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {[
            {
              text: 'Приложение помогло мне лучше понять свои эмоции и научиться справляться со стрессом. Рекомендую всем!',
              author: 'Анна М.',
              role: 'Пользователь 6 месяцев',
              rating: 5
            },
            {
              text: 'Очень удобные тесты и понятные рекомендации. Прогресс виден уже через несколько недель регулярного использования.',
              author: 'Дмитрий К.',
              role: 'Пользователь 3 месяца',
              rating: 5
            },
          ].map((testimonial, idx) => (
            <Card key={idx} className="bg-gradient-to-br from-secondary/30 to-accent/20">
              <CardContent className="p-6">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-foreground mb-6 italic">"{testimonial.text}"</p>
                <div>
                  <p className="font-semibold text-foreground">{testimonial.author}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* FAQ Items */}
      <section>
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-foreground mb-2">FAQ Items</h2>
          <p className="text-sm text-muted-foreground">
            Элементы часто задаваемых вопросов
          </p>
        </div>

        <div className="space-y-4">
          {[
            {
              question: 'Как часто нужно проходить тесты?',
              answer: 'Мы рекомендуем проходить базовую проверку настроения ежедневно (занимает 2-3 минуты), а более детальные тесты — раз в неделю или при изменении эмоционального состояния.'
            },
            {
              question: 'Конфиденциальны ли мои данные?',
              answer: 'Да, все ваши данные полностью конфиденциальны и защищены в соответствии с законодательством о персональных данных. Мы не передаём информацию третьим лицам без вашего согласия.'
            },
            {
              question: 'Могу ли я получить консультацию специалиста?',
              answer: 'Да, в приложении доступна запись на консультацию с квалифицированными психологами. Вы можете выбрать удобное время и формат встречи (онлайн или офлайн).'
            },
          ].map((faq, idx) => {
            const [isOpen, setIsOpen] = useState(false);
            return (
              <Card 
                key={idx} 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setIsOpen(!isOpen)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="font-semibold text-foreground flex-1">{faq.question}</h3>
                    <ChevronRight className={`w-5 h-5 text-muted-foreground flex-shrink-0 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
                  </div>
                  {isOpen && (
                    <p className="text-sm text-muted-foreground mt-4 pt-4 border-t border-border">
                      {faq.answer}
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}
