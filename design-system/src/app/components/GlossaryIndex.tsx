import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { ArrowRight, User, BookOpen } from 'lucide-react';

interface GlossaryIndexProps {
  viewport: 'mobile' | 'desktop';
}

interface Term {
  id: string;
  title: string;
  shortDefinition: string;
  category: 'cbt' | 'mindfulness' | 'neuroscience' | 'practices' | 'techniques';
}

interface LetterSection {
  letter: string;
  terms: Term[];
}

const categoryConfig = {
  cbt: {
    label: 'КПТ',
    variant: 'secondary' as const
  },
  mindfulness: {
    label: 'Осознанность',
    variant: 'outline' as const
  },
  neuroscience: {
    label: 'Нейронаука',
    variant: 'outline' as const
  },
  practices: {
    label: 'Практики',
    variant: 'secondary' as const
  },
  techniques: {
    label: 'Техники',
    variant: 'outline' as const
  }
};

const glossaryData: LetterSection[] = [
  {
    letter: 'А',
    terms: [
      {
        id: 'affirmation',
        title: 'Аффирмация',
        shortDefinition: 'Позитивное утверждение, направленное на изменение негативных убеждений и формирование конструктивных паттернов мышления.',
        category: 'techniques'
      },
      {
        id: 'anchor',
        title: 'Анкер (якорь)',
        shortDefinition: 'Стимул или действие, которое вызывает определённое эмоциональное состояние. Используется для быстрого доступа к ресурсным состояниям.',
        category: 'practices'
      },
      {
        id: 'automatic-thoughts',
        title: 'Автоматические мысли',
        shortDefinition: 'Спонтанные мысли, возникающие в ответ на ситуацию без сознательного анализа. Часто содержат когнитивные искажения.',
        category: 'cbt'
      },
      {
        id: 'acceptance',
        title: 'Акцептация',
        shortDefinition: 'Принятие своих мыслей, эмоций и телесных ощущений без попыток их изменить или избежать. Ключевой элемент терапии принятия и ответственности.',
        category: 'mindfulness'
      }
    ]
  },
  {
    letter: 'В',
    terms: [
      {
        id: 'mindfulness',
        title: 'Внимательность (майндфулнесс)',
        shortDefinition: 'Состояние осознанного присутствия в настоящем моменте с открытым и безоценочным отношением к своему опыту.',
        category: 'mindfulness'
      },
      {
        id: 'validation',
        title: 'Валидация эмоций',
        shortDefinition: 'Признание и принятие эмоций как естественных и понятных реакций, без попыток их отрицать или обесценивать.',
        category: 'practices'
      },
      {
        id: 'hrv',
        title: 'Вариабельность сердечного ритма',
        shortDefinition: 'Изменчивость интервалов между сердечными сокращениями. Показатель адаптивности нервной системы и стрессоустойчивости.',
        category: 'neuroscience'
      }
    ]
  },
  {
    letter: 'Г',
    terms: [
      {
        id: 'hyperactivation',
        title: 'Гиперактивация',
        shortDefinition: 'Состояние повышенного возбуждения нервной системы в ответ на стресс. Проявляется в виде тревоги, паники, раздражительности.',
        category: 'neuroscience'
      },
      {
        id: 'graded-exposure',
        title: 'Градуированная экспозиция',
        shortDefinition: 'Постепенное и контролируемое столкновение с пугающими ситуациями для преодоления страхов и тревоги.',
        category: 'cbt'
      }
    ]
  },
  {
    letter: 'Д',
    terms: [
      {
        id: 'diaphragmatic-breathing',
        title: 'Диафрагмальное дыхание',
        shortDefinition: 'Техника глубокого дыхания с использованием диафрагмы. Активирует парасимпатическую нервную систему и способствует расслаблению.',
        category: 'techniques'
      },
      {
        id: 'decatastrophizing',
        title: 'Декатастрофизация',
        shortDefinition: 'Когнитивная техника для снижения тревоги путём реалистичной оценки вероятности и последствий негативных событий.',
        category: 'cbt'
      },
      {
        id: 'emotion-diary',
        title: 'Дневник эмоций',
        shortDefinition: 'Инструмент для отслеживания эмоциональных состояний, триггеров и паттернов. Помогает развить эмоциональную осознанность.',
        category: 'practices'
      }
    ]
  },
  {
    letter: 'И',
    terms: [
      {
        id: 'interoception',
        title: 'Интероцепция',
        shortDefinition: 'Способность воспринимать внутренние телесные сигналы (сердцебиение, дыхание, напряжение). Основа эмоциональной осознанности.',
        category: 'neuroscience'
      }
    ]
  },
  {
    letter: 'К',
    terms: [
      {
        id: 'cognitive-distortions',
        title: 'Когнитивные искажения',
        shortDefinition: 'Систематические ошибки в мышлении, которые искажают восприятие реальности и поддерживают негативные эмоции.',
        category: 'cbt'
      },
      {
        id: 'coping-strategies',
        title: 'Копинг-стратегии',
        shortDefinition: 'Способы справления со стрессом и трудными ситуациями. Могут быть адаптивными (решение проблем) или дезадаптивными (избегание).',
        category: 'practices'
      }
    ]
  },
  {
    letter: 'М',
    terms: [
      {
        id: 'metacognition',
        title: 'Метакогниция',
        shortDefinition: 'Осознание и понимание собственных мыслительных процессов. Способность наблюдать за своими мыслями со стороны.',
        category: 'mindfulness'
      },
      {
        id: 'body-scan',
        title: 'Медитация сканирования тела',
        shortDefinition: 'Практика последовательного направления внимания на разные части тела для развития телесной осознанности и расслабления.',
        category: 'mindfulness'
      }
    ]
  },
  {
    letter: 'Н',
    terms: [
      {
        id: 'neuroplasticity',
        title: 'Нейропластичность',
        shortDefinition: 'Способность мозга изменять свою структуру и функции в ответ на опыт. Основа для изменения привычек и паттернов мышления.',
        category: 'neuroscience'
      }
    ]
  },
  {
    letter: 'П',
    terms: [
      {
        id: 'progressive-relaxation',
        title: 'Прогрессивная мышечная релаксация',
        shortDefinition: 'Техника последовательного напряжения и расслабления групп мышц для снижения физического и эмоционального напряжения.',
        category: 'techniques'
      },
      {
        id: 'polyvagal-theory',
        title: 'Поливагальная теория',
        shortDefinition: 'Концепция о роли блуждающего нерва в регуляции эмоций и социального поведения через три состояния нервной системы.',
        category: 'neuroscience'
      }
    ]
  },
  {
    letter: 'Р',
    terms: [
      {
        id: 'reframing',
        title: 'Рефрейминг',
        shortDefinition: 'Изменение способа интерпретации ситуации для получения более адаптивной перспективы и снижения негативных эмоций.',
        category: 'cbt'
      },
      {
        id: 'rumination',
        title: 'Руминация',
        shortDefinition: 'Навязчивое повторяющееся размышление о негативных событиях и эмоциях. Усиливает депрессию и тревогу.',
        category: 'cbt'
      }
    ]
  },
  {
    letter: 'С',
    terms: [
      {
        id: 'self-compassion',
        title: 'Самосострадание',
        shortDefinition: 'Доброжелательное и понимающее отношение к себе в моменты страдания или неудач вместо самокритики.',
        category: 'mindfulness'
      },
      {
        id: 'somatic-markers',
        title: 'Соматические маркеры',
        shortDefinition: 'Телесные ощущения, связанные с эмоциями и помогающие в принятии решений на уровне интуиции.',
        category: 'neuroscience'
      }
    ]
  },
  {
    letter: 'Т',
    terms: [
      {
        id: 'thought-record',
        title: 'Таблица мыслей',
        shortDefinition: 'Структурированный метод записи и анализа автоматических мыслей для выявления и изменения когнитивных искажений.',
        category: 'cbt'
      },
      {
        id: 'triggers',
        title: 'Триггеры',
        shortDefinition: 'Ситуации, события или стимулы, которые запускают определённые эмоциональные или поведенческие реакции.',
        category: 'practices'
      }
    ]
  },
  {
    letter: 'Э',
    terms: [
      {
        id: 'emotional-regulation',
        title: 'Эмоциональная регуляция',
        shortDefinition: 'Способность управлять интенсивностью и продолжительностью эмоциональных реакций адаптивными способами.',
        category: 'practices'
      },
      {
        id: 'exposure-therapy',
        title: 'Экспозиционная терапия',
        shortDefinition: 'Метод лечения тревожных расстройств через систематическое столкновение с пугающими ситуациями в безопасных условиях.',
        category: 'cbt'
      }
    ]
  }
];

// Get all letters that have terms
const availableLetters = glossaryData.map(section => section.letter);

export function GlossaryIndex({ viewport }: GlossaryIndexProps) {
  return (
    <section>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-foreground mb-2">
          Glossary (/glossary) — Index — {viewport === 'mobile' ? 'Mobile (375px)' : 'Desktop (1440px)'}
        </h2>
        <p className="text-sm text-muted-foreground">
          Глоссарий терминов
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
        <div className={viewport === 'mobile' ? 'p-6 py-8' : 'p-12'}>
          <div className={viewport === 'mobile' ? '' : 'max-w-6xl mx-auto'}>
            {/* Header */}
            <div className={`mb-10 ${viewport === 'mobile' ? '' : 'text-center'}`}>
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-primary" />
                </div>
              </div>
              <h1 className={`font-bold text-foreground mb-3 ${viewport === 'mobile' ? 'text-2xl' : 'text-3xl'}`}>
                Глоссарий терминов
              </h1>
              <p className={`text-muted-foreground leading-relaxed ${viewport === 'mobile' ? 'text-sm' : 'text-base max-w-2xl mx-auto'}`}>
                Справочник ключевых понятий из когнитивно-поведенческой терапии, 
                практик осознанности и нейронауки для работы с эмоциональным балансом.
              </p>
            </div>

            {/* Alphabet Navigation */}
            <div className={`mb-10 pb-6 border-b border-border ${viewport === 'mobile' ? '' : ''}`}>
              <div className="flex flex-wrap gap-2 justify-center">
                {availableLetters.map((letter) => (
                  <a
                    key={letter}
                    href={`#letter-${letter}`}
                    className={`text-foreground hover:text-primary hover:bg-primary/5 rounded-lg transition-colors ${
                      viewport === 'mobile' 
                        ? 'w-9 h-9 flex items-center justify-center text-sm font-medium' 
                        : 'w-10 h-10 flex items-center justify-center text-base font-medium'
                    }`}
                  >
                    {letter}
                  </a>
                ))}
              </div>
            </div>

            {/* Letter Sections */}
            <div className="space-y-12">
              {glossaryData.map((section) => (
                <div key={section.letter} id={`letter-${section.letter}`}>
                  {/* Letter Heading */}
                  <div className="mb-6">
                    <h2 className={`font-bold text-foreground ${viewport === 'mobile' ? 'text-3xl' : 'text-4xl'}`}>
                      {section.letter}
                    </h2>
                  </div>

                  {/* Terms Grid */}
                  <div className={`grid gap-4 ${viewport === 'mobile' ? 'grid-cols-1' : 'grid-cols-2 lg:grid-cols-3'}`}>
                    {section.terms.map((term) => {
                      const categoryInfo = categoryConfig[term.category];
                      
                      return (
                        <Card 
                          key={term.id}
                          className="border hover:border-primary/40 hover:shadow-md transition-all cursor-pointer group"
                        >
                          <CardContent className="p-5">
                            {/* Category Badge */}
                            <Badge 
                              variant={categoryInfo.variant}
                              className="mb-3 text-xs"
                            >
                              {categoryInfo.label}
                            </Badge>

                            {/* Term Title */}
                            <h3 className="font-semibold text-foreground text-base mb-2 leading-snug group-hover:text-primary transition-colors">
                              {term.title}
                            </h3>

                            {/* Short Definition */}
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {term.shortDefinition}
                            </p>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
