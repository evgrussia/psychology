'use client';

import React from 'react';
import { Disclaimer, Button, Card, Container, Section } from '@psychology/design-system/components';
import { spacing, typography, colors, effects } from '@psychology/design-system/tokens';
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
    <main style={{ backgroundColor: 'var(--color-bg-primary)', minHeight: '100vh' }}>
      <Section spacingSize="lg">
        <Container maxWidth="800px">
          <header style={{ textAlign: 'center', marginBottom: 'var(--space-12)' }}>
            <h1 style={{ 
              ...typography.hero, 
              color: 'var(--color-text-primary)', 
              marginBottom: 'var(--space-4)' 
            }}>
              Экстренная помощь
            </h1>
            <p style={{ 
              ...typography.body.lg, 
              color: 'var(--color-text-secondary)',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              Если вы чувствуете, что находитесь в опасности или не справляетесь прямо сейчас, 
              пожалуйста, обратитесь к специалистам экстренных служб.
            </p>
          </header>

          <Disclaimer variant="error" title="Важное уточнение">
            Этот ресурс и консультации наших психологов <strong>не являются службой экстренной помощи</strong>. 
            Мы не можем гарантировать мгновенный ответ в моменте кризиса. Пожалуйста, используйте контакты ниже для немедленной связи.
          </Disclaimer>

          <div 
            style={{ display: 'grid', gap: 'var(--space-6)', marginTop: 'var(--space-10)' }} 
            role="list" 
            aria-label="Контакты экстренных служб"
          >
            {emergencyServices.map((service, index) => (
              <Card 
                key={index} 
                style={{ 
                  padding: 0, 
                  overflow: 'hidden', 
                  border: service.primary ? `2px solid var(--color-error)` : `1px solid var(--color-border-primary)`,
                  boxShadow: service.primary ? 'var(--shadow-md)' : 'var(--shadow-sm)'
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <div style={{ padding: 'var(--space-6)', flex: 1 }}>
                    <div style={{ 
                      display: 'flex', 
                      flexDirection: 'row', 
                      alignItems: 'center', 
                      justifyContent: 'space-between', 
                      gap: 'var(--space-4)', 
                      marginBottom: 'var(--space-3)' 
                    }}>
                      <h2 style={{ 
                        ...typography.h3, 
                        margin: 0,
                        color: 'var(--color-text-primary)' 
                      }}>
                        {service.title}
                      </h2>
                      <span style={{ 
                        ...typography.h2, 
                        color: service.primary ? 'var(--color-error)' : 'var(--color-brand-primary)',
                        fontWeight: 800,
                        whiteSpace: 'nowrap'
                      }}>
                        {service.number}
                      </span>
                    </div>
                    <p style={{ 
                      ...typography.body.md, 
                      color: 'var(--color-text-secondary)',
                      marginBottom: 'var(--space-6)',
                      lineHeight: 1.6
                    }}>
                      {service.desc}
                    </p>
                    <Button 
                      variant={service.primary ? "primary" : "secondary"}
                      fullWidth
                      onClick={() => handleCall(service.number, service.title)}
                      aria-label={`Позвонить ${service.title} ${service.number}`}
                    >
                      Позвонить {service.number}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div style={{ 
            marginTop: 'var(--space-16)', 
            backgroundColor: 'var(--color-bg-secondary)', 
            borderRadius: 'var(--radius-lg)', 
            padding: 'var(--space-8)', 
            textAlign: 'center',
            border: `1px solid var(--color-border-primary)`
          }}>
            <h3 style={{ ...typography.h3, color: 'var(--color-text-primary)', marginBottom: 'var(--space-4)' }}>
              Другие способы помощи
            </h3>
            <p style={{ ...typography.body.md, color: 'var(--color-text-secondary)', marginBottom: 'var(--space-8)', maxWidth: '600px', margin: '0 auto var(--space-8) auto' }}>
              Если ваша ситуация позволяет подождать, вы можете ознакомиться с нашими материалами 
              по самопомощи или запланировать обычную консультацию.
            </p>
            <div style={{ display: 'flex', flexDirection: 'row', gap: 'var(--space-4)', justifyContent: 'center', flexWrap: 'wrap' }}>
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
        </Container>
      </Section>
    </main>
  );
}
