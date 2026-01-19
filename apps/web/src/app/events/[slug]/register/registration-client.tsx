'use client';

import React from 'react';
import Link from 'next/link';
import { Alert, AlertDescription, Button, Card, Container, Section, Disclaimer } from '@psychology/design-system';
import { track } from '@/lib/tracking';

type PreferredContact = 'email' | 'telegram' | 'phone';

export function EventRegistrationClient({ event }: { event: any }) {
  const [preferredContact, setPreferredContact] = React.useState<PreferredContact>('email');
  const [contactValue, setContactValue] = React.useState('');
  const [personalDataConsent, setPersonalDataConsent] = React.useState(true);
  const [communicationsConsent, setCommunicationsConsent] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

  const submit = async () => {
    setLoading(true);
    setError(null);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001/api';
      const res = await fetch(`${apiUrl}/public/events/${event.slug}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          preferred_contact: preferredContact,
          contact_value: contactValue,
          consents: {
            personal_data: personalDataConsent,
            communications: communicationsConsent,
          },
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.message || 'Не удалось отправить заявку');
      }
      await res.json();
      track('event_registered', {
        event_slug: event.slug,
        preferred_contact: preferredContact,
      });
      setSuccess(true);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Section>
      <Container className="max-w-xl">
        <div className="space-y-4">
          <Link href={`/events/${event.slug}`} className="text-sm text-primary underline underline-offset-2">
            ← Назад к мероприятию
          </Link>
          <h1 className="text-3xl font-semibold">Регистрация</h1>
          <p className="text-muted-foreground">{event.title}</p>
        </div>

        <div className="mt-8 space-y-6">
          {success ? (
            <Card className="p-6 space-y-4">
              <h2 className="text-xl font-semibold">Заявка отправлена</h2>
              <p className="text-muted-foreground">
                Спасибо! Мы свяжемся с вами по выбранному контакту ближе к мероприятию.
              </p>
              <Button asChild variant="outline">
                <Link href="/events">Вернуться к списку</Link>
              </Button>
            </Card>
          ) : (
            <Card className="p-6 space-y-5">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium">Как лучше связаться?</label>
                <select
                  value={preferredContact}
                  onChange={(e) => setPreferredContact(e.target.value as PreferredContact)}
                  className="w-full rounded-md border border-border bg-background px-3 py-2"
                >
                  <option value="email">Email</option>
                  <option value="telegram">Telegram</option>
                  <option value="phone">Телефон</option>
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="contact-input" className="text-sm font-medium">Контакт</label>
                <input
                  id="contact-input"
                  value={contactValue}
                  onChange={(e) => setContactValue(e.target.value)}
                  className="w-full rounded-md border border-border bg-background px-3 py-2"
                  placeholder={preferredContact === 'telegram' ? '@username' : preferredContact === 'phone' ? '+7...' : 'name@example.com'}
                />
              </div>

              <div className="space-y-3 text-sm">
                <label className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    checked={personalDataConsent}
                    onChange={(e) => setPersonalDataConsent(e.target.checked)}
                    className="mt-1"
                  />
                  <span>Я согласен(на) на обработку персональных данных (обязательно)</span>
                </label>
                <label className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    checked={communicationsConsent}
                    onChange={(e) => setCommunicationsConsent(e.target.checked)}
                    className="mt-1"
                  />
                  <span>Можно прислать напоминание о мероприятии (необязательно)</span>
                </label>
              </div>

              <Button onClick={() => void submit()} disabled={loading || !personalDataConsent || !contactValue.trim()} className="w-full">
                {loading ? 'Отправляем...' : 'Отправить заявку'}
              </Button>

              <Disclaimer variant="info" title="Конфиденциальность">
                Мы используем контакт только для организации мероприятия. Это не экстренная помощь.
              </Disclaimer>
            </Card>
          )}
        </div>
      </Container>
    </Section>
  );
}

