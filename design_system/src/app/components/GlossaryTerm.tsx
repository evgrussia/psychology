import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { 
  ArrowRight, User, BookOpen, 
  FileText, Video, Headphones, Calendar
} from 'lucide-react';

interface GlossaryTermProps {
  viewport: 'mobile' | 'desktop';
}

export function GlossaryTerm({ viewport }: GlossaryTermProps) {
  return (
    <section>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-foreground mb-2">
          Glossary (/glossary/[slug]) — Term — {viewport === 'mobile' ? 'Mobile (375px)' : 'Desktop (1440px)'}
        </h2>
        <p className="text-sm text-muted-foreground">
          Страница отдельного термина
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
            <h3 className="font-semibold text-foreground">Глоссарий</h3>
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
                <a href="#" className="text-sm font-medium text-primary">Глоссарий</a>
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
          {/* Term Header */}
          <div className={`border-b border-border ${viewport === 'mobile' ? 'px-6 py-8' : 'px-12 py-12'}`}>
            <div className={viewport === 'mobile' ? '' : 'max-w-4xl mx-auto'}>
              {/* Back Link */}
              <a 
                href="#" 
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-6 group"
              >
                <ArrowRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
                <span>Вернуться в словарь</span>
              </a>

              {/* Category Badge */}
              <div className="mb-4">
                <Badge variant="secondary" className="text-xs">
                  КПТ
                </Badge>
              </div>

              {/* H1 Title */}
              <h1 className={`font-bold text-foreground mb-6 ${viewport === 'mobile' ? 'text-3xl' : 'text-4xl'}`}>
                Когнитивные искажения
              </h1>

              {/* Short Definition (Highlighted Block) */}
              <Card className="border-l-4 border-l-primary bg-primary/5 mb-6">
                <CardContent className="p-5">
                  <p className={`text-foreground leading-relaxed ${viewport === 'mobile' ? 'text-base' : 'text-lg'}`}>
                    <strong className="font-semibold">Краткое определение:</strong> Систематические ошибки 
                    в мышлении, которые искажают восприятие реальности и поддерживают негативные эмоции. 
                    Автоматические паттерны обработки информации, приводящие к неточным выводам.
                  </p>
                </CardContent>
              </Card>

              {/* Also Known As */}
              <div className="mb-6">
                <p className="text-sm font-semibold text-foreground mb-3">
                  Также известно как:
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="text-xs">
                    Когнитивные ошибки
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    Ошибки мышления
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    Ловушки мышления
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    Cognitive distortions
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Prose Content */}
          <div className={viewport === 'mobile' ? 'px-6 py-10' : 'px-12 py-16'}>
            <div className={viewport === 'mobile' ? '' : 'max-w-4xl mx-auto'}>
              <div className="prose prose-sm max-w-none">
                {/* Main content */}
                <div className="text-base leading-relaxed text-muted-foreground space-y-6">
                  <h2 className={`font-bold text-foreground mt-0 mb-4 ${viewport === 'mobile' ? 'text-xl' : 'text-2xl'}`}>
                    Что это такое
                  </h2>

                  <p>
                    Когнитивные искажения — это систематические отклонения от рациональных стандартов 
                    обработки информации. Наш мозг использует <strong className="text-foreground font-semibold">ментальные 
                    ярлыки</strong> (эвристики) для быстрой оценки ситуаций, но эти ярлыки могут 
                    приводить к предсказуемым ошибкам в суждениях.
                  </p>

                  <p>
                    В контексте эмоционального здоровья когнитивные искажения особенно важны, 
                    потому что они напрямую влияют на наши эмоции и поведение. Как писал основатель 
                    когнитивной терапии Аарон Бек: <em className="text-foreground">"То, как мы думаем, 
                    определяет то, как мы себя чувствуем"</em>.
                  </p>

                  <h2 className={`font-bold text-foreground mt-10 mb-4 ${viewport === 'mobile' ? 'text-xl' : 'text-2xl'}`}>
                    Основные типы когнитивных искажений
                  </h2>

                  <h3 className="font-semibold text-foreground mt-8 mb-3 text-lg">
                    1. Чёрно-белое мышление (дихотомическое мышление)
                  </h3>

                  <p>
                    Восприятие ситуаций в крайностях: что-то либо идеально, либо катастрофично, 
                    без промежуточных вариантов.
                  </p>

                  <Card className="border-2 my-4">
                    <CardContent className="p-5">
                      <p className="text-sm font-semibold text-foreground mb-2">
                        Пример:
                      </p>
                      <p className="text-sm text-muted-foreground">
                        "Если я не сделаю это безупречно, значит я полный неудачник." 
                        Игнорируется возможность частичного успеха или нормального результата.
                      </p>
                    </CardContent>
                  </Card>

                  <h3 className="font-semibold text-foreground mt-8 mb-3 text-lg">
                    2. Катастрофизация
                  </h3>

                  <p>
                    Преувеличение вероятности или серьёзности негативных событий. Автоматический 
                    переход к самому худшему сценарию.
                  </p>

                  <Card className="border-2 my-4">
                    <CardContent className="p-5">
                      <p className="text-sm font-semibold text-foreground mb-2">
                        Пример:
                      </p>
                      <p className="text-sm text-muted-foreground">
                        "Если я провалю эту презентацию, меня уволят, я не найду новую работу, 
                        потеряю квартиру и останусь на улице." Один возможный негатив 
                        раздувается до катастрофы.
                      </p>
                    </CardContent>
                  </Card>

                  <h3 className="font-semibold text-foreground mt-8 mb-3 text-lg">
                    3. Сверхобобщение
                  </h3>

                  <p>
                    Формирование широких выводов на основе одного или нескольких изолированных случаев. 
                    Применение опыта одной ситуации ко всем похожим ситуациям.
                  </p>

                  <Card className="border-2 my-4">
                    <CardContent className="p-5">
                      <p className="text-sm font-semibold text-foreground mb-2">
                        Пример:
                      </p>
                      <p className="text-sm text-muted-foreground">
                        "Он не ответил на моё сообщение. Никто никогда не хочет со мной общаться." 
                        Один случай превращается в универсальное правило.
                      </p>
                    </CardContent>
                  </Card>

                  <h3 className="font-semibold text-foreground mt-8 mb-3 text-lg">
                    4. Ментальный фильтр (выборочное внимание)
                  </h3>

                  <p>
                    Фокусировка исключительно на негативных деталях ситуации при игнорировании 
                    позитивных или нейтральных аспектов.
                  </p>

                  <Card className="border-2 my-4">
                    <CardContent className="p-5">
                      <p className="text-sm font-semibold text-foreground mb-2">
                        Пример:
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Получив отчёт с 9 положительными комментариями и 1 критическим замечанием, 
                        человек зацикливается только на критике и игнорирует всю позитивную обратную связь.
                      </p>
                    </CardContent>
                  </Card>

                  <h3 className="font-semibold text-foreground mt-8 mb-3 text-lg">
                    5. Чтение мыслей
                  </h3>

                  <p>
                    Уверенность в том, что вы знаете, что думают другие люди, без достаточных 
                    доказательств. Обычно предполагается негативное мнение.
                  </p>

                  <Card className="border-2 my-4">
                    <CardContent className="p-5">
                      <p className="text-sm font-semibold text-foreground mb-2">
                        Пример:
                      </p>
                      <p className="text-sm text-muted-foreground">
                        "Она думает, что я глупый" — без каких-либо слов или действий с её стороны, 
                        подтверждающих это предположение.
                      </p>
                    </CardContent>
                  </Card>

                  <h3 className="font-semibold text-foreground mt-8 mb-3 text-lg">
                    6. Персонализация
                  </h3>

                  <p>
                    Принятие ответственности за события, находящиеся вне вашего контроля. 
                    Интерпретация внешних событий как имеющих личное отношение к вам.
                  </p>

                  <Card className="border-2 my-4">
                    <CardContent className="p-5">
                      <p className="text-sm font-semibold text-foreground mb-2">
                        Пример:
                      </p>
                      <p className="text-sm text-muted-foreground">
                        "Коллега выглядит расстроенным — наверное, я сделал что-то не так." 
                        Хотя у коллеги могут быть свои личные причины для плохого настроения.
                      </p>
                    </CardContent>
                  </Card>

                  <h2 className={`font-bold text-foreground mt-10 mb-4 ${viewport === 'mobile' ? 'text-xl' : 'text-2xl'}`}>
                    Как работать с когнитивными искажениями
                  </h2>

                  <p>
                    Основной метод работы с когнитивными искажениями в КПТ — это 
                    <strong className="text-foreground font-semibold"> когнитивная реструктуризация</strong>. 
                    Это систематический процесс распознавания и изменения искажённых мыслей.
                  </p>

                  <h3 className="font-semibold text-foreground mt-8 mb-3 text-lg">
                    Шаги когнитивной реструктуризации:
                  </h3>

                  <ol className="space-y-3 ml-6 list-decimal marker:text-primary marker:font-semibold">
                    <li>
                      <strong className="text-foreground">Распознайте автоматическую мысль.</strong> Заметьте 
                      мысль, которая возникает в момент негативной эмоции.
                    </li>
                    <li>
                      <strong className="text-foreground">Определите тип искажения.</strong> Какая 
                      ошибка мышления присутствует? (катастрофизация, чтение мыслей и т.д.)
                    </li>
                    <li>
                      <strong className="text-foreground">Оцените доказательства.</strong> Какие факты 
                      подтверждают эту мысль? Какие опровергают?
                    </li>
                    <li>
                      <strong className="text-foreground">Сформулируйте альтернативную мысль.</strong> Более 
                      сбалансированная и реалистичная интерпретация ситуации.
                    </li>
                    <li>
                      <strong className="text-foreground">Заметьте изменение в эмоциях.</strong> Как 
                      изменилось ваше эмоциональное состояние после переоценки?
                    </li>
                  </ol>

                  <Card className="border-l-4 border-l-primary bg-primary/5 my-6">
                    <CardContent className="p-5">
                      <p className="text-sm font-semibold text-foreground mb-2">
                        Важно понимать:
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Цель — не "позитивное мышление", а <strong className="text-foreground">реалистичное 
                        мышление</strong>. Мы не заменяем негативные мысли на нереалистично позитивные, 
                        а стремимся к более точной и сбалансированной оценке ситуации.
                      </p>
                    </CardContent>
                  </Card>

                  <h2 className={`font-bold text-foreground mt-10 mb-4 ${viewport === 'mobile' ? 'text-xl' : 'text-2xl'}`}>
                    Почему это важно
                  </h2>

                  <p>
                    Исследования показывают, что когнитивные искажения играют центральную роль в 
                    развитии и поддержании тревожных расстройств, депрессии и других эмоциональных 
                    проблем. Научившись распознавать и корректировать эти искажения, вы:
                  </p>

                  <ul className="space-y-2 ml-6 list-disc marker:text-primary">
                    <li>Снижаете интенсивность негативных эмоций</li>
                    <li>Принимаете более взвешенные решения</li>
                    <li>Улучшаете качество межличностных отношений</li>
                    <li>Развиваете более гибкое и адаптивное мышление</li>
                    <li>Повышаете общую психологическую устойчивость</li>
                  </ul>

                  <p className="mt-8">
                    Работа с когнитивными искажениями — это навык, который развивается с практикой. 
                    Чем больше вы тренируетесь замечать и переоценивать искажённые мысли, тем легче 
                    это становится делать автоматически.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Related Materials Section */}
          <div className="border-t border-border">
            <div className={viewport === 'mobile' ? 'px-6 py-10' : 'px-12 py-16'}>
              <div className={viewport === 'mobile' ? '' : 'max-w-4xl mx-auto'}>
                <h2 className={`font-bold text-foreground mb-6 ${viewport === 'mobile' ? 'text-xl' : 'text-2xl'}`}>
                  Связанные материалы
                </h2>

                <div className={`grid gap-4 ${viewport === 'mobile' ? 'grid-cols-1' : 'grid-cols-2'}`}>
                  {/* Related Article */}
                  <Card className="border-2 hover:shadow-lg transition-all cursor-pointer group">
                    <CardContent className="p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <FileText className="w-4 h-4 text-primary" />
                        </div>
                        <Badge variant="outline" className="text-xs">
                          Статья
                        </Badge>
                      </div>
                      <h3 className="font-semibold text-foreground text-base mb-2 leading-snug group-hover:text-primary transition-colors">
                        Как распознать свои автоматические мысли
                      </h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        Практическое руководство по выявлению неосознанных паттернов мышления.
                      </p>
                      <div className="flex items-center gap-1.5 text-sm font-medium text-primary">
                        <span>Читать</span>
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Related Video */}
                  <Card className="border-2 hover:shadow-lg transition-all cursor-pointer group">
                    <CardContent className="p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                          <Video className="w-4 h-4 text-accent" />
                        </div>
                        <Badge variant="outline" className="text-xs">
                          Видео
                        </Badge>
                      </div>
                      <h3 className="font-semibold text-foreground text-base mb-2 leading-snug group-hover:text-primary transition-colors">
                        Техника "Сократовский диалог"
                      </h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        Видео-урок по методу проверки искажённых убеждений через вопросы.
                      </p>
                      <div className="flex items-center gap-1.5 text-sm font-medium text-primary">
                        <span>Смотреть</span>
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Related Practice */}
                  <Card className="border-2 hover:shadow-lg transition-all cursor-pointer group">
                    <CardContent className="p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center">
                          <Headphones className="w-4 h-4 text-success" />
                        </div>
                        <Badge variant="outline" className="text-xs">
                          Аудио
                        </Badge>
                      </div>
                      <h3 className="font-semibold text-foreground text-base mb-2 leading-snug group-hover:text-primary transition-colors">
                        Управляемая медитация на наблюдение за мыслями
                      </h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        15-минутная практика развития метакогнитивных навыков.
                      </p>
                      <div className="flex items-center gap-1.5 text-sm font-medium text-primary">
                        <span>Слушать</span>
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Related Tool */}
                  <Card className="border-2 hover:shadow-lg transition-all cursor-pointer group">
                    <CardContent className="p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded-lg bg-warning/10 flex items-center justify-center">
                          <FileText className="w-4 h-4 text-warning" />
                        </div>
                        <Badge variant="outline" className="text-xs">
                          Инструмент
                        </Badge>
                      </div>
                      <h3 className="font-semibold text-foreground text-base mb-2 leading-snug group-hover:text-primary transition-colors">
                        Шаблон таблицы мыслей
                      </h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        Готовый шаблон для записи и анализа автоматических мыслей.
                      </p>
                      <div className="flex items-center gap-1.5 text-sm font-medium text-primary">
                        <span>Скачать</span>
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="border-t border-border bg-gradient-to-br from-primary/5 to-accent/5">
            <div className={viewport === 'mobile' ? 'px-6 py-12' : 'px-12 py-16'}>
              <div className={`text-center ${viewport === 'mobile' ? '' : 'max-w-3xl mx-auto'}`}>
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  <Calendar className="w-8 h-8 text-primary" />
                </div>
                
                <h2 className={`font-bold text-foreground mb-4 ${viewport === 'mobile' ? 'text-2xl' : 'text-3xl'}`}>
                  Работайте с когнитивными искажениями под руководством специалиста
                </h2>
                
                <p className={`text-muted-foreground mb-8 leading-relaxed ${viewport === 'mobile' ? 'text-base' : 'text-lg'}`}>
                  Квалифицированный психолог поможет вам научиться распознавать ваши 
                  индивидуальные паттерны мышления и разработать эффективные стратегии 
                  для их изменения.
                </p>

                <div className={`space-y-3 ${viewport === 'mobile' ? '' : 'flex gap-4 justify-center space-y-0'}`}>
                  <Button size="lg" className={`gap-2 ${viewport === 'mobile' ? 'w-full' : ''}`}>
                    <Calendar className="w-5 h-5" />
                    Подобрать психолога
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg"
                    className={`gap-2 ${viewport === 'mobile' ? 'w-full' : ''}`}
                  >
                    <BookOpen className="w-5 h-5" />
                    Больше терминов
                  </Button>
                </div>

                <p className="text-sm text-muted-foreground mt-6">
                  Проверенные специалисты • Конфиденциально • Онлайн и офлайн
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
