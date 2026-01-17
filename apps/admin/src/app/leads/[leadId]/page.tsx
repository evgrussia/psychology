'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

interface LeadDetail {
  id: string;
  status: string;
  source: string;
  topicCode: string | null;
  utm: Record<string, any> | null;
  createdAt: string;
  updatedAt: string;
  identities: Array<{
    id: string;
    userId: string | null;
    anonymousId: string | null;
    email: string | null;
    phone: string | null;
    telegramUserId: string | null;
    isPrimary: boolean;
    createdAt: string;
    user?: {
      id: string;
      email: string | null;
      phone: string | null;
      telegramUserId: string | null;
      displayName: string | null;
    } | null;
  }>;
  timelineEvents: Array<{
    id: string;
    eventName: string;
    source: string;
    occurredAt: string;
    deepLinkId: string | null;
    properties: Record<string, any>;
  }>;
  notes: Array<{
    id: string;
    leadId: string;
    authorUserId: string;
    text: string;
    createdAt: string;
    author?: {
      id: string;
      email: string | null;
      displayName: string | null;
    } | null;
  }>;
  consents: {
    personalData: boolean;
    communications: boolean;
    telegram: boolean;
  } | null;
}

const STATUS_OPTIONS = [
  { value: 'new', label: 'Новый' },
  { value: 'engaged', label: 'Вовлечён' },
  { value: 'booking_started', label: 'Запись начата' },
  { value: 'booked_confirmed', label: 'Запись подтверждена' },
  { value: 'paid', label: 'Оплачено' },
  { value: 'completed_session', label: 'Сессия завершена' },
  { value: 'follow_up_needed', label: 'Нужен follow-up' },
  { value: 'inactive', label: 'Неактивен' },
];

export default function LeadDetailPage() {
  const params = useParams();
  const router = useRouter();
  const leadId = typeof params.leadId === 'string' ? params.leadId : params.leadId?.[0];
  const [loading, setLoading] = useState(true);
  const [lead, setLead] = useState<LeadDetail | null>(null);
  const [noteText, setNoteText] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  const loadLead = useCallback(async () => {
    if (!leadId) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/leads/${leadId}`, { credentials: 'include' });
      if (!response.ok) {
        throw new Error('Lead not found');
      }
      const data = (await response.json()) as LeadDetail;
      setLead(data);
    } catch (error) {
      console.error(error);
      setLead(null);
    } finally {
      setLoading(false);
    }
  }, [leadId]);

  useEffect(() => {
    loadLead();
  }, [loadLead]);

  const updateStatus = useCallback(async (status: string) => {
    if (!leadId || !lead) return;
    try {
      const response = await fetch(`/api/admin/leads/${leadId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status }),
      });
      if (!response.ok) {
        throw new Error('Failed to update status');
      }
      setLead((prev) => (prev ? { ...prev, status } : prev));
    } catch (error) {
      console.error(error);
    }
  }, [lead, leadId]);

  const addNote = useCallback(async () => {
    if (!leadId || !noteText.trim()) return;
    setSavingNote(true);
    try {
      const response = await fetch(`/api/admin/leads/${leadId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ text: noteText.trim() }),
      });
      if (!response.ok) {
        throw new Error('Failed to add note');
      }
      const note = await response.json();
      setLead((prev) => (prev ? { ...prev, notes: [note, ...prev.notes] } : prev));
      setNoteText('');
    } catch (error) {
      console.error(error);
    } finally {
      setSavingNote(false);
    }
  }, [leadId, noteText]);

  if (loading) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
        Загружаем лид...
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-sm text-muted-foreground">Лид не найден.</p>
        <button
          type="button"
          onClick={() => router.back()}
          className="w-fit rounded-md border px-3 py-1 text-sm"
        >
          Назад
        </button>
      </div>
    );
  }

  const primaryIdentity = lead.identities.find((identity) => identity.isPrimary) ?? lead.identities[0];
  const displayName =
    primaryIdentity?.user?.displayName || primaryIdentity?.user?.email || primaryIdentity?.email || 'Гость';

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-xs uppercase text-muted-foreground">CRM-лиды</div>
          <h1 className="text-2xl font-semibold">{displayName}</h1>
          <p className="text-xs text-muted-foreground">{lead.id}</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/leads" className="rounded-md border px-3 py-1 text-sm">
            Назад к списку
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border p-4">
          <h2 className="text-sm font-semibold">Основное</h2>
          <div className="mt-3 grid gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Источник</span>
              <span>{lead.source}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Тема</span>
              <span>{lead.topicCode || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Создан</span>
              <span>{new Date(lead.createdAt).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Статус</span>
              <select
                value={lead.status}
                onChange={(event) => updateStatus(event.target.value)}
                className="rounded-md border bg-background px-2 py-1 text-xs"
              >
                {STATUS_OPTIONS.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="rounded-lg border p-4">
          <h2 className="text-sm font-semibold">Контакты</h2>
          <div className="mt-3 flex flex-col gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Email</span>
              <span>{primaryIdentity?.email || primaryIdentity?.user?.email || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Телефон</span>
              <span>{primaryIdentity?.phone || primaryIdentity?.user?.phone || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Telegram</span>
              <span>{primaryIdentity?.telegramUserId || primaryIdentity?.user?.telegramUserId || '—'}</span>
            </div>
            {lead.consents && (
              <div className="mt-2 rounded-md bg-muted/30 p-2 text-xs text-muted-foreground">
                Согласия: ПДн {lead.consents.personalData ? '✓' : '—'}, коммуникации{' '}
                {lead.consents.communications ? '✓' : '—'}, Telegram {lead.consents.telegram ? '✓' : '—'}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[2fr,1fr]">
        <div className="rounded-lg border p-4">
          <h2 className="text-sm font-semibold">Таймлайн событий</h2>
          <div className="mt-4 flex flex-col gap-3 text-sm">
            {lead.timelineEvents.length === 0 && (
              <div className="rounded-md border border-dashed p-4 text-center text-xs text-muted-foreground">
                Событий пока нет
              </div>
            )}
            {lead.timelineEvents.map((event) => (
              <div key={event.id} className="rounded-md border bg-background p-3">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                  <span>{new Date(event.occurredAt).toLocaleString()}</span>
                  <span>{event.source}</span>
                </div>
                <div className="mt-1 font-medium">{event.eventName}</div>
                {Object.keys(event.properties).length > 0 && (
                  <div className="mt-2 text-xs text-muted-foreground">
                    {Object.entries(event.properties).map(([key, value]) => (
                      <div key={key}>
                        {key}: {String(value)}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border p-4">
          <h2 className="text-sm font-semibold">Заметки</h2>
          <textarea
            value={noteText}
            onChange={(event) => setNoteText(event.target.value)}
            rows={4}
            className="mt-3 w-full rounded-md border bg-background p-2 text-sm"
            placeholder="Внутренняя заметка (шифруется)."
          />
          <button
            type="button"
            onClick={addNote}
            disabled={savingNote || !noteText.trim()}
            className="mt-2 w-full rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground disabled:opacity-50"
          >
            {savingNote ? 'Сохраняем...' : 'Добавить заметку'}
          </button>
          <div className="mt-4 flex flex-col gap-3 text-sm">
            {lead.notes.length === 0 && (
              <div className="rounded-md border border-dashed p-3 text-center text-xs text-muted-foreground">
                Заметок пока нет
              </div>
            )}
            {lead.notes.map((note) => (
              <div key={note.id} className="rounded-md border bg-background p-3">
                <div className="text-xs text-muted-foreground">
                  {note.author?.displayName || note.author?.email || note.authorUserId} ·{' '}
                  {new Date(note.createdAt).toLocaleString()}
                </div>
                <div className="mt-2 whitespace-pre-wrap">{note.text}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
