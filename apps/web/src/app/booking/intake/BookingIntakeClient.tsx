'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  Button,
  Card,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from '@psychology/design-system';
import { track } from '@/lib/tracking';
import { BookingStepLayout } from '../BookingStepLayout';
import { loadBookingDraft } from '../bookingStorage';

const NOTES_LIMIT = 500;

const topics = [
  { value: 'anxiety', label: 'Тревога' },
  { value: 'burnout', label: 'Выгорание' },
  { value: 'relationships', label: 'Отношения' },
  { value: 'boundaries', label: 'Границы' },
  { value: 'selfesteem', label: 'Самооценка' },
  { value: 'other', label: 'Другое' },
];

const goals = [
  { value: 'clarity', label: 'Прояснить ситуацию' },
  { value: 'support', label: 'Получить поддержку' },
  { value: 'skills', label: 'Разобрать навыки и стратегии' },
  { value: 'decision', label: 'Принять решение' },
];

const experiences = [
  { value: 'first_time', label: 'Это первая консультация' },
  { value: 'had_before', label: 'Опыт был ранее' },
];

const intensityLevels = [
  { value: 'low', label: 'Низкая' },
  { value: 'moderate', label: 'Средняя' },
  { value: 'high', label: 'Высокая' },
];

const focusAreas = [
  { value: 'state', label: 'Состояние и поддержка' },
  { value: 'actions', label: 'План действий' },
  { value: 'boundaries', label: 'Границы и отношения' },
];

export function BookingIntakeClient() {
  const router = useRouter();
  const fieldIds = React.useMemo(
    () => ({
      topic: 'intake-topic',
      goal: 'intake-goal',
      experience: 'intake-experience',
      intensity: 'intake-intensity',
      focus: 'intake-focus',
      notes: 'intake-notes',
    }),
    [],
  );
  const errorSummaryRef = React.useRef<HTMLDivElement>(null);
  const [answers, setAnswers] = React.useState<Record<string, string>>({
    topic: '',
    goal: '',
    experience: '',
    intensity: '',
    focus: '',
  });
  const [notes, setNotes] = React.useState('');
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    const draft = loadBookingDraft();
    if (!draft?.appointmentId || !draft.serviceSlug) {
      router.replace('/booking/service');
      return;
    }
    track('intake_started', {
      service_slug: draft.serviceSlug,
    });
  }, [router]);

  React.useEffect(() => {
    if (Object.keys(errors).length > 0) {
      errorSummaryRef.current?.focus();
    }
  }, [errors]);

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    Object.entries(answers).forEach(([key, value]) => {
      if (!value) {
        nextErrors[key] = 'Пожалуйста, выберите вариант.';
      }
    });
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMessage(null);
    if (!validate()) {
      return;
    }

    const draft = loadBookingDraft();
    if (!draft?.appointmentId) {
      router.replace('/booking/service');
      return;
    }

    setIsSubmitting(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001/api';
      const payload = {
        ...answers,
        notes: notes.trim() || null,
      };

      const res = await fetch(`${apiUrl}/public/booking/${draft.appointmentId}/intake`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payload }),
      });

      if (!res.ok) {
        throw new Error('Не удалось отправить анкету.');
      }

      track('intake_submitted', {
        service_slug: draft.serviceSlug,
        has_text_fields: notes.trim().length > 0,
      });

      router.push('/booking/consents');
    } catch (err: any) {
      setErrorMessage(err.message || 'Не удалось отправить анкету. Попробуйте снова.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <BookingStepLayout
      title="Короткая анкета"
      description="Ответы помогут подготовиться к первой встрече. Не указывайте персональные данные."
      step={3}
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
          <p className="font-semibold">Пожалуйста, проверьте ответы:</p>
          <ul className="mt-2 list-disc pl-5">
            {Object.entries(errors).map(([key, message]) => (
              <li key={key}>
                <a className="underline underline-offset-2" href={`#${fieldIds[key as keyof typeof fieldIds]}`}>
                  {message}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
      {errorMessage && (
        <div role="alert" aria-live="polite" className="rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
          {errorMessage}
        </div>
      )}

      <Card className="p-6">
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor={fieldIds.topic}>С чем хотите поработать?</Label>
            <Select value={answers.topic} onValueChange={(value) => setAnswers((prev) => ({ ...prev, topic: value }))}>
              <SelectTrigger
                id={fieldIds.topic}
                aria-invalid={!!errors.topic}
                aria-describedby={errors.topic ? `${fieldIds.topic}-error` : undefined}
                aria-required="true"
              >
                <SelectValue placeholder="Выберите тему" />
              </SelectTrigger>
              <SelectContent>
                {topics.map((item) => (
                  <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.topic && (
              <p id={`${fieldIds.topic}-error`} className="text-xs text-destructive">
                {errors.topic}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor={fieldIds.goal}>Какой результат будет полезен?</Label>
            <Select value={answers.goal} onValueChange={(value) => setAnswers((prev) => ({ ...prev, goal: value }))}>
              <SelectTrigger
                id={fieldIds.goal}
                aria-invalid={!!errors.goal}
                aria-describedby={errors.goal ? `${fieldIds.goal}-error` : undefined}
                aria-required="true"
              >
                <SelectValue placeholder="Выберите цель" />
              </SelectTrigger>
              <SelectContent>
                {goals.map((item) => (
                  <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.goal && (
              <p id={`${fieldIds.goal}-error`} className="text-xs text-destructive">
                {errors.goal}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor={fieldIds.experience}>Опыт консультаций</Label>
            <Select value={answers.experience} onValueChange={(value) => setAnswers((prev) => ({ ...prev, experience: value }))}>
              <SelectTrigger
                id={fieldIds.experience}
                aria-invalid={!!errors.experience}
                aria-describedby={errors.experience ? `${fieldIds.experience}-error` : undefined}
                aria-required="true"
              >
                <SelectValue placeholder="Выберите вариант" />
              </SelectTrigger>
              <SelectContent>
                {experiences.map((item) => (
                  <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.experience && (
              <p id={`${fieldIds.experience}-error`} className="text-xs text-destructive">
                {errors.experience}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor={fieldIds.intensity}>Насколько интенсивно сейчас состояние?</Label>
            <Select value={answers.intensity} onValueChange={(value) => setAnswers((prev) => ({ ...prev, intensity: value }))}>
              <SelectTrigger
                id={fieldIds.intensity}
                aria-invalid={!!errors.intensity}
                aria-describedby={errors.intensity ? `${fieldIds.intensity}-error` : undefined}
                aria-required="true"
              >
                <SelectValue placeholder="Выберите уровень" />
              </SelectTrigger>
              <SelectContent>
                {intensityLevels.map((item) => (
                  <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.intensity && (
              <p id={`${fieldIds.intensity}-error`} className="text-xs text-destructive">
                {errors.intensity}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor={fieldIds.focus}>На чём хотите сфокусироваться?</Label>
            <Select value={answers.focus} onValueChange={(value) => setAnswers((prev) => ({ ...prev, focus: value }))}>
              <SelectTrigger
                id={fieldIds.focus}
                aria-invalid={!!errors.focus}
                aria-describedby={errors.focus ? `${fieldIds.focus}-error` : undefined}
                aria-required="true"
              >
                <SelectValue placeholder="Выберите фокус" />
              </SelectTrigger>
              <SelectContent>
                {focusAreas.map((item) => (
                  <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.focus && (
              <p id={`${fieldIds.focus}-error`} className="text-xs text-destructive">
                {errors.focus}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor={fieldIds.notes}>Дополнительные детали (по желанию)</Label>
            <Textarea
              id={fieldIds.notes}
              value={notes}
              onChange={(event) => setNotes(event.target.value.slice(0, NOTES_LIMIT))}
              placeholder="Коротко опишите, что важно учесть. Не пишите персональные данные."
              rows={4}
            />
            <p className="text-xs text-muted-foreground">
              {notes.length}/{NOTES_LIMIT} символов
            </p>
          </div>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Отправляем...' : 'Продолжить'}
          </Button>
        </form>
      </Card>
    </BookingStepLayout>
  );
}
