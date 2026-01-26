import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { 
  ArrowRight, User, Calendar, Clock, 
  BookOpen, FileText
} from 'lucide-react';

interface BlogListProps {
  viewport: 'mobile' | 'desktop';
  hasArticles?: boolean;
}

interface Article {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  timeToBenefit: string;
  category: string;
}

const articles: Article[] = [
  {
    id: '1',
    title: 'Как отличить тревогу от тревожного расстройства',
    excerpt: 'Тревога — нормальная эмоция, которая помогает нам справляться с потенциальными угрозами. Но когда она становится хронической и мешает повседневной жизни, это может быть признаком тревожного расстройства.',
    date: '12 января 2026',
    timeToBenefit: '8 мин чтения',
    category: 'Тревога'
  },
  {
    id: '2',
    title: 'Физиология стресса: что происходит в организме',
    excerpt: 'Когда мы испытываем стресс, в организме запускается каскад физиологических реакций. Понимание этих механизмов помогает лучше управлять своим состоянием и выбирать эффективные стратегии.',
    date: '10 января 2026',
    timeToBenefit: '10 мин чтения',
    category: 'Стресс'
  },
  {
    id: '3',
    title: 'Техники заземления при панических атаках',
    excerpt: 'Паническая атака — это внезапный приступ интенсивного страха. В этой статье разбираем проверенные техники, которые помогают вернуть контроль в моменты острой паники.',
    date: '8 января 2026',
    timeToBenefit: '6 мин чтения',
    category: 'Панические атаки'
  },
  {
    id: '4',
    title: 'Когнитивные искажения: как мысли влияют на эмоции',
    excerpt: 'Наш мозг склонен к определённым паттернам мышления, которые искажают реальность. Узнайте о самых распространённых когнитивных искажениях и способах с ними работать.',
    date: '5 января 2026',
    timeToBenefit: '12 мин чтения',
    category: 'КПТ'
  },
  {
    id: '5',
    title: 'Границы в отношениях: как научиться говорить "нет"',
    excerpt: 'Установка здоровых границ — ключевой навык для эмоционального благополучия. Разбираемся, почему так сложно отказывать и как это делать экологично.',
    date: '3 января 2026',
    timeToBenefit: '9 мин чтения',
    category: 'Отношения'
  },
  {
    id: '6',
    title: 'Работа с прокрастинацией через самосострадание',
    excerpt: 'Прокрастинация часто связана с перфекционизмом и страхом неудачи. Подход через самосострадание помогает разорвать этот цикл и вернуть продуктивность.',
    date: '1 января 2026',
    timeToBenefit: '7 мин чтения',
    category: 'Прокрастинация'
  }
];

export function BlogList({ viewport, hasArticles = true }: BlogListProps) {
  return (
    <section>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-foreground mb-2">
          Blog (/blog) — List — {viewport === 'mobile' ? 'Mobile (375px)' : 'Desktop (1440px)'}
        </h2>
        <p className="text-sm text-muted-foreground">
          Список статей блога {hasArticles ? '(с контентом)' : '(empty state)'}
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
            <h3 className="font-semibold text-foreground">Блог</h3>
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
                <a href="#" className="text-sm font-medium text-primary">Блог</a>
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
          <div className={viewport === 'mobile' ? '' : 'max-w-5xl mx-auto'}>
            {/* Header */}
            <div className={`mb-10 ${viewport === 'mobile' ? '' : 'text-center'}`}>
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-primary" />
                </div>
              </div>
              <h1 className={`font-bold text-foreground mb-3 ${viewport === 'mobile' ? 'text-2xl' : 'text-3xl'}`}>
                Блог
              </h1>
              <p className={`text-muted-foreground ${viewport === 'mobile' ? 'text-sm' : 'text-base max-w-2xl mx-auto'}`}>
                Статьи о ментальном здоровье, психологии и практиках работы с эмоциями. 
                Все материалы основаны на доказательных подходах и написаны понятным языком.
              </p>
            </div>

            {/* Articles List or Empty State */}
            {hasArticles ? (
              <div className="space-y-4">
                {articles.map((article) => (
                  <Card 
                    key={article.id}
                    className="border-2 hover:shadow-lg transition-all cursor-pointer group"
                  >
                    <CardContent className={viewport === 'mobile' ? 'p-5' : 'p-6'}>
                      <div className={viewport === 'mobile' ? '' : 'flex gap-6 items-start'}>
                        {/* Icon (Desktop only) */}
                        {viewport === 'desktop' && (
                          <div className="w-16 h-16 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                            <FileText className="w-8 h-8" />
                          </div>
                        )}

                        {/* Content */}
                        <div className="flex-1">
                          {/* Category Badge */}
                          <div className="mb-3">
                            <Badge variant="secondary" className="text-xs">
                              {article.category}
                            </Badge>
                          </div>

                          {/* Title */}
                          <h3 className={`font-semibold text-foreground mb-3 group-hover:text-primary transition-colors ${
                            viewport === 'mobile' ? 'text-lg' : 'text-xl'
                          }`}>
                            {article.title}
                          </h3>

                          {/* Excerpt */}
                          <p className="text-sm text-muted-foreground mb-4 leading-relaxed line-clamp-2">
                            {article.excerpt}
                          </p>

                          {/* Meta */}
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5" />
                              <span>{article.date}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5" />
                              <span>{article.timeToBenefit}</span>
                            </div>
                          </div>
                        </div>

                        {/* Arrow (Desktop only) */}
                        {viewport === 'desktop' && (
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 rounded-full bg-muted group-hover:bg-primary/10 flex items-center justify-center transition-colors">
                              <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              /* Empty State */
              <div className="py-16">
                <Card className="border-2 border-dashed bg-muted/20">
                  <CardContent className={`text-center ${viewport === 'mobile' ? 'p-8' : 'p-12'}`}>
                    <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
                      <BookOpen className="w-10 h-10 text-muted-foreground" />
                    </div>
                    
                    <h3 className={`font-semibold text-foreground mb-3 ${viewport === 'mobile' ? 'text-lg' : 'text-xl'}`}>
                      Статьи пока не опубликованы
                    </h3>
                    
                    <p className={`text-muted-foreground mb-6 ${viewport === 'mobile' ? 'text-sm' : 'text-base max-w-md mx-auto'}`}>
                      Мы работаем над созданием полезных материалов о ментальном здоровье. 
                      Подпишитесь на обновления, чтобы не пропустить первые публикации.
                    </p>

                    <div className={`space-y-3 ${viewport === 'mobile' ? '' : 'flex gap-3 justify-center space-y-0'}`}>
                      <Button size="lg" className={`gap-2 ${viewport === 'mobile' ? 'w-full' : ''}`}>
                        Подписаться на обновления
                      </Button>
                      <Button 
                        variant="outline" 
                        size="lg"
                        className={`gap-2 ${viewport === 'mobile' ? 'w-full' : ''}`}
                      >
                        <ArrowRight className="w-4 h-4" />
                        Перейти к интерактивам
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
