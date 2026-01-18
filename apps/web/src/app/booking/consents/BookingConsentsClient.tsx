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
  const fieldIds = React.useMemo(
    () => ({
      email: 'consents-email',
      phone: 'consents-phone',
      personal: 'consents-personal-data',
      communications: 'consents-communications',
      telegram: 'consents-telegram',
    }),
    [],
  );
  const errorSummaryRef = React.useRef<HTMLDivElement>(null);
  const [email, setEmail] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [consents, setConsents] = React.useState({
    personal_data: false,
    communications: false,
    telegram: false,
  });
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [formError, setFormError] = React.useState<string | null>(null);
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

  React.useEffect(() => {
    if (Object.keys(errors).length > 0) {
      errorSummaryRef.current?.focus();
    }
  }, [errors]);

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (!emailPattern.test(email)) {
      nextErrors.email = 'Введите корректный email.';
    }
    if (!consents.personal_data) {
      nextErrors.personal_data = 'Нужно согласие на обработку персональных данных.';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError(null);
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
      setFormError(err.message || 'Не удалось сохранить согласия. Попробуйте ещё раз.');
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
      {Object.keys(errors).length > 0 && (
        <div
          ref={errorSummaryRef}
          tabIndex={-1}
          role="alert"
          aria-live="assertive"
          className="rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive"
        >
          <p className="font-semibold">Пожалуйста, проверьте форму:</p>
          <ul className="mt-2 list-disc pl-5">
            {Object.entries(errors).map(([key, message]) => (
              <li key={key}>
                <a
                  className="underline underline-offset-2"
                  href={`#${key === 'email' ? fieldIds.email : fieldIds.personal}`}
                >
                  {message}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
      {formError && (
        <div role="alert" aria-live="polite" className="rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
          {formError}
        </div>
      )}

      <Card className="p-6">
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor={fieldIds.email}>Email для подтверждений</Label>
            <Input
              id={fieldIds.email}
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="name@example.com"
              required
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? `${fieldIds.email}-error` : undefined}
            />
            {errors.email && (
              <p id={`${fieldIds.email}-error`} className="text-xs text-destructive">
                {errors.email}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor={fieldIds.phone}>Телефон (необязательно)</Label>
            <Input
              id={fieldIds.phone}
              type="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="+7 (999) 000-00-00"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Checkbox
                id={fieldIds.personal}
                checked={consents.personal_data}
                onCheckedChange={(checked) => setConsents((prev) => ({ ...prev, personal_data: !!checked }))}
                aria-invalid={!!errors.personal_data}
                aria-describedby={errors.personal_data ? `${fieldIds.personal}-error` : undefined}
              />
              <Label htmlFor={fieldIds.personal} className="text-sm leading-relaxed">
                Я даю согласие на обработку персональных данных и подтверждаю, что ознакомился с{' '}
                <Link href="/legal/personal-data-consent" className="text-primary underline underline-offset-2">
                  текстом согласия
                </Link>.
              </Label>
            </div>
            {errors.personal_data && (
              <p id={`${fieldIds.personal}-error`} className="text-xs text-destructive">
                {errors.personal_data}
              </p>
            )}
            <div className="flex items-start gap-3">
              <Checkbox
                id={fieldIds.communications}
                checked={consents.communications}
                onCheckedChange={(checked) => setConsents((prev) => ({ ...prev, communications: !!checked }))}
              />
              <Label htmlFor={fieldIds.communications} className="text-sm leading-relaxed">
                Разрешаю отправлять напоминания и сервисные сообщения по записи.
              </Label>
            </div>
            <div className="flex items-start gap-3">
              <Checkbox
                id={fieldIds.telegram}
                checked={consents.telegram}
                onCheckedChange={(checked) => setConsents((prev) => ({ ...prev, telegram: !!checked }))}
              />
              <Label htmlFor={fieldIds.telegram} className="text-sm leading-relaxed">
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
