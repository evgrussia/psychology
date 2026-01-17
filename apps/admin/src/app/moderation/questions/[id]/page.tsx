'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { AdminAuthGuard } from '@/components/admin-auth-guard';
import { useAdminAuth } from '@/components/admin-auth-context';

type UgcStatus = 'pending' | 'flagged' | 'approved' | 'answered' | 'rejected';

interface ModerationItemDetails {
  id: string;
  status: UgcStatus;
  submittedAt: string;
  answeredAt: string | null;
  triggerFlags: string[];
  questionText: string;
  contactValue: string | null;
  publishAllowed: boolean;
  answers: Array<{
    id: string;
    text: string;
    publishedAt: string;
    answeredBy: { id: string; email: string | null; displayName: string | null } | null;
  }>;
  moderations: Array<{
    id: string;
    action: string;
    reasonCategory: string | null;
    createdAt: string;
    moderator: { id: string; email: string | null; displayName: string | null } | null;
  }>;
}

interface ModerationTemplate {
  id: string;
  name: string;
  channel: string;
  status: string;
  latestVersion: {
    id: string;
    version: number;
    subject: string | null;
    bodyMarkdown: string;
    updatedBy: { id: string; email: string | null; displayName: string | null } | null;
    createdAt: string;
  } | null;
}

const checklistItems = [
  { id: 'safe', label: 'Безопасность: нет кризисных маркеров' },
  { id: 'ethics', label: 'Этика: нет медицинских назначений/диагноза' },
  { id: 'pii', label: 'PII: нет личных данных (или маскированы)' },
  { id: 'boundaries', label: 'Границы: не просит "терапию в комментариях"' },
  { id: 'scope', label: 'Scope: в рамках компетенции психолога' },
];

const reasonOptions = [
  { value: 'crisis', label: 'Кризис' },
  { value: 'medical', label: 'Медицинский/диагноз' },
  { value: 'out_of_scope', label: 'Out-of-scope' },
  { value: 'therapy_request', label: 'Запрос терапии в комментариях' },
  { value: 'spam', label: 'Спам/реклама' },
  { value: 'pii', label: 'PII' },
  { value: 'other', label: 'Другое' },
];

export default function ModerationQuestionPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const { user } = useAdminAuth();
  const [item, setItem] = useState<ModerationItemDetails | null>(null);
  const [templates, setTemplates] = useState<ModerationTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [answerText, setAnswerText] = useState('');
  const [rejectReason, setRejectReason] = useState('medical');
  const [escalateReason, setEscalateReason] = useState('');
  const [checklistState, setChecklistState] = useState<Record<string, boolean>>({});

  const canAnswer = Boolean(user?.roles.includes('owner'));
  const canModerate = Boolean(user?.roles.some((role) => role === 'owner' || role === 'assistant'));

  const fetchItem = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/moderation/items/${id}`, {
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to load moderation item');
      }
      const data = (await response.json()) as ModerationItemDetails;
      setItem(data);
    } catch (error) {
      console.error(error);
      setItem(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchTemplates = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/moderation/templates', {
        credentials: 'include',
      });
      if (!response.ok) {
        return;
      }
      const data = (await response.json()) as ModerationTemplate[];
      setTemplates(data);
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    fetchItem();
    fetchTemplates();
  }, [fetchItem, fetchTemplates]);

  const handleAction = useCallback(
    async (path: string, body?: Record<string, any>) => {
      if (!id) return;
      setActionLoading(true);
      try {
        const response = await fetch(`/api/admin/moderation/items/${id}/${path}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: body ? JSON.stringify(body) : undefined,
        });
        if (!response.ok) {
          throw new Error('Moderation action failed');
        }
        await fetchItem();
      } catch (error) {
        console.error(error);
      } finally {
        setActionLoading(false);
      }
    },
    [fetchItem, id],
  );

  const lastAnswer = useMemo(() => item?.answers[0] ?? null, [item]);

  return (
    <AdminAuthGuard allowedRoles={['owner', 'assistant']}>
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <Link href="/moderation" className="text-sm text-muted-foreground">
              ← Назад к очереди
            </Link>
            <h1 className="mt-2 text-2xl font-semibold">Анонимный вопрос</h1>
            <p className="text-sm text-muted-foreground">{item?.id}</p>
          </div>
          {item && (
            <div className="rounded-lg border px-4 py-2 text-sm">
              Статус: <span className="font-medium">{item.status}</span>
            </div>
          )}
        </div>

        {loading ? (
          <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
            Загружаем карточку модерации...
          </div>
        ) : !item ? (
          <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
            Карточка не найдена.
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
            <section className="space-y-6">
              <div className="rounded-lg border p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-xs uppercase text-muted-foreground">Дата отправки</div>
                    <div className="text-sm font-medium">
                      {new Date(item.submittedAt).toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs uppercase text-muted-foreground">Триггеры</div>
                    <div className="text-sm">
                      {item.triggerFlags.length > 0 ? item.triggerFlags.join(', ') : '—'}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs uppercase text-muted-foreground">Контакт</div>
                    <div className="text-sm">{item.contactValue ?? '—'}</div>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="text-xs uppercase text-muted-foreground">Текст вопроса</div>
                  <div className="whitespace-pre-wrap rounded-md border bg-muted/20 p-3 text-sm">
                    {item.questionText}
                  </div>
                </div>
              </div>

              <div className="rounded-lg border p-4">
                <div className="text-sm font-semibold">Чеклист модерации</div>
                <div className="mt-3 grid gap-2">
                  {checklistItems.map((itemCheck) => (
                    <label key={itemCheck.id} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={Boolean(checklistState[itemCheck.id])}
                        onChange={(event) =>
                          setChecklistState((prev) => ({
                            ...prev,
                            [itemCheck.id]: event.target.checked,
                          }))
                        }
                      />
                      <span>{itemCheck.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {canAnswer && (
                <div className="rounded-lg border p-4">
                  <div className="text-sm font-semibold">Ответ психолога</div>
                  <textarea
                    value={answerText}
                    onChange={(event) => setAnswerText(event.target.value)}
                    rows={8}
                    className="mt-3 w-full rounded-md border bg-background p-3 text-sm"
                    placeholder="Введите ответ..."
                  />
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleAction('answer', { text: answerText })}
                      disabled={actionLoading || !answerText.trim()}
                      className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
                    >
                      Опубликовать ответ
                    </button>
                    {lastAnswer && (
                      <span className="text-xs text-muted-foreground">
                        Последний ответ: {new Date(lastAnswer.publishedAt).toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {item.moderations.length > 0 && (
                <div className="rounded-lg border p-4">
                  <div className="text-sm font-semibold">История модерации</div>
                  <div className="mt-3 space-y-2 text-sm">
                    {item.moderations.map((action) => (
                      <div key={action.id} className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <span className="font-medium">{action.action}</span>
                          {action.reasonCategory && (
                            <span className="text-muted-foreground"> · {action.reasonCategory}</span>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {action.moderator?.displayName ||
                            action.moderator?.email ||
                            '—'}{' '}
                          · {new Date(action.createdAt).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>

            <aside className="space-y-6">
              {canModerate && (
                <div className="rounded-lg border p-4">
                  <div className="text-sm font-semibold">Действия модерации</div>
                  <div className="mt-3 flex flex-col gap-3">
                    <button
                      type="button"
                      onClick={() => handleAction('approve')}
                      disabled={actionLoading}
                      className="rounded-md border px-3 py-2 text-sm font-medium"
                    >
                      Одобрить
                    </button>
                    <div className="space-y-2">
                      <select
                        value={rejectReason}
                        onChange={(event) => setRejectReason(event.target.value)}
                        className="w-full rounded-md border bg-background px-2 py-2 text-sm"
                      >
                        {reasonOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => handleAction('reject', { reasonCategory: rejectReason })}
                        disabled={actionLoading}
                        className="w-full rounded-md border border-destructive/40 px-3 py-2 text-sm font-medium text-destructive"
                      >
                        Отклонить
                      </button>
                    </div>
                    <div className="space-y-2">
                      <select
                        value={escalateReason}
                        onChange={(event) => setEscalateReason(event.target.value)}
                        className="w-full rounded-md border bg-background px-2 py-2 text-sm"
                      >
                        <option value="">Причина эскалации</option>
                        {reasonOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() =>
                          handleAction('escalate', {
                            reasonCategory: escalateReason || undefined,
                          })
                        }
                        disabled={actionLoading}
                        className="w-full rounded-md border px-3 py-2 text-sm font-medium"
                      >
                        Эскалировать
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="rounded-lg border p-4">
                <div className="text-sm font-semibold">Шаблоны ответов</div>
                <div className="mt-3 space-y-3 text-sm">
                  {templates.length === 0 && (
                    <div className="text-xs text-muted-foreground">Шаблонов пока нет.</div>
                  )}
                  {templates.map((template) => (
                    <div key={template.id} className="rounded-md border p-3">
                      <div className="font-medium">{template.name}</div>
                      {template.latestVersion?.subject && (
                        <div className="text-xs text-muted-foreground">
                          {template.latestVersion.subject}
                        </div>
                      )}
                      <div className="mt-2 line-clamp-4 whitespace-pre-wrap text-xs text-muted-foreground">
                        {template.latestVersion?.bodyMarkdown || 'Нет версии'}
                      </div>
                      {template.latestVersion && canAnswer && (
                        <button
                          type="button"
                          onClick={() => setAnswerText(template.latestVersion?.bodyMarkdown ?? '')}
                          className="mt-2 text-xs font-medium text-primary"
                        >
                          Использовать шаблон
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>
    </AdminAuthGuard>
  );
}
