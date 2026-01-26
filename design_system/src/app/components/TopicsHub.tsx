import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  ArrowRight, User, Heart, Brain, Zap, 
  Shield, Users, CloudRain, Flame, Moon,
  Coffee, Sparkles, MessageCircle, AlertCircle
} from 'lucide-react';

interface TopicsHubProps {
  viewport: 'mobile' | 'desktop';
}

interface Topic {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string;
  contentCount?: number;
  popular?: boolean;
}

const topics: Topic[] = [
  {
    id: '1',
    title: 'Тревога и беспокойство',
    description: 'Постоянное напряжение, навязчивые мысли о будущем, физические симптомы тревоги',
    icon: AlertCircle,
    color: 'warning',
    contentCount: 24,
    popular: true
  },
  {
    id: '2',
    title: 'Панические атаки',
    description: 'Внезапный страх, учащённое сердцебиение, нехватка воздуха, страх потерять контроль',
    icon: Zap,
    color: 'danger',
    contentCount: 18,
    popular: true
  },
  {
    id: '3',
    title: 'Депрессия и апатия',
    description: 'Упадок сил, потеря интереса к жизни, постоянная усталость, грусть без причины',
    icon: CloudRain,
    color: 'info',
    contentCount: 32
  },
  {
    id: '4',
    title: 'Стресс и выгорание',
    description: 'Хроническая усталость, невозможность расслабиться, снижение продуктивности',
    icon: Flame,
    color: 'danger',
    contentCount: 28
  },
  {
    id: '5',
    title: 'Бессонница и сон',
    description: 'Трудности с засыпанием, прерывистый сон, ранние пробуждения, дневная сонливость',
    icon: Moon,
    color: 'accent',
    contentCount: 15
  },
  {
    id: '6',
    title: 'Самооценка и уверенность',
    description: 'Сомнения в себе, перфекционизм, синдром самозванца, страх оценки',
    icon: Sparkles,
    color: 'primary',
    contentCount: 21,
    popular: true
  },
  {
    id: '7',
    title: 'Отношения и границы',
    description: 'Конфликты, созависимость, неумение отказывать, токсичные отношения',
    icon: Users,
    color: 'success',
    contentCount: 26
  },
  {
    id: '8',
    title: 'Эмоциональная регуляция',
    description: 'Вспышки гнева, неконтролируемые эмоции, перепады настроения',
    icon: Heart,
    color: 'danger',
    contentCount: 19
  },
  {
    id: '9',
    title: 'Работа с травмой',
    description: 'Последствия травматических событий, флешбэки, триггеры, ПТСР',
    icon: Shield,
    color: 'info',
    contentCount: 22
  },
  {
    id: '10',
    title: 'Прокрастинация',
    description: 'Откладывание важных дел, отсутствие мотивации, паралич от перфекционизма',
    icon: Coffee,
    color: 'warning',
    contentCount: 14
  },
  {
    id: '11',
    title: 'Коммуникация',
    description: 'Сложности в общении, социальная тревога, страх конфликтов',
    icon: MessageCircle,
    color: 'primary',
    contentCount: 17
  },
  {
    id: '12',
    title: 'Смысл и ценности',
    description: 'Поиск жизненных целей, экзистенциальный кризис, переоценка ценностей',
    icon: Brain,
    color: 'accent',
    contentCount: 12
  }
];

export function TopicsHub({ viewport }: TopicsHubProps) {
  return (
    <section>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-foreground mb-2">
          Topics (/s-chem-ya-pomogayu) — Hub — {viewport === 'mobile' ? 'Mobile (375px)' : 'Desktop (1440px)'}
        </h2>
        <p className="text-sm text-muted-foreground">
          Хаб тем для работы с эмоциональным здоровьем
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
            <h3 className="font-semibold text-foreground">С чем я помогаю</h3>
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
        <div className={viewport === 'mobile' ? 'p-6 py-8' : 'p-12'}>
          <div className={viewport === 'mobile' ? '' : 'max-w-6xl mx-auto'}>
            {/* Header */}
            <div className={`mb-10 ${viewport === 'mobile' ? 'text-center' : ''}`}>
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Brain className="w-6 h-6 text-primary" />
                </div>
              </div>
              <h1 className={`font-bold text-foreground mb-3 ${viewport === 'mobile' ? 'text-2xl' : 'text-3xl'}`}>
                С чем я помогаю
              </h1>
              <p className={`text-muted-foreground ${viewport === 'mobile' ? 'text-sm' : 'text-base max-w-3xl mx-auto'}`}>
                Выберите тему, которая откликается вам прямо сейчас. Для каждой есть статьи, 
                упражнения, техники и рекомендации, основанные на доказательных подходах психотерапии.
              </p>
            </div>

            {/* Topics Grid */}
            <div className={`grid gap-4 ${viewport === 'mobile' ? 'grid-cols-1' : 'grid-cols-2 lg:grid-cols-3'}`}>
              {topics.map((topic) => (
                <Card 
                  key={topic.id} 
                  className="border-2 hover:shadow-lg transition-all cursor-pointer group relative overflow-hidden"
                >
                  {/* Popular Badge */}
                  {topic.popular && (
                    <div className="absolute top-3 right-3 z-10">
                      <Badge className="bg-primary text-white text-xs font-semibold">
                        Популярное
                      </Badge>
                    </div>
                  )}

                  <CardContent className="p-5">
                    {/* Icon */}
                    <div className={`w-14 h-14 rounded-xl bg-${topic.color}/10 text-${topic.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <topic.icon className="w-7 h-7" />
                    </div>

                    {/* Title */}
                    <h3 className="font-semibold text-foreground text-lg mb-2 group-hover:text-primary transition-colors">
                      {topic.title}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2 leading-relaxed">
                      {topic.description}
                    </p>

                    {/* Meta */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {topic.contentCount} материалов
                      </span>
                      <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </div>
                  </CardContent>

                  {/* Hover gradient overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-br from-${topic.color}/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none`} />
                </Card>
              ))}
            </div>

            {/* Bottom CTA */}
            <div className="mt-12 text-center">
              <div className={`p-8 rounded-xl border-2 border-dashed border-border bg-muted/20 ${viewport === 'mobile' ? '' : 'max-w-2xl mx-auto'}`}>
                <h3 className="font-semibold text-foreground text-lg mb-2">
                  Не нашли нужную тему?
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Воспользуйтесь интерактивным навигатором — он поможет определить, 
                  что происходит, и предложит подходящие материалы
                </p>
                <Button size="lg" className="gap-2">
                  Запустить навигатор
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
