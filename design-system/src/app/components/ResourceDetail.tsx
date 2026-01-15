import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { 
  ArrowRight, User, Clock, Heart, 
  File, Download, BookmarkPlus, Share2,
  CheckCircle2, Library
} from 'lucide-react';

interface ResourceDetailProps {
  viewport: 'mobile' | 'desktop';
}

export function ResourceDetail({ viewport }: ResourceDetailProps) {
  return (
    <section>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-foreground mb-2">
          Resources (/resources/[slug]) — Detail — {viewport === 'mobile' ? 'Mobile (375px)' : 'Desktop (1440px)'}
        </h2>
        <p className="text-sm text-muted-foreground">
          Страница отдельного ресурса
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
            <h3 className="font-semibold text-foreground">Ресурсы</h3>
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
                <a href="#" className="text-sm font-medium text-primary">Ресурсы</a>
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
          {/* Resource Header */}
          <div className={`border-b border-border ${viewport === 'mobile' ? 'px-6 py-8' : 'px-12 py-12'}`}>
            <div className={viewport === 'mobile' ? '' : 'max-w-4xl mx-auto'}>
              {/* Breadcrumb */}
              <div className="flex items-center gap-2 mb-6 text-sm text-muted-foreground">
                <span className="hover:text-primary cursor-pointer transition-colors">Ресурсы</span>
                <ArrowRight className="w-3.5 h-3.5" />
                <span className="text-foreground font-medium">Гид по техникам осознанного дыхания</span>
              </div>

              {/* Format Icon + Badges */}
              <div className="flex items-center gap-2 mb-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <File className="w-6 h-6" />
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="text-xs">PDF</Badge>
                  <Badge variant="outline" className="text-xs gap-1">
                    <Clock className="w-3 h-3" />
                    15 мин чтения
                  </Badge>
                  <Badge 
                    variant="outline"
                    className="text-xs gap-1 border bg-success/10 text-success border-success/20"
                  >
                    <Heart className="w-3 h-3" />
                    Базовый
                  </Badge>
                </div>
              </div>

              {/* H1 Title */}
              <h1 className={`font-bold text-foreground mb-4 ${viewport === 'mobile' ? 'text-3xl' : 'text-4xl'}`}>
                Гид по техникам осознанного дыхания
              </h1>

              {/* Description */}
              <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                Подробное руководство с пошаговыми инструкциями для 7 дыхательных техник, 
                которые помогают справиться с тревогой и стрессом. Научно обоснованные методы 
                для быстрого успокоения нервной системы.
              </p>

              {/* Actions */}
              <div className={`gap-3 ${viewport === 'mobile' ? 'flex flex-col' : 'flex items-center'}`}>
                <Button size="lg" className={`gap-2 ${viewport === 'mobile' ? 'w-full' : ''}`}>
                  <Download className="w-4 h-4" />
                  Скачать PDF (2.4 МБ)
                </Button>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size={viewport === 'mobile' ? 'default' : 'lg'} className="gap-2">
                    <Share2 className="w-4 h-4" />
                    {viewport === 'desktop' && 'Поделиться'}
                  </Button>
                  <Button variant="outline" size={viewport === 'mobile' ? 'default' : 'lg'} className="gap-2">
                    <BookmarkPlus className="w-4 h-4" />
                    {viewport === 'desktop' && 'Сохранить'}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Resource Content (Prose) */}
          <div className={viewport === 'mobile' ? 'px-6 py-10' : 'px-12 py-16'}>
            <div className={viewport === 'mobile' ? '' : 'max-w-4xl mx-auto'}>
              <div className="prose prose-sm max-w-none">
                {/* Lead paragraph */}
                <p className="text-lg leading-relaxed text-muted-foreground mb-6">
                  Дыхание — это самый доступный инструмент регуляции эмоционального состояния. 
                  В этом гиде вы найдёте семь проверенных техник, которые помогут вам быстро 
                  снизить тревогу, справиться со стрессом и вернуть спокойствие.
                </p>

                {/* Main content */}
                <div className="text-base leading-relaxed text-muted-foreground space-y-6">
                  <h2 className={`font-bold text-foreground mt-10 mb-4 ${viewport === 'mobile' ? 'text-xl' : 'text-2xl'}`}>
                    Почему дыхание так важно
                  </h2>

                  <p>
                    Дыхание — это единственная автономная функция организма, которую мы можем 
                    <strong className="text-foreground font-semibold"> сознательно контролировать</strong>. 
                    Изменяя паттерн дыхания, мы напрямую влияем на активность вегетативной нервной системы.
                  </p>

                  <Card className="border-l-4 border-l-primary bg-primary/5 my-6">
                    <CardContent className="p-5">
                      <p className="text-sm font-semibold text-foreground mb-2">
                        Научный факт:
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Медленное глубокое дыхание активирует парасимпатическую нервную систему, 
                        отвечающую за расслабление и восстановление. Это физиологически снижает 
                        уровень кортизола и адреналина в крови.
                      </p>
                    </CardContent>
                  </Card>

                  <h2 className={`font-bold text-foreground mt-10 mb-4 ${viewport === 'mobile' ? 'text-xl' : 'text-2xl'}`}>
                    7 дыхательных техник
                  </h2>

                  <h3 className="font-semibold text-foreground mt-8 mb-3 text-lg">
                    1. Дыхание 4-7-8 (для быстрого успокоения)
                  </h3>

                  <Card className="border-2 my-4">
                    <CardContent className="p-5">
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-semibold text-foreground mb-2">
                            Как выполнять:
                          </p>
                          <ol className="text-sm space-y-2 ml-5 list-decimal marker:text-primary marker:font-semibold">
                            <li>Вдох через нос на 4 счёта</li>
                            <li>Задержка дыхания на 7 счётов</li>
                            <li>Выдох через рот на 8 счётов</li>
                            <li>Повторить 4 цикла</li>
                          </ol>
                        </div>
                        <div className="pt-2 border-t border-border">
                          <p className="text-xs text-muted-foreground">
                            <strong className="text-foreground">Когда использовать:</strong> Перед сном, 
                            при острой тревоге, для быстрого расслабления
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <h3 className="font-semibold text-foreground mt-8 mb-3 text-lg">
                    2. Квадратное дыхание (для концентрации)
                  </h3>

                  <Card className="border-2 my-4">
                    <CardContent className="p-5">
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-semibold text-foreground mb-2">
                            Как выполнять:
                          </p>
                          <ol className="text-sm space-y-2 ml-5 list-decimal marker:text-primary marker:font-semibold">
                            <li>Вдох на 4 счёта</li>
                            <li>Задержка на 4 счёта</li>
                            <li>Выдох на 4 счёта</li>
                            <li>Задержка на 4 счёта</li>
                            <li>Повторить 5-10 циклов</li>
                          </ol>
                        </div>
                        <div className="pt-2 border-t border-border">
                          <p className="text-xs text-muted-foreground">
                            <strong className="text-foreground">Когда использовать:</strong> Перед важной встречей, 
                            для повышения концентрации, при рассеянном внимании
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <h3 className="font-semibold text-foreground mt-8 mb-3 text-lg">
                    3. Диафрагмальное дыхание (для глубокого расслабления)
                  </h3>

                  <Card className="border-2 my-4">
                    <CardContent className="p-5">
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-semibold text-foreground mb-2">
                            Как выполнять:
                          </p>
                          <ol className="text-sm space-y-2 ml-5 list-decimal marker:text-primary marker:font-semibold">
                            <li>Положите руку на живот</li>
                            <li>Медленно вдохните через нос, наполняя живот (рука поднимается)</li>
                            <li>Медленно выдохните через рот, втягивая живот (рука опускается)</li>
                            <li>Практикуйте 5-10 минут</li>
                          </ol>
                        </div>
                        <div className="pt-2 border-t border-border">
                          <p className="text-xs text-muted-foreground">
                            <strong className="text-foreground">Когда использовать:</strong> Ежедневная практика, 
                            при хроническом стрессе, для общего расслабления
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <h3 className="font-semibold text-foreground mt-8 mb-3 text-lg">
                    4. Дыхание с удлинённым выдохом (для снятия напряжения)
                  </h3>

                  <Card className="border-2 my-4">
                    <CardContent className="p-5">
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-semibold text-foreground mb-2">
                            Как выполнять:
                          </p>
                          <ol className="text-sm space-y-2 ml-5 list-decimal marker:text-primary marker:font-semibold">
                            <li>Вдох через нос на 4 счёта</li>
                            <li>Выдох через нос или рот на 6-8 счётов</li>
                            <li>Выдох должен быть в 1.5-2 раза длиннее вдоха</li>
                            <li>Продолжайте 3-5 минут</li>
                          </ol>
                        </div>
                        <div className="pt-2 border-t border-border">
                          <p className="text-xs text-muted-foreground">
                            <strong className="text-foreground">Когда использовать:</strong> При физическом напряжении, 
                            после стрессовой ситуации, для быстрого успокоения
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <h3 className="font-semibold text-foreground mt-8 mb-3 text-lg">
                    5. Попеременное дыхание через ноздри (для баланса)
                  </h3>

                  <Card className="border-2 my-4">
                    <CardContent className="p-5">
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-semibold text-foreground mb-2">
                            Как выполнять:
                          </p>
                          <ol className="text-sm space-y-2 ml-5 list-decimal marker:text-primary marker:font-semibold">
                            <li>Закройте правую ноздрю пальцем, вдохните через левую</li>
                            <li>Закройте левую ноздрю, выдохните через правую</li>
                            <li>Вдохните через правую (левая закрыта)</li>
                            <li>Закройте правую, выдохните через левую</li>
                            <li>Повторите 5-10 циклов</li>
                          </ol>
                        </div>
                        <div className="pt-2 border-t border-border">
                          <p className="text-xs text-muted-foreground">
                            <strong className="text-foreground">Когда использовать:</strong> Для ясности ума, 
                            при эмоциональном дисбалансе, перед медитацией
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <h3 className="font-semibold text-foreground mt-8 mb-3 text-lg">
                    6. Резонансное дыхание (для оптимальной вариабельности)
                  </h3>

                  <Card className="border-2 my-4">
                    <CardContent className="p-5">
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-semibold text-foreground mb-2">
                            Как выполнять:
                          </p>
                          <ol className="text-sm space-y-2 ml-5 list-decimal marker:text-primary marker:font-semibold">
                            <li>Дышите с частотой 5-6 вдохов в минуту</li>
                            <li>Вдох 5 секунд, выдох 5 секунд</li>
                            <li>Практикуйте минимум 10 минут</li>
                            <li>Можно использовать метроном или приложение</li>
                          </ol>
                        </div>
                        <div className="pt-2 border-t border-border">
                          <p className="text-xs text-muted-foreground">
                            <strong className="text-foreground">Когда использовать:</strong> Ежедневная практика, 
                            для улучшения вариабельности сердечного ритма, при хроническом стрессе
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <h3 className="font-semibold text-foreground mt-8 mb-3 text-lg">
                    7. Физиологический вздох (для моментального облегчения)
                  </h3>

                  <Card className="border-2 my-4">
                    <CardContent className="p-5">
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-semibold text-foreground mb-2">
                            Как выполнять:
                          </p>
                          <ol className="text-sm space-y-2 ml-5 list-decimal marker:text-primary marker:font-semibold">
                            <li>Глубокий вдох через нос</li>
                            <li>Второй короткий довдох через нос (добор воздуха)</li>
                            <li>Долгий медленный выдох через рот</li>
                            <li>Достаточно 1-3 повторений</li>
                          </ol>
                        </div>
                        <div className="pt-2 border-t border-border">
                          <p className="text-xs text-muted-foreground">
                            <strong className="text-foreground">Когда использовать:</strong> При острой тревоге или плаче, 
                            для быстрого восстановления контроля, в экстренных ситуациях
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <h2 className={`font-bold text-foreground mt-10 mb-4 ${viewport === 'mobile' ? 'text-xl' : 'text-2xl'}`}>
                    Рекомендации по практике
                  </h2>

                  <Card className="border-l-4 border-l-success bg-success/5 my-6">
                    <CardContent className="p-5">
                      <ul className="text-sm space-y-2">
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                          <span><strong className="text-foreground">Регулярность:</strong> Лучше 5 минут ежедневно, чем 30 минут раз в неделю</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                          <span><strong className="text-foreground">Комфорт:</strong> Не должно быть головокружения или дискомфорта</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                          <span><strong className="text-foreground">Постепенность:</strong> Начните с 2-3 минут и увеличивайте время</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                          <span><strong className="text-foreground">Гибкость:</strong> Экспериментируйте и найдите технику, которая работает для вас</span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>

                  <h2 className={`font-bold text-foreground mt-10 mb-4 ${viewport === 'mobile' ? 'text-xl' : 'text-2xl'}`}>
                    Как выбрать подходящую технику
                  </h2>

                  <p>
                    Разные техники подходят для разных ситуаций и целей:
                  </p>

                  <ul className="space-y-2 ml-6 list-disc marker:text-primary">
                    <li><strong className="text-foreground">Острая тревога:</strong> 4-7-8, Физиологический вздох</li>
                    <li><strong className="text-foreground">Подготовка к важному событию:</strong> Квадратное дыхание</li>
                    <li><strong className="text-foreground">Общее расслабление:</strong> Диафрагмальное, Резонансное</li>
                    <li><strong className="text-foreground">Эмоциональный баланс:</strong> Попеременное через ноздри</li>
                    <li><strong className="text-foreground">После стресса:</strong> Удлинённый выдох</li>
                  </ul>

                  <p className="mt-8">
                    Все эти техники безопасны для большинства людей, но если у вас есть респираторные 
                    заболевания или сердечно-сосудистые проблемы, проконсультируйтесь с врачом перед началом практики.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="border-t border-border bg-gradient-to-br from-primary/5 to-accent/5">
            <div className={viewport === 'mobile' ? 'px-6 py-12' : 'px-12 py-16'}>
              <div className={`text-center ${viewport === 'mobile' ? '' : 'max-w-3xl mx-auto'}`}>
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  <Library className="w-8 h-8 text-primary" />
                </div>
                
                <h2 className={`font-bold text-foreground mb-4 ${viewport === 'mobile' ? 'text-2xl' : 'text-3xl'}`}>
                  Больше практических материалов
                </h2>
                
                <p className={`text-muted-foreground mb-8 leading-relaxed ${viewport === 'mobile' ? 'text-base' : 'text-lg'}`}>
                  В нашей библиотеке вы найдёте ещё десятки проверенных ресурсов: видео-практики, 
                  аудио-медитации, статьи и PDF-гиды для работы с эмоциями.
                </p>

                <div className={`space-y-3 ${viewport === 'mobile' ? '' : 'flex gap-4 justify-center space-y-0'}`}>
                  <Button size="lg" className={`gap-2 ${viewport === 'mobile' ? 'w-full' : ''}`}>
                    <Library className="w-5 h-5" />
                    Все ресурсы
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg"
                    className={`gap-2 ${viewport === 'mobile' ? 'w-full' : ''}`}
                  >
                    <ArrowRight className="w-5 h-5" />
                    Начать практику
                  </Button>
                </div>

                <p className="text-sm text-muted-foreground mt-6">
                  Научно обоснованные методы • Бесплатный доступ • Проверено экспертами
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
