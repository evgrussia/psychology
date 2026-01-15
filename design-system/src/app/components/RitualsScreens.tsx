import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { 
  ArrowRight, User, Sparkles, Wind, Heart, 
  Brain, Coffee, Moon, Sun, Zap
} from 'lucide-react';

interface RitualsScreensProps {
  viewport: 'mobile' | 'desktop';
}

type FilterTag = 'Все' | 'Тревога' | 'Паника' | 'Стресс' | 'Усталость' | 'Грусть' | 'Бессонница';

interface Ritual {
  id: string;
  title: string;
  why: string;
  duration: number;
  tags: FilterTag[];
  icon: any;
  color: string;
}

const rituals: Ritual[] = [
  {
    id: '1',
    title: '5-4-3-2-1: Заземление',
    why: 'Быстро возвращает в настоящий момент при панике и острой тревоге. Переключает внимание с мыслей на органы чувств.',
    duration: 3,
    tags: ['Тревога', 'Паника'],
    icon: Sparkles,
    color: 'primary'
  },
  {
    id: '2',
    title: 'Дыхание 4-7-8',
    why: 'Активирует парасимпатическую нервную систему, снижает уровень кортизола. Помогает при стрессе и перед сном.',
    duration: 5,
    tags: ['Стресс', 'Бессонница', 'Тревога'],
    icon: Wind,
    color: 'info'
  },
  {
    id: '3',
    title: 'Сканирование тела',
    why: 'Снимает мышечные зажимы, которые накапливаются при хроническом стрессе. Учит замечать телесные сигналы.',
    duration: 10,
    tags: ['Стресс', 'Усталость'],
    icon: Heart,
    color: 'danger'
  },
  {
    id: '4',
    title: 'Утренние страницы',
    why: 'Разгружает голову от навязчивых мыслей, помогает прояснить эмоции. Регулярная практика снижает тревожность.',
    duration: 15,
    tags: ['Тревога', 'Грусть'],
    icon: Coffee,
    color: 'warning'
  },
  {
    id: '5',
    title: 'Прогрессивная релаксация',
    why: 'Последовательное напряжение и расслабление мышц учит различать состояния тела и контролировать физическое напряжение.',
    duration: 12,
    tags: ['Стресс', 'Тревога', 'Бессонница'],
    icon: Moon,
    color: 'accent'
  },
  {
    id: '6',
    title: 'Энергетическая растяжка',
    why: 'Мягкие движения улучшают кровообращение, снимают сонливость и апатию. Подходит при упадке сил.',
    duration: 7,
    tags: ['Усталость', 'Грусть'],
    icon: Zap,
    color: 'success'
  },
];

export function RitualsScreens({ viewport }: RitualsScreensProps) {
  const [activeFilter, setActiveFilter] = useState<FilterTag>('Все');

  const filterTags: FilterTag[] = ['Все', 'Тревога', 'Паника', 'Стресс', 'Усталость', 'Грусть', 'Бессонница'];

  const filteredRituals = activeFilter === 'Все' 
    ? rituals 
    : rituals.filter(ritual => ritual.tags.includes(activeFilter));

  return (
    <>
      {/* Screen: Start / Rituals - Catalog */}
      <section>
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-foreground mb-2">
            Start / Rituals — Catalog — {viewport === 'mobile' ? 'Mobile (375px)' : 'Desktop (1440px)'}
          </h2>
          <p className="text-sm text-muted-foreground">
            Каталог мини-ритуалов с фильтрами
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
              <h3 className="font-semibold text-foreground">Ритуалы</h3>
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
                  <a href="#" className="text-sm font-medium text-primary">Ритуалы</a>
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
          <div className={viewport === 'mobile' ? 'p-6 py-8' : 'p-12'}>
            <div className={viewport === 'mobile' ? '' : 'max-w-6xl mx-auto'}>
              {/* Header */}
              <div className={`mb-8 ${viewport === 'mobile' ? 'text-center' : ''}`}>
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-primary" />
                  </div>
                </div>
                <h1 className={`font-bold text-foreground mb-3 ${viewport === 'mobile' ? 'text-2xl' : 'text-3xl'}`}>
                  Библиотека мини-ритуалов
                </h1>
                <p className={`text-muted-foreground ${viewport === 'mobile' ? 'text-sm' : 'text-base max-w-2xl mx-auto'}`}>
                  Короткие практики для работы с эмоциями в моменте. Каждый ритуал — проверенная техника, 
                  которую можно выполнить где угодно за несколько минут.
                </p>
              </div>

              {/* Filters */}
              <div className="mb-8">
                <h4 className="text-sm font-semibold text-foreground mb-4">Фильтр по теме</h4>
                <div className="flex flex-wrap gap-2">
                  {filterTags.map((tag) => (
                    <Button
                      key={tag}
                      size="sm"
                      variant={activeFilter === tag ? 'default' : 'outline'}
                      onClick={() => setActiveFilter(tag)}
                      className="rounded-full"
                    >
                      {tag}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Rituals Grid */}
              {filteredRituals.length > 0 ? (
                <div className={`grid gap-6 ${viewport === 'mobile' ? 'grid-cols-1' : 'grid-cols-2 lg:grid-cols-3'}`}>
                  {filteredRituals.map((ritual) => (
                    <Card key={ritual.id} className="flex flex-col h-full border-2 hover:shadow-lg transition-shadow">
                      <CardContent className="p-6 flex flex-col flex-1">
                        {/* Icon */}
                        <div className={`w-14 h-14 rounded-xl bg-${ritual.color}/10 text-${ritual.color} flex items-center justify-center mb-4`}>
                          <ritual.icon className="w-7 h-7" />
                        </div>

                        {/* Title */}
                        <h3 className="font-semibold text-foreground text-lg mb-3">
                          {ritual.title}
                        </h3>

                        {/* Why - description */}
                        <p className="text-sm text-muted-foreground mb-4 flex-1 line-clamp-3">
                          {ritual.why}
                        </p>

                        {/* Duration badge */}
                        <div className="mb-4">
                          <Badge variant="outline" className="text-xs">
                            ~{ritual.duration} {ritual.duration === 1 ? 'минута' : ritual.duration < 5 ? 'минуты' : 'минут'}
                          </Badge>
                        </div>

                        {/* CTA */}
                        <Button 
                          variant="tertiary" 
                          className="w-full gap-2"
                        >
                          Начать
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                /* Empty State */
                <div className="text-center py-16">
                  <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-6">
                    <Sparkles className="w-10 h-10 text-muted-foreground/50" />
                  </div>
                  <h3 className="font-semibold text-foreground text-xl mb-2">
                    Ритуалов по данной теме пока нет
                  </h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    Попробуйте выбрать другую тему или вернитесь к общему списку
                  </p>
                  <Button 
                    variant="outline"
                    onClick={() => setActiveFilter('Все')}
                  >
                    Показать все ритуалы
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Screen: Start / Rituals - Catalog with Empty State (Паника filter) */}
      <section>
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-foreground mb-2">
            Start / Rituals — Catalog (Empty State) — {viewport === 'mobile' ? 'Mobile (375px)' : 'Desktop (1440px)'}
          </h2>
          <p className="text-sm text-muted-foreground">
            Пустое состояние при фильтре "Паника"
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
              <h3 className="font-semibold text-foreground">Ритуалы</h3>
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
                  <a href="#" className="text-sm font-medium text-primary">Ритуалы</a>
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
          <div className={viewport === 'mobile' ? 'p-6 py-8' : 'p-12'}>
            <div className={viewport === 'mobile' ? '' : 'max-w-6xl mx-auto'}>
              {/* Header */}
              <div className={`mb-8 ${viewport === 'mobile' ? 'text-center' : ''}`}>
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-primary" />
                  </div>
                </div>
                <h1 className={`font-bold text-foreground mb-3 ${viewport === 'mobile' ? 'text-2xl' : 'text-3xl'}`}>
                  Библиотека мини-ритуалов
                </h1>
                <p className={`text-muted-foreground ${viewport === 'mobile' ? 'text-sm' : 'text-base max-w-2xl mx-auto'}`}>
                  Короткие практики для работы с эмоциями в моменте. Каждый ритуал — проверенная техника, 
                  которую можно выполнить где угодно за несколько минут.
                </p>
              </div>

              {/* Filters - Паника selected */}
              <div className="mb-8">
                <h4 className="text-sm font-semibold text-foreground mb-4">Фильтр по теме</h4>
                <div className="flex flex-wrap gap-2">
                  {filterTags.map((tag) => (
                    <Button
                      key={tag}
                      size="sm"
                      variant={tag === 'Паника' ? 'default' : 'outline'}
                      className="rounded-full"
                    >
                      {tag}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Empty State */}
              <div className="text-center py-16">
                <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-6">
                  <Sparkles className="w-10 h-10 text-muted-foreground/50" />
                </div>
                <h3 className="font-semibold text-foreground text-xl mb-2">
                  Ритуалов по данной теме пока нет
                </h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Попробуйте выбрать другую тему или вернитесь к общему списку
                </p>
                <Button variant="outline">
                  Показать все ритуалы
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
