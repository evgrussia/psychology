'use client';

import React from 'react';
import { Button, Card, Container, Section } from '@psychology/design-system';

export function FavoritesClient() {
  return (
    <Section>
      <Container className="max-w-3xl">
        <Card className="p-8 space-y-4 text-center">
          <h1 className="text-3xl font-bold text-foreground">Избранное</h1>
          <p className="text-muted-foreground">
            Аптечка с сохранёнными материалами появится в следующей итерации.
            Пока можно вернуться к практикам или записи.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={() => (window.location.href = '/start')}>
              Вернуться к практикам
            </Button>
            <Button variant="outline" onClick={() => (window.location.href = '/booking')}>
              Записаться
            </Button>
          </div>
        </Card>
      </Container>
    </Section>
  );
}
