import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { 
  ArrowRight, User, Calendar, Clock, 
  Share2, BookmarkPlus, Heart, Play
} from 'lucide-react';

interface BlogArticleProps {
  viewport: 'mobile' | 'desktop';
}

export function BlogArticle({ viewport }: BlogArticleProps) {
  return (
    <section>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-foreground mb-2">
          Blog (/blog/[slug]) — Article — {viewport === 'mobile' ? 'Mobile (375px)' : 'Desktop (1440px)'}
        </h2>
        <p className="text-sm text-muted-foreground">
          Страница отдельной статьи блога
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
        <div className={viewport === 'mobile' ? '' : ''}>
          {/* Article Header */}
          <div className={`border-b border-border ${viewport === 'mobile' ? 'px-6 py-8' : 'px-12 py-12'}`}>
            <div className={viewport === 'mobile' ? '' : 'max-w-4xl mx-auto'}>
              {/* Breadcrumb */}
              <div className="flex items-center gap-2 mb-6 text-sm text-muted-foreground">
                <span className="hover:text-primary cursor-pointer transition-colors">Блог</span>
                <ArrowRight className="w-3.5 h-3.5" />
                <span className="text-foreground font-medium">Как отличить тревогу от тревожного расстройства</span>
              </div>

              {/* Category Badge */}
              <div className="mb-4">
                <Badge className="bg-primary text-white">Тревога</Badge>
              </div>

              {/* H1 Title */}
              <h1 className={`font-bold text-foreground mb-6 ${viewport === 'mobile' ? 'text-3xl' : 'text-4xl'}`}>
                Как отличить тревогу от тревожного расстройства
              </h1>

              {/* Meta Info */}
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>12 января 2026</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>8 мин чтения</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" className="gap-2">
                  <Share2 className="w-4 h-4" />
                  {viewport === 'desktop' && 'Поделиться'}
                </Button>
                <Button variant="outline" size="sm" className="gap-2">
                  <BookmarkPlus className="w-4 h-4" />
                  {viewport === 'desktop' && 'Сохранить'}
                </Button>
              </div>
            </div>
          </div>

          {/* Article Content (Prose) */}
          <div className={viewport === 'mobile' ? 'px-6 py-10' : 'px-12 py-16'}>
            <div className={viewport === 'mobile' ? '' : 'max-w-4xl mx-auto'}>
              <div className="prose prose-sm max-w-none">
                {/* Lead paragraph */}
                <p className="text-lg leading-relaxed text-muted-foreground mb-6">
                  Тревога — это нормальная эмоция, которая помогает нам справляться с потенциальными угрозами. 
                  Но когда она становится хронической и мешает повседневной жизни, это может быть признаком 
                  тревожного расстройства. В этой статье разберёмся, где проходит эта граница.
                </p>

                {/* Main content */}
                <div className="text-base leading-relaxed text-muted-foreground space-y-6">
                  <h2 className={`font-bold text-foreground mt-10 mb-4 ${viewport === 'mobile' ? 'text-xl' : 'text-2xl'}`}>
                    Что такое нормальная тревога
                  </h2>

                  <p>
                    <strong className="text-foreground font-semibold">Нормальная тревога</strong> — это адаптивная 
                    реакция на реальную угрозу или вызов. Она помогает нам мобилизовать ресурсы, 
                    сконцентрироваться и справиться с задачей.
                  </p>

                  <p>
                    Примеры нормальной тревоги:
                  </p>

                  <ul className="space-y-2 ml-6 list-disc marker:text-primary">
                    <li>Волнение перед важной презентацией или экзаменом</li>
                    <li>Беспокойство о здоровье близкого человека</li>
                    <li>Опасения перед сложным разговором</li>
                    <li>Напряжение при принятии важного решения</li>
                  </ul>

                  <p>
                    Ключевые характеристики нормальной тревоги:
                  </p>

                  <Card className="border-l-4 border-l-success bg-success/5 my-6">
                    <CardContent className="p-5">
                      <ul className="space-y-2 text-sm">
                        <li>✓ Пропорциональна ситуации</li>
                        <li>✓ Проходит после разрешения ситуации</li>
                        <li>✓ Не мешает функционированию</li>
                        <li>✓ Может даже повысить продуктивность</li>
                      </ul>
                    </CardContent>
                  </Card>

                  <h2 className={`font-bold text-foreground mt-10 mb-4 ${viewport === 'mobile' ? 'text-xl' : 'text-2xl'}`}>
                    Когда тревога становится расстройством
                  </h2>

                  <p>
                    <strong className="text-foreground font-semibold">Тревожное расстройство</strong> — это состояние, 
                    при котором тревога становится хронической, чрезмерной и непропорциональной реальной угрозе. 
                    Она начинает существенно влиять на качество жизни.
                  </p>

                  <h3 className="font-semibold text-foreground mt-8 mb-3 text-lg">
                    Основные признаки тревожного расстройства:
                  </h3>

                  <Card className="border-l-4 border-l-warning bg-warning/5 my-6">
                    <CardContent className="p-5">
                      <div className="space-y-4 text-sm">
                        <div>
                          <h4 className="font-semibold text-foreground mb-2">1. Чрезмерность</h4>
                          <p className="text-muted-foreground">
                            Реакция непропорциональна реальной угрозе. Например, паническая атака из-за 
                            необходимости позвонить по телефону.
                          </p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground mb-2">2. Хроничность</h4>
                          <p className="text-muted-foreground">
                            Тревога присутствует большую часть времени на протяжении как минимум 6 месяцев.
                          </p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground mb-2">3. Нарушение функционирования</h4>
                          <p className="text-muted-foreground">
                            Тревога мешает работе, учёбе, отношениям, повседневным делам.
                          </p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground mb-2">4. Избегающее поведение</h4>
                          <p className="text-muted-foreground">
                            Постоянное избегание ситуаций, людей, мест из-за тревоги, что сужает жизнь.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <h2 className={`font-bold text-foreground mt-10 mb-4 ${viewport === 'mobile' ? 'text-xl' : 'text-2xl'}`}>
                    Типы тревожных расстройств
                  </h2>

                  <p>
                    Тревожные расстройства включают несколько диагнозов с разными проявлениями:
                  </p>

                  <div className="space-y-4 my-6">
                    <Card className="border-2">
                      <CardContent className="p-5">
                        <h4 className="font-semibold text-foreground mb-2">
                          Генерализованное тревожное расстройство (ГТР)
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Постоянное беспокойство о множестве вещей (работа, здоровье, финансы) без конкретной причины.
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="border-2">
                      <CardContent className="p-5">
                        <h4 className="font-semibold text-foreground mb-2">
                          Паническое расстройство
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Повторяющиеся панические атаки и постоянный страх их повторения.
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="border-2">
                      <CardContent className="p-5">
                        <h4 className="font-semibold text-foreground mb-2">
                          Социальное тревожное расстройство
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Интенсивный страх социальных ситуаций и оценки окружающих.
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="border-2">
                      <CardContent className="p-5">
                        <h4 className="font-semibold text-foreground mb-2">
                          Специфические фобии
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Иррациональный страх конкретных объектов или ситуаций (высота, полёты, пауки).
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  <h2 className={`font-bold text-foreground mt-10 mb-4 ${viewport === 'mobile' ? 'text-xl' : 'text-2xl'}`}>
                    Когда стоит обратиться за помощью
                  </h2>

                  <p>
                    Обратитесь к специалисту, если замечаете у себя:
                  </p>

                  <ul className="space-y-2 ml-6 list-disc marker:text-primary">
                    <li>Тревога присутствует большую часть дней на протяжении нескольких месяцев</li>
                    <li>Вы избегаете важных ситуаций или отношений из-за тревоги</li>
                    <li>Тревога мешает работе, учёбе или личной жизни</li>
                    <li>Вы используете алкоголь или другие вещества, чтобы справиться с тревогой</li>
                    <li>У вас появились панические атаки</li>
                    <li>Вы чувствуете безнадёжность или думаете о самоповреждении</li>
                  </ul>

                  <Card className="border-l-4 border-l-primary bg-primary/5 my-8">
                    <CardContent className="p-5">
                      <p className="text-sm font-semibold text-foreground mb-2">
                        Важно помнить:
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Тревожные расстройства хорошо поддаются лечению. Когнитивно-поведенческая терапия (КПТ) 
                        показывает высокую эффективность, особенно в сочетании с практиками осознанности и, 
                        при необходимости, медикаментозной поддержкой.
                      </p>
                    </CardContent>
                  </Card>

                  <h2 className={`font-bold text-foreground mt-10 mb-4 ${viewport === 'mobile' ? 'text-xl' : 'text-2xl'}`}>
                    Что делать прямо сейчас
                  </h2>

                  <p>
                    Если вы узнали себя в описании тревожного расстройства:
                  </p>

                  <ol className="space-y-3 ml-6 list-decimal marker:text-primary marker:font-semibold">
                    <li>
                      <strong className="text-foreground">Пройдите диагностику</strong> — используйте интерактивный 
                      навигатор тревоги для первичной оценки
                    </li>
                    <li>
                      <strong className="text-foreground">Изучите техники самопомощи</strong> — дыхательные упражнения, 
                      заземление, когнитивная реструктуризация
                    </li>
                    <li>
                      <strong className="text-foreground">Обратитесь к специалисту</strong> — запишитесь на консультацию 
                      для профессиональной оценки и плана лечения
                    </li>
                  </ol>

                  <p className="mt-8">
                    Помните: обращение за помощью — это признак силы, а не слабости. Тревожные расстройства — 
                    это медицинское состояние, которое требует внимания и лечения, как и любое другое.
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
                  <Heart className="w-8 h-8 text-primary" />
                </div>
                
                <h2 className={`font-bold text-foreground mb-4 ${viewport === 'mobile' ? 'text-2xl' : 'text-3xl'}`}>
                  Готовы разобраться со своей тревогой?
                </h2>
                
                <p className={`text-muted-foreground mb-8 leading-relaxed ${viewport === 'mobile' ? 'text-base' : 'text-lg'}`}>
                  Пройдите интерактивную диагностику, чтобы понять, с каким типом тревоги вы сталкиваетесь, 
                  и получите персонализированные рекомендации.
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
                    <ArrowRight className="w-5 h-5" />
                    Все статьи о тревоге
                  </Button>
                </div>

                <p className="text-sm text-muted-foreground mt-6">
                  Научный подход • Бесплатно • Конфиденциально
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
