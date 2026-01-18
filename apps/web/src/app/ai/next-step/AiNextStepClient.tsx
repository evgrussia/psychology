'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  Button,
  Card,
  Container,
  CrisisBanner,
  ResultCard,
  Section,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
  RadioGroup,
  RadioGroupItem,
} from '@psychology/design-system';
import { fetchAiNextStep, AiNextStepResponse } from '@/lib/ai';
import { createTelegramDeepLink } from '@/lib/telegram';
import { track } from '@/lib/tracking';

interface TopicItem {
  code: string;
  title: string;
}

const DEFAULT_ANSWERS = {
  intensity: 'background',
  goal: 'relief',
  time_to_benefit: 'min_1_3',
  support_level: 'self_help',
  safety: 'safe',
} as const;

export const AiNextStepClient: React.FC = () => {
  const [topics, setTopics] = useState<TopicItem[]>([]);
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [consentSensitive, setConsentSensitive] = useState(false);
  const [freeText, setFreeText] = useState('');
  const [answers, setAnswers] = useState({
    ...DEFAULT_ANSWERS,
    topic_code: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [response, setResponse] = useState<AiNextStepResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTopics = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001/api';
        const res = await fetch(`${apiUrl}/public/topics`);
        if (!res.ok) return;
        const data = await res.json();
        setTopics(Array.isArray(data) ? data : []);
      } catch {
        setTopics([]);
      }
    };
    void loadTopics();
  }, []);

  useEffect(() => {
    if (response?.status === 'crisis') {
      track('crisis_banner_shown', {
        trigger_type: response.crisis?.trigger ?? 'panic_like',
        surface: 'agent',
      });
    }
  }, [response]);

  const topicOptions = useMemo(() => {
    return topics.map((topic) => ({ value: topic.code, label: topic.title }));
  }, [topics]);

  const submit = async () => {
    setSubmitting(true);
    setError(null);
    setResponse(null);
    try {
      const data = await fetchAiNextStep({
        age_confirmed: ageConfirmed,
        consent_sensitive_text: consentSensitive,
        free_text: freeText.trim() || undefined,
        answers: {
          ...answers,
          topic_code: answers.topic_code || undefined,
        },
      });
      setResponse(data);
    } catch (err: any) {
      setError(err?.message || 'Не удалось получить ответ');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTelegramCta = async () => {
    const { url, deepLinkId } = await createTelegramDeepLink({
      flow: 'plan_7d',
      topic: answers.topic_code || undefined,
      source: 'ai_next_step',
      tgTarget: 'bot',
    });
    track('cta_tg_click', {
      tg_target: 'bot',
      tg_flow: 'plan_7d',
      deep_link_id: deepLinkId,
      topic: answers.topic_code || undefined,
    });
    window.location.href = url;
  };

  const handleBookingCta = () => {
    track('booking_start', {
      entry_point: 'ai_next_step',
      topic: answers.topic_code || undefined,
    });
    window.location.href = '/booking';
  };

  const handleCrisisAction = (action: { id: string; href?: string }) => {
    track('crisis_help_click', { action: action.id });
    if (action.href) {
      window.location.href = action.href;
    }
  };

  return (
    <>
      <Section>
        <Container className="max-w-3xl space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-foreground">Навигатор следующего шага</h1>
            <p className="text-muted-foreground">
              Небольшие вопросы помогут подобрать безопасный следующий шаг без хранения ваших текстов.
            </p>
          </div>

          <Card className="p-6 space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                С чем вы сейчас? (можно пропустить)
              </label>
              <Select
                value={answers.topic_code || 'any'}
                onValueChange={(value) =>
                  setAnswers((prev) => ({ ...prev, topic_code: value === 'any' ? '' : value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите тему" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Без выбора</SelectItem>
                  {topicOptions.map((topic) => (
                    <SelectItem key={topic.value} value={topic.value}>
                      {topic.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Сейчас ощущается больше…</label>
              <RadioGroup
                value={answers.intensity}
                onValueChange={(value) => setAnswers((prev) => ({ ...prev, intensity: value as any }))}
              >
                <label className="flex items-center gap-3">
                  <RadioGroupItem value="acute" />
                  <span>Остро, прямо сейчас</span>
                </label>
                <label className="flex items-center gap-3">
                  <RadioGroupItem value="background" />
                  <span>Фоном, но беспокоит</span>
                </label>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Чего хочется в первую очередь?</label>
              <RadioGroup
                value={answers.goal}
                onValueChange={(value) => setAnswers((prev) => ({ ...prev, goal: value as any }))}
              >
                <label className="flex items-center gap-3">
                  <RadioGroupItem value="relief" />
                  <span>Облегчения и опоры</span>
                </label>
                <label className="flex items-center gap-3">
                  <RadioGroupItem value="clarity" />
                  <span>Ясности и понимания</span>
                </label>
                <label className="flex items-center gap-3">
                  <RadioGroupItem value="decision" />
                  <span>Принять решение</span>
                </label>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Сколько времени есть на первый шаг?</label>
              <RadioGroup
                value={answers.time_to_benefit}
                onValueChange={(value) => setAnswers((prev) => ({ ...prev, time_to_benefit: value as any }))}
              >
                <label className="flex items-center gap-3">
                  <RadioGroupItem value="min_1_3" />
                  <span>1–3 минуты</span>
                </label>
                <label className="flex items-center gap-3">
                  <RadioGroupItem value="min_7_10" />
                  <span>7–10 минут</span>
                </label>
                <label className="flex items-center gap-3">
                  <RadioGroupItem value="min_20_30" />
                  <span>20–30 минут</span>
                </label>
                <label className="flex items-center gap-3">
                  <RadioGroupItem value="series" />
                  <span>Серия шагов</span>
                </label>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Какой уровень поддержки вам ближе?</label>
              <RadioGroup
                value={answers.support_level}
                onValueChange={(value) => setAnswers((prev) => ({ ...prev, support_level: value as any }))}
              >
                <label className="flex items-center gap-3">
                  <RadioGroupItem value="self_help" />
                  <span>Самопомощь</span>
                </label>
                <label className="flex items-center gap-3">
                  <RadioGroupItem value="micro_support" />
                  <span>Микро‑поддержка</span>
                </label>
                <label className="flex items-center gap-3">
                  <RadioGroupItem value="consultation" />
                  <span>Хочу обсудить с психологом</span>
                </label>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Вы сейчас в безопасности?
              </label>
              <RadioGroup
                value={answers.safety}
                onValueChange={(value) => setAnswers((prev) => ({ ...prev, safety: value as any }))}
              >
                <label className="flex items-center gap-3">
                  <RadioGroupItem value="safe" />
                  <span>Да, я в безопасности</span>
                </label>
                <label className="flex items-center gap-3">
                  <RadioGroupItem value="not_sure" />
                  <span>Не уверен(а)</span>
                </label>
                <label className="flex items-center gap-3">
                  <RadioGroupItem value="unsafe" />
                  <span>Нет, мне небезопасно</span>
                </label>
              </RadioGroup>
            </div>

            <div className="space-y-3 border-t border-border pt-4">
              <label className="flex items-center gap-3 text-sm">
                <input
                  type="checkbox"
                  checked={ageConfirmed}
                  onChange={(event) => setAgeConfirmed(event.target.checked)}
                />
                Мне 18 лет или больше
              </label>
              <label className="flex items-center gap-3 text-sm">
                <input
                  type="checkbox"
                  checked={consentSensitive}
                  onChange={(event) => setConsentSensitive(event.target.checked)}
                />
                Я понимаю, что текст может содержать чувствительные данные
              </label>
              <Textarea
                placeholder="Можно оставить 1–2 фразы (не обязательно)"
                value={freeText}
                onChange={(event) => setFreeText(event.target.value)}
                disabled={!consentSensitive}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                size="lg"
                disabled={!ageConfirmed || submitting}
                onClick={submit}
              >
                {submitting ? 'Подбираем рекомендации...' : 'Получить следующий шаг'}
              </Button>
              <Button variant="outline" size="lg" onClick={() => window.location.href = '/booking'}>
                Записаться сразу
              </Button>
            </div>
          </Card>

          {error && <p className="text-sm text-destructive">{error}</p>}
        </Container>
      </Section>

      {response && (
        <Section>
          <Container className="max-w-3xl space-y-6">
            {response.status === 'crisis' && (
              <div className="space-y-4">
                <CrisisBanner
                  message={response.message}
                  className="mt-2"
                />
                <div className="flex flex-wrap gap-3">
                  {response.crisis?.actions.map((action) => (
                    <Button
                      key={action.id}
                      variant={action.id === 'call_112' ? 'default' : 'outline'}
                      onClick={() => handleCrisisAction(action)}
                    >
                      {action.label}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {response.status === 'refused' && (
              <Card className="p-6 space-y-3">
                <h2 className="text-xl font-semibold text-foreground">Безопасные рамки</h2>
                <p className="text-muted-foreground">{response.message}</p>
              </Card>
            )}

            {response.status === 'ok' && (
              <ResultCard
                title="Ваш следующий шаг"
                description={response.message}
                steps={[
                  { title: 'Сейчас', items: response.next_steps?.now || [] },
                  { title: 'На неделю', items: response.next_steps?.week || [] },
                ]}
              >
                <div className="space-y-4">
                  {response.recommendations?.topic && (
                    <div>
                      <p className="text-sm text-muted-foreground">Тема</p>
                      <a
                        className="text-primary font-medium"
                        href={response.recommendations.topic.href}
                      >
                        {response.recommendations.topic.title}
                      </a>
                    </div>
                  )}
                  {response.recommendations?.resources?.length ? (
                    <div>
                      <p className="text-sm text-muted-foreground">Ресурсы</p>
                      <div className="flex flex-col gap-2">
                        {response.recommendations.resources.map((item) => (
                          <a key={item.href} href={item.href} className="text-primary">
                            {item.title}
                          </a>
                        ))}
                      </div>
                    </div>
                  ) : null}
                  {response.recommendations?.articles?.length ? (
                    <div>
                      <p className="text-sm text-muted-foreground">Статьи</p>
                      <div className="flex flex-col gap-2">
                        {response.recommendations.articles.map((item) => (
                          <a key={item.href} href={item.href} className="text-primary">
                            {item.title}
                          </a>
                        ))}
                      </div>
                    </div>
                  ) : null}
                  <div className="flex flex-wrap gap-3 pt-2">
                    <Button onClick={handleTelegramCta}>
                      Получить план в Telegram
                    </Button>
                    <Button variant="outline" onClick={handleBookingCta}>
                      Записаться
                    </Button>
                  </div>
                </div>
              </ResultCard>
            )}

            <p className="text-xs text-muted-foreground">{response.disclaimer}</p>
          </Container>
        </Section>
      )}
    </>
  );
};
