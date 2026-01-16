'use client';

import React from 'react';
import Link from 'next/link';
import { CabinetPageLayout } from '../CabinetPageLayout';
import { getCabinetAppointments } from '../cabinetApi';
import { Button, Card } from '@psychology/design-system';
import { track } from '@/lib/tracking';

const statusLabels: Record<string, string> = {
  pending_payment: 'Ожидает оплату',
  paid: 'Оплачено',
  confirmed: 'Подтверждено',
  canceled: 'Отменено',
  rescheduled: 'Перенесено',
  completed: 'Завершено',
};

export default function CabinetAppointmentsPage() {
  const [loading, setLoading] = React.useState(true);
  const [unauthorized, setUnauthorized] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [appointments, setAppointments] = React.useState<any>(null);

  React.useEffect(() => {
    track('lk_opened', { page_path: '/cabinet/appointments' });
  }, []);

  React.useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        const data = await getCabinetAppointments();
        if (!isMounted) return;
        setAppointments(data);
        setUnauthorized(false);
        setError(null);
      } catch (err: any) {
        if (!isMounted) return;
        if (err?.message === 'unauthorized') {
          setUnauthorized(true);
        } else {
          setError('Не удалось загрузить встречи.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <CabinetPageLayout
      title="Ваши встречи"
      description="Предстоящие и прошедшие консультации в одном месте."
    >
      {loading && (
        <div className="rounded-2xl border border-dashed border-border p-8 text-center text-muted-foreground">
          Загружаем встречи...
        </div>
      )}

      {!loading && unauthorized && (
        <Card className="p-8 text-center space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">Войдите, чтобы увидеть встречи</h2>
          <p className="text-muted-foreground">
            Доступ к расписанию доступен только для клиентов.
          </p>
          <div>
            <Button asChild>
              <Link href="/login">Войти в кабинет</Link>
            </Button>
          </div>
        </Card>
      )}

      {!loading && !unauthorized && error && (
        <div role="alert" className="rounded-2xl border border-destructive/40 bg-destructive/10 p-6 text-destructive">
          {error}
        </div>
      )}

      {!loading && !unauthorized && !error && (
        <div className="space-y-8">
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">Предстоящие</h2>
            {appointments?.upcoming?.length ? (
              <div className="grid gap-4">
                {appointments.upcoming.map((appointment: any) => (
                  <Card key={appointment.id} className="p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <div className="text-sm font-semibold text-muted-foreground uppercase">
                        {statusLabels[appointment.status] || 'Встреча'}
                      </div>
                      <div className="text-lg font-semibold text-foreground">
                        {appointment.service?.title || 'Консультация'}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {new Date(appointment.start_at_utc).toLocaleString('ru-RU', {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Формат: {appointment.format === 'online' ? 'Онлайн' : appointment.format === 'offline' ? 'Офлайн' : 'Онлайн / офлайн'}
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-6 text-muted-foreground">
                Пока нет предстоящих встреч. Вы можете выбрать удобное время.
                <div className="mt-4">
                  <Button asChild variant="outline">
                    <Link href="/booking">Записаться</Link>
                  </Button>
                </div>
              </Card>
            )}
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">Прошедшие</h2>
            {appointments?.past?.length ? (
              <div className="grid gap-4">
                {appointments.past.map((appointment: any) => (
                  <Card key={appointment.id} className="p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <div className="text-sm font-semibold text-muted-foreground uppercase">
                        {statusLabels[appointment.status] || 'Встреча'}
                      </div>
                      <div className="text-lg font-semibold text-foreground">
                        {appointment.service?.title || 'Консультация'}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {new Date(appointment.start_at_utc).toLocaleString('ru-RU', {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Формат: {appointment.format === 'online' ? 'Онлайн' : appointment.format === 'offline' ? 'Офлайн' : 'Онлайн / офлайн'}
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-6 text-muted-foreground">
                Здесь появятся ваши прошлые встречи после первых консультаций.
              </Card>
            )}
          </section>
        </div>
      )}
    </CabinetPageLayout>
  );
}
