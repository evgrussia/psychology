'use client';

import React from 'react';
import Link from 'next/link';
import { Button, Card, Checkbox, Label } from '@psychology/design-system';
import { CabinetPageLayout } from '../CabinetPageLayout';
import {
  deleteCabinetAccount,
  exportCabinetData,
  getCabinetConsents,
  updateCabinetConsents,
} from '../cabinetApi';
import { track } from '@/lib/tracking';

export default function CabinetSettingsPage() {
  const [loading, setLoading] = React.useState(true);
  const [unauthorized, setUnauthorized] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [notice, setNotice] = React.useState<string | null>(null);
  const [consents, setConsents] = React.useState({
    personal_data: true,
    communications: false,
    telegram: false,
  });
  const [isSaving, setIsSaving] = React.useState(false);
  const [isExporting, setIsExporting] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [isDeleted, setIsDeleted] = React.useState(false);

  React.useEffect(() => {
    track('lk_opened', { page_path: '/cabinet/settings' });
  }, []);

  React.useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        const data = await getCabinetConsents();
        if (!isMounted) return;
        setConsents(data);
        setUnauthorized(false);
        setError(null);
      } catch (err: any) {
        if (!isMounted) return;
        if (err?.message === 'unauthorized') {
          setUnauthorized(true);
        } else {
          setError('Не удалось загрузить настройки кабинета.');
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

  const handleSaveConsents = async () => {
    setError(null);
    setNotice(null);
    setIsSaving(true);
    try {
      const result = await updateCabinetConsents({
        communications: consents.communications,
        telegram: consents.telegram,
        source: 'cabinet',
      });
      setConsents(result.consents);
      setNotice('Согласия обновлены.');
    } catch (err: any) {
      if (err?.message === 'unauthorized') {
        setUnauthorized(true);
      } else {
        setError('Не удалось обновить согласия. Попробуйте снова.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleExport = async () => {
    setError(null);
    setNotice(null);
    setIsExporting(true);
    try {
      const result = await exportCabinetData({ format: 'zip' });
      const url = window.URL.createObjectURL(result.blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = result.filename;
      link.click();
      window.URL.revokeObjectURL(url);
      setNotice('Экспорт сформирован. Файл скачан.');
    } catch (err: any) {
      if (err?.message === 'unauthorized') {
        setUnauthorized(true);
      } else {
        setError('Не удалось сформировать экспорт. Попробуйте снова.');
      }
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    setError(null);
    setNotice(null);
    if (!window.confirm('Удалить аккаунт без возможности восстановления?')) {
      return;
    }
    setIsDeleting(true);
    try {
      await deleteCabinetAccount();
      setIsDeleted(true);
      setNotice('Аккаунт удалён. Вы вышли из системы.');
    } catch (err: any) {
      if (err?.message === 'unauthorized') {
        setUnauthorized(true);
      } else {
        setError('Не удалось удалить аккаунт. Попробуйте снова.');
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <CabinetPageLayout
      title="Настройки"
      description="Управляйте согласиями и своими данными. Изменения фиксируются в журнале безопасности."
    >
      {loading && (
        <div className="rounded-2xl border border-dashed border-border p-8 text-center text-muted-foreground">
          Загружаем настройки...
        </div>
      )}

      {!loading && unauthorized && (
        <Card className="p-8 text-center space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">Войдите, чтобы открыть настройки</h2>
          <p className="text-muted-foreground">Настройки доступны только авторизованным клиентам.</p>
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

      {!loading && !unauthorized && notice && (
        <div role="status" className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-emerald-900">
          {notice}
        </div>
      )}

      {!loading && !unauthorized && !error && (
        <div className="space-y-6">
          <Card className="p-6 space-y-4">
            <div className="text-lg font-semibold text-foreground">Согласия и коммуникации</div>
            <p className="text-sm text-muted-foreground">
              Согласие на обработку персональных данных требуется для работы кабинета. Остальные согласия можно
              отключить в любой момент.
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Checkbox id="consent-personal" checked disabled />
                <Label htmlFor="consent-personal">Обработка персональных данных</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="consent-communications"
                  checked={consents.communications}
                  onCheckedChange={(checked) =>
                    setConsents((prev) => ({ ...prev, communications: Boolean(checked) }))
                  }
                />
                <Label htmlFor="consent-communications">Email и напоминания</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="consent-telegram"
                  checked={consents.telegram}
                  onCheckedChange={(checked) =>
                    setConsents((prev) => ({ ...prev, telegram: Boolean(checked) }))
                  }
                />
                <Label htmlFor="consent-telegram">Сообщения в Telegram</Label>
              </div>
            </div>
            <div>
              <Button onClick={handleSaveConsents} disabled={isSaving || isDeleted}>
                {isSaving ? 'Сохраняем...' : 'Сохранить согласия'}
              </Button>
            </div>
          </Card>

          <Card className="p-6 space-y-4">
            <div className="text-lg font-semibold text-foreground">Экспорт данных</div>
            <p className="text-sm text-muted-foreground">
              Скачайте архив с вашими данными: встречи, дневники, записи, согласия. Файл формируется сразу.
            </p>
            <div>
              <Button onClick={handleExport} disabled={isExporting || isDeleted}>
                {isExporting ? 'Готовим экспорт...' : 'Скачать архив'}
              </Button>
            </div>
          </Card>

          <Card className="p-6 space-y-4 border-destructive/30">
            <div className="text-lg font-semibold text-destructive">Удаление аккаунта</div>
            <p className="text-sm text-muted-foreground">
              Аккаунт будет удалён, доступ закроется, а чувствительные данные будут очищены. Действие необратимо.
            </p>
            <div>
              <Button variant="destructive" onClick={handleDeleteAccount} disabled={isDeleting || isDeleted}>
                {isDeleting ? 'Удаляем...' : 'Удалить аккаунт'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </CabinetPageLayout>
  );
}
