'use client';

import React from 'react';
import { Container, ProgressBar, Section } from '@psychology/design-system';

interface BookingStepLayoutProps {
  title: string;
  description?: string;
  step: number;
  total: number;
  children: React.ReactNode;
}

export function BookingStepLayout({ title, description, step, total, children }: BookingStepLayoutProps) {
  const progressValue = Math.min(100, Math.max(0, (step / total) * 100));

  return (
    <Section>
      <Container className="max-w-4xl">
        <div className="flex flex-col gap-8">
          <div className="space-y-4">
            <ProgressBar value={progressValue} label={`Шаг ${step} из ${total}`} showValue />
            <div>
              <h1 className="text-3xl font-bold text-foreground">{title}</h1>
              {description && (
                <p className="mt-2 text-muted-foreground">{description}</p>
              )}
            </div>
          </div>
          {children}
        </div>
      </Container>
    </Section>
  );
}
