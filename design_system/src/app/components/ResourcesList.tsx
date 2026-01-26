import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { 
  ArrowRight, User, Clock, Heart, 
  FileText, Video, Headphones, File,
  BookOpen, Library
} from 'lucide-react';

interface ResourcesListProps {
  viewport: 'mobile' | 'desktop';
  hasResources?: boolean;
}

interface Resource {
  id: string;
  title: string;
  excerpt: string;
  format: 'article' | 'video' | 'audio' | 'pdf';
  timeToBenefit: string;
  supportLevel: 'basic' | 'intermediate' | 'advanced';
}

const resources: Resource[] = [
  {
    id: '1',
    title: 'Гид по техникам осознанного дыхания',
    excerpt: 'Подробное руководство с пошаговыми инструкциями для 7 дыхательных техник, которые помогают справиться с тревогой и стрессом.',
    format: 'pdf',
    timeToBenefit: '15 мин чтения',
    supportLevel: 'basic'
  },
  {
    id: '2',
    title: 'Видео: Практика прогрессивной мышечной релаксации',
    excerpt: 'Управляемая 20-минутная практика для снятия физического напряжения. Можно выполнять в любое время дня.',
    format: 'video',
    timeToBenefit: '20 мин практики',
    supportLevel: 'basic'
  },
  {
    id: '3',
    title: 'Когнитивные искажения: чек-лист',
    excerpt: 'Полный список из 15 когнитивных искажений с примерами и вопросами для самопроверки. Инструмент для работы с автоматическими мыслями.',
    format: 'article',
    timeToBenefit: '10 мин чтения',
    supportLevel: 'intermediate'
  },
  {
    id: '4',
    title: 'Аудио: Медитация на принятие эмоций',
    excerpt: '15-минутная управляемая медитация для развития навыка присутствия с трудными эмоциями без избегания.',
    format: 'audio',
    timeToBenefit: '15 мин',
    supportLevel: 'intermediate'
  },
  {
    id: '5',
    title: 'Протокол работы с паническими атаками',
    excerpt: 'Пошаговый алгоритм действий во время панической атаки и стратегии профилактики. Основано на КПТ подходе.',
    format: 'pdf',
    timeToBenefit: '12 мин чтения',
    supportLevel: 'intermediate'
  },
  {
    id: '6',
    title: 'Видео: Введение в терапию принятия и ответственности (ACT)',
    excerpt: '45-минутная лекция о принципах ACT и том, как этот подход помогает при тревоге и депрессии.',
    format: 'video',
    timeToBenefit: '45 мин',
    supportLevel: 'advanced'
  },
  {
    id: '7',
    title: 'Работа с убеждениями через сократический диалог',
    excerpt: 'Продвинутая техника для глубокой работы с базовыми убеждениями. Включает шаблоны вопросов и примеры.',
    format: 'article',
    timeToBenefit: '25 мин чтения',
    supportLevel: 'advanced'
  },
  {
    id: '8',
    title: 'Аудио: Практика самосострадания',
    excerpt: '20-минутная управляемая практика для развития доброго отношения к себе в моменты трудностей.',
    format: 'audio',
    timeToBenefit: '20 мин',
    supportLevel: 'basic'
  },
  {
    id: '9',
    title: 'Шаблон дневника эмоций и триггеров',
    excerpt: 'Структурированный шаблон для отслеживания паттернов эмоциональных реакций. Помогает выявить связи между ситуациями, мыслями и чувствами.',
    format: 'pdf',
    timeToBenefit: '5 мин в день',
    supportLevel: 'intermediate'
  }
];

const formatIcons = {
  article: FileText,
  video: Video,
  audio: Headphones,
  pdf: File
};

const formatLabels = {
  article: 'Статья',
  video: 'Видео',
  audio: 'Аудио',
  pdf: 'PDF'
};

const supportLevelLabels = {
  basic: 'Базовый',
  intermediate: 'Средний',
  advanced: 'Продвинутый'
};

const supportLevelColors = {
  basic: 'bg-success/10 text-success border-success/20',
  intermediate: 'bg-warning/10 text-warning border-warning/20',
  advanced: 'bg-primary/10 text-primary border-primary/20'
};

export function ResourcesList({ viewport, hasResources = true }: ResourcesListProps) {
  return (
    <section>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-foreground mb-2">
          Resources (/resources) — List — {viewport === 'mobile' ? 'Mobile (375px)' : 'Desktop (1440px)'}
        </h2>
        <p className="text-sm text-muted-foreground">
          Список ресурсов {hasResources ? '(с контентом)' : '(empty state)'}
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
        <div className={viewport === 'mobile' ? 'p-6 py-8' : 'p-12'}>
          <div className={viewport === 'mobile' ? '' : 'max-w-6xl mx-auto'}>
            {/* Header */}
            <div className={`mb-10 ${viewport === 'mobile' ? '' : 'text-center'}`}>
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Library className="w-6 h-6 text-primary" />
                </div>
              </div>
              <h1 className={`font-bold text-foreground mb-3 ${viewport === 'mobile' ? 'text-2xl' : 'text-3xl'}`}>
                Библиотека ресурсов
              </h1>
              <p className={`text-muted-foreground ${viewport === 'mobile' ? 'text-sm' : 'text-base max-w-2xl mx-auto'}`}>
                Практические материалы для самостоятельной работы: статьи, видео, аудио-практики и PDF-гиды. 
                Все ресурсы проверены и основаны на доказательных подходах.
              </p>
            </div>

            {/* Resources Grid or Empty State */}
            {hasResources ? (
              <div className={`grid gap-4 ${viewport === 'mobile' ? 'grid-cols-1' : 'grid-cols-2 lg:grid-cols-3'}`}>
                {resources.map((resource) => {
                  const FormatIcon = formatIcons[resource.format];
                  
                  return (
                    <Card 
                      key={resource.id}
                      className="border-2 hover:shadow-lg transition-all cursor-pointer group"
                    >
                      <CardContent className="p-5">
                        {/* Format Icon */}
                        <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                          <FormatIcon className="w-6 h-6" />
                        </div>

                        {/* Title */}
                        <h3 className="font-semibold text-foreground text-base mb-3 group-hover:text-primary transition-colors line-clamp-2">
                          {resource.title}
                        </h3>

                        {/* Excerpt */}
                        <p className="text-sm text-muted-foreground mb-4 leading-relaxed line-clamp-3">
                          {resource.excerpt}
                        </p>

                        {/* Chips */}
                        <div className="flex flex-wrap gap-2">
                          {/* Format */}
                          <Badge variant="secondary" className="text-xs gap-1">
                            <FormatIcon className="w-3 h-3" />
                            {formatLabels[resource.format]}
                          </Badge>

                          {/* Time to Benefit */}
                          <Badge variant="outline" className="text-xs gap-1">
                            <Clock className="w-3 h-3" />
                            {resource.timeToBenefit}
                          </Badge>

                          {/* Support Level */}
                          <Badge 
                            variant="outline"
                            className={`text-xs gap-1 border ${supportLevelColors[resource.supportLevel]}`}
                          >
                            <Heart className="w-3 h-3" />
                            {supportLevelLabels[resource.supportLevel]}
                          </Badge>
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
                      <Library className="w-10 h-10 text-muted-foreground" />
                    </div>
                    
                    <h3 className={`font-semibold text-foreground mb-3 ${viewport === 'mobile' ? 'text-lg' : 'text-xl'}`}>
                      Ресурсы в разработке
                    </h3>
                    
                    <p className={`text-muted-foreground mb-6 ${viewport === 'mobile' ? 'text-sm' : 'text-base max-w-md mx-auto'}`}>
                      Мы готовим библиотеку практических материалов: статьи, видео-практики, 
                      аудио-медитации и PDF-гиды. Скоро здесь появятся полезные ресурсы.
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
                        Вернуться на главную
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
