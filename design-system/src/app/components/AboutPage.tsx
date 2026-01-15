import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { 
  ArrowRight, User, Heart, Shield, Lock, 
  Eye, Users, BookOpen, Sparkles
} from 'lucide-react';

interface AboutPageProps {
  viewport: 'mobile' | 'desktop';
}

export function AboutPage({ viewport }: AboutPageProps) {
  return (
    <section>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-foreground mb-2">
          About (/about) — Content — {viewport === 'mobile' ? 'Mobile (375px)' : 'Desktop (1440px)'}
        </h2>
        <p className="text-sm text-muted-foreground">
          О проекте с принципами и этикой
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
            <h3 className="font-semibold text-foreground">О проекте</h3>
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
                <a href="#" className="text-sm font-medium text-primary">О проекте</a>
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
        <div className={viewport === 'mobile' ? 'p-6 py-8' : 'p-12 py-16'}>
          <div className={viewport === 'mobile' ? '' : 'max-w-4xl mx-auto'}>
            {/* Header */}
            <div className={`mb-10 ${viewport === 'mobile' ? '' : 'text-center'}`}>
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Heart className="w-6 h-6 text-primary" />
                </div>
              </div>
              <h1 className={`font-bold text-foreground mb-3 ${viewport === 'mobile' ? 'text-2xl' : 'text-3xl'}`}>
                О проекте «Эмоциональный баланс»
              </h1>
              <p className={`text-muted-foreground leading-relaxed ${viewport === 'mobile' ? 'text-sm' : 'text-base max-w-2xl mx-auto'}`}>
                Научно обоснованные инструменты для поддержки эмоционального здоровья, 
                основанные на методах когнитивно-поведенческой терапии и практиках осознанности.
              </p>
            </div>

            {/* Prose Content */}
            <div className="prose prose-sm max-w-none">
              <div className="text-base leading-relaxed text-muted-foreground space-y-6">
                <h2 className={`font-bold text-foreground mt-0 mb-4 ${viewport === 'mobile' ? 'text-xl' : 'text-2xl'}`}>
                  Миссия проекта
                </h2>

                <p>
                  «Эмоциональный баланс» создан для того, чтобы сделать проверенные 
                  психологические методы доступными каждому. Мы верим, что забота о ментальном 
                  здоровье должна быть такой же естественной, как забота о физическом здоровье — 
                  регулярной, понятной и не требующей героических усилий.
                </p>

                <p>
                  Наша цель — <strong className="text-foreground font-semibold">помочь вам развить 
                  навыки эмоциональной регуляции</strong>, которые вы сможете использовать 
                  в повседневной жизни. Это не о том, чтобы избавиться от всех негативных эмоций 
                  (это невозможно и не нужно), а о том, чтобы научиться с ними работать.
                </p>

                <h2 className={`font-bold text-foreground mt-10 mb-4 ${viewport === 'mobile' ? 'text-xl' : 'text-2xl'}`}>
                  Для кого этот проект
                </h2>

                <p>
                  Этот проект будет полезен, если вы:
                </p>

                <ul className="space-y-2 ml-6 list-disc marker:text-primary">
                  <li>Хотите лучше понимать свои эмоции и реакции</li>
                  <li>Ищете способы справляться со стрессом и тревогой</li>
                  <li>Интересуетесь научно обоснованными методами саморазвития</li>
                  <li>Проходите психотерапию и хотите дополнить её самостоятельной практикой</li>
                  <li>Просто хотите развить более здоровое отношение к своим эмоциям</li>
                </ul>

                <Card className="border-l-4 border-l-primary bg-primary/5 my-6">
                  <CardContent className="p-5">
                    <p className="text-sm font-semibold text-foreground mb-2">
                      Важно понимать:
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Этот проект <strong className="text-foreground">не заменяет профессиональную 
                      психологическую помощь</strong>. Если вы испытываете серьёзные эмоциональные 
                      трудности, депрессию или мысли о самоповреждении, пожалуйста, обратитесь 
                      к квалифицированному специалисту.
                    </p>
                  </CardContent>
                </Card>

                <h2 className={`font-bold text-foreground mt-10 mb-4 ${viewport === 'mobile' ? 'text-xl' : 'text-2xl'}`}>
                  Научная основа
                </h2>

                <p>
                  Все методы и техники, представленные на платформе, основаны на 
                  <strong className="text-foreground font-semibold"> доказательной психологии</strong>. 
                  Мы опираемся на подходы, эффективность которых подтверждена научными 
                  исследованиями:
                </p>

                <div className="space-y-4 my-6">
                  <Card className="border-2">
                    <CardContent className="p-5">
                      <h3 className="font-semibold text-foreground text-base mb-2">
                        Когнитивно-поведенческая терапия (КПТ)
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Один из наиболее изученных и эффективных методов психотерапии. КПТ помогает 
                        распознавать и изменять неадаптивные паттерны мышления и поведения.
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-2">
                    <CardContent className="p-5">
                      <h3 className="font-semibold text-foreground text-base mb-2">
                        Практики осознанности (Mindfulness)
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Техники развития осознанного присутствия в настоящем моменте. Снижают 
                        реактивность, улучшают эмоциональную регуляцию и общее благополучие.
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-2">
                    <CardContent className="p-5">
                      <h3 className="font-semibold text-foreground text-base mb-2">
                        Терапия принятия и ответственности (ACT)
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Подход третьей волны КПТ, фокусирующийся на психологической гибкости, 
                        принятии трудных переживаний и осознанных действиях согласно ценностям.
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-2">
                    <CardContent className="p-5">
                      <h3 className="font-semibold text-foreground text-base mb-2">
                        Поливагальная теория
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Современная нейробиологическая модель регуляции эмоций через понимание 
                        работы автономной нервной системы и блуждающего нерва.
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <h2 className={`font-bold text-foreground mt-10 mb-4 ${viewport === 'mobile' ? 'text-xl' : 'text-2xl'}`}>
                  Как устроен проект
                </h2>

                <p>
                  Платформа включает несколько взаимосвязанных инструментов:
                </p>

                <div className="space-y-3 ml-6 my-4">
                  <div className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Sparkles className="w-3 h-3 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground text-sm mb-1">
                        Интерактивный навигатор
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Помогает найти подходящие инструменты и практики в зависимости от 
                        вашей текущей ситуации и потребностей.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <BookOpen className="w-3 h-3 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground text-sm mb-1">
                        Образовательные материалы
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Статьи, видео и аудио-материалы о методах работы с эмоциями, основах 
                        КПТ, нейробиологии стресса и других релевантных темах.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Heart className="w-3 h-3 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground text-sm mb-1">
                        Практические инструменты
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Упражнения, техники и ритуалы для ежедневной практики эмоциональной 
                        регуляции и развития психологической гибкости.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Users className="w-3 h-3 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground text-sm mb-1">
                        Подбор специалистов
                      </p>
                      <p className="text-sm text-muted-foreground">
                        База проверенных психологов и психотерапевтов для тех, кто готов 
                        к работе с профессионалом.
                      </p>
                    </div>
                  </div>
                </div>

                <p className="mt-6">
                  Все инструменты разработаны так, чтобы их можно было использовать 
                  самостоятельно, в удобное время и в собственном темпе. Мы не навязываем 
                  жёстких программ — вы сами выбираете, что и когда практиковать.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Trust Blocks Section */}
        <div className="border-t border-border bg-muted/30">
          <div className={viewport === 'mobile' ? 'px-6 py-10' : 'px-12 py-16'}>
            <div className={viewport === 'mobile' ? '' : 'max-w-4xl mx-auto'}>
              <h2 className={`font-bold text-foreground mb-8 ${viewport === 'mobile' ? 'text-xl' : 'text-2xl'} text-center`}>
                Мои принципы и этика
              </h2>

              <div className={`grid gap-6 ${viewport === 'mobile' ? 'grid-cols-1' : 'grid-cols-2'}`}>
                {/* Trust Block 1 */}
                <Card className="border-2 bg-background">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <Shield className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground text-base mb-3">
                      Научная обоснованность
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Мы используем только методы, эффективность которых подтверждена научными 
                      исследованиями. Никаких псевдонаучных практик, эзотерики или недоказанных 
                      "чудо-техник".
                    </p>
                  </CardContent>
                </Card>

                {/* Trust Block 2 */}
                <Card className="border-2 bg-background">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <Lock className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground text-base mb-3">
                      Конфиденциальность и безопасность
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Ваши личные данные и результаты самодиагностики защищены. Мы не продаём 
                      информацию третьим лицам и не используем её для целей, не связанных с 
                      улучшением платформы.
                    </p>
                  </CardContent>
                </Card>

                {/* Trust Block 3 */}
                <Card className="border-2 bg-background">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <Eye className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground text-base mb-3">
                      Прозрачность ограничений
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Мы честно говорим о том, что может и чего не может этот проект. Самопомощь — 
                      это мощный инструмент, но она не заменит профессиональную терапию при 
                      серьёзных состояниях.
                    </p>
                  </CardContent>
                </Card>

                {/* Trust Block 4 */}
                <Card className="border-2 bg-background">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <Heart className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground text-base mb-3">
                      Фокус на благополучии
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Цель проекта — помочь вам чувствовать себя лучше, а не создать зависимость 
                      от платформы. Мы поощряем автономность и критическое мышление.
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card className="border-l-4 border-l-primary bg-primary/5 mt-8">
                <CardContent className="p-6">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    <strong className="text-foreground font-semibold">Этический кодекс:</strong> Все 
                    специалисты, представленные в базе психологов, проходят проверку квалификации 
                    и следуют этическим стандартам профессиональных психологических сообществ. 
                    Мы не сотрудничаем с людьми, использующими манипулятивные или потенциально 
                    вредные практики.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="border-t border-border">
          <div className={viewport === 'mobile' ? 'px-6 py-10' : 'px-12 py-12'}>
            <div className={`text-center ${viewport === 'mobile' ? '' : 'max-w-2xl mx-auto'}`}>
              <p className="text-base text-muted-foreground mb-6 leading-relaxed">
                Готовы начать работу над эмоциональным балансом?
              </p>
              <div className={`space-y-3 ${viewport === 'mobile' ? '' : 'flex gap-4 justify-center space-y-0'}`}>
                <Button size="lg" className={`gap-2 ${viewport === 'mobile' ? 'w-full' : ''}`}>
                  <Sparkles className="w-5 h-5" />
                  Пройти навигатор
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  className={`gap-2 ${viewport === 'mobile' ? 'w-full' : ''}`}
                >
                  <BookOpen className="w-5 h-5" />
                  Смотреть материалы
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
