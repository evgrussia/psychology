'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  Button,
  Card,
  Checkbox,
  Container,
  CrisisBanner,
  Disclaimer,
  Input,
  Label,
  Section,
  Textarea,
} from '@psychology/design-system';
import { track } from '@/lib/tracking';
import { evaluateCrisisTrigger, type CrisisTriggerType } from '@/lib/interactive';
import { createTelegramDeepLink } from '@/lib/telegram';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001/api';

const QUESTION_MIN_LENGTH = 20;
const QUESTION_MAX_LENGTH = 4000;
const CONTACT_MIN_LENGTH = 3;
const CONTACT_MAX_LENGTH = 200;

const HIGH_RISK_TRIGGERS: CrisisTriggerType[] = ['suicidal_ideation', 'self_harm', 'violence'];

function detectPii(text: string): boolean {
  if (!text) return false;
  const emailPattern = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i;
  const phonePattern = /(\+7\d{10}|8\d{10}|\+?\d[\d\s\-\(\)]{8,}\d)/;
  const piiKeywordPattern = /(паспорт|адрес)/i;
  return emailPattern.test(text) || phonePattern.test(text) || piiKeywordPattern.test(text);
}

function maskPii(text: string): string {
  if (!text) return text;
  const emailPattern = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi;
  const phonePattern = /(\+7\d{10}|8\d{10}|\+?\d[\d\s\-\(\)]{8,}\d)/g;
  const piiKeywordPattern = /(паспорт|адрес)/gi;
  return text
    .replace(emailPattern, '[скрыто]')
    .replace(phonePattern, '[скрыто]')
    .replace(piiKeywordPattern, '[скрыто]');
}

export default function AnonymousQuestionClient() {
  const [questionText, setQuestionText] = useState('');
  const [contactValue, setContactValue] = useState('');
  const [contactConsent, setContactConsent] = useState(false);
  const [publishAllowed, setPublishAllowed] = useState(false);
  const [crisisAcknowledged, setCrisisAcknowledged] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    id: string;
    status: string;
    triggerFlags: string[];
    submittedAt: string;
  } | null>(null);

  const crisisTriggerType = useMemo(
    () => evaluateCrisisTrigger(questionText),
    [questionText],
  );
  const hasPii = useMemo(() => detectPii(questionText), [questionText]);
  const isHighRisk = crisisTriggerType ? HIGH_RISK_TRIGGERS.includes(crisisTriggerType) : false;
  const isModerateRisk = Boolean(crisisTriggerType) && !isHighRisk;

  useEffect(() => {
    if (crisisTriggerType) {
      track('crisis_banner_shown', {
        trigger_type: crisisTriggerType,
        surface: 'question',
      });
    }
  }, [crisisTriggerType]);

  useEffect(() => {
    if (!isHighRisk) {
      setCrisisAcknowledged(false);
    }
  }, [isHighRisk]);

  const questionLength = questionText.trim().length;
  const contactLength = contactValue.trim().length;

  const validationIssues: string[] = [];
  if (questionLength > 0 && questionLength < QUESTION_MIN_LENGTH) {
    validationIssues.push(`Минимум ${QUESTION_MIN_LENGTH} символов.`);
  }
  if (questionLength > QUESTION_MAX_LENGTH) {
    validationIssues.push(`Максимум ${QUESTION_MAX_LENGTH} символов.`);
  }
  if (contactConsent && contactLength > 0 && (contactLength < CONTACT_MIN_LENGTH || contactLength > CONTACT_MAX_LENGTH)) {
    validationIssues.push(`Контакт должен быть от ${CONTACT_MIN_LENGTH} до ${CONTACT_MAX_LENGTH} символов.`);
  }
  if (hasPii) {
    validationIssues.push('В тексте обнаружены личные данные. Пожалуйста, удалите или замаскируйте их.');
  }
  if (isHighRisk && !crisisAcknowledged) {
    validationIssues.push('Подтвердите, что вы в безопасности, чтобы отправить вопрос.');
  }

  const canSubmit =
    questionLength >= QUESTION_MIN_LENGTH &&
    questionLength <= QUESTION_MAX_LENGTH &&
    validationIssues.length === 0 &&
    !submitting;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!canSubmit) {
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/public/ugc/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: questionText.trim(),
          contactValue: contactConsent && contactValue.trim() ? contactValue.trim() : undefined,
          publishAllowed,
        }),
      });

      if (!response.ok) {
        throw new Error('Не удалось отправить вопрос. Попробуйте позже.');
      }

      const data = await response.json();
      setResult(data);
      setQuestionText('');
      setContactValue('');
      setContactConsent(false);
      setPublishAllowed(false);
      setCrisisAcknowledged(false);

      track('question_submitted', {
        channel: 'web',
        has_contact: Boolean(contactConsent && contactValue.trim()),
      });
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : 'Произошла ошибка.';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleTelegramAnswer = async (questionId: string) => {
    const { deepLinkId, url } = await createTelegramDeepLink({
      flow: 'question',
      tgTarget: 'bot',
      source: 'question_form',
      entityId: questionId,
    });
    track('cta_tg_click', {
      tg_target: 'bot',
      tg_flow: 'question',
      deep_link_id: deepLinkId,
    });
    window.location.href = url;
  };

  if (result) {
    return (
      <Section>
        <Container className="max-w-2xl">
          <Card className="p-8 space-y-4">
            <h1 className="text-2xl font-semibold">Спасибо! Вопрос отправлен.</h1>
            <p className="text-muted-foreground">
              Мы передали ваш запрос на модерацию. Ответ обычно занимает 24–48 часов.
            </p>
            <div className="rounded-md bg-muted/50 p-4 text-sm">
              <div className="font-medium">ID вопроса: {result.id}</div>
              <div className="text-muted-foreground">Статус: {result.status}</div>
            </div>
            {result.triggerFlags?.length > 0 && (
              <Disclaimer variant="info" title="Вопрос помечен флагами">
                Ваш запрос содержит чувствительные темы. Мы обработаем его в приоритетном порядке.
              </Disclaimer>
            )}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => void handleTelegramAnswer(result.id)}
              >
                Получить ответ в Telegram
              </Button>
              <Button onClick={() => setResult(null)} variant="outline">
                Отправить ещё один вопрос
              </Button>
            </div>
          </Card>
        </Container>
      </Section>
    );
  }

  return (
    <Section>
      <Container className="max-w-3xl space-y-8">
        <header className="space-y-3">
          <h1 className="text-4xl font-bold">Анонимный вопрос психологу</h1>
          <p className="text-muted-foreground">
            Вы можете задать вопрос без регистрации. Мы ответим бережно и без публикации ваших данных.
          </p>
        </header>

        <Disclaimer variant="info" title="Перед отправкой">
          Это не экстренная помощь. Если вы в остром кризисе, пожалуйста, воспользуйтесь экстренными службами. Ответ на вопрос
          обычно занимает 24–48 часов. Мы можем опубликовать вопрос в общем разделе только при вашем согласии.
        </Disclaimer>

        {isHighRisk && (
          <div className="space-y-4">
            <CrisisBanner message="Мы видим признаки кризиса. Если вам сейчас небезопасно, обратитесь за немедленной помощью." />
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-foreground">
              <p className="mb-3">
                Если вы в безопасности и всё равно хотите задать вопрос, подтвердите это ниже. Мы ответим бережно и предоставим ресурсы
                поддержки.
              </p>
              <label className="flex items-center gap-2">
                <Checkbox
                  checked={crisisAcknowledged}
                  onCheckedChange={(checked) => setCrisisAcknowledged(Boolean(checked))}
                  id="crisis-ack"
                />
                <span>Я в безопасности и хочу задать вопрос</span>
              </label>
            </div>
          </div>
        )}

        {isModerateRisk && (
          <Disclaimer variant="info" title="Если вам тяжело прямо сейчас">
            Обратитесь за поддержкой к близким или в службы помощи. Мы ответим на ваш вопрос в течение 24–48 часов.
          </Disclaimer>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="questionText">Ваш вопрос</Label>
            <Textarea
              id="questionText"
              value={questionText}
              onChange={(event) => setQuestionText(event.target.value)}
              placeholder="Опишите ситуацию коротко и без личных данных"
              rows={8}
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Минимум {QUESTION_MIN_LENGTH} символов</span>
              <span>
                {questionLength}/{QUESTION_MAX_LENGTH}
              </span>
            </div>
          </div>

          {hasPii && (
            <Card className="border-warning/30 bg-warning/10 p-4 text-sm">
              <div className="font-medium">В тексте есть личные данные</div>
              <p className="text-muted-foreground">
                Чтобы сохранить конфиденциальность, пожалуйста, удалите контакты, адрес или паспортные данные.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setQuestionText(maskPii(questionText))}
                >
                  Замаскировать автоматически
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setQuestionText('')}
                >
                  Очистить поле
                </Button>
              </div>
            </Card>
          )}

          <div className="space-y-3">
            <Label htmlFor="contactValue">Контакт для ответа (опционально)</Label>
            <Input
              id="contactValue"
              value={contactValue}
              onChange={(event) => setContactValue(event.target.value)}
              placeholder="Email или телефон"
              disabled={!contactConsent}
            />
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={contactConsent}
                onCheckedChange={(checked) => setContactConsent(Boolean(checked))}
                id="contact-consent"
              />
              <span>Согласен(на) на обработку контакта для ответа</span>
            </label>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={publishAllowed}
              onCheckedChange={(checked) => setPublishAllowed(Boolean(checked))}
              id="publish-consent"
            />
            <span>Разрешаю анонимную публикацию вопроса</span>
          </label>

          {validationIssues.length > 0 && (
            <Card className="border-destructive/30 bg-destructive/5 p-4 text-sm">
              <ul className="space-y-1 text-destructive">
                {validationIssues.map((issue) => (
                  <li key={issue}>{issue}</li>
                ))}
              </ul>
            </Card>
          )}

          {error && (
            <Card className="border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
              {error}
            </Card>
          )}

          <Button type="submit" disabled={!canSubmit} size="lg" className="w-full">
            {submitting ? 'Отправляем...' : 'Отправить вопрос'}
          </Button>
        </form>
      </Container>
    </Section>
  );
}
