import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { 
  ArrowRight, User, Home, Sparkles, BookOpen, 
  Calendar, Info, Search
} from 'lucide-react';

interface NotFoundPageProps {
  viewport: 'mobile' | 'desktop';
}

export function NotFoundPage({ viewport }: NotFoundPageProps) {
  return (
    <section>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-foreground mb-2">
          Not Found (/404) — Default — {viewport === 'mobile' ? 'Mobile (375px)' : 'Desktop (1440px)'}
        </h2>
        <p className="text-sm text-muted-foreground">
          Страница не найдена с навигационными подсказками
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
            <h3 className="font-semibold text-foreground">Страница не найдена</h3>
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
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Материалы</a>
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
        <div className={viewport === 'mobile' ? 'p-6 py-16' : 'p-12 py-24'}>
          <div className={viewport === 'mobile' ? '' : 'max-w-3xl mx-auto'}>
            {/* 404 Large Number */}
            <div className="text-center mb-8">
              <div className={`font-bold text-primary/20 select-none ${
                viewport === 'mobile' ? 'text-8xl' : 'text-9xl'
              }`}>
                404
              </div>
            </div>

            {/* Header */}
            <div className="text-center mb-12">
              <h1 className={`font-bold text-foreground mb-3 ${
                viewport === 'mobile' ? 'text-2xl' : 'text-3xl'
              }`}>
                Страница не найдена
              </h1>
              <p className={`text-muted-foreground leading-relaxed ${
                viewport === 'mobile' ? 'text-sm' : 'text-base'
              }`}>
                Кажется, вы перешли по несуществующей ссылке или страница была удалена. 
                Не переживайте — мы поможем найти нужный раздел.
              </p>
            </div>

            {/* Navigation Panel */}
            <Card className="border-2 mb-8">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-5">
                  <Search className="w-5 h-5 text-primary" />
                  <h2 className={`font-semibold text-foreground ${
                    viewport === 'mobile' ? 'text-base' : 'text-lg'
                  }`}>
                    С чего начать?
                  </h2>
                </div>

                {/* Navigation Tiles Grid */}
                <div className={`grid gap-3 ${
                  viewport === 'mobile' ? 'grid-cols-1' : 'grid-cols-2'
                }`}>
                  {/* Tile 1: Start / Navigator */}
                  <button className="group text-left">
                    <Card className="border-2 transition-all hover:border-primary hover:bg-primary/5">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                            <Sparkles className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-foreground text-sm mb-1 group-hover:text-primary transition-colors">
                              Интерактивный навигатор
                            </h3>
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              Подберите практики под вашу ситуацию
                            </p>
                          </div>
                          <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                        </div>
                      </CardContent>
                    </Card>
                  </button>

                  {/* Tile 2: Blog / Materials */}
                  <button className="group text-left">
                    <Card className="border-2 transition-all hover:border-primary hover:bg-primary/5">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                            <BookOpen className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-foreground text-sm mb-1 group-hover:text-primary transition-colors">
                              Материалы и статьи
                            </h3>
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              Образовательный контент о методах
                            </p>
                          </div>
                          <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                        </div>
                      </CardContent>
                    </Card>
                  </button>

                  {/* Tile 3: Services / Specialists */}
                  <button className="group text-left">
                    <Card className="border-2 transition-all hover:border-primary hover:bg-primary/5">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                            <Calendar className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-foreground text-sm mb-1 group-hover:text-primary transition-colors">
                              Подбор специалиста
                            </h3>
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              База проверенных психологов
                            </p>
                          </div>
                          <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                        </div>
                      </CardContent>
                    </Card>
                  </button>

                  {/* Tile 4: About */}
                  <button className="group text-left">
                    <Card className="border-2 transition-all hover:border-primary hover:bg-primary/5">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                            <Info className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-foreground text-sm mb-1 group-hover:text-primary transition-colors">
                              О проекте
                            </h3>
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              Миссия, принципы и научная основа
                            </p>
                          </div>
                          <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                        </div>
                      </CardContent>
                    </Card>
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Main CTA */}
            <div className="text-center">
              <Button 
                size="lg" 
                className={`gap-2 ${viewport === 'mobile' ? 'w-full' : 'min-w-[280px]'}`}
              >
                <Home className="w-5 h-5" />
                На главную
              </Button>
            </div>

            {/* Additional Help */}
            <div className="mt-10 text-center">
              <p className="text-sm text-muted-foreground mb-3">
                Если проблема повторяется, сообщите нам об этом
              </p>
              <Button variant="ghost" size="sm">
                Сообщить о проблеме
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
