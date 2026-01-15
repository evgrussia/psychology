'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button, Card, Checkbox, Input, Label } from '@psychology/design-system';
import { BookingStepLayout } from '../BookingStepLayout';
import { loadBookingDraft, saveBookingDraft } from '../bookingStorage';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function BookingConsentsClient() {
  const router = useRouter();
  const [email, setEmail] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [consents, setConsents] = React.useState({
    personal_data: false,
    communications: false,
    telegram: false,
  });
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    const draft = loadBookingDraft();
    if (!draft?.appointmentId) {
      router.replace('/booking/service');
      return;
    }
    if (draft.contactEmail) {
      setEmail(draft.contactEmail);
    }
  }, [router]);

  const validate = () => {
    if (!emailPattern.test(email)) {
      setErrorMessage('Введите корректный email.');
      return false;
    }
    if (!consents.personal_data) {
      setErrorMessage('Нужно согласие на обработку персональных данных.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMessage(null);
    if (!validate()) return;

    const draft = loadBookingDraft();
    if (!draft?.appointmentId) {
      router.replace('/booking/service');
      return;
    }

    setIsSubmitting(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001/api';
      const res = await fetch(`${apiUrl}/public/booking/${draft.appointmentId}/consents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          phone: phone || null,
          consents,
          source: 'booking',
        }),
      });

      if (!res.ok) {
        throw new Error('Не удалось сохранить согласия.');
      }

      saveBookingDraft({ contactEmail: email });
      router.push('/booking/payment');
    } catch (err: any) {
      setErrorMessage(err.message || 'Не удалось сохранить согласия. Попробуйте ещё раз.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <BookingStepLayout
      title="Согласия и контакт"
      description="Подтвердите документы и оставьте контакт для подтверждения записи."
      step={4}
      total={5}
    >
      {errorMessage && (
        <div role="alert" aria-live="polite" className="rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
          {errorMessage}
        </div>
      )}

      <Card className="p-6">
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="email">Email для подтверждений</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="name@example.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Телефон (необязательно)</Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="+7 (999) 000-00-00"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Checkbox
                id="personal_data"
                checked={consents.personal_data}
                onCheckedChange={(checked) => setConsents((prev) => ({ ...prev, personal_data: !!checked }))}
              />
              <Label htmlFor="personal_data" className="text-sm leading-relaxed">
                Я даю согласие на обработку персональных данных и подтверждаю, что ознакомился с{' '}
                <Link href="/legal/personal-data-consent" className="text-primary underline underline-offset-2">
                  текстом согласия
                </Link>.
              </Label>
            </div>
            <div className="flex items-start gap-3">
              <Checkbox
                id="communications"
                checked={consents.communications}
                onCheckedChange={(checked) => setConsents((prev) => ({ ...prev, communications: !!checked }))}
              />
              <Label htmlFor="communications" className="text-sm leading-relaxed">
                Разрешаю отправлять напоминания и сервисные сообщения по записи.
              </Label>
            </div>
            <div className="flex items-start gap-3">
              <Checkbox
                id="telegram"
                checked={consents.telegram}
                onCheckedChange={(checked) => setConsents((prev) => ({ ...prev, telegram: !!checked }))}
              />
              <Label htmlFor="telegram" className="text-sm leading-relaxed">
                Хочу получать полезные материалы в Telegram (можно отключить в любой момент).
              </Label>
            </div>
          </div>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Сохраняем...' : 'Перейти к оплате'}
          </Button>
        </form>
      </Card>
    </BookingStepLayout>
  );
}
