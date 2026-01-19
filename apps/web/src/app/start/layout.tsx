import React from 'react';
import { Disclaimer, Container, Section } from '@psychology/design-system';

export default function StartLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Section className="py-8">
        <Container className="max-w-3xl">
          <Disclaimer variant="info" showEmergencyLink title="Важно помнить">
            Материалы и практики на этой странице не являются экстренной помощью. Если вам нужна срочная поддержка,
            пожалуйста, обратитесь в экстренные службы.
          </Disclaimer>
        </Container>
      </Section>
    </>
  );
}
