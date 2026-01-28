import { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { BookOpen, Plus, Heart, Brain, Edit3, Trash2, Download, Filter, ChevronLeft, Lock, Loader2, AlertCircle } from 'lucide-react';
import * as cabinetApi from '@/api/endpoints/cabinet';
import type { DiaryEntry } from '@/api/types/cabinet';

interface CabinetDiaryProps {
  onBack?: () => void;
}

const diaryTypeMeta: Record<string, { name: string; description: string; icon: typeof Heart; color: string; bgColor: string }> = {
  emotions: {
    name: 'Дневник эмоций',
    description: 'Отслеживание настроения',
    icon: Heart,
    color: 'from-[#FFB5C5] to-[#FFD4B5]',
    bgColor: 'from-[#FFB5C5]/5 to-[#FFD4B5]/5',
  },
  abc: {
    name: 'ABC дневник',
    description: 'Анализ мыслей и реакций',
    icon: Brain,
    color: 'from-[#A8B5FF] to-[#C8F5E8]',
    bgColor: 'from-[#A8B5FF]/5 to-[#C8F5E8]/5',
  },
  gratitude: {
    name: 'Дневник благодарности',
    description: 'Что радует каждый день',
    icon: Heart,
    color: 'from-[#7FD99A] to-[#C8F5E8]',
    bgColor: 'from-[#7FD99A]/5 to-[#C8F5E8]/5',
  },
};

const diaryTypes = [
  { id: 'emotions', ...diaryTypeMeta.emotions },
  { id: 'abc', ...diaryTypeMeta.abc },
  { id: 'gratitude', ...diaryTypeMeta.gratitude },
];

function formatEntryDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
}

function formatEntryTime(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
}

export default function CabinetDiary({ onBack }: CabinetDiaryProps) {
  const [selectedType, setSelectedType] = useState<string>('all');
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newType, setNewType] = useState('abc');
  const [newContent, setNewContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const loadEntries = useCallback(() => {
    setLoading(true);
    setError(null);
    cabinetApi
      .getDiaryEntries()
      .then((res) => setEntries(res.data ?? []))
      .catch((err) => setError(err?.message ?? 'Не удалось загрузить записи'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);
    setSubmitting(true);
    try {
      await cabinetApi.createDiaryEntry({ type: newType, content: newContent || undefined });
      setNewContent('');
      setShowNewForm(false);
      loadEntries();
    } catch (err) {
      setCreateError(err?.message ?? 'Не удалось создать запись');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredEntries = selectedType === 'all'
    ? entries
    : entries.filter((entry) => entry.type === selectedType);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-32">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-[#7FD99A]" />
          <p className="text-[#718096]">Загрузка записей...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 pt-32">
        <div className="max-w-4xl mx-auto flex flex-col items-center gap-4 py-12">
          <AlertCircle className="w-12 h-12 text-red-500" />
          <p className="text-[#2D3748] font-medium">{error}</p>
          <button
            onClick={() => loadEntries()}
            type="button"
            className="px-6 py-3 rounded-xl border-2 border-gray-200 text-[#2D3748] font-medium hover:bg-gray-50"
          >
            Обновить
          </button>
          {onBack && (
            <button onClick={onBack} type="button" className="text-sm text-[#718096] hover:text-[#7FD99A]">
              Вернуться в кабинет
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <section className="relative px-4 sm:px-6 lg:px-8 pt-32 sm:pt-36 lg:pt-40 pb-8 sm:pb-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#7FD99A]/10 to-white -z-10" />
        
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <button
              onClick={onBack}
              className="inline-flex items-center gap-2 text-sm text-[#718096] hover:text-[#7FD99A] transition-colors mb-6"
            >
              <ChevronLeft className="w-5 h-5" />
              Вернуться в кабинет
            </button>

            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-[32px] sm:text-4xl lg:text-5xl font-bold text-[#2D3748] mb-2 leading-tight">
                  Мои дневники
                </h1>
                <p className="text-base sm:text-lg text-[#718096]">
                  Личное пространство для рефлексии
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowNewForm(true)}
                className="hidden sm:flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#7FD99A] to-[#C8F5E8] text-white font-medium shadow-sm hover:shadow-md active:scale-[0.98] transition-all"
              >
                <Plus className="w-5 h-5" />
                Новая запись
              </button>
            </div>

            {/* Privacy Notice */}
            <div className="bg-gradient-to-r from-[#C8F5E8]/10 to-[#7FD99A]/10 border border-[#C8F5E8]/30 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Lock className="w-5 h-5 text-[#7FD99A] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-[#718096]">
                    <span className="font-medium text-[#2D3748]">Только для вас:</span> Ваши записи полностью конфиденциальны. 
                    Психолог не видит их без вашего разрешения.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Diary Types */}
      <section className="px-4 sm:px-6 lg:px-8 pb-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-lg font-semibold text-[#2D3748] mb-4">
            Типы дневников
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {diaryTypes.map((type) => (
              <button
                key={type.id}
                type="button"
                onClick={() => {
                  setNewType(type.id);
                  setShowNewForm(true);
                }}
                className="group bg-white border border-gray-200 rounded-xl p-5 hover:border-transparent hover:shadow-lg transition-all text-left relative overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${type.bgColor} opacity-0 group-hover:opacity-100 transition-opacity`} />
                <div className="relative">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${type.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <type.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-base font-semibold text-[#2D3748] mb-1">{type.name}</h3>
                  <p className="text-sm text-[#718096]">{type.description}</p>
                </div>
              </button>
            ))}
          </div>

          {/* New entry form */}
          {showNewForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-6 bg-white border border-gray-200 rounded-2xl p-6 shadow-lg"
            >
              <h3 className="text-lg font-semibold text-[#2D3748] mb-4">Новая запись</h3>
              {createError && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">{createError}</div>
              )}
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#2D3748] mb-2">Тип</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 text-[#2D3748] bg-white focus:outline-none focus:border-[#7FD99A]"
                  >
                    {diaryTypes.map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#2D3748] mb-2">Текст (необязательно)</label>
                  <textarea
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 text-[#2D3748] bg-white focus:outline-none focus:border-[#7FD99A]"
                    placeholder="Опишите мысли, настроение или события дня..."
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#7FD99A] to-[#C8F5E8] text-white font-medium disabled:opacity-50 flex items-center gap-2"
                  >
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    Сохранить
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowNewForm(false); setCreateError(null); }}
                    className="px-6 py-2.5 rounded-xl border border-gray-200 text-[#718096] font-medium hover:bg-gray-50"
                  >
                    Отмена
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </div>
      </section>

      {/* Filter & Actions */}
      <section className="px-4 sm:px-6 lg:px-8 pb-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-[#718096]" />
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-4 py-2 rounded-lg border border-gray-200 text-sm text-[#2D3748] bg-white focus:outline-none focus:border-[#7FD99A]"
              >
                <option value="all">Все записи ({entries.length})</option>
                <option value="emotions">Дневник эмоций</option>
                <option value="abc">ABC дневник</option>
                <option value="gratitude">Дневник благодарности</option>
              </select>
            </div>

            <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-sm text-[#718096] hover:border-[#7FD99A]/30 hover:bg-gray-50 transition-all">
              <Download className="w-4 h-4" />
              Экспорт в PDF
            </button>
          </div>
        </div>
      </section>

      {/* Entries List */}
      <section className="px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16">
        <div className="max-w-4xl mx-auto">
          {filteredEntries.length > 0 ? (
            <div className="space-y-4">
              {filteredEntries.map((entry, index) => {
                const meta = diaryTypeMeta[entry.type] ?? { name: entry.type, color: 'from-[#A8B5FF] to-[#C8F5E8]' };
                return (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="group bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 hover:border-gray-300 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <div className="text-3xl flex-shrink-0">📝</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${meta.color} text-white`}>
                              {meta.name}
                            </span>
                            <div className="flex items-center gap-2 text-sm text-[#718096] mt-2">
                              <span>{formatEntryDate(entry.created_at)}</span>
                              {entry.created_at && <span>•</span>}
                              <span>{formatEntryTime(entry.created_at)}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button type="button" className="w-9 h-9 rounded-lg hover:bg-gray-50 flex items-center justify-center transition-colors">
                              <Edit3 className="w-4 h-4 text-[#718096]" />
                            </button>
                            <button type="button" className="w-9 h-9 rounded-lg hover:bg-red-50 flex items-center justify-center transition-colors">
                              <Trash2 className="w-4 h-4 text-[#718096] hover:text-red-500" />
                            </button>
                          </div>
                        </div>
                        {entry.content ? (
                          <p className="text-base text-[#718096] leading-relaxed line-clamp-3">{entry.content}</p>
                        ) : (
                          <p className="text-sm text-[#718096] italic">Запись без текста</p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            // Empty State
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#7FD99A]/10 to-[#C8F5E8]/10 flex items-center justify-center mx-auto mb-6">
                <BookOpen className="w-10 h-10 text-[#7FD99A]" />
              </div>
              <h3 className="text-xl font-semibold text-[#2D3748] mb-2">
                У вас пока нет записей
              </h3>
              <p className="text-base text-[#718096] mb-8 max-w-md mx-auto">
                Начните вести дневник, чтобы лучше понимать свои эмоции и мысли
              </p>
              <button
                type="button"
                onClick={() => setShowNewForm(true)}
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-[#7FD99A] to-[#C8F5E8] text-white font-medium shadow-sm hover:shadow-md active:scale-[0.98] transition-all inline-flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Создать первую запись
              </button>
            </motion.div>
          )}
        </div>
      </section>

      {/* Mobile FAB */}
      <button
        type="button"
        onClick={() => setShowNewForm(true)}
        className="sm:hidden fixed bottom-6 right-4 w-14 h-14 rounded-full bg-gradient-to-r from-[#7FD99A] to-[#C8F5E8] text-white shadow-[0_8px_24px_-4px_rgba(127,217,154,0.5)] hover:shadow-[0_12px_32px_-4px_rgba(127,217,154,0.6)] active:scale-95 transition-all flex items-center justify-center z-40"
      >
        <Plus className="w-6 h-6" />
      </button>
    </>
  );
}
