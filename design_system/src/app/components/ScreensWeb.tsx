import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription } from './ui/alert';
import { 
  Home, Menu, Bell, User, Search, ArrowRight, Star, 
  ChevronRight, Heart, Calendar, TrendingUp, BookOpen,
  Clock, Target, Award, CheckCircle2, Play, Filter,
  Shield, Users, Sparkles, MessageCircle, AlertCircle,
  Phone, Brain, Smile, Zap, Send
} from 'lucide-react';
import { QuizCard } from './domain/QuizCard';
import { MoodCheckIn } from './domain/MoodCheckIn';
import { QuizScreens } from './QuizScreens';
import { NavigatorScreens } from './NavigatorScreens';
import { BoundariesScripts } from './BoundariesScripts';
import { RitualsScreens } from './RitualsScreens';
import { RitualFlow } from './RitualFlow';
import { EmergencyScreen } from './EmergencyScreen';
import { TopicsHub } from './TopicsHub';
import { TopicLanding } from './TopicLanding';
import { BlogList } from './BlogList';
import { BlogArticle } from './BlogArticle';
import { ResourcesList } from './ResourcesList';
import { ResourceDetail } from './ResourceDetail';
import { CuratedList } from './CuratedList';
import { GlossaryIndex } from './GlossaryIndex';
import { GlossaryTerm } from './GlossaryTerm';
import { AboutPage } from './AboutPage';
import { HowItWorksPage } from './HowItWorksPage';
import { LegalPage } from './LegalPage';
import { NotFoundPage } from './NotFoundPage';

export function ScreensWeb() {
  const [viewport, setViewport] = useState<'mobile' | 'desktop'>('desktop');

  return (
    <div className="max-w-7xl mx-auto p-6 md:p-8 space-y-12">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Screens (Web)</h1>
        <p className="text-muted-foreground mb-6">
          Полные экраны приложения в формате Mobile (375px) и Desktop (1440px)
        </p>
        
        {/* Viewport Toggle */}
        <div className="flex gap-2">
          <Button 
            variant={viewport === 'mobile' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewport('mobile')}
          >
            Mobile (375px)
          </Button>
          <Button 
            variant={viewport === 'desktop' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewport('desktop')}
          >
            Desktop (1440px)
          </Button>
        </div>
      </div>

      {/* ========== MARKETING PAGES ========== */}
      <div className="border-t-4 border-primary pt-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-2">📢 Marketing Pages</h2>
          <p className="text-sm text-muted-foreground">
            Лендинги, информационные страницы и маркетинговый контент
          </p>
        </div>

      {/* Screen: Home (/) - Default - Mobile/Desktop */}
      <section>
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-foreground mb-2">
            Home (/) — Default — {viewport === 'mobile' ? 'Mobile (375px)' : 'Desktop (1440px)'}
          </h2>
          <p className="text-sm text-muted-foreground">
            Главная страница с Hero, блоками помощи, Trust blocks, FAQ и CTA
          </p>
        </div>

        <div className={`mx-auto border-2 border-border rounded-xl overflow-hidden bg-background ${
          viewport === 'mobile' ? 'max-w-[375px]' : 'max-w-full'
        }`}>
          {/* Top Navigation */}
          {viewport === 'mobile' ? (
            <div className="flex items-center justify-between p-4 border-b border-border bg-card sticky top-0 z-10">
              <button className="p-2 hover:bg-muted rounded-lg min-w-[44px] min-h-[44px]">
                <Menu className="w-5 h-5 text-foreground" />
              </button>
              <h3 className="font-semibold text-foreground">Главная</h3>
              <button className="p-2 hover:bg-muted rounded-lg relative min-w-[44px] min-h-[44px]">
                <Bell className="w-5 h-5 text-foreground" />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between px-12 py-4 border-b border-border bg-card sticky top-0 z-10">
              <div className="flex items-center gap-8">
                <h3 className="font-bold text-xl text-foreground">Эмоциональный баланс</h3>
                <nav className="flex gap-6">
                  <a href="#" className="text-sm font-medium text-primary">Главная</a>
                  <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Подход</a>
                  <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Услуги</a>
                  <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Контакты</a>
                </nav>
              </div>
              <Button className="gap-2">
                Записаться
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* Content Container */}
          <div className={viewport === 'mobile' ? '' : 'max-w-7xl mx-auto'}>
            {/* 1. Hero Section */}
            <section className={viewport === 'mobile' ? 'p-6 py-12' : 'px-12 py-20'}>
              <div className={viewport === 'mobile' ? 'text-center' : 'max-w-4xl mx-auto text-center'}>
                <Badge className="mb-4">Психологическая поддержка онлайн</Badge>
                <h1 className={`font-bold text-foreground mb-6 ${viewport === 'mobile' ? 'text-3xl' : 'text-5xl'}`}>
                  Эмоциональный баланс
                </h1>
                <p className={`font-semibold text-primary mb-4 ${viewport === 'mobile' ? 'text-xl' : 'text-2xl'}`}>
                  Тёплое пространство для заботы о себе
                </p>
                <p className={`text-muted-foreground mb-8 ${viewport === 'mobile' ? 'text-base' : 'text-lg max-w-2xl mx-auto'}`}>
                  Помогаю справиться с тревогой, стрессом и эмоциональным выгоранием. 
                  Работаю в подходах КПТ и schema-терапии. Онлайн-сессии в удобное время.
                </p>
                
                {/* CTA Buttons */}
                <div className={`flex gap-3 ${viewport === 'mobile' ? 'flex-col' : 'flex-row justify-center'}`}>
                  <Button size="lg" className={`gap-2 ${viewport === 'mobile' ? 'w-full' : ''}`}>
                    Записаться на консультацию
                    <Calendar className="w-4 h-4" />
                  </Button>
                  <Button size="lg" variant="outline" className={`gap-2 ${viewport === 'mobile' ? 'w-full' : ''}`}>
                    Начать в Telegram
                    <Send className="w-4 h-4" />
                  </Button>
                </div>

                {/* Trust Indicators */}
                <div className={`flex items-center justify-center gap-6 pt-8 text-sm text-muted-foreground ${viewport === 'mobile' ? 'flex-col gap-3' : ''}`}>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-success" />
                    <span>Сертифицированный психолог</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-primary" />
                    <span>Конфиденциальность</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 fill-primary text-primary" />
                    <span>4.9 рейтинг</span>
                  </div>
                </div>
              </div>
            </section>

            {/* 2. Блок "С чем я помогаю" */}
            <section className={`bg-muted/30 ${viewport === 'mobile' ? 'p-6 py-12' : 'px-12 py-16'}`}>
              <div className={viewport === 'mobile' ? '' : 'max-w-6xl mx-auto'}>
                <div className="text-center mb-10">
                  <h2 className={`font-bold text-foreground mb-3 ${viewport === 'mobile' ? 'text-2xl' : 'text-3xl'}`}>
                    С чем я помогаю
                  </h2>
                  <p className="text-muted-foreground">
                    Основные направления работы
                  </p>
                </div>

                <div className={`grid gap-6 ${viewport === 'mobile' ? 'grid-cols-1' : 'grid-cols-3'}`}>
                  {[
                    {
                      icon: Brain,
                      title: 'Тревога и стресс',
                      description: 'Работа с тревожными расстройствами, паническими атаками и хроническим стрессом',
                      color: 'bg-primary/10 text-primary'
                    },
                    {
                      icon: Heart,
                      title: 'Эмоциональное выгорание',
                      description: 'Восстановление ресурсов, профилактика выгорания, баланс работы и жизни',
                      color: 'bg-success/10 text-success'
                    },
                    {
                      icon: Smile,
                      title: 'Самооценка и уверенность',
                      description: 'Повышение самооценки, работа с внутренним критиком, принятие себя',
                      color: 'bg-warning/10 text-warning'
                    },
                    {
                      icon: Users,
                      title: 'Отношения',
                      description: 'Сложности в отношениях, коммуникация, установление границ',
                      color: 'bg-info/10 text-info'
                    },
                    {
                      icon: Target,
                      title: 'Жизненные кризисы',
                      description: 'Поддержка в сложные периоды, поиск смыслов, адаптация к изменениям',
                      color: 'bg-danger/10 text-danger'
                    },
                    {
                      icon: Sparkles,
                      title: 'Личностный рост',
                      description: 'Развитие эмоционального интеллекта, осознанность, достижение целей',
                      color: 'bg-accent/50 text-primary'
                    },
                  ].map((topic, idx) => (
                    <Card key={idx} className="hover:shadow-lg transition-shadow cursor-pointer group">
                      <CardContent className="p-6">
                        <div className={`w-12 h-12 rounded-xl ${topic.color} flex items-center justify-center mb-4`}>
                          <topic.icon className="w-6 h-6" />
                        </div>
                        <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                          {topic.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {topic.description}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </section>

            {/* 3. Блок "Первый шаг за 3 минуты" */}
            <section className={viewport === 'mobile' ? 'p-6 py-12' : 'px-12 py-16'}>
              <div className={viewport === 'mobile' ? '' : 'max-w-6xl mx-auto'}>
                <div className="text-center mb-10">
                  <Badge variant="secondary" className="mb-3">Быстрый старт</Badge>
                  <h2 className={`font-bold text-foreground mb-3 ${viewport === 'mobile' ? 'text-2xl' : 'text-3xl'}`}>
                    Первый шаг за 3 минуты
                  </h2>
                  <p className="text-muted-foreground">
                    Начните заботиться о своём эмоциональном здоровье прямо сейчас
                  </p>
                </div>

                <div className={`grid gap-6 ${viewport === 'mobile' ? 'grid-cols-1' : 'grid-cols-3'}`}>
                  {[
                    {
                      step: '1',
                      icon: BookOpen,
                      title: 'Экспресс-тест',
                      description: 'Пройдите быстрый тест на уровень тревожности или стресса',
                      time: '3 минуты',
                      cta: 'Пройти тест',
                      color: 'primary'
                    },
                    {
                      step: '2',
                      icon: MessageCircle,
                      title: 'Telegram-бот',
                      description: 'Начните вести дневник настроения и получайте рекомендации',
                      time: 'Бесплатно',
                      cta: 'Открыть бота',
                      color: 'success'
                    },
                    {
                      step: '3',
                      icon: Calendar,
                      title: 'Консультация',
                      description: 'Запишитесь на первую встречу в удобное для вас время',
                      time: '50 минут',
                      cta: 'Записаться',
                      color: 'warning'
                    },
                  ].map((item, idx) => (
                    <Card key={idx} className="relative overflow-hidden hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="absolute -top-4 -right-4 text-8xl font-bold text-muted/10">
                          {item.step}
                        </div>
                        <div className="relative">
                          <div className={`w-12 h-12 rounded-xl bg-${item.color}/10 text-${item.color} flex items-center justify-center mb-4`}>
                            <item.icon className="w-6 h-6" />
                          </div>
                          <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
                          <p className="text-sm text-muted-foreground mb-4">{item.description}</p>
                          <div className="flex items-center justify-between">
                            <Badge variant="outline">{item.time}</Badge>
                            <Button variant="ghost" size="sm" className="gap-2 group">
                              {item.cta}
                              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </section>

            {/* 4. Trust Blocks "Почему мне можно доверять" */}
            <section className={`bg-gradient-to-br from-primary/5 to-accent/10 ${viewport === 'mobile' ? 'p-6 py-12' : 'px-12 py-16'}`}>
              <div className={viewport === 'mobile' ? '' : 'max-w-6xl mx-auto'}>
                <div className="text-center mb-10">
                  <h2 className={`font-bold text-foreground mb-3 ${viewport === 'mobile' ? 'text-2xl' : 'text-3xl'}`}>
                    Почему мне можно доверять
                  </h2>
                  <p className="text-muted-foreground">
                    Профессионализм, опыт и искренняя забота о каждом клиенте
                  </p>
                </div>

                <div className={`grid gap-8 ${viewport === 'mobile' ? 'grid-cols-1' : 'grid-cols-2'}`}>
                  {[
                    {
                      icon: Award,
                      title: 'Образование и сертификаты',
                      points: [
                        'Диплом клинического психолога МГУ',
                        'Сертификация по КПТ (BABCP)',
                        'Обучение schema-терапии',
                        'Регулярная супервизия'
                      ]
                    },
                    {
                      icon: Users,
                      title: 'Опыт работы',
                      points: [
                        '5+ лет практики в психологии',
                        '200+ клиентов',
                        'Работа с тревогой, выгоранием, кризисами',
                        'Онлайн-формат с 2020 года'
                      ]
                    },
                    {
                      icon: Shield,
                      title: 'Конфиденциальность',
                      points: [
                        'Защищённые каналы связи',
                        'Соблюдение врачебной тайны',
                        'Безопасное хранение данных',
                        'GDPR compliance'
                      ]
                    },
                    {
                      icon: Heart,
                      title: 'Подход',
                      points: [
                        'Доказательные методы (КПТ, schema)',
                        'Индивидуальный план терапии',
                        'Поддержка между сессиями',
                        'Ориентация на результат'
                      ]
                    },
                  ].map((block, idx) => (
                    <Card key={idx} className="bg-card/80 backdrop-blur">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4 mb-4">
                          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                            <block.icon className="w-6 h-6" />
                          </div>
                          <h3 className="font-semibold text-foreground pt-2">{block.title}</h3>
                        </div>
                        <ul className="space-y-2">
                          {block.points.map((point, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                              <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                              <span>{point}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </section>

            {/* 5. FAQ "Частые вопросы" */}
            <section className={viewport === 'mobile' ? 'p-6 py-12' : 'px-12 py-16'}>
              <div className={viewport === 'mobile' ? '' : 'max-w-4xl mx-auto'}>
                <div className="text-center mb-10">
                  <h2 className={`font-bold text-foreground mb-3 ${viewport === 'mobile' ? 'text-2xl' : 'text-3xl'}`}>
                    Частые вопросы
                  </h2>
                  <p className="text-muted-foreground">
                    Ответы на самые распространённые вопросы о терапии
                  </p>
                </div>

                <div className="space-y-4">
                  {[
                    {
                      question: 'Как проходит онлайн-консультация?',
                      answer: 'Консультации проводятся по видеосвязи (Zoom, Google Meet или Telegram) в удобное для вас время. Длительность сессии — 50 минут. Важно обеспечить приватное пространство и стабильное интернет-соединение.'
                    },
                    {
                      question: 'Сколько сессий может понадобиться?',
                      answer: 'Это зависит от запроса. Для работы с конкретной ситуацией может быть достаточно 5-10 встреч. Глубокая терапия занимает от 3-6 месяцев. На первой консультации мы обсудим ваш запрос и составим примерный план.'
                    },
                    {
                      question: 'Сколько стоит консультация?',
                      answer: 'Стоимость одной сессии (50 минут) — 4500 рублей. Есть возможность приобрести пакеты сессий со скидкой. Для студентов и людей в сложной жизненной ситуации предусмотрена социальная цена.'
                    },
                    {
                      question: 'Как понять, что мне нужна терапия?',
                      answer: 'Если вы чувствуете постоянную тревогу, стресс, апатию, сложности в отношениях или просто хотите лучше понимать себя — терапия может помочь. Необязательно ждать кризиса. Психолог — это поддержка на пути к лучшей версии себя.'
                    },
                    {
                      question: 'Конфиденциальна ли информация?',
                      answer: 'Да, абсолютно. Всё, что вы говорите на сессиях, остаётся между нами. Я соблюдаю принципы врачебной тайны и не разглашаю информацию третьим лицам без вашего письменного согласия.'
                    },
                  ].map((faq, idx) => {
                    const [isOpen, setIsOpen] = useState(false);
                    return (
                      <Card 
                        key={idx} 
                        className="cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => setIsOpen(!isOpen)}
                      >
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between gap-4">
                            <h3 className="font-semibold text-foreground flex-1">{faq.question}</h3>
                            <ChevronRight className={`w-5 h-5 text-muted-foreground flex-shrink-0 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
                          </div>
                          {isOpen && (
                            <p className="text-sm text-muted-foreground mt-4 pt-4 border-t border-border">
                              {faq.answer}
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* 6. Disclaimer с emergency link */}
            <section className={viewport === 'mobile' ? 'p-6' : 'px-12 py-8'}>
              <div className={viewport === 'mobile' ? '' : 'max-w-6xl mx-auto'}>
                <Alert className="border-warning/50 bg-warning/5">
                  <AlertCircle className="h-4 w-4 text-warning" />
                  <AlertDescription className="text-sm">
                    <p className="font-medium text-warning mb-2">Важная информация</p>
                    <p className="text-foreground mb-3">
                      Если вы находитесь в кризисной ситуации и нуждаетесь в немедленной помощи, пожалуйста, обратитесь на{' '}
                      <a href="tel:88002000122" className="font-semibold text-primary hover:underline">
                        горячую линию психологической помощи 8-800-2000-122
                      </a>
                      {' '}(бесплатно, круглосуточно) или в скорую психиатрическую помощь.
                    </p>
                    <p className="text-muted-foreground text-xs">
                      Онлайн-консультации не заменяют очную психиатрическую или медицинскую помощь при острых состояниях.
                    </p>
                  </AlertDescription>
                </Alert>
              </div>
            </section>

            {/* 7. Финальный CTA Block */}
            <section className={`bg-gradient-to-r from-primary/10 to-accent/10 border-t border-border ${viewport === 'mobile' ? 'p-6 py-12' : 'px-12 py-16'}`}>
              <div className={`text-center ${viewport === 'mobile' ? '' : 'max-w-4xl mx-auto'}`}>
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  <Calendar className="w-8 h-8 text-primary" />
                </div>
                <h2 className={`font-bold text-foreground mb-4 ${viewport === 'mobile' ? 'text-2xl' : 'text-3xl'}`}>
                  Готовы сделать первый шаг?
                </h2>
                <p className={`text-muted-foreground mb-8 ${viewport === 'mobile' ? 'text-base' : 'text-lg max-w-2xl mx-auto'}`}>
                  Запишитесь на первую консультацию, и мы вместе найдём путь к вашему эмоциональному балансу
                </p>
                <div className={`flex gap-3 ${viewport === 'mobile' ? 'flex-col' : 'flex-row justify-center'}`}>
                  <Button size="lg" className={`gap-2 ${viewport === 'mobile' ? 'w-full' : ''}`}>
                    Записаться на консультацию
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                  <Button size="lg" variant="outline" className={`gap-2 ${viewport === 'mobile' ? 'w-full' : ''}`}>
                    Написать в Telegram
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-6">
                  Отвечу в течение 24 часов
                </p>
              </div>
            </section>

            {/* Footer */}
            <footer className={`border-t border-border bg-muted/30 ${viewport === 'mobile' ? 'p-6' : 'px-12 py-8'}`}>
              <div className={`flex items-center justify-between ${viewport === 'mobile' ? 'flex-col gap-4 text-center' : ''}`}>
                <div>
                  <p className="font-semibold text-foreground mb-1">Эмоциональный баланс</p>
                  <p className="text-sm text-muted-foreground">Психологическая поддержка онлайн</p>
                </div>
                <div className={`flex gap-6 text-sm text-muted-foreground ${viewport === 'mobile' ? 'flex-col gap-2' : ''}`}>
                  <a href="#" className="hover:text-foreground transition-colors">О терапии</a>
                  <a href="#" className="hover:text-foreground transition-colors">Цены</a>
                  <a href="#" className="hover:text-foreground transition-colors">Контакты</a>
                  <a href="#" className="hover:text-foreground transition-colors">Политика конфиденциальности</a>
                </div>
              </div>
              <div className={`pt-6 text-xs text-muted-foreground ${viewport === 'mobile' ? 'text-center' : ''}`}>
                <p>© 2024 Эмоциональный баланс. Все права защищены.</p>
              </div>
            </footer>
          </div>
        </div>
      </section>

      {/* Screen: Start (/start) - Hub - Mobile/Desktop */}
      <section>
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-foreground mb-2">
            Start (/start) — Hub — {viewport === 'mobile' ? 'Mobile (375px)' : 'Desktop (1440px)'}
          </h2>
          <p className="text-sm text-muted-foreground">
            Стартовый хаб с инструментами и направлениями работы
          </p>
        </div>

        <div className={`mx-auto border-2 border-border rounded-xl overflow-hidden bg-background ${
          viewport === 'mobile' ? 'max-w-[375px]' : 'max-w-full'
        }`}>
          {/* Top Navigation */}
          {viewport === 'mobile' ? (
            <div className="flex items-center justify-between p-4 border-b border-border bg-card sticky top-0 z-10">
              <button className="p-2 hover:bg-muted rounded-lg min-w-[44px] min-h-[44px]">
                <Menu className="w-5 h-5 text-foreground" />
              </button>
              <h3 className="font-semibold text-foreground">Начало</h3>
              <button className="p-2 hover:bg-muted rounded-lg relative min-w-[44px] min-h-[44px]">
                <User className="w-5 h-5 text-foreground" />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between px-12 py-4 border-b border-border bg-card sticky top-0 z-10">
              <div className="flex items-center gap-8">
                <h3 className="font-bold text-xl text-foreground">Эмоциональный баланс</h3>
                <nav className="flex gap-6">
                  <a href="#" className="text-sm font-medium text-primary">Начало</a>
                  <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Инструменты</a>
                  <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Библиотека</a>
                  <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Профиль</a>
                </nav>
              </div>
              <Button className="gap-2">
                Консультация
                <Calendar className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* Content Container */}
          <div className={viewport === 'mobile' ? '' : 'max-w-7xl mx-auto'}>
            {/* Hero Section */}
            <section className={viewport === 'mobile' ? 'p-6 py-12' : 'px-12 py-16'}>
              <div className={viewport === 'mobile' ? 'text-center' : 'max-w-4xl mx-auto text-center'}>
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  <Sparkles className="w-8 h-8 text-primary" />
                </div>
                <h1 className={`font-bold text-foreground mb-4 ${viewport === 'mobile' ? 'text-3xl' : 'text-4xl'}`}>
                  С чего начнём?
                </h1>
                <p className={`text-muted-foreground ${viewport === 'mobile' ? 'text-base' : 'text-lg max-w-2xl mx-auto'}`}>
                  Выберите инструмент для работы с эмоциями, пройдите тест или изучите полезные практики
                </p>
              </div>
            </section>

            {/* Инструменты - Grid карточек */}
            <section className={`bg-muted/30 ${viewport === 'mobile' ? 'p-6 py-12' : 'px-12 py-16'}`}>
              <div className={viewport === 'mobile' ? '' : 'max-w-6xl mx-auto'}>
                <div className="mb-8">
                  <h2 className={`font-semibold text-foreground mb-2 ${viewport === 'mobile' ? 'text-xl' : 'text-2xl'}`}>
                    Инструменты и практики
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Начните с того, что откликается прямо сейчас
                  </p>
                </div>

                <div className={`grid gap-6 ${viewport === 'mobile' ? 'grid-cols-1' : 'grid-cols-2 lg:grid-cols-3'}`}>
                  {/* Тест тревоги */}
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
                    <div className="aspect-video bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center relative">
                      <Brain className="w-12 h-12 text-primary" />
                      <Badge className="absolute top-3 right-3">5 минут</Badge>
                    </div>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                            Тест на тревогу
                          </h3>
                          <p className="text-sm text-muted-foreground mb-3">
                            Оцените уровень тревожности по шкале GAD-7
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <BookOpen className="w-4 h-4" />
                            <span>7 вопросов</span>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Тест на выгорание */}
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
                    <div className="aspect-video bg-gradient-to-br from-danger/20 to-warning/20 flex items-center justify-center relative">
                      <Zap className="w-12 h-12 text-danger" />
                      <Badge className="absolute top-3 right-3">8 минут</Badge>
                    </div>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                            Тест на выгорание
                          </h3>
                          <p className="text-sm text-muted-foreground mb-3">
                            Проверьте признаки эмоционального выгорания
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <BookOpen className="w-4 h-4" />
                            <span>12 вопросов</span>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Навигатор */}
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-success/10 text-success flex items-center justify-center flex-shrink-0">
                          <Target className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                            Навигатор запроса
                          </h3>
                          <p className="text-sm text-muted-foreground mb-3">
                            Не знаете, с чего начать? Ответьте на 3 вопроса, и мы подберём подходящие инструменты
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="w-full gap-2 group">
                        Начать навигацию
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Термометр ресурса */}
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-warning/10 text-warning flex items-center justify-center flex-shrink-0">
                          <TrendingUp className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                            Термометр ресурса
                          </h3>
                          <p className="text-sm text-muted-foreground mb-3">
                            Быстрая проверка уровня энергии и эмоционального состояния
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">2 минуты</Badge>
                        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Библиотека ритуалов */}
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
                    <div className="aspect-video bg-gradient-to-br from-success/20 to-accent/20 flex items-center justify-center relative">
                      <BookOpen className="w-12 h-12 text-success" />
                      <Badge className="absolute top-3 right-3" variant="secondary">Новое</Badge>
                    </div>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                            Библиотека ритуалов
                          </h3>
                          <p className="text-sm text-muted-foreground mb-3">
                            Практики на каждый день: утро, перерывы, вечер
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Sparkles className="w-4 h-4" />
                            <span>24 практики</span>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Дневник настроения */}
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-info/10 text-info flex items-center justify-center flex-shrink-0">
                          <Heart className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                            Дневник настроения
                          </h3>
                          <p className="text-sm text-muted-foreground mb-3">
                            Отслеживайте эмоции каждый день и замечайте паттерны
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">Ежедневно</Badge>
                        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </section>

            {/* Популярные материалы */}
            <section className={viewport === 'mobile' ? 'p-6 py-12' : 'px-12 py-16'}>
              <div className={viewport === 'mobile' ? '' : 'max-w-6xl mx-auto'}>
                <div className="mb-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className={`font-semibold text-foreground mb-2 ${viewport === 'mobile' ? 'text-xl' : 'text-2xl'}`}>
                        Популярные материалы
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        Статьи и упражнения для самостоятельной работы
                      </p>
                    </div>
                    {viewport === 'desktop' && (
                      <Button variant="ghost" className="gap-2">
                        Все материалы
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>

                <div className={`grid gap-6 ${viewport === 'mobile' ? 'grid-cols-1' : 'grid-cols-3'}`}>
                  {[
                    {
                      type: 'Статья',
                      title: '5 техник быстрого снижения тревоги',
                      time: '5 мин',
                      icon: BookOpen,
                      badge: null
                    },
                    {
                      type: 'Упражнение',
                      title: 'Дыхательная практика 4-7-8',
                      time: '3 мин',
                      icon: Play,
                      badge: 'Популярное'
                    },
                    {
                      type: 'Гайд',
                      title: 'Как выстроить здоровые границы',
                      time: '10 мин',
                      icon: Shield,
                      badge: null
                    },
                  ].map((item, idx) => (
                    <Card key={idx} className="hover:shadow-lg transition-shadow cursor-pointer group">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-2 mb-3">
                          <Badge variant="outline">{item.type}</Badge>
                          {item.badge && <Badge variant="secondary">{item.badge}</Badge>}
                        </div>
                        <h3 className="font-semibold text-foreground mb-3 group-hover:text-primary transition-colors">
                          {item.title}
                        </h3>
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{item.time}</span>
                          </div>
                          <ChevronRight className="w-5 h-5 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {viewport === 'mobile' && (
                  <Button variant="outline" className="w-full mt-6 gap-2">
                    Все материалы
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </section>

            {/* CTA Block "Нужна помощь специалиста?" */}
            <section className={`bg-gradient-to-br from-primary/10 to-accent/10 border-t border-border ${viewport === 'mobile' ? 'p-6 py-12' : 'px-12 py-16'}`}>
              <div className={`text-center ${viewport === 'mobile' ? '' : 'max-w-4xl mx-auto'}`}>
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  <MessageCircle className="w-8 h-8 text-primary" />
                </div>
                <h2 className={`font-bold text-foreground mb-4 ${viewport === 'mobile' ? 'text-2xl' : 'text-3xl'}`}>
                  Нужна помощь специалиста?
                </h2>
                <p className={`text-muted-foreground mb-8 ${viewport === 'mobile' ? 'text-base' : 'text-lg max-w-2xl mx-auto'}`}>
                  Запишитесь на консультацию с психологом или начните диалог в Telegram-боте
                </p>
                <div className={`flex gap-3 ${viewport === 'mobile' ? 'flex-col' : 'flex-row justify-center'}`}>
                  <Button size="lg" className={`gap-2 ${viewport === 'mobile' ? 'w-full' : ''}`}>
                    Записаться на консультацию
                    <Calendar className="w-4 h-4" />
                  </Button>
                  <Button size="lg" variant="outline" className={`gap-2 ${viewport === 'mobile' ? 'w-full' : ''}`}>
                    Написать в Telegram
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-6 flex items-center justify-center gap-2">
                  <Shield className="w-4 h-4" />
                  Конфиденциально и безопасно
                </p>
              </div>
            </section>

            {/* Footer */}
            <footer className={`border-t border-border bg-muted/30 ${viewport === 'mobile' ? 'p-6' : 'px-12 py-8'}`}>
              <div className={`flex items-center justify-between ${viewport === 'mobile' ? 'flex-col gap-4 text-center' : ''}`}>
                <div>
                  <p className="font-semibold text-foreground mb-1">Эмоциональный баланс</p>
                  <p className="text-sm text-muted-foreground">Инструменты для заботы о себе</p>
                </div>
                <div className={`flex gap-6 text-sm text-muted-foreground ${viewport === 'mobile' ? 'flex-col gap-2' : ''}`}>
                  <a href="#" className="hover:text-foreground transition-colors">Инструменты</a>
                  <a href="#" className="hover:text-foreground transition-colors">Библиотека</a>
                  <a href="#" className="hover:text-foreground transition-colors">Помощь</a>
                </div>
              </div>
            </footer>
          </div>

          {/* Bottom Navigation (Mobile only) */}
          {viewport === 'mobile' && (
            <div className="flex items-center justify-around p-4 border-t border-border bg-background sticky bottom-0">
              {[
                { icon: Home, label: 'Главная', active: false },
                { icon: Sparkles, label: 'Начало', active: true },
                { icon: BookOpen, label: 'Библиотека', active: false },
                { icon: User, label: 'Профиль', active: false },
              ].map((item) => (
                <button
                  key={item.label}
                  className="flex flex-col items-center gap-1 p-2 rounded-lg transition-colors hover:bg-muted min-w-[44px] min-h-[44px]"
                >
                  <item.icon className={`w-5 h-5 ${item.active ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span className={`text-xs ${item.active ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                    {item.label}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      </div>
      {/* End Old Screens Section */}

      {/* ========== CONTENT PAGES ========== */}
      <div className="border-t-4 border-warning pt-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-2">📚 Content Pages</h2>
          <p className="text-sm text-muted-foreground">
            Темы, статьи, ресурсы, подборки и глоссарий
          </p>
        </div>

      {/* Topics Hub */}
      <TopicsHub viewport={viewport} />

      {/* Topic Landing */}
      <TopicLanding viewport={viewport} />

      {/* Blog List - With Articles */}
      <BlogList viewport={viewport} hasArticles={true} />

      {/* Blog List - Empty State */}
      <BlogList viewport={viewport} hasArticles={false} />

      {/* Blog Article */}
      <BlogArticle viewport={viewport} />

      {/* Resources List - With Resources */}
      <ResourcesList viewport={viewport} hasResources={true} />

      {/* Resources List - Empty State */}
      <ResourcesList viewport={viewport} hasResources={false} />

      {/* Resource Detail */}
      <ResourceDetail viewport={viewport} />

      {/* Curated List - With Collections */}
      <CuratedList viewport={viewport} hasCollections={true} />

      {/* Curated List - Empty State */}
      <CuratedList viewport={viewport} hasCollections={false} />

      {/* Glossary Index */}
      <GlossaryIndex viewport={viewport} />

      {/* Glossary Term */}
      <GlossaryTerm viewport={viewport} />

      </div>
      {/* End Content Pages Section */}

      {/* ========== MARKETING PAGES (ADDITIONAL) ========== */}
      <div className="border-t-4 border-secondary pt-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-2">📄 About & How It Works</h2>
          <p className="text-sm text-muted-foreground">
            Информационные страницы о проекте и принципах работы
          </p>
        </div>

      {/* About Page */}
      <AboutPage viewport={viewport} />

      {/* How It Works Page */}
      <HowItWorksPage viewport={viewport} />

      </div>
      {/* End About Section */}

      {/* ========== SYSTEM PAGES ========== */}
      <div className="border-t-4 border-destructive pt-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-2">⚙️ System Pages</h2>
          <p className="text-sm text-muted-foreground">
            Служебные страницы, юридические документы и обработка ошибок
          </p>
        </div>

      {/* Legal Pages - Privacy Policy */}
      <LegalPage viewport={viewport} slug="privacy" />

      {/* Legal Pages - Personal Data Consent */}
      <LegalPage viewport={viewport} slug="personal-data-consent" />

      {/* Legal Pages - Offer (Terms) */}
      <LegalPage viewport={viewport} slug="offer" />

      {/* Legal Pages - Disclaimer */}
      <LegalPage viewport={viewport} slug="disclaimer" />

      {/* Legal Pages - Cookies Policy */}
      <LegalPage viewport={viewport} slug="cookies" />

      {/* Not Found Page */}
      <NotFoundPage viewport={viewport} />

      </div>
      {/* End System Pages Section */}

      {/* ========== INTERACTIVES ========== */}
      <div className="border-t-4 border-accent pt-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-2">✨ Interactive Tools</h2>
          <p className="text-sm text-muted-foreground">
            Квизы, навигатор, скрипты границ и интерактивные практики
          </p>
        </div>

      {/* Quiz Screens */}
      <QuizScreens viewport={viewport} />

      {/* Navigator Screens */}
      <NavigatorScreens viewport={viewport} />

      {/* Boundaries Scripts Screens */}
      <BoundariesScripts viewport={viewport} />

      {/* Rituals Screens */}
      <RitualsScreens viewport={viewport} />

      {/* Ritual Flow Screens */}
      <RitualFlow viewport={viewport} />

      </div>
      {/* End Interactives Section */}

      {/* ========== EMERGENCY & CRISIS ========== */}
      <div className="border-t-4 border-destructive pt-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-2">🚨 Emergency & Crisis</h2>
          <p className="text-sm text-muted-foreground">
            Экстренная помощь и кризисные ресурсы
          </p>
        </div>

      {/* Emergency Screen */}
      <EmergencyScreen viewport={viewport} />

      </div>
      {/* End Emergency Section */}

      {/* ========== OLD/DEPRECATED SCREENS ========== */}
      <div className="border-t-4 border-muted pt-8 opacity-50">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-2">🗄️ Old Screens (Deprecated)</h2>
          <p className="text-sm text-muted-foreground">
            Старые версии экранов для референса
          </p>
        </div>

      {/* Old Screen 1: Home / Landing - Default - Mobile/Desktop */}
      <section>
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-foreground mb-2">
            Home / Landing — Default — {viewport === 'mobile' ? 'Mobile' : 'Desktop'}
          </h2>
          <p className="text-sm text-muted-foreground">
            Главная страница приложения
          </p>
        </div>

        <div className={`mx-auto border-2 border-border rounded-xl overflow-hidden bg-background ${
          viewport === 'mobile' ? 'max-w-[375px]' : 'max-w-full'
        }`}>
          {/* Top Bar */}
          {viewport === 'mobile' ? (
            <div className="flex items-center justify-between p-4 border-b border-border">
              <button className="p-2 hover:bg-muted rounded-lg min-w-[44px] min-h-[44px]">
                <Menu className="w-5 h-5 text-foreground" />
              </button>
              <h3 className="font-semibold text-foreground">Главная</h3>
              <button className="p-2 hover:bg-muted rounded-lg relative min-w-[44px] min-h-[44px]">
                <Bell className="w-5 h-5 text-foreground" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-danger rounded-full" />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between px-8 py-4 border-b border-border">
              <div className="flex items-center gap-8">
                <h3 className="font-bold text-xl text-foreground">EmotionalBalance</h3>
                <nav className="flex gap-6">
                  <a href="#" className="text-sm font-medium text-primary">Главная</a>
                  <a href="#" className="text-sm text-muted-foreground hover:text-foreground">Тесты</a>
                  <a href="#" className="text-sm text-muted-foreground hover:text-foreground">Материалы</a>
                  <a href="#" className="text-sm text-muted-foreground hover:text-foreground">Консультации</a>
                </nav>
              </div>
              <div className="flex items-center gap-3">
                <button className="p-2 hover:bg-muted rounded-lg relative">
                  <Bell className="w-5 h-5 text-foreground" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-danger rounded-full" />
                </button>
                <button className="p-2 hover:bg-muted rounded-lg">
                  <User className="w-5 h-5 text-foreground" />
                </button>
              </div>
            </div>
          )}

          {/* Content */}
          <div className={viewport === 'mobile' ? 'p-4 space-y-6' : 'p-8 space-y-8'}>
            {/* Hero Section */}
            <div className="bg-gradient-to-br from-primary/10 via-accent/5 to-secondary/10 rounded-xl p-6 md:p-8 text-center">
              <Badge className="mb-3">Добро пожаловать!</Badge>
              <h1 className={viewport === 'mobile' ? 'text-2xl font-bold text-foreground mb-3' : 'text-4xl font-bold text-foreground mb-4'}>
                Ваш путь к эмоциональному балансу
              </h1>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Пройдите персонализированные тесты и получите рекомендации
              </p>
              <Button size={viewport === 'mobile' ? 'default' : 'lg'} className="gap-2">
                Начать тестирование
                <ArrowRight className="w-4 h-4" />
              </Button>
              <div className={`flex items-center justify-center gap-6 pt-6 text-sm text-muted-foreground ${viewport === 'mobile' ? 'flex-col' : ''}`}>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 fill-primary text-primary" />
                  <span>4.8 рейтинг</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success" />
                  <span>10,000+ пользователей</span>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className={`grid ${viewport === 'mobile' ? 'grid-cols-2' : 'grid-cols-4'} gap-4`}>
              {[
                { label: 'Тестов пройдено', value: '12', icon: CheckCircle2 },
                { label: 'Дней подряд', value: '7', icon: Calendar },
                { label: 'Средний балл', value: '8.5', icon: Star },
                { label: 'Часов медитации', value: '4.5', icon: Clock },
              ].map((stat, idx) => (
                <Card key={idx}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <stat.icon className="w-4 h-4 text-primary" />
                    </div>
                    <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Popular Topics */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-foreground">Популярные темы</h2>
                <button className="text-sm text-primary font-medium flex items-center gap-1">
                  Все темы
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <div className={`grid ${viewport === 'mobile' ? 'grid-cols-1' : 'grid-cols-3'} gap-4`}>
                {[
                  { title: 'Управление стрессом', lessons: '8 уроков', icon: Target, color: 'bg-primary/10 text-primary' },
                  { title: 'Эмоциональный интеллект', lessons: '12 уроков', icon: Heart, color: 'bg-success/10 text-success' },
                  { title: 'Mindfulness практики', lessons: '6 уроков', icon: BookOpen, color: 'bg-warning/10 text-warning' },
                ].map((topic, idx) => (
                  <Card key={idx} className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <div className={`w-10 h-10 rounded-lg ${topic.color} flex items-center justify-center mb-3`}>
                        <topic.icon className="w-5 h-5" />
                      </div>
                      <h3 className="font-semibold text-foreground mb-1">{topic.title}</h3>
                      <p className="text-sm text-muted-foreground">{topic.lessons}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Navigation (Mobile only) */}
          {viewport === 'mobile' && (
            <div className="flex items-center justify-around p-4 border-t border-border bg-background">
              {[
                { icon: Home, label: 'Главная', active: true },
                { icon: BookOpen, label: 'Тесты', active: false },
                { icon: Heart, label: 'Настроение', active: false },
                { icon: User, label: 'Профиль', active: false },
              ].map((item) => (
                <button
                  key={item.label}
                  className="flex flex-col items-center gap-1 p-2 rounded-lg transition-colors hover:bg-muted min-w-[44px] min-h-[44px]"
                >
                  <item.icon className={`w-5 h-5 ${item.active ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span className={`text-xs ${item.active ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                    {item.label}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Screen 2: Quizzes / List - Default - Mobile/Desktop */}
      <section>
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-foreground mb-2">
            Quizzes / List — Default — {viewport === 'mobile' ? 'Mobile' : 'Desktop'}
          </h2>
          <p className="text-sm text-muted-foreground">
            Каталог тестов и опросников
          </p>
        </div>

        <div className={`mx-auto border-2 border-border rounded-xl overflow-hidden bg-background ${
          viewport === 'mobile' ? 'max-w-[375px]' : 'max-w-full'
        }`}>
          {/* Header */}
          {viewport === 'mobile' ? (
            <div className="p-4 border-b border-border">
              <h3 className="font-semibold text-foreground mb-3">Тесты</h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Поиск тестов..." className="pl-10" />
              </div>
            </div>
          ) : (
            <div className="p-8 border-b border-border">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-foreground mb-2">Тесты и опросники</h1>
                  <p className="text-muted-foreground">Выберите тест для оценки вашего состояния</p>
                </div>
                <Button variant="outline" className="gap-2">
                  <Filter className="w-4 h-4" />
                  Фильтры
                </Button>
              </div>
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Поиск тестов..." className="pl-10" />
              </div>
            </div>
          )}

          {/* Content */}
          <div className={viewport === 'mobile' ? 'p-4' : 'p-8'}>
            {/* Category Tabs */}
            <div className="mb-6">
              <Tabs defaultValue="all">
                <TabsList className={viewport === 'mobile' ? 'w-full grid grid-cols-3' : ''}>
                  <TabsTrigger value="all">Все</TabsTrigger>
                  <TabsTrigger value="popular">Популярные</TabsTrigger>
                  <TabsTrigger value="new">Новые</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Quiz Cards */}
            <div className="space-y-4">
              {[
                {
                  title: 'Оценка уровня тревожности',
                  description: 'Определите уровень тревоги по шкале GAD-7',
                  duration: '5 мин',
                  questions: 7,
                  badge: 'Популярное',
                  color: 'primary'
                },
                {
                  title: 'Шкала депрессии Бека',
                  description: 'Стандартизированный тест для оценки депрессии',
                  duration: '10 мин',
                  questions: 21,
                  badge: null,
                  color: 'success'
                },
                {
                  title: 'Уровень стресса',
                  description: 'Оцените ваш текущий уровень стресса',
                  duration: '3 мин',
                  questions: 10,
                  badge: 'Новое',
                  color: 'warning'
                },
              ].map((quiz, idx) => (
                <Card key={idx} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground mb-1">{quiz.title}</h3>
                        <p className="text-sm text-muted-foreground">{quiz.description}</p>
                      </div>
                      {quiz.badge && (
                        <Badge variant="secondary" className="flex-shrink-0">{quiz.badge}</Badge>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{quiz.duration}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <BookOpen className="w-4 h-4" />
                          <span>{quiz.questions} вопросов</span>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">
                        Пройти тест
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Bottom Navigation (Mobile only) */}
          {viewport === 'mobile' && (
            <div className="flex items-center justify-around p-4 border-t border-border bg-background">
              {[
                { icon: Home, label: 'Главная', active: false },
                { icon: BookOpen, label: 'Тесты', active: true },
                { icon: Heart, label: 'Настроение', active: false },
                { icon: User, label: 'Профиль', active: false },
              ].map((item) => (
                <button
                  key={item.label}
                  className="flex flex-col items-center gap-1 p-2 rounded-lg min-w-[44px] min-h-[44px]"
                >
                  <item.icon className={`w-5 h-5 ${item.active ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span className={`text-xs ${item.active ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                    {item.label}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Screen 3: Quizzes / [slug] - Progress - Mobile/Desktop */}
      <section>
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-foreground mb-2">
            Quizzes / [slug] — Progress — {viewport === 'mobile' ? 'Mobile' : 'Desktop'}
          </h2>
          <p className="text-sm text-muted-foreground">
            Прохождение теста с прогресс-баром
          </p>
        </div>

        <div className={`mx-auto border-2 border-border rounded-xl overflow-hidden bg-background ${
          viewport === 'mobile' ? 'max-w-[375px]' : 'max-w-full'
        }`}>
          {/* Header with Progress */}
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between mb-4">
              <Button variant="ghost" size="sm">← Назад</Button>
              <span className="text-sm text-muted-foreground">Вопрос 3 из 7</span>
            </div>
            <Progress value={42.8} className="h-2" />
          </div>

          {/* Content */}
          <div className={`flex items-center justify-center ${viewport === 'mobile' ? 'p-4 min-h-[400px]' : 'p-12 min-h-[600px]'}`}>
            <QuizCard variant="single-choice" />
          </div>
        </div>
      </section>

      {/* Screen 4: Quizzes / [slug] - Result - Mobile/Desktop */}
      <section>
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-foreground mb-2">
            Quizzes / [slug] — Result — {viewport === 'mobile' ? 'Mobile' : 'Desktop'}
          </h2>
          <p className="text-sm text-muted-foreground">
            Результаты теста
          </p>
        </div>

        <div className={`mx-auto border-2 border-border rounded-xl overflow-hidden bg-background ${
          viewport === 'mobile' ? 'max-w-[375px]' : 'max-w-full'
        }`}>
          <div className={viewport === 'mobile' ? 'p-6 space-y-6' : 'p-12 space-y-8'}>
            {/* Result Card */}
            <div className="text-center">
              <div className="w-24 h-24 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-12 h-12 text-success" />
              </div>
              <h1 className={`font-bold text-foreground mb-3 ${viewport === 'mobile' ? 'text-2xl' : 'text-4xl'}`}>
                Тест завершён!
              </h1>
              <p className="text-muted-foreground max-w-md mx-auto">
                Спасибо за ваши ответы. Вот результаты оценки вашего состояния
              </p>
            </div>

            {/* Score */}
            <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
              <CardContent className="p-8 text-center">
                <p className="text-sm text-muted-foreground mb-2">Ваш результат</p>
                <div className="text-6xl font-bold text-primary mb-2">7.5</div>
                <p className="text-sm text-muted-foreground mb-4">из 10 баллов</p>
                <Badge className="bg-success text-success-foreground">Низкий уровень тревожности</Badge>
              </CardContent>
            </Card>

            {/* Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle>Рекомендации</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  На основе ваших результатов мы рекомендуем:
                </p>
                <ul className="space-y-3">
                  {[
                    'Продолжайте практиковать техники релаксации',
                    'Поддерживайте регулярный режим сна',
                    'Уделяйте время физической активности',
                  ].map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-foreground">{rec}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className={`flex gap-3 ${viewport === 'mobile' ? 'flex-col' : ''}`}>
              <Button className="flex-1">Сохранить результат</Button>
              <Button variant="outline" className="flex-1">Пройти ещё раз</Button>
            </div>
          </div>
        </div>
      </section>

      {/* Screen 5: Dashboard / Profile - Default - Mobile/Desktop */}
      <section>
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-foreground mb-2">
            Dashboard / Profile — Default — {viewport === 'mobile' ? 'Mobile' : 'Desktop'}
          </h2>
          <p className="text-sm text-muted-foreground">
            Профиль пользователя с дашбордом
          </p>
        </div>

        <div className={`mx-auto border-2 border-border rounded-xl overflow-hidden bg-background ${
          viewport === 'mobile' ? 'max-w-[375px]' : 'max-w-full'
        }`}>
          {/* Header */}
          <div className={viewport === 'mobile' ? 'p-4 border-b border-border' : 'p-8 border-b border-border'}>
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <User className="w-8 h-8 text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-foreground mb-1">Анна Иванова</h2>
                <p className="text-sm text-muted-foreground mb-3">С нами с января 2024</p>
                <div className="flex gap-2">
                  <Badge variant="secondary">Активный пользователь</Badge>
                  <Badge className="bg-success/10 text-success">7 дней подряд</Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className={viewport === 'mobile' ? 'p-4 space-y-6' : 'p-8 space-y-8'}>
            {/* Stats Grid */}
            <div>
              <h3 className="font-semibold text-foreground mb-4">Ваша статистика</h3>
              <div className={`grid ${viewport === 'mobile' ? 'grid-cols-2' : 'grid-cols-4'} gap-4`}>
                {[
                  { label: 'Тестов', value: '12', icon: CheckCircle2, color: 'text-primary' },
                  { label: 'Дней подряд', value: '7', icon: Calendar, color: 'text-success' },
                  { label: 'Средний балл', value: '8.5', icon: Star, color: 'text-warning' },
                  { label: 'Часов', value: '4.5', icon: Clock, color: 'text-info' },
                ].map((stat, idx) => (
                  <Card key={idx}>
                    <CardContent className="p-4">
                      <stat.icon className={`w-4 h-4 ${stat.color} mb-2`} />
                      <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div>
              <h3 className="font-semibold text-foreground mb-4">Недавняя активность</h3>
              <div className="space-y-3">
                {[
                  { title: 'Пройден тест "Уровень стресса"', time: '2 часа назад', score: '7.5/10' },
                  { title: 'Проверка настроения', time: 'Сегодня утром', score: '😊' },
                  { title: 'Пройден курс "Управление тревогой"', time: 'Вчера', score: '100%' },
                ].map((activity, idx) => (
                  <Card key={idx}>
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground mb-1">{activity.title}</p>
                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                      </div>
                      <Badge variant="outline">{activity.score}</Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Mood Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Динамика настроения</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-32 bg-gradient-to-r from-primary/10 via-success/10 to-warning/10 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-8 h-8 text-muted-foreground" />
                  <span className="ml-2 text-sm text-muted-foreground">График настроения за неделю</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Bottom Navigation (Mobile only) */}
          {viewport === 'mobile' && (
            <div className="flex items-center justify-around p-4 border-t border-border bg-background">
              {[
                { icon: Home, label: 'Главная', active: false },
                { icon: BookOpen, label: 'Тесты', active: false },
                { icon: Heart, label: 'Настроение', active: false },
                { icon: User, label: 'Профиль', active: true },
              ].map((item) => (
                <button
                  key={item.label}
                  className="flex flex-col items-center gap-1 p-2 rounded-lg min-w-[44px] min-h-[44px]"
                >
                  <item.icon className={`w-5 h-5 ${item.active ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span className={`text-xs ${item.active ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                    {item.label}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      </div>
      {/* End Old/Deprecated Screens Section */}

    </div>
  );
}