'use client';

import React from 'react';
import { Disclaimer, Button, Card, Container, Section } from '@psychology/design-system';
import { track } from '../../lib/tracking';
import { useRouter } from 'next/navigation';

export default function EmergencyClient() {
  const router = useRouter();
  const handleCall = (number: string, title: string) => {
    track('crisis_help_click', { action: `call_${title.toLowerCase().replace(/\s+/g, '_')}` });
    window.location.href = `tel:${number.replace(/[^0-9+]/g, '')}`;
  };

  const emergencyServices = [
    {
      title: 'Единый номер экстренных служб',
      number: '112',
      desc: 'Для вызова скорой помощи, полиции или спасателей в любой критической ситуации.',
      primary: true,
    },
    {
      title: 'Всероссийский детский телефон доверия',
      number: '8-800-2000-122',
      desc: 'Для детей, подростков и их родителей. Психологическая помощь в сложных ситуациях. Бесплатно и анонимно.',
    },
    {
      title: 'Экстренная психологическая помощь МЧС',
      number: '+7 (495) 989-50-50',
      desc: 'Для тех, кто оказался в острой кризисной ситуации или пережил травматическое событие.',
    },
    {
      title: 'Московская служба психологической помощи',
      number: '051',
      desc: 'С городского телефона: 051. С мобильного: +7 (495) 051. Круглосуточная поддержка жителей города.',
    },
  ];

  return (
    <>
      <Section className="py-12 md:py-24">
        <Container className="max-w-3xl">
          <header className="text-center mb-12 relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 opacity-10 pointer-events-none">
              <img src="/assets/graphics/icons/icon-chat-outline-1024x1024.svg" alt="" className="w-full h-full" />
            </div>
            <h1 className="text-4xl font-bold mb-4 text-foreground relative z-10">
              Экстренная помощь
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto relative z-10">
              Если вы чувствуете, что находитесь в опасности или не справляетесь прямо сейчас, 
              пожалуйста, обратитесь к специалистам экстренных служб.
            </p>
          </header>

          <div className="mb-12 flex justify-center">
            <img 
              src="/assets/graphics/spot/spot-confidentiality-1024x1024.svg" 
              alt="Безопасное пространство" 
              className="w-48 h-48 opacity-80"
            />
          </div>

          <Disclaimer variant="destructive" title="Важное уточнение">
            Этот ресурс и консультации наших психологов <strong className="font-bold">не являются службой экстренной помощи</strong>. 
            Мы не можем гарантировать мгновенный ответ в моменте кризиса. Пожалуйста, используйте контакты ниже для немедленной связи.
          </Disclaimer>

          <div 
            className="grid gap-6 mt-10"
            role="list" 
            aria-label="Контакты экстренных служб"
          >
            {emergencyServices.map((service, index) => (
              <Card 
                key={index} 
                className={`overflow-hidden p-0 border-2 ${service.primary ? 'border-destructive shadow-md' : 'border-border'}`}
              >
                <div className="flex flex-col p-6">
                  <div className="flex items-center justify-between gap-4 mb-3">
                    <h2 className="text-xl font-bold m-0 text-foreground">
                      {service.title}
                    </h2>
                    <span className={`text-2xl font-extrabold whitespace-nowrap ${service.primary ? 'text-destructive' : 'text-primary'}`}>
                      {service.number}
                    </span>
                  </div>
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    {service.desc}
                  </p>
                  <Button 
                    asChild
                    variant={service.primary ? "destructive" : "outline"}
                    className="w-full"
                  >
                    <a
                      href={`tel:${service.number.replace(/[^0-9+]/g, '')}`}
                      onClick={() => track('crisis_help_click', { action: `call_${service.title.toLowerCase().replace(/\s+/g, '_')}` })}
                      aria-label={`Позвонить ${service.title} ${service.number}`}
                      role="button"
                    >
                      Позвонить {service.number}
                    </a>
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          <div className="mt-16 bg-muted rounded-2xl p-8 text-center border border-border">
            <h3 className="text-2xl font-bold text-foreground mb-4">
              Другие способы помощи
            </h3>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Если ваша ситуация позволяет подождать, вы можете ознакомиться с нашими материалами 
              по самопомощи или запланировать обычную консультацию.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button variant="outline" onClick={() => {
                track('crisis_help_click', { action: 'back_to_resources' });
                router.push('/start');
              }}>
                Библиотека практик
              </Button>
              <Button variant="outline" onClick={() => {
                track('crisis_help_click', { action: 'go_home' });
                router.push('/');
              }}>
                Вернуться на главную
              </Button>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
