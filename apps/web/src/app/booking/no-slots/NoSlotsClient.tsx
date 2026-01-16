'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, Checkbox, Input, Label, RadioGroup, RadioGroupItem } from '@psychology/design-system';
import { BookingStepLayout } from '../BookingStepLayout';
import { loadBookingDraft } from '../bookingStorage';
import { track } from '@/lib/tracking';
import { buildTelegramDeepLink, generateDeepLinkId } from '@/lib/telegram';

export function NoSlotsClient() {
  const router = useRouter();
  const [serviceSlug, setServiceSlug] = React.useState<string | null>(null);
  const [serviceTitle, setServiceTitle] = React.useState<string | null>(null);
  const [contactMethod, setContactMethod] = React.useState<'email' | 'phone' | 'telegram'>('email');
  const [contactValue, setContactValue] = React.useState('');
  const [preferredTimeWindow, setPreferredTimeWindow] = React.useState<'weekday_morning' | 'weekday_evening' | 'weekend' | 'any'>('any');
  const [consents, setConsents] = React.useState({ personal_data: false, communications: false });
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);

  React.useEffect(() => {
    const draft = loadBookingDraft();
    setServiceSlug(draft?.serviceSlug ?? null);
    setServiceTitle(draft?.serviceTitle ?? null);
  }, []);

  React.useEffect(() => {
    if (!serviceSlug || typeof window === 'undefined') return;
    const key = `no_slots_tracked_${serviceSlug}`;
    if (sessionStorage.getItem(key)) return;
    track('show_no_slots', {
      service_slug: serviceSlug,
      date_range: 'next_14d',
    });
    sessionStorage.setItem(key, '1');
  }, [serviceSlug]);

  const normalizeContact = () => {
    const trimmed = contactValue.trim();
    if (!trimmed) return null;
    if (contactMethod === 'phone') {
      const digits = trimmed.replace(/\D/g, '');
      return digits.length >= 10 && digits.length <= 15 ? digits : null;
    }
    if (contactMethod === 'email') {
      const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return pattern.test(trimmed) ? trimmed : null;
    }
    return trimmed.startsWith('@') ? trimmed : `@${trimmed}`;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMessage(null);

    if (!serviceSlug) {
      setErrorMessage('Сначала выберите услугу, чтобы оставить заявку.');
      return;
    }

    if (!consents.personal_data) {
      setErrorMessage('Нужно согласие на обработку персональных данных.');
      return;
    }

    if (!consents.communications) {
      setErrorMessage('Без согласия на коммуникации мы не сможем связаться. Можно перейти в Telegram-консьерж.');
      return;
    }

    const normalized = normalizeContact();
    if (!normalized) {
      setErrorMessage('Проверьте контактные данные.');
      return;
    }

    setIsSubmitting(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001/api';
      const res = await fetch(`${apiUrl}/public/waitlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_slug: serviceSlug,
          preferred_contact: contactMethod,
          contact_value: normalized,
          preferred_time_window: preferredTimeWindow,
          consents: {
            personal_data: consents.personal_data,
            communications: consents.communications,
          },
          source: 'web',
        }),
      });

      if (!res.ok) {
        throw new Error('Не удалось отправить заявку. Попробуйте ещё раз.');
      }

      track('waitlist_submitted', {
        service_slug: serviceSlug,
        preferred_contact: contactMethod,
        preferred_time_window: preferredTimeWindow,
      });

      setSubmitted(true);
    } catch (err: any) {
      setErrorMessage(err.message || 'Не удалось отправить заявку. Попробуйте ещё раз.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTelegramClick = () => {
    const deepLinkId = generateDeepLinkId();
    const url = buildTelegramDeepLink({
      deepLinkId,
      flow: 'concierge',
      source: 'booking_no_slots',
    });

    track('cta_tg_click', {
      tg_target: 'bot',
      tg_flow: 'concierge',
      deep_link_id: deepLinkId,
    });

    window.location.href = url;
  };

  return (
    <BookingStepLayout
      title="Пока нет свободных слотов"
      description="Оставьте заявку в лист ожидания или выберите другой формат связи."
      step={2}
      total={5}
    >
      {errorMessage && (
        <div role="alert" aria-live="polite" className="rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
          {errorMessage}
        </div>
      )}
      <Card className="p-6 space-y-4">
        <p className="text-sm text-muted-foreground">
          Мы можем сообщить, когда появится новое время. Также можно написать в Telegram-консьерж и подобрать вариант.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => router.push('/start')} variant="outline">
            С чего начать
          </Button>
          <Button onClick={handleTelegramClick}>Написать в Telegram</Button>
        </div>
      </Card>

      <Card className="p-6">
        {submitted ? (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">Заявка в лист ожидания отправлена</h2>
            <p className="text-sm text-muted-foreground">
              Мы свяжемся, как только появится подходящее время. Если хочется подобрать вариант быстрее, можно написать в Telegram-консьерж.
            </p>
            <Button onClick={handleTelegramClick}>Перейти в Telegram</Button>
          </div>
        ) : (
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label className="text-sm">Как с вами связаться?</Label>
              <RadioGroup value={contactMethod} onValueChange={(value) => setContactMethod(value as typeof contactMethod)} className="space-y-2">
                <div className="flex items-center gap-3">
                  <RadioGroupItem id="contact-email" value="email" />
                  <Label htmlFor="contact-email">Email</Label>
                </div>
                <div className="flex items-center gap-3">
                  <RadioGroupItem id="contact-phone" value="phone" />
                  <Label htmlFor="contact-phone">Телефон</Label>
                </div>
                <div className="flex items-center gap-3">
                  <RadioGroupItem id="contact-telegram" value="telegram" />
                  <Label htmlFor="contact-telegram">Telegram</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact-value">
                {contactMethod === 'email' && 'Email'}
                {contactMethod === 'phone' && 'Телефон'}
                {contactMethod === 'telegram' && 'Ваш Telegram'}
              </Label>
              <Input
                id="contact-value"
                type={contactMethod === 'email' ? 'email' : 'text'}
                value={contactValue}
                onChange={(event) => setContactValue(event.target.value)}
                placeholder={
                  contactMethod === 'email'
                    ? 'name@example.com'
                    : contactMethod === 'phone'
                    ? '+7 (999) 000-00-00'
                    : '@username'
                }
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Когда удобнее?</Label>
              <RadioGroup
                value={preferredTimeWindow}
                onValueChange={(value) => setPreferredTimeWindow(value as typeof preferredTimeWindow)}
                className="space-y-2"
              >
                <div className="flex items-center gap-3">
                  <RadioGroupItem id="time-any" value="any" />
                  <Label htmlFor="time-any">Любое время</Label>
                </div>
                <div className="flex items-center gap-3">
                  <RadioGroupItem id="time-weekday-morning" value="weekday_morning" />
                  <Label htmlFor="time-weekday-morning">Будни, утро/день</Label>
                </div>
                <div className="flex items-center gap-3">
                  <RadioGroupItem id="time-weekday-evening" value="weekday_evening" />
                  <Label htmlFor="time-weekday-evening">Будни, вечер</Label>
                </div>
                <div className="flex items-center gap-3">
                  <RadioGroupItem id="time-weekend" value="weekend" />
                  <Label htmlFor="time-weekend">Выходные</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="waitlist-personal-data"
                  checked={consents.personal_data}
                  onCheckedChange={(checked) => setConsents((prev) => ({ ...prev, personal_data: !!checked }))}
                />
                <Label htmlFor="waitlist-personal-data" className="text-sm leading-relaxed">
                  Даю согласие на обработку персональных данных.
                </Label>
              </div>
              <div className="flex items-start gap-3">
                <Checkbox
                  id="waitlist-communications"
                  checked={consents.communications}
                  onCheckedChange={(checked) => setConsents((prev) => ({ ...prev, communications: !!checked }))}
                />
                <Label htmlFor="waitlist-communications" className="text-sm leading-relaxed">
                  Разрешаю связаться со мной по поводу листа ожидания.
                </Label>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Отправляем...' : 'Оставить заявку'}
              </Button>
              <Button type="button" variant="outline" onClick={handleTelegramClick}>
                Telegram-консьерж
              </Button>
            </div>

            {serviceTitle && (
              <p className="text-xs text-muted-foreground">
                Услуга: {serviceTitle}
              </p>
            )}
          </form>
        )}
      </Card>
    </BookingStepLayout>
  );
}
