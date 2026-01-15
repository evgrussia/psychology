import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { 
  ArrowRight, User, Sparkles, Heart,
  Brain, Shield, Clock, Target
} from 'lucide-react';

interface CuratedListProps {
  viewport: 'mobile' | 'desktop';
  hasCollections?: boolean;
}

interface Collection {
  id: string;
  title: string;
  type: 'pathway' | 'course' | 'toolkit' | 'challenge';
  itemsCount: number;
  duration?: string;
}

const collections: Collection[] = [
  {
    id: '1',
    title: 'Путь от тревоги к спокойствию',
    type: 'pathway',
    itemsCount: 12,
    duration: '4 недели'
  },
  {
    id: '2',
    title: 'Основы когнитивно-поведенческой терапии',
    type: 'course',
    itemsCount: 8,
    duration: '2 недели'
  },
  {
    id: '3',
    title: 'Набор инструментов для работы со стрессом',
    type: 'toolkit',
    itemsCount: 15,
    duration: 'В своём темпе'
  },
  {
    id: '4',
    title: '21 день практики осознанности',
    type: 'challenge',
    itemsCount: 21,
    duration: '3 недели'
  },
  {
    id: '5',
    title: 'Преодоление социальной тревоги',
    type: 'pathway',
    itemsCount: 10,
    duration: '3 недели'
  },
  {
    id: '6',
    title: 'Управление эмоциями: полный курс',
    type: 'course',
    itemsCount: 16,
    duration: '6 недель'
  },
  {
    id: '7',
    title: 'Инструменты для борьбы с паникой',
    type: 'toolkit',
    itemsCount: 9,
    duration: 'В своём темпе'
  },
  {
    id: '8',
    title: '30 дней самосострадания',
    type: 'challenge',
    itemsCount: 30,
    duration: '1 месяц'
  },
  {
    id: '9',
    title: 'От избегания к принятию',
    type: 'pathway',
    itemsCount: 14,
    duration: '5 недель'
  }
];

const typeConfig = {
  pathway: {
    label: 'Путь',
    icon: Target,
    color: 'bg-primary/10 text-primary border-primary/20'
  },
  course: {
    label: 'Курс',
    icon: Brain,
    color: 'bg-accent/10 text-accent border-accent/20'
  },
  toolkit: {
    label: 'Набор инструментов',
    icon: Shield,
    color: 'bg-warning/10 text-warning border-warning/20'
  },
  challenge: {
    label: 'Челлендж',
    icon: Sparkles,
    color: 'bg-success/10 text-success border-success/20'
  }
};

export function CuratedList({ viewport, hasCollections = true }: CuratedListProps) {
  return (
    <section>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-foreground mb-2">
          Curated (/curated) — List — {viewport === 'mobile' ? 'Mobile (375px)' : 'Desktop (1440px)'}
        </h2>
        <p className="text-sm text-muted-foreground">
          Список подборок {hasCollections ? '(с контентом)' : '(empty state)'}
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
            <h3 className="font-semibold text-foreground">Подборки</h3>
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
                <a href="#" className="text-sm font-medium text-primary">Подборки</a>
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
            <div className={`mb-10 ${viewport === 'mobile' ? '' : 'text-center'}`}>
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-primary" />
                </div>
              </div>
              <h1 className={`font-bold text-foreground mb-3 ${viewport === 'mobile' ? 'text-2xl' : 'text-3xl'}`}>
                Кураторские подборки
              </h1>
              <p className={`text-muted-foreground ${viewport === 'mobile' ? 'text-sm' : 'text-base max-w-2xl mx-auto'}`}>
                Структурированные программы, курсы и наборы инструментов для системной работы 
                с эмоциональным балансом. Каждая подборка — это продуманный путь к конкретной цели.
              </p>
            </div>

            {/* Collections Grid or Empty State */}
            {hasCollections ? (
              <div className={`grid gap-4 ${viewport === 'mobile' ? 'grid-cols-1' : 'grid-cols-2 lg:grid-cols-3'}`}>
                {collections.map((collection) => {
                  const config = typeConfig[collection.type];
                  const TypeIcon = config.icon;
                  
                  return (
                    <Card 
                      key={collection.id}
                      className="border-2 hover:shadow-lg transition-all cursor-pointer group relative overflow-hidden"
                    >
                      {/* Gradient background */}
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      
                      <CardContent className="p-6 relative">
                        {/* Type Badge */}
                        <Badge 
                          variant="outline"
                          className={`mb-4 gap-1.5 ${config.color}`}
                        >
                          <TypeIcon className="w-3.5 h-3.5" />
                          {config.label}
                        </Badge>

                        {/* Title */}
                        <h3 className="font-semibold text-foreground text-base mb-4 leading-snug group-hover:text-primary transition-colors min-h-[3rem]">
                          {collection.title}
                        </h3>

                        {/* Meta Info */}
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                          <span className="flex items-center gap-1">
                            <Heart className="w-3.5 h-3.5" />
                            {collection.itemsCount} {collection.itemsCount === 1 ? 'элемент' : collection.itemsCount < 5 ? 'элемента' : 'элементов'}
                          </span>
                          {collection.duration && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              {collection.duration}
                            </span>
                          )}
                        </div>

                        {/* Micro-CTA */}
                        <div className="flex items-center gap-1.5 text-sm font-medium text-primary group-hover:gap-2.5 transition-all">
                          <span>Начать просмотр</span>
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              /* Empty State */
              <div className="py-16">
                <Card className="border-2 border-dashed bg-muted/20">
                  <CardContent className={`text-center ${viewport === 'mobile' ? 'p-8' : 'p-12'}`}>
                    <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
                      <Sparkles className="w-10 h-10 text-muted-foreground" />
                    </div>
                    
                    <h3 className={`font-semibold text-foreground mb-3 ${viewport === 'mobile' ? 'text-lg' : 'text-xl'}`}>
                      Подборки пока готовятся
                    </h3>
                    
                    <p className={`text-muted-foreground mb-6 ${viewport === 'mobile' ? 'text-sm' : 'text-base max-w-md mx-auto'}`}>
                      Мы создаём структурированные программы и курсы для системной работы 
                      с эмоциональным балансом. Скоро здесь появятся готовые пути к вашим целям.
                    </p>

                    <div className={`space-y-3 ${viewport === 'mobile' ? '' : 'flex gap-3 justify-center space-y-0'}`}>
                      <Button size="lg" className={`gap-2 ${viewport === 'mobile' ? 'w-full' : ''}`}>
                        Узнать о запуске
                      </Button>
                      <Button 
                        variant="outline" 
                        size="lg"
                        className={`gap-2 ${viewport === 'mobile' ? 'w-full' : ''}`}
                      >
                        <ArrowRight className="w-4 h-4" />
                        Изучить доступные материалы
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
