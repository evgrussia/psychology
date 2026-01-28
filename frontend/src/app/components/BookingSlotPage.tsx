import { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { Calendar as CalendarIcon, Clock, Video, MapPin, ChevronLeft, ChevronRight, Globe, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { getSlots } from '@/api/endpoints/booking';
import type { Service, Slot } from '@/api/types/booking';
import { ApiError } from '@/api/client';
import { showApiError } from '@/lib/errorToast';

function formatPrice(amount: number): string {
  return new Intl.NumberFormat('ru-RU', { style: 'decimal', maximumFractionDigits: 0 }).format(amount) + ' ₽';
}

function getTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/Moscow';
  } catch {
    return 'Europe/Moscow';
  }
}

function getDateRange(): { date_from: string; date_to: string } {
  const now = new Date();
  const date_from = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const date_to = new Date(date_from);
  date_to.setDate(date_to.getDate() + 60);
  return {
    date_from: date_from.toISOString(),
    date_to: date_to.toISOString(),
  };
}

function slotToLocalDate(slot: Slot): string {
  const s = slot.local_start_at || slot.start_at;
  return s.slice(0, 10);
}

function slotToLocalTime(slot: Slot): string {
  const s = slot.local_start_at || slot.start_at;
  const d = new Date(s);
  return d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
}

function slotsByDate(slots: Slot[]): Map<string, Slot[]> {
  const map = new Map<string, Slot[]>();
  for (const slot of slots) {
    const key = slotToLocalDate(slot);
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(slot);
  }
  for (const arr of map.values()) {
    arr.sort((a, b) => (a.local_start_at || a.start_at).localeCompare(b.local_start_at || b.start_at));
  }
  return map;
}

interface BookingSlotPageProps {
  serviceId: string | null;
  service: Service | null;
  onContinue?: (slot: Slot, format: 'online' | 'offline') => void;
  onBack?: () => void;
}

export default function BookingSlotPage({ serviceId, service, onContinue, onBack }: BookingSlotPageProps) {
  const [format, setFormat] = useState<'online' | 'offline'>('online');
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [currentMonthOffset, setCurrentMonthOffset] = useState(0);

  const timezone = getTimezone();
  const { date_from, date_to } = getDateRange();

  const slotsByDateMap = useMemo(() => slotsByDate(slots), [slots]);
  const availableDates = useMemo(() => Array.from(slotsByDateMap.keys()).sort(), [slotsByDateMap]);
  const slotsForSelectedDate = selectedDateKey ? slotsByDateMap.get(selectedDateKey) ?? [] : [];

  useEffect(() => {
    if (!serviceId) return;
    setLoading(true);
    setError(null);
    getSlots(serviceId, { date_from, date_to, timezone })
      .then((res) => {
        setSlots(res.data);
        setSelectedDateKey(null);
        setSelectedSlot(null);
      })
      .catch((err) => {
        showApiError(err);
        setError(err instanceof ApiError ? err.message : 'Не удалось загрузить слоты');
      })
      .finally(() => setLoading(false));
  }, [serviceId, date_from, date_to, timezone]);

  const subtitle = service
    ? `${service.title} • ${service.duration_minutes} мин • ${formatPrice(Number(service.price_amount))}`
    : '';

  if (!serviceId) {
    return (
      <section className="relative px-4 sm:px-6 lg:px-8 pt-32 sm:pt-36 lg:pt-40 pb-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#C8F5E8]/10 to-white -z-10" />
        <div className="max-w-md mx-auto text-center">
          <p className="text-[#718096] mb-4">Сначала выберите услугу</p>
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-sm text-[#718096] hover:text-[#A8B5FF] transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            Назад к выбору услуги
          </button>
        </div>
      </section>
    );
  }

  if (loading) {
    return (
      <section className="relative px-4 sm:px-6 lg:px-8 pt-32 sm:pt-36 lg:pt-40 pb-12 overflow-hidden min-h-[50vh] flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-b from-[#C8F5E8]/10 to-white -z-10" />
        <div className="flex flex-col items-center gap-4 text-[#718096]">
          <Loader2 className="w-10 h-10 animate-spin text-[#7FD99A]" />
          <p>Загрузка доступного времени...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="relative px-4 sm:px-6 lg:px-8 pt-32 sm:pt-36 lg:pt-40 pb-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#C8F5E8]/10 to-white -z-10" />
        <div className="max-w-md mx-auto text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-red-50 text-red-500 mb-4">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-semibold text-[#2D3748] mb-2">Ошибка загрузки</h2>
          <p className="text-[#718096] mb-4">{error}</p>
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-sm text-[#A8B5FF] hover:underline"
          >
            <ChevronLeft className="w-5 h-5" />
            Назад к выбору услуги
          </button>
        </div>
      </section>
    );
  }

  const daysOfWeek = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
  const now = new Date();
  const viewMonth = new Date(now.getFullYear(), now.getMonth() + currentMonthOffset, 1);
  const viewMonthLabel = viewMonth.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });
  const firstDay = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 1).getDay();
  const startOffset = firstDay === 0 ? 6 : firstDay - 1;
  const daysInMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 0).getDate();
  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < startOffset; i++) calendarDays.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarDays.push(d);
  const dayKey = (d: number) => {
    const y = viewMonth.getFullYear();
    const m = String(viewMonth.getMonth() + 1).padStart(2, '0');
    const day = String(d).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  return (
    <>
      <section className="relative px-4 sm:px-6 lg:px-8 pt-32 sm:pt-36 lg:pt-40 pb-8 sm:pb-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#C8F5E8]/10 to-white -z-10" />
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <button
              onClick={onBack}
              className="inline-flex items-center gap-2 text-sm text-[#718096] hover:text-[#A8B5FF] transition-colors mb-6"
            >
              <ChevronLeft className="w-5 h-5" />
              Назад к выбору услуги
            </button>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#C8F5E8]/10 to-[#7FD99A]/10 text-sm font-medium text-[#2D3748] mb-6">
              <CalendarIcon className="w-4 h-4 text-[#7FD99A]" />
              Шаг 2 из 4
            </div>
            <h1 className="text-[32px] sm:text-4xl lg:text-5xl font-bold text-[#2D3748] mb-4 leading-tight">
              Выберите дату и время
            </h1>
            <p className="text-base sm:text-lg text-[#718096] leading-relaxed">{subtitle}</p>
          </motion.div>
        </div>
      </section>

      <section className="px-4 sm:px-6 lg:px-8 pb-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-lg font-semibold text-[#2D3748] mb-4">Формат встречи</h2>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setFormat('online')}
              className={`p-4 rounded-xl border-2 transition-all ${
                format === 'online' ? 'border-[#7FD99A] bg-[#7FD99A]/5' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${format === 'online' ? 'bg-[#7FD99A]/10' : 'bg-gray-50'}`}>
                  <Video className={`w-5 h-5 ${format === 'online' ? 'text-[#7FD99A]' : 'text-[#718096]'}`} />
                </div>
                <div className="text-left">
                  <p className={`text-sm sm:text-base font-medium ${format === 'online' ? 'text-[#2D3748]' : 'text-[#718096]'}`}>Онлайн</p>
                  <p className="text-xs text-[#718096]">Видеосвязь</p>
                </div>
              </div>
            </button>
            <button
              onClick={() => setFormat('offline')}
              className={`p-4 rounded-xl border-2 transition-all ${
                format === 'offline' ? 'border-[#7FD99A] bg-[#7FD99A]/5' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${format === 'offline' ? 'bg-[#7FD99A]/10' : 'bg-gray-50'}`}>
                  <MapPin className={`w-5 h-5 ${format === 'offline' ? 'text-[#7FD99A]' : 'text-[#718096]'}`} />
                </div>
                <div className="text-left">
                  <p className={`text-sm sm:text-base font-medium ${format === 'offline' ? 'text-[#2D3748]' : 'text-[#718096]'}`}>Офлайн</p>
                  <p className="text-xs text-[#718096]">В офисе</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </section>

      <section className="px-4 sm:px-6 lg:px-8 pb-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-2 text-sm text-[#718096]">
              <Globe className="w-4 h-4" />
              <span>Часовой пояс:</span>
            </div>
            <span className="text-sm text-[#2D3748] font-medium">{timezone}</span>
          </div>
        </div>
      </section>

      <section className="px-4 sm:px-6 lg:px-8 pb-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-6">
            <div className="flex items-center justify-between mb-6">
              <button
                type="button"
                onClick={() => setCurrentMonthOffset((o) => o - 1)}
                className="w-10 h-10 rounded-lg hover:bg-gray-50 flex items-center justify-center transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-[#718096]" />
              </button>
              <h3 className="text-lg font-semibold text-[#2D3748] capitalize">{viewMonthLabel}</h3>
              <button
                type="button"
                onClick={() => setCurrentMonthOffset((o) => o + 1)}
                className="w-10 h-10 rounded-lg hover:bg-gray-50 flex items-center justify-center transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-[#718096]" />
              </button>
            </div>
            <div className="grid grid-cols-7 gap-2 mb-2">
              {daysOfWeek.map((day) => (
                <div key={day} className="text-center text-xs font-medium text-[#718096] py-2">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2">
              {calendarDays.map((day, index) => {
                if (day === null) return <div key={`empty-${index}`} className="aspect-square" />;
                const key = dayKey(day);
                const isAvailable = availableDates.includes(key);
                const isSelected = selectedDateKey === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      setSelectedDateKey(key);
                      setSelectedSlot(null);
                    }}
                    disabled={!isAvailable}
                    className={`aspect-square rounded-xl text-sm sm:text-base font-medium transition-all ${
                      isSelected
                        ? 'bg-gradient-to-br from-[#7FD99A] to-[#C8F5E8] text-white shadow-sm'
                        : isAvailable
                          ? 'bg-white border-2 border-[#7FD99A]/20 text-[#2D3748] hover:border-[#7FD99A]/50'
                          : 'bg-gray-50 text-[#718096] cursor-not-allowed opacity-50'
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {selectedDateKey && (
        <section className="px-4 sm:px-6 lg:px-8 pb-12">
          <div className="max-w-4xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <h2 className="text-lg font-semibold text-[#2D3748] mb-4">
                Доступное время на {new Date(selectedDateKey + 'T12:00:00').toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {slotsForSelectedDate.map((slot) => {
                  const isSelected = selectedSlot?.id === slot.id;
                  const available = slot.status === 'available';
                  return (
                    <button
                      key={slot.id}
                      type="button"
                      onClick={() => available && setSelectedSlot(slot)}
                      disabled={!available}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        isSelected
                          ? 'border-[#7FD99A] bg-[#7FD99A]/5'
                          : available
                            ? 'border-gray-200 hover:border-[#7FD99A]/30'
                            : 'border-gray-100 bg-gray-50 cursor-not-allowed opacity-50'
                      }`}
                    >
                      <div className="flex items-center gap-2 justify-center">
                        <Clock className={`w-4 h-4 ${isSelected ? 'text-[#7FD99A]' : 'text-[#718096]'}`} />
                        <span className={`text-base font-medium ${isSelected ? 'text-[#2D3748]' : 'text-[#718096]'}`}>
                          {slotToLocalTime(slot)}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {selectedSlot && (
        <section className="px-4 sm:px-6 lg:px-8 pb-8 sm:pb-12">
          <div className="max-w-4xl mx-auto">
            <div className="sticky bottom-0 sm:static bg-white sm:bg-transparent py-4 sm:py-0 -mx-4 px-4 sm:mx-0 sm:px-0 border-t sm:border-0 border-gray-100">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-[#7FD99A]/10 to-[#C8F5E8]/10 border border-[#7FD99A]/20 rounded-2xl p-6"
              >
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#7FD99A] to-[#C8F5E8] flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-[#2D3748] mb-3">Выбранное время</h3>
                    <div className="space-y-2 text-sm text-[#718096]">
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4" />
                        <span>
                          {new Date(selectedSlot.local_start_at || selectedSlot.start_at).toLocaleDateString('ru-RU', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                          , {slotToLocalTime(selectedSlot)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {format === 'online' ? <Video className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
                        <span>{format === 'online' ? 'Онлайн-встреча' : 'В офисе'}</span>
                      </div>
                      {service && (
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>{service.duration_minutes} минут</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onContinue?.(selectedSlot, format)}
                  className="w-full px-8 py-4 rounded-xl bg-gradient-to-r from-[#7FD99A] to-[#C8F5E8] text-white font-medium shadow-[0_8px_24px_-4px_rgba(127,217,154,0.4)] hover:shadow-[0_12px_32px_-4px_rgba(127,217,154,0.5)] active:scale-[0.98] transition-all"
                >
                  Продолжить
                </button>
              </motion.div>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
