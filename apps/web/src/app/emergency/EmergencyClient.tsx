'use client';

import React from 'react';
import { Disclaimer, Button } from '../../../../design-system/components';
import { spacing, typography, colors } from '../../../../design-system/tokens';
import { track } from '../../lib/tracking';

export default function EmergencyClient() {
  return (
    <main style={{ 
      padding: `${spacing.space[20]} ${spacing.space[6]}`,
      maxWidth: '800px',
      margin: '0 auto'
    }}>
      <h1 style={{
        ...typography.h1,
        marginBottom: spacing.space[8],
        color: colors.semantic.error.dark,
      }}>Экстренная помощь</h1>

      <Disclaimer variant="warning" title="Важное предупреждение">
        Этот сайт и предоставляемые через него услуги <strong>не являются</strong> службой экстренной помощи. 
        Мы не работаем в режиме реального времени и не можем гарантировать немедленный ответ.
      </Disclaimer>

      <section style={{ marginBottom: spacing.space[10] }} aria-labelledby="emergency-contacts-heading">
        <h2 id="emergency-contacts-heading" style={{ ...typography.h2, marginBottom: spacing.space[6], color: colors.text.primary }}>
          Контакты экстренных служб
        </h2>
        <p style={{ ...typography.body, marginBottom: spacing.space[6], color: colors.text.primary }}>
          Если вы чувствуете, что находитесь в опасности, думаете о причинении себе вреда или нуждаетесь в немедленной психологической поддержке, пожалуйста, воспользуйтесь контактами ниже. Они работают круглосуточно, бесплатно и анонимно.
        </p>

        <div style={{ 
          display: 'grid', 
          gap: spacing.space[4],
          gridTemplateColumns: '1fr',
        }} role="list" aria-label="Список служб экстренной помощи">
          {[
            {
              title: 'Всероссийский детский телефон доверия',
              number: '8-800-2000-122',
              desc: 'Для детей, подростков и их родителей. Круглосуточно, бесплатно.',
            },
            {
              title: 'Экстренная психологическая помощь МЧС России',
              number: '+7 (495) 989-50-50',
              desc: 'Круглосуточная психологическая поддержка.',
            },
            {
              title: 'Московская служба психологической помощи населению',
              number: '051',
              desc: 'С городского телефона. С мобильного: 8-495-051. Бесплатно, круглосуточно.',
            },
            {
              title: 'Единый номер экстренных служб',
              number: '112',
              desc: 'Для вызова скорой помощи или полиции.',
            },
          ].map((service, index) => (
            <div key={index} role="listitem" style={{
              padding: spacing.space[6],
              backgroundColor: colors.bg.secondary,
              borderRadius: '12px',
              borderLeft: `4px solid ${colors.brand.primary.DEFAULT}`,
            }}>
              <h3 style={{ ...typography.h3, marginBottom: spacing.space[2], fontSize: '20px' }}>
                {service.title}
              </h3>
              <div style={{ 
                ...typography.h2, 
                color: colors.brand.primary.dark,
                marginBottom: spacing.space[2],
              }}>
                <a 
                  href={`tel:${service.number.replace(/[^0-9+]/g, '')}`} 
                  style={{ color: 'inherit', textDecoration: 'none' }}
                  onClick={() => track('crisis_help_click', { action: `call_${service.title.toLowerCase().replace(/\s+/g, '_')}` })}
                  aria-label={`Позвонить в ${service.title}: ${service.number}`}
                >
                  {service.number}
                </a>
              </div>
              <p style={{ ...typography.bodySmall, color: colors.text.secondary, margin: 0 }}>
                {service.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section style={{ 
        padding: spacing.space[8],
        backgroundColor: colors.bg.tertiary,
        borderRadius: '16px',
        textAlign: 'center',
      }}>
        <h2 style={{ ...typography.h2, marginBottom: spacing.space[4] }}>Вернуться на сайт</h2>
        <p style={{ ...typography.body, marginBottom: spacing.space[6] }}>
          Если ваша ситуация не является экстренной, вы можете ознакомиться с материалами блога или записаться на обычную консультацию.
        </p>
        <div style={{ display: 'flex', gap: spacing.space[4], justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button variant="primary" onClick={() => {
            track('crisis_help_click', { action: 'go_home' });
            window.location.href = '/';
          }}>
            На главную
          </Button>
          <Button variant="secondary" onClick={() => {
            track('crisis_help_click', { action: 'go_blog' });
            window.location.href = '/blog';
          }}>
            Перейти в блог
          </Button>
        </div>
      </section>
    </main>
  );
}
