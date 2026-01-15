import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { 
  Phone, AlertTriangle, MessageCircle, Heart, 
  Users, ArrowRight, PhoneCall, Clock
} from 'lucide-react';

interface EmergencyScreenProps {
  viewport: 'mobile' | 'desktop';
}

interface EmergencyService {
  id: string;
  title: string;
  phone: string;
  description: string;
  hours: string;
  isPrimary?: boolean;
}

const services: EmergencyService[] = [
  {
    id: '1',
    title: 'Телефон неотложной психологической помощи',
    phone: '051',
    description: 'Экстренная психологическая поддержка в кризисной ситуации. Бесплатно, анонимно, круглосуточно.',
    hours: '24/7',
    isPrimary: true
  },
  {
    id: '2',
    title: 'Всероссийский телефон доверия',
    phone: '8 800 2000 122',
    description: 'Квалифицированная психологическая помощь в трудной жизненной ситуации.',
    hours: 'Круглосуточно'
  },
  {
    id: '3',
    title: 'Линия помощи "Ты не один"',
    phone: '8 800 333 44 34',
    description: 'Помощь людям в кризисном эмоциональном состоянии, переживающим депрессию или тревогу.',
    hours: 'Ежедневно 9:00 - 21:00'
  },
  {
    id: '4',
    title: 'Центр экстренной психологической помощи МЧС',
    phone: '8 495 989 50 50',
    description: 'Психологическая поддержка при чрезвычайных ситуациях, травматических событиях.',
    hours: 'Круглосуточно'
  }
];

export function EmergencyScreen({ viewport }: EmergencyScreenProps) {
  return (
    <section>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-foreground mb-2">
          Emergency (/emergency) — Default — {viewport === 'mobile' ? 'Mobile (375px)' : 'Desktop (1440px)'}
        </h2>
        <p className="text-sm text-muted-foreground">
          Экран экстренной помощи
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
            <h3 className="font-semibold text-foreground">Экстренная помощь</h3>
            <div className="w-[44px]" />
          </div>
        ) : (
          <div className="flex items-center justify-between px-12 py-4 border-b border-border bg-card">
            <div className="flex items-center gap-8">
              <h3 className="font-bold text-xl text-foreground">Эмоциональный баланс</h3>
              <nav className="flex gap-6">
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Начало</a>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Навигатор</a>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Ритуалы</a>
                <a href="#" className="text-sm font-medium text-danger">Помощь</a>
              </nav>
            </div>
            <Button variant="ghost" size="sm">
              <Phone className="w-4 h-4 mr-2" />
              Позвонить
            </Button>
          </div>
        )}

        {/* Content */}
        <div className={viewport === 'mobile' ? 'p-6 py-8' : 'p-12'}>
          <div className={viewport === 'mobile' ? '' : 'max-w-4xl mx-auto'}>
            {/* Header */}
            <div className={`mb-8 ${viewport === 'mobile' ? 'text-center' : ''}`}>
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-14 h-14 rounded-full bg-danger/10 flex items-center justify-center">
                  <Phone className="w-7 h-7 text-danger" />
                </div>
              </div>
              <h1 className={`font-bold text-foreground mb-3 ${viewport === 'mobile' ? 'text-2xl' : 'text-3xl'}`}>
                Экстренная психологическая помощь
              </h1>
              <p className={`text-muted-foreground ${viewport === 'mobile' ? 'text-sm' : 'text-base max-w-2xl mx-auto'}`}>
                Если вам очень плохо прямо сейчас — вы не одни. Здесь собраны телефоны служб, 
                где профессионалы готовы выслушать и поддержать вас в любое врем��.
              </p>
            </div>

            {/* Disclaimer */}
            <Alert variant="destructive" className="mb-8 border-2">
              <AlertTriangle className="h-5 w-5" />
              <AlertTitle className="font-semibold mb-2">Важно: это не служба экстренной медицинской помощи</AlertTitle>
              <AlertDescription className="text-sm">
                Если вам требуется срочная медицинская помощь или вы находитесь в опасной для жизни ситуации, 
                немедленно звоните <strong className="font-bold">112</strong> или <strong className="font-bold">103</strong> (Скорая помощь).
              </AlertDescription>
            </Alert>

            {/* Services List */}
            <div className="space-y-4 mb-10">
              <h2 className="text-xl font-semibold text-foreground mb-6">Кризисные службы поддержки</h2>
              
              {services.map((service) => (
                <Card 
                  key={service.id}
                  className={`transition-all ${
                    service.isPrimary 
                      ? 'border-danger border-4 shadow-xl bg-gradient-to-br from-danger/5 to-primary/5' 
                      : 'border-2 hover:shadow-lg'
                  }`}
                >
                  <CardContent className={viewport === 'mobile' ? 'p-5' : 'p-6'}>
                    {/* Primary Badge */}
                    {service.isPrimary && (
                      <div className="flex items-center gap-2 mb-4">
                        <div className="px-3 py-1 bg-danger text-white rounded-full text-xs font-semibold flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          Приоритетный номер
                        </div>
                      </div>
                    )}

                    {/* Title */}
                    <h3 className={`font-semibold text-foreground mb-3 ${
                      service.isPrimary 
                        ? viewport === 'mobile' ? 'text-lg' : 'text-xl' 
                        : viewport === 'mobile' ? 'text-base' : 'text-lg'
                    }`}>
                      {service.title}
                    </h3>

                    {/* Phone Number - Large */}
                    <div className={`mb-4 font-bold tabular-nums ${
                      service.isPrimary
                        ? viewport === 'mobile' ? 'text-4xl text-danger' : 'text-5xl text-danger'
                        : viewport === 'mobile' ? 'text-3xl text-primary' : 'text-4xl text-primary'
                    }`}>
                      {service.phone}
                    </div>

                    {/* Hours Badge */}
                    <div className="mb-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                        service.hours.includes('24/7') || service.hours.includes('Круглосуточно')
                          ? 'bg-success/10 text-success border border-success/20'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        <Clock className="w-3.5 h-3.5" />
                        {service.hours}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
                      {service.description}
                    </p>

                    {/* CTA */}
                    <Button 
                      variant={service.isPrimary ? 'default' : 'outline'}
                      size="lg"
                      className={`w-full gap-2 ${service.isPrimary ? 'bg-danger hover:bg-danger/90' : ''}`}
                    >
                      <PhoneCall className="w-5 h-5" />
                      Позвонить {service.phone}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Other Ways to Get Help */}
            <Card className="border-2 bg-muted/30">
              <CardContent className={viewport === 'mobile' ? 'p-5' : 'p-6'}>
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center flex-shrink-0">
                    <Heart className="w-5 h-5 text-info" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-1">
                      Другие способы получить помощь
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Иногда помогает просто поговорить с кем-то близким
                    </p>
                  </div>
                </div>

                <div className={`space-y-3 ${viewport === 'mobile' ? '' : 'flex gap-3 space-y-0'}`}>
                  <Button 
                    variant="secondary" 
                    size="lg" 
                    className={`gap-2 ${viewport === 'mobile' ? 'w-full' : 'flex-1'}`}
                  >
                    <MessageCircle className="w-5 h-5" />
                    Написать близкому человеку
                  </Button>
                  <Button 
                    variant="secondary" 
                    size="lg"
                    className={`gap-2 ${viewport === 'mobile' ? 'w-full' : 'flex-1'}`}
                  >
                    <Users className="w-5 h-5" />
                    Онлайн-чат с психологом
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Additional Info */}
            <Alert className="mt-6 bg-primary/5 border-primary/20">
              <Heart className="h-4 w-4 text-primary" />
              <AlertDescription className="text-sm text-foreground">
                Все звонки на горячие линии <strong className="font-semibold">бесплатны и анонимны</strong>. 
                Вам не нужно называть своё имя или объяснять, откуда вы звоните.
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </div>
    </section>
  );
}