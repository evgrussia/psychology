'use client';

import React from 'react';
import { Disclaimer, Button, Card } from '@psychology/design-system/components';
import { spacing, typography, colors } from '@psychology/design-system/tokens';
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
    <main className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
            Экстренная помощь
          </h1>
          <p className="text-xl text-slate-600">
            Если вы чувствуете, что находитесь в опасности или не справляетесь прямо сейчас, 
            пожалуйста, обратитесь к специалистам экстренных служб.
          </p>
        </div>

        <Disclaimer variant="error" title="Важное уточнение">
          Этот ресурс и консультации наших психологов <strong>не являются службой экстренной помощи</strong>. 
          Мы не можем гарантировать мгновенный ответ в моменте кризиса. Пожалуйста, используйте контакты ниже для немедленной связи.
        </Disclaimer>

        <div className="grid gap-6 mt-10" role="list" aria-label="Контакты экстренных служб">
          {emergencyServices.map((service, index) => (
            <Card key={index} className={`p-0 overflow-hidden border-2 ${service.primary ? 'border-red-200 shadow-md' : 'border-slate-100'}`}>
              <div className="flex flex-col md:flex-row">
                {service.primary && (
                  <div className="bg-red-600 text-white flex items-center justify-center p-6 md:w-32">
                    <span className="text-4xl font-black">112</span>
                  </div>
                )}
                <div className="p-6 flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
                    <h2 className="text-xl font-bold text-slate-900 leading-tight">
                      {service.title}
                    </h2>
                    <span className="text-2xl font-black text-indigo-600 whitespace-nowrap">
                      {service.number}
                    </span>
                  </div>
                  <p className="text-slate-600 mb-6 leading-relaxed">
                    {service.desc}
                  </p>
                  <a 
                    href={`tel:${service.number.replace(/[^0-9+]/g, '')}`}
                    role="button"
                    className={`inline-flex items-center justify-center rounded-pill px-6 py-3 font-medium transition-all ${
                      service.primary 
                        ? "bg-red-600 hover:bg-red-700 text-white shadow-sm" 
                        : "bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-200"
                    } w-full sm:w-auto`}
                    onClick={() => handleCall(service.number, service.title)}
                    aria-label={`Позвонить ${service.title} ${service.number}`}
                  >
                    Позвонить {service.number}
                  </a>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="mt-16 bg-white rounded-2xl p-8 border border-slate-200 text-center shadow-sm">
          <h3 className="text-2xl font-bold text-slate-900 mb-4">
            Другие способы помощи
          </h3>
          <p className="text-slate-600 mb-8 max-w-xl mx-auto">
            Если ваша ситуация позволяет подождать, вы можете ознакомиться с нашими материалами 
            по самопомощи или запланировать обычную консультацию.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="secondary" onClick={() => {
              track('crisis_help_click', { action: 'back_to_resources' });
              router.push('/start');
            }}>
              Библиотека практик
            </Button>
            <Button variant="secondary" onClick={() => {
              track('crisis_help_click', { action: 'go_home' });
              router.push('/');
            }}>
              Вернуться на главную
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
