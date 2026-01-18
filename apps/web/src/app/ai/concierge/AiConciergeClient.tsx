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
import { fetchAiConcierge, AiConciergeResponse } from '@/lib/ai';
import { createTelegramDeepLink } from '@/lib/telegram';
import { track } from '@/lib/tracking';

interface TopicItem {
  code: string;
  title: string;
}

const DEFAULT_ANSWERS = {
  goal: 'first_meeting',
  format_preference: 'any',
  urgency: 'flexible',
} as const;

export const AiConciergeClient: React.FC = () => {
  const [topics, setTopics] = useState<TopicItem[]>([]);
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [consentSensitive, setConsentSensitive] = useState(false);
  const [freeText, setFreeText] = useState('');
  const [answers, setAnswers] = useState({
    ...DEFAULT_ANSWERS,
    topic_code: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [response, setResponse] = useState<AiConciergeResponse | null>(null);
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
      const data = await fetchAiConcierge({
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
      flow: 'concierge',
      topic: answers.topic_code || undefined,
      source: 'ai_concierge',
      tgTarget: 'bot',
    });
    track('cta_tg_click', {
      tg_target: 'bot',
      tg_flow: 'concierge',
      deep_link_id: deepLinkId,
      topic: answers.topic_code || undefined,
    });
    window.location.href = url;
  };

  const handleBookingCta = () => {
    track('booking_start', {
      entry_point: 'ai_concierge',
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
            <h1 className="text-3xl font-bold text-foreground">Консьерж записи</h1>
            <p className="text-muted-foreground">
              Помогу выбрать формат и следующий шаг без обсуждения терапевтических деталей.
            </p>
          </div>

          <Card className="p-6 space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Тема запроса (можно пропустить)
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
              <label className="text-sm font-medium text-foreground">Какой формат удобнее?</label>
              <RadioGroup
                value={answers.format_preference}
                onValueChange={(value) =>
                  setAnswers((prev) => ({ ...prev, format_preference: value as any }))
                }
              >
                <label className="flex items-center gap-3">
                  <RadioGroupItem value="any" />
                  <span>Без предпочтений</span>
                </label>
                <label className="flex items-center gap-3">
                  <RadioGroupItem value="online" />
                  <span>Онлайн</span>
                </label>
                <label className="flex items-center gap-3">
                  <RadioGroupItem value="offline" />
                  <span>Офлайн (Москва)</span>
                </label>
                <label className="flex items-center gap-3">
                  <RadioGroupItem value="hybrid" />
                  <span>Гибридный формат</span>
                </label>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Что ожидаете от встречи?</label>
              <RadioGroup
                value={answers.goal}
                onValueChange={(value) => setAnswers((prev) => ({ ...prev, goal: value as any }))}
              >
                <label className="flex items-center gap-3">
                  <RadioGroupItem value="first_meeting" />
                  <span>Познакомиться и прояснить запрос</span>
                </label>
                <label className="flex items-center gap-3">
                  <RadioGroupItem value="single_session" />
                  <span>Разобрать ситуацию за одну встречу</span>
                </label>
                <label className="flex items-center gap-3">
                  <RadioGroupItem value="ongoing_support" />
                  <span>Долгосрочная поддержка</span>
                </label>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Когда хотелось бы попасть?</label>
              <RadioGroup
                value={answers.urgency}
                onValueChange={(value) => setAnswers((prev) => ({ ...prev, urgency: value as any }))}
              >
                <label className="flex items-center gap-3">
                  <RadioGroupItem value="asap" />
                  <span>Как можно скорее</span>
                </label>
                <label className="flex items-center gap-3">
                  <RadioGroupItem value="this_week" />
                  <span>На этой неделе</span>
                </label>
                <label className="flex items-center gap-3">
                  <RadioGroupItem value="flexible" />
                  <span>Гибко</span>
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
                placeholder="Можно уточнить удобное время или формат (не обязательно)"
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
                {submitting ? 'Подбираем шаг...' : 'Получить рекомендации'}
              </Button>
              <Button variant="outline" size="lg" onClick={() => window.location.href = '/booking'}>
                Перейти к записи
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
                title="Рекомендация консьержа"
                description={response.message}
                steps={[
                  { title: 'Дальше', items: response.recommendation?.next_steps || [] },
                ]}
              >
                <div className="space-y-4">
                  {response.recommendation?.service && (
                    <div>
                      <p className="text-sm text-muted-foreground">Рекомендованная услуга</p>
                      <a
                        className="text-primary font-medium"
                        href={response.recommendation.service.href}
                      >
                        {response.recommendation.service.title}
                      </a>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-3 pt-2">
                    <Button onClick={handleBookingCta}>Перейти к записи</Button>
                    <Button variant="outline" onClick={handleTelegramCta}>
                      Написать в Telegram
                    </Button>
                  </div>
                </div>
              </ResultCard>
            )}

            {response.handoff && (
              <Card className="p-6 space-y-3">
                <h3 className="text-lg font-semibold text-foreground">Нужна поддержка специалиста</h3>
                <p className="text-muted-foreground">{response.handoff.reason}</p>
                <div className="flex flex-wrap gap-3">
                  {response.handoff.actions.map((action) => (
                    <Button key={action.href} variant="outline" onClick={() => (window.location.href = action.href)}>
                      {action.label}
                    </Button>
                  ))}
                </div>
              </Card>
            )}

            <p className="text-xs text-muted-foreground">{response.disclaimer}</p>
          </Container>
        </Section>
      )}
    </>
  );
};
