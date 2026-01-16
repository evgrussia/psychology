'use client';

import React from 'react';
import Link from 'next/link';
import {
  Button,
  Card,
  Checkbox,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from '@psychology/design-system';
import { CabinetPageLayout } from '../CabinetPageLayout';
import {
  createCabinetDiary,
  deleteCabinetDiary,
  exportCabinetDiary,
  getCabinetDiary,
  DiaryEntry,
  DiaryType,
  ExportDiaryPeriod,
} from '../cabinetApi';
import { track } from '@/lib/tracking';

const diaryTabs: Array<{ type: DiaryType; label: string }> = [
  { type: 'emotions', label: 'Эмоции' },
  { type: 'abc', label: 'ABC-дневник' },
];

const intensityOptions = [
  { value: 'low', label: 'Низкая' },
  { value: 'moderate', label: 'Средняя' },
  { value: 'high', label: 'Высокая' },
];

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export default function CabinetDiaryPage() {
  const [loading, setLoading] = React.useState(true);
  const [unauthorized, setUnauthorized] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [diaryType, setDiaryType] = React.useState<DiaryType>('emotions');
  const [entries, setEntries] = React.useState<DiaryEntry[]>([]);
  const [entryDate, setEntryDate] = React.useState(() => formatDate(new Date()));
  const [fromDate, setFromDate] = React.useState<string>('');
  const [toDate, setToDate] = React.useState<string>('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isExporting, setIsExporting] = React.useState(false);
  const [withoutText, setWithoutText] = React.useState(false);
  const [exportPeriod, setExportPeriod] = React.useState<ExportDiaryPeriod>('30d');
  const [emotionValues, setEmotionValues] = React.useState({
    emotion: '',
    intensity: '',
    context: '',
    notes: '',
  });
  const [abcValues, setAbcValues] = React.useState({
    activating_event: '',
    beliefs: '',
    consequences: '',
    notes: '',
  });

  React.useEffect(() => {
    track('lk_opened', { page_path: '/cabinet/diary' });
  }, []);

  const loadEntries = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await getCabinetDiary({
        type: diaryType,
        from: fromDate || undefined,
        to: toDate || undefined,
      });
      setEntries(data.items);
      setUnauthorized(false);
      setError(null);
    } catch (err: any) {
      if (err?.message === 'unauthorized') {
        setUnauthorized(true);
      } else {
        setError('Не удалось загрузить дневники.');
      }
    } finally {
      setLoading(false);
    }
  }, [diaryType, fromDate, toDate]);

  React.useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  const resetForm = () => {
    setEntryDate(formatDate(new Date()));
    setWithoutText(false);
    setEmotionValues({ emotion: '', intensity: '', context: '', notes: '' });
    setAbcValues({ activating_event: '', beliefs: '', consequences: '', notes: '' });
  };

  const buildPayload = () => {
    if (diaryType === 'emotions') {
      return {
        emotion: emotionValues.emotion.trim(),
        intensity: emotionValues.intensity,
        context: withoutText ? null : emotionValues.context.trim() || null,
        notes: withoutText ? null : emotionValues.notes.trim() || null,
      };
    }
    return {
      activating_event: withoutText ? null : abcValues.activating_event.trim() || null,
      beliefs: withoutText ? null : abcValues.beliefs.trim() || null,
      consequences: withoutText ? null : abcValues.consequences.trim() || null,
      notes: withoutText ? null : abcValues.notes.trim() || null,
    };
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (diaryType === 'emotions' && !emotionValues.emotion.trim()) {
      setError('Пожалуйста, отметьте эмоцию.');
      return;
    }
    if (diaryType === 'emotions' && !emotionValues.intensity) {
      setError('Пожалуйста, выберите интенсивность.');
      return;
    }

    setIsSubmitting(true);
    try {
      await createCabinetDiary({
        diary_type: diaryType,
        entry_date: entryDate,
        payload: buildPayload(),
      });
      resetForm();
      await loadEntries();
    } catch (err: any) {
      if (err?.message === 'unauthorized') {
        setUnauthorized(true);
      } else {
        setError('Не удалось сохранить запись. Попробуйте снова.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (entry: DiaryEntry) => {
    setError(null);
    if (!window.confirm('Удалить запись из дневника?')) {
      return;
    }
    try {
      await deleteCabinetDiary(entry.id);
      await loadEntries();
    } catch (err: any) {
      if (err?.message === 'unauthorized') {
        setUnauthorized(true);
      } else {
        setError('Не удалось удалить запись.');
      }
    }
  };

  const handleExport = async () => {
    setError(null);
    if (exportPeriod === 'custom' && (!fromDate || !toDate)) {
      setError('Укажите период для экспорта.');
      return;
    }

    setIsExporting(true);
    try {
      const result = await exportCabinetDiary({
        period: exportPeriod,
        from: exportPeriod === 'custom' ? fromDate : null,
        to: exportPeriod === 'custom' ? toDate : null,
      });
      const url = window.URL.createObjectURL(result.blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = result.filename;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      if (err?.message === 'unauthorized') {
        setUnauthorized(true);
      } else {
        setError('Не удалось сформировать PDF. Попробуйте снова.');
      }
    } finally {
      setIsExporting(false);
    }
  };

  const renderEntrySummary = (entry: DiaryEntry) => {
    if (entry.diary_type === 'emotions') {
      const emotion = (entry.payload?.emotion as string) || 'Эмоция';
      const intensity = (entry.payload?.intensity as string) || '';
      return (
        <>
          <div className="text-lg font-semibold text-foreground">{emotion}</div>
          {intensity && <div className="text-sm text-muted-foreground">Интенсивность: {intensity}</div>}
        </>
      );
    }
    return (
      <>
        <div className="text-lg font-semibold text-foreground">ABC-запись</div>
        <div className="text-sm text-muted-foreground">
          {entry.payload?.activating_event ? 'Ситуация описана' : 'Без текста'}
        </div>
      </>
    );
  };

  return (
    <CabinetPageLayout
      title="Дневники"
      description="Личные заметки доступны только вам. Записи можно удалять в любой момент."
    >
      {loading && (
        <div className="rounded-2xl border border-dashed border-border p-8 text-center text-muted-foreground">
          Загружаем дневники...
        </div>
      )}

      {!loading && unauthorized && (
        <Card className="p-8 text-center space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">Войдите, чтобы вести дневник</h2>
          <p className="text-muted-foreground">
            Дневники доступны только авторизованным клиентам.
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
          <Card className="p-6 space-y-6">
            <div className="flex flex-wrap gap-2">
              {diaryTabs.map((tab) => (
                <Button
                  key={tab.type}
                  type="button"
                  variant={diaryType === tab.type ? 'default' : 'outline'}
                  onClick={() => setDiaryType(tab.type)}
                >
                  {tab.label}
                </Button>
              ))}
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="entryDate">Дата</Label>
                  <Input
                    id="entryDate"
                    type="date"
                    value={entryDate}
                    onChange={(event) => setEntryDate(event.target.value)}
                    required
                  />
                </div>
                {diaryType === 'emotions' && (
                  <div className="space-y-2">
                    <Label>Интенсивность</Label>
                    <Select
                      value={emotionValues.intensity}
                      onValueChange={(value) => setEmotionValues((prev) => ({ ...prev, intensity: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите уровень" />
                      </SelectTrigger>
                      <SelectContent>
                        {intensityOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                {diaryType === 'emotions' && (
                  <div className="space-y-2">
                    <Label htmlFor="emotion">Эмоция</Label>
                    <Input
                      id="emotion"
                      value={emotionValues.emotion}
                      onChange={(event) => setEmotionValues((prev) => ({ ...prev, emotion: event.target.value }))}
                      placeholder="Например, тревога"
                      required
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="withoutText"
                  checked={withoutText}
                  onCheckedChange={(checked) => setWithoutText(Boolean(checked))}
                />
                <Label htmlFor="withoutText">Без текста — только отметки и категории</Label>
              </div>

              {diaryType === 'emotions' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="emotionContext">Ситуация или фон</Label>
                    <Textarea
                      id="emotionContext"
                      value={emotionValues.context}
                      onChange={(event) => setEmotionValues((prev) => ({ ...prev, context: event.target.value }))}
                      placeholder="Коротко опишите, что происходило"
                      disabled={withoutText}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emotionNotes">Что помогло или хотелось бы попробовать</Label>
                    <Textarea
                      id="emotionNotes"
                      value={emotionValues.notes}
                      onChange={(event) => setEmotionValues((prev) => ({ ...prev, notes: event.target.value }))}
                      placeholder="Можно оставить пустым"
                      disabled={withoutText}
                    />
                  </div>
                </div>
              )}

              {diaryType === 'abc' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="abcEvent">A — Ситуация</Label>
                    <Textarea
                      id="abcEvent"
                      value={abcValues.activating_event}
                      onChange={(event) => setAbcValues((prev) => ({ ...prev, activating_event: event.target.value }))}
                      placeholder="Что произошло?"
                      disabled={withoutText}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="abcBeliefs">B — Мысли и убеждения</Label>
                    <Textarea
                      id="abcBeliefs"
                      value={abcValues.beliefs}
                      onChange={(event) => setAbcValues((prev) => ({ ...prev, beliefs: event.target.value }))}
                      placeholder="Какие мысли появились?"
                      disabled={withoutText}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="abcConsequences">C — Реакции и последствия</Label>
                    <Textarea
                      id="abcConsequences"
                      value={abcValues.consequences}
                      onChange={(event) => setAbcValues((prev) => ({ ...prev, consequences: event.target.value }))}
                      placeholder="Что вы почувствовали или сделали?"
                      disabled={withoutText}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="abcNotes">Заметка</Label>
                    <Textarea
                      id="abcNotes"
                      value={abcValues.notes}
                      onChange={(event) => setAbcValues((prev) => ({ ...prev, notes: event.target.value }))}
                      placeholder="Можно оставить пустым"
                      disabled={withoutText}
                    />
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-3">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Сохраняем...' : 'Сохранить запись'}
                </Button>
                <Button type="button" variant="ghost" onClick={resetForm}>
                  Очистить
                </Button>
              </div>
            </form>
          </Card>

          <Card className="p-6 space-y-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="text-lg font-semibold text-foreground">Записи</div>
              <div className="flex flex-wrap gap-2">
                <div className="space-y-1">
                  <Label htmlFor="fromDate" className="text-xs uppercase text-muted-foreground">С</Label>
                  <Input
                    id="fromDate"
                    type="date"
                    value={fromDate}
                    onChange={(event) => setFromDate(event.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="toDate" className="text-xs uppercase text-muted-foreground">По</Label>
                  <Input
                    id="toDate"
                    type="date"
                    value={toDate}
                    onChange={(event) => setToDate(event.target.value)}
                  />
                </div>
                <Button type="button" variant="outline" onClick={loadEntries}>
                  Применить
                </Button>
                <div className="space-y-1">
                  <Label htmlFor="exportPeriod" className="text-xs uppercase text-muted-foreground">
                    Экспорт
                  </Label>
                  <Select
                    value={exportPeriod}
                    onValueChange={(value) => setExportPeriod(value as ExportDiaryPeriod)}
                  >
                    <SelectTrigger id="exportPeriod" className="min-w-[160px]">
                      <SelectValue placeholder="Период" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7d">Последние 7 дней</SelectItem>
                      <SelectItem value="30d">Последние 30 дней</SelectItem>
                      <SelectItem value="custom">Выбрать вручную</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="button" onClick={handleExport} disabled={isExporting}>
                  {isExporting ? 'Готовим PDF...' : 'Скачать PDF'}
                </Button>
              </div>
            </div>

            {entries.length ? (
              <div className="space-y-4">
                {entries.map((entry) => (
                  <Card key={entry.id} className="p-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="text-xs uppercase tracking-wider text-muted-foreground">
                        {entry.entry_date}
                      </div>
                      {renderEntrySummary(entry)}
                      {entry.has_text && (
                        <div className="text-xs text-muted-foreground mt-2">
                          Содержит текст
                        </div>
                      )}
                    </div>
                    <Button type="button" variant="outline" onClick={() => handleDelete(entry)}>
                      Удалить
                    </Button>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-muted-foreground">
                Записей пока нет. Добавьте первую запись выше.
              </div>
            )}
          </Card>
        </div>
      )}
    </CabinetPageLayout>
  );
}
