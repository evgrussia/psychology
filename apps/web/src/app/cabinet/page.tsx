'use client';

import React from 'react';
import Link from 'next/link';
import { CabinetPageLayout } from './CabinetPageLayout';
import { getCabinetAppointments, getCabinetMaterials, getCabinetProfile } from './cabinetApi';
import { Card, Button } from '@psychology/design-system';
import { track } from '@/lib/tracking';

export default function CabinetOverviewPage() {
  const [loading, setLoading] = React.useState(true);
  const [unauthorized, setUnauthorized] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [profile, setProfile] = React.useState<any>(null);
  const [appointments, setAppointments] = React.useState<any>(null);
  const [materials, setMaterials] = React.useState<any>(null);

  React.useEffect(() => {
    track('lk_opened', { page_path: '/cabinet' });
  }, []);

  React.useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        const [profileData, appointmentsData, materialsData] = await Promise.all([
          getCabinetProfile(),
          getCabinetAppointments(),
          getCabinetMaterials(),
        ]);
        if (!isMounted) return;
        setProfile(profileData);
        setAppointments(appointmentsData);
        setMaterials(materialsData);
        setUnauthorized(false);
        setError(null);
      } catch (err: any) {
        if (!isMounted) return;
        if (err?.message === 'unauthorized') {
          setUnauthorized(true);
        } else {
          setError('Не удалось загрузить данные кабинета.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <CabinetPageLayout
      title="Личный кабинет"
      description="Здесь собраны ваши встречи и материалы после консультаций."
    >
      {loading && (
        <div className="rounded-2xl border border-dashed border-border p-8 text-center text-muted-foreground">
          Загружаем данные кабинета...
        </div>
      )}

      {!loading && unauthorized && (
        <Card className="p-8 text-center space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">Войдите, чтобы открыть кабинет</h2>
          <p className="text-muted-foreground">
            Доступ к встречам и материалам доступен только для клиентов.
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
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="p-6 space-y-3">
            <div className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Ближайшая встреча
            </div>
            {appointments?.upcoming?.length ? (
              <>
                <h2 className="text-2xl font-semibold text-foreground">
                  {appointments.upcoming[0]?.service?.title || 'Встреча'}
                </h2>
                <p className="text-muted-foreground">
                  {new Date(appointments.upcoming[0].start_at_utc).toLocaleString('ru-RU', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </p>
                <Button asChild variant="outline">
                  <Link href="/cabinet/appointments">Посмотреть все встречи</Link>
                </Button>
              </>
            ) : (
              <>
                <p className="text-muted-foreground">Предстоящих встреч пока нет.</p>
                <Button asChild variant="outline">
                  <Link href="/booking">Записаться</Link>
                </Button>
              </>
            )}
          </Card>

          <Card className="p-6 space-y-3">
            <div className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Материалы
            </div>
            <h2 className="text-3xl font-semibold text-foreground">
              {materials?.items?.length ?? 0}
            </h2>
            <p className="text-muted-foreground">
              Все файлы и ссылки после встреч.
            </p>
            <Button asChild variant="outline">
              <Link href="/cabinet/materials">Открыть материалы</Link>
            </Button>
          </Card>
        </div>
      )}

      {!loading && !unauthorized && profile && (
        <Card className="p-6 mt-6">
          <h3 className="text-lg font-semibold text-foreground">Профиль</h3>
          <p className="text-muted-foreground mt-2">
            {profile.display_name || profile.email || 'Профиль клиента'}
          </p>
        </Card>
      )}
    </CabinetPageLayout>
  );
}
