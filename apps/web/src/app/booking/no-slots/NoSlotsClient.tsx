'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, Checkbox, Input, Label, RadioGroup, RadioGroupItem } from '@psychology/design-system';
import { BookingStepLayout } from '../BookingStepLayout';
import { loadBookingDraft } from '../bookingStorage';
import { getLeadId, track } from '@/lib/tracking';
import { createTelegramDeepLink } from '@/lib/telegram';
import { saveBookingDraft } from '../bookingStorage';

interface AlternativeSlot {
  id: string;
  start_at_utc: string;
  end_at_utc: string;
}

interface AlternativeDay {
  date: string;
  slot_count: number;
  first_slot: AlternativeSlot;
}

interface TimeWindowAlternative {
  window: 'weekday_morning' | 'weekday_evening' | 'weekend';
  slot: AlternativeSlot | null;
}

interface AlternativeService {
  id: string;
  slug: string;
  title: string;
  format: 'online' | 'offline' | 'hybrid';
  duration_minutes: number;
  price_amount: number;
  deposit_amount?: number | null;
  offline_address?: string | null;
}

interface FormatAlternative {
  service: AlternativeService;
  earliest_slot: AlternativeSlot | null;
}

interface BookingAlternativesResponse {
  status: 'available';
  timezone: string;
  service: {
    id: string;
    slug: string;
    title: string;
    format: 'online' | 'offline' | 'hybrid';
    topic_code?: string | null;
  };
  base_range: {
    from: string;
    to: string;
  };
  alternative_range: {
    from: string;
    to: string;
  };
  has_slots_in_range: boolean;
  next_slots: AlternativeSlot[];
  next_days: AlternativeDay[];
  time_windows: TimeWindowAlternative[];
  format_alternatives: FormatAlternative[];
}

const defaultRangeDays = 14;

const formatLabels: Record<AlternativeService['format'], string> = {
  online: 'Онлайн',
  offline: 'Офлайн',
  hybrid: 'Онлайн / офлайн',
};

const windowLabels: Record<TimeWindowAlternative['window'], string> = {
  weekday_morning: 'Будни, утро/день',
  weekday_evening: 'Будни, вечер',
  weekend: 'Выходные',
};

function formatDateTime(value: string, timezone: string) {
  const date = new Date(value);
  const dateFormatter = new Intl.DateTimeFormat('ru-RU', {
    timeZone: timezone,
    day: '2-digit',
    month: 'long',
    weekday: 'short',
  });
  const timeFormatter = new Intl.DateTimeFormat('ru-RU', {
    timeZone: timezone,
    hour: '2-digit',
    minute: '2-digit',
  });
  return {
    date: dateFormatter.format(date),
    time: timeFormatter.format(date),
  };
}

export function NoSlotsClient() {
  const router = useRouter();
  const fieldIds = React.useMemo(
    () => ({
      contactValue: 'waitlist-contact-value',
      personalData: 'waitlist-personal-data',
    }),
    [],
  );
  const errorSummaryRef = React.useRef<HTMLDivElement>(null);
  const [serviceSlug, setServiceSlug] = React.useState<string | null>(null);
  const [serviceTitle, setServiceTitle] = React.useState<string | null>(null);
  const [serviceFormat, setServiceFormat] = React.useState<'online' | 'offline' | 'hybrid' | null>(null);
  const [timezone, setTimezone] = React.useState<string>('');
  const [contactMethod, setContactMethod] = React.useState<'email' | 'phone' | 'telegram'>('email');
  const [contactValue, setContactValue] = React.useState('');
  const [preferredTimeWindow, setPreferredTimeWindow] = React.useState<'weekday_morning' | 'weekday_evening' | 'weekend' | 'any'>('any');
  const [consents, setConsents] = React.useState({ personal_data: false, communications: false });
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [formError, setFormError] = React.useState<string | null>(null);
  const [alternativesError, setAlternativesError] = React.useState<string | null>(null);
  const [alternativesLoading, setAlternativesLoading] = React.useState(false);
  const [alternatives, setAlternatives] = React.useState<null | BookingAlternativesResponse>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);

  React.useEffect(() => {
    const draft = loadBookingDraft();
    setServiceSlug(draft?.serviceSlug ?? null);
    setServiceTitle(draft?.serviceTitle ?? null);
    setServiceFormat(draft?.serviceFormat ?? null);
    setTimezone(draft?.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone);
  }, []);

  React.useEffect(() => {
    if (!serviceSlug || !timezone) return;
    const controller = new AbortController();
    const loadAlternatives = async () => {
      setAlternativesLoading(true);
      setAlternativesError(null);
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001/api';
        const url = new URL(`${apiUrl}/public/booking/alternatives`);
        url.searchParams.set('service_slug', serviceSlug);
        url.searchParams.set('tz', timezone);
        if (serviceFormat) {
          url.searchParams.set('format', serviceFormat);
        }
        const res = await fetch(url.toString(), { signal: controller.signal });
        if (!res.ok) {
          throw new Error('Не удалось загрузить альтернативные слоты.');
        }
        const data: BookingAlternativesResponse = await res.json();
        setAlternatives(data);
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          setAlternativesError(err.message || 'Не удалось загрузить альтернативные варианты.');
        }
      } finally {
        setAlternativesLoading(false);
      }
    };

    loadAlternatives();
    return () => controller.abort();
  }, [serviceSlug, timezone, serviceFormat]);

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

  React.useEffect(() => {
    if (Object.keys(errors).length > 0) {
      errorSummaryRef.current?.focus();
    }
  }, [errors]);

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
    setFormError(null);

    if (!serviceSlug) {
      setErrors({});
      setFormError('Сначала выберите услугу, чтобы оставить заявку.');
      return;
    }

    const normalized = normalizeContact();
    const nextErrors: Record<string, string> = {};
    if (!normalized) {
      nextErrors.contact_value = 'Проверьте контактные данные.';
    }
    if (!consents.personal_data) {
      nextErrors.personal_data = 'Нужно согласие на обработку персональных данных.';
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

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

      setErrors({});
      setSubmitted(true);
    } catch (err: any) {
      setFormError(err.message || 'Не удалось отправить заявку. Попробуйте ещё раз.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTelegramClick = async () => {
    setFormError(null);
    try {
      const { deepLinkId, url } = await createTelegramDeepLink({
        flow: 'concierge',
        source: 'booking_no_slots',
        tgTarget: 'bot',
      });

      track('cta_tg_click', {
        tg_target: 'bot',
        tg_flow: 'concierge',
        deep_link_id: deepLinkId,
      });

      window.location.href = url;
    } catch (error: any) {
      setFormError(error?.message || 'Не удалось открыть Telegram. Попробуйте ещё раз.');
    }
  };

  const handleAlternativeSlot = async (slot: AlternativeSlot, overrideService?: AlternativeService) => {
    setFormError(null);
    if (!timezone) {
      setFormError('Не удалось определить таймзону. Попробуйте обновить страницу.');
      return;
    }

    const draft = loadBookingDraft() ?? {};
    const resolvedServiceSlug = overrideService?.slug ?? serviceSlug;
    if (!resolvedServiceSlug) {
      setFormError('Сначала выберите услугу, чтобы продолжить.');
      return;
    }

    let clientRequestId = draft.clientRequestId;
    if (!clientRequestId) {
      clientRequestId = crypto.randomUUID();
      saveBookingDraft({ clientRequestId });
    }

    const baseFormat = serviceFormat
      ?? (alternatives?.service.format === 'hybrid' ? 'online' : alternatives?.service.format);
    const resolvedFormat = overrideService?.format === 'hybrid'
      ? (serviceFormat === 'offline' ? 'offline' : 'online')
      : overrideService?.format ?? baseFormat ?? undefined;

    if (overrideService) {
      saveBookingDraft({
        serviceId: overrideService.id,
        serviceSlug: overrideService.slug,
        serviceTitle: overrideService.title,
        serviceFormat: resolvedFormat ?? overrideService.format,
        serviceDuration: overrideService.duration_minutes,
        priceAmount: overrideService.price_amount,
        depositAmount: overrideService.deposit_amount ?? null,
      });
    }

    setIsSubmitting(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001/api';
      const res = await fetch(`${apiUrl}/public/booking/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_slug: resolvedServiceSlug,
          slot_id: slot.id,
          timezone,
          format: resolvedFormat,
          client_request_id: clientRequestId,
          lead_id: getLeadId(),
        }),
      });

      if (!res.ok) {
        if (res.status === 409) {
          const data = await res.json().catch(() => null);
          if (data?.code === 'slot_conflict') {
            setFormError('Этот слот уже заняли. Пожалуйста, выберите другой вариант.');
            return;
          }
        }
        throw new Error('Не удалось забронировать слот.');
      }

      const data = await res.json();
      saveBookingDraft({
        appointmentId: data.appointment_id,
        slotId: slot.id,
        slotStartAtUtc: slot.start_at_utc,
        slotEndAtUtc: slot.end_at_utc,
        timezone,
      });

      track('booking_slot_selected', {
        slot_start_at: slot.start_at_utc,
        timezone,
        service_slug: resolvedServiceSlug,
      });

      router.push('/booking/intake');
    } catch (err: any) {
      setFormError(err.message || 'Не удалось забронировать слот. Попробуйте ещё раз.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSwitchFormat = (nextFormat: 'online' | 'offline') => {
    saveBookingDraft({ serviceFormat: nextFormat });
    setServiceFormat(nextFormat);
    router.push('/booking/slot');
  };

  return (
    <BookingStepLayout
      title="Пока нет свободных слотов"
      description="Оставьте заявку в лист ожидания или выберите другой формат связи."
      step={2}
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
                  href={`#${key === 'contact_value' ? fieldIds.contactValue : fieldIds.personalData}`}
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

      {alternativesLoading && (
        <Card className="p-6 text-sm text-muted-foreground" aria-live="polite">
          Подбираем ближайшие альтернативы...
        </Card>
      )}

      {alternativesError && (
        <div role="alert" aria-live="polite" className="rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
          {alternativesError}
        </div>
      )}

      {alternatives?.status === 'available' && alternatives.next_slots.length > 0 && (
        <Card className="p-6 space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Ближайшие доступные слоты</h2>
            <p className="text-sm text-muted-foreground">
              Вот несколько ближайших вариантов за пределами ближайших {defaultRangeDays} дней.
            </p>
          </div>
          <div className="space-y-3">
            {alternatives.next_slots.map((slot) => {
              const formatted = formatDateTime(slot.start_at_utc, alternatives.timezone);
              return (
                <div key={slot.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border p-4">
                  <div>
                    <div className="font-medium text-foreground">{formatted.date}</div>
                    <div className="text-sm text-muted-foreground">{formatted.time}</div>
                  </div>
                  <Button onClick={() => handleAlternativeSlot(slot)} disabled={isSubmitting}>
                    Выбрать
                  </Button>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {alternatives?.status === 'available' && alternatives.next_days.length > 0 && (
        <Card className="p-6 space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Ближайшие свободные дни</h2>
            <p className="text-sm text-muted-foreground">
              Выберите ближайший день с доступными слотами.
            </p>
          </div>
          <div className="space-y-3">
            {alternatives.next_days.map((day) => {
              const formatted = formatDateTime(day.first_slot.start_at_utc, alternatives.timezone);
              return (
                <div key={day.date} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border p-4">
                  <div>
                    <div className="font-medium text-foreground">{formatted.date}</div>
                    <div className="text-sm text-muted-foreground">
                      Доступно слотов: {day.slot_count}. Первый: {formatted.time}
                    </div>
                  </div>
                  <Button onClick={() => handleAlternativeSlot(day.first_slot)} disabled={isSubmitting}>
                    Выбрать
                  </Button>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {alternatives?.status === 'available' && alternatives.time_windows.length > 0 && (
        <Card className="p-6 space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Другие временные окна</h2>
            <p className="text-sm text-muted-foreground">
              Можно подобрать слот в другом промежутке дня.
            </p>
          </div>
          <div className="space-y-3">
            {alternatives.time_windows.map((window) => (
              <div key={window.window} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border p-4">
                <div>
                  <div className="font-medium text-foreground">{windowLabels[window.window]}</div>
                  <div className="text-sm text-muted-foreground">
                    {window.slot ? formatDateTime(window.slot.start_at_utc, alternatives.timezone).date : 'Нет ближайших слотов'}
                    {window.slot ? ` · ${formatDateTime(window.slot.start_at_utc, alternatives.timezone).time}` : ''}
                  </div>
                </div>
                <Button onClick={() => window.slot && handleAlternativeSlot(window.slot)} disabled={!window.slot || isSubmitting}>
                  Выбрать
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {alternatives?.service.format === 'hybrid' && (
        <Card className="p-6 space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Сменить формат консультации</h2>
          <p className="text-sm text-muted-foreground">
            Если формат не принципиален, попробуйте другой вариант консультации.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button
              variant={serviceFormat === 'online' ? 'outline' : 'default'}
              onClick={() => handleSwitchFormat('online')}
            >
              Онлайн
            </Button>
            <Button
              variant={serviceFormat === 'offline' ? 'outline' : 'default'}
              onClick={() => handleSwitchFormat('offline')}
            >
              Офлайн
            </Button>
          </div>
        </Card>
      )}

      {alternatives?.status === 'available' && alternatives.format_alternatives.length > 0 && (
        <Card className="p-6 space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Другие форматы консультации</h2>
            <p className="text-sm text-muted-foreground">
              Есть услуги с другим форматом и ближайшим временем.
            </p>
          </div>
          <div className="space-y-3">
            {alternatives.format_alternatives.map((alt) => {
              const formatted = alt.earliest_slot
                ? formatDateTime(alt.earliest_slot.start_at_utc, alternatives.timezone)
                : null;
              return (
                <div key={alt.service.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border p-4">
                  <div>
                    <div className="font-medium text-foreground">{alt.service.title}</div>
                    <div className="text-sm text-muted-foreground">
                      Формат: {formatLabels[alt.service.format]}
                      {formatted ? ` · ближайший слот ${formatted.date} ${formatted.time}` : ''}
                    </div>
                  </div>
                  <Button
                    onClick={() => alt.earliest_slot && handleAlternativeSlot(alt.earliest_slot, alt.service)}
                    disabled={!alt.earliest_slot || isSubmitting}
                  >
                    Выбрать
                  </Button>
                </div>
              );
            })}
          </div>
        </Card>
      )}

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
              <Label htmlFor={fieldIds.contactValue}>
                {contactMethod === 'email' && 'Email'}
                {contactMethod === 'phone' && 'Телефон'}
                {contactMethod === 'telegram' && 'Ваш Telegram'}
              </Label>
              <Input
                id={fieldIds.contactValue}
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
                aria-invalid={!!errors.contact_value}
                aria-describedby={errors.contact_value ? `${fieldIds.contactValue}-error` : undefined}
              />
              {errors.contact_value && (
                <p id={`${fieldIds.contactValue}-error`} className="text-xs text-destructive">
                  {errors.contact_value}
                </p>
              )}
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
                  id={fieldIds.personalData}
                  checked={consents.personal_data}
                  onCheckedChange={(checked) => setConsents((prev) => ({ ...prev, personal_data: !!checked }))}
                  aria-invalid={!!errors.personal_data}
                  aria-describedby={errors.personal_data ? `${fieldIds.personalData}-error` : undefined}
                />
                <Label htmlFor={fieldIds.personalData} className="text-sm leading-relaxed">
                  Даю согласие на обработку персональных данных.
                </Label>
              </div>
              {errors.personal_data && (
                <p id={`${fieldIds.personalData}-error`} className="text-xs text-destructive">
                  {errors.personal_data}
                </p>
              )}
              <div className="flex items-start gap-3">
                <Checkbox
                  id="waitlist-communications"
                  checked={consents.communications}
                  onCheckedChange={(checked) => setConsents((prev) => ({ ...prev, communications: !!checked }))}
                />
                <Label htmlFor="waitlist-communications" className="text-sm leading-relaxed">
                  Разрешаю связаться со мной по поводу листа ожидания (иначе мы не сможем сообщить о слотах).
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
