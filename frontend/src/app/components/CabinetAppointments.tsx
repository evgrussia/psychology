import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Calendar, Clock, Video, MapPin, MoreVertical, X, RefreshCw, ExternalLink, ChevronLeft, CalendarPlus, Loader2, AlertCircle } from 'lucide-react';
import * as cabinetApi from '@/api/endpoints/cabinet';
import type { CabinetAppointment } from '@/api/types/cabinet';

interface CabinetAppointmentsProps {
  onBack?: () => void;
  onNavigateToBooking?: () => void;
}

function formatSlotDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
}

function formatSlotTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
}

function slotDurationMinutes(startAt: string, endAt: string): number {
  const start = new Date(startAt).getTime();
  const end = new Date(endAt).getTime();
  return Math.round((end - start) / 60000);
}

export default function CabinetAppointments({ onBack, onNavigateToBooking }: CabinetAppointmentsProps) {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [appointments, setAppointments] = useState<CabinetAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    cabinetApi
      .getAppointments({ status: 'all' })
      .then((res) => {
        if (!cancelled) setAppointments(res.data ?? []);
      })
      .catch((err) => {
        if (!cancelled) setError(err?.message ?? 'Не удалось загрузить встречи');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const now = new Date().toISOString();
  const upcomingAppointments = appointments.filter(
    (a) => a.slot?.start_at && a.slot.start_at >= now && !['canceled', 'no_show'].includes(a.status)
  );
  const pastAppointments = appointments.filter(
    (a) => a.slot?.start_at && (a.slot.start_at < now || ['completed', 'canceled', 'no_show'].includes(a.status))
  );

  const displayed = activeTab === 'upcoming' ? upcomingAppointments : pastAppointments;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#7FD99A]/10 text-xs font-medium text-[#7FD99A]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#7FD99A]" />
            Подтверждено
          </span>
        );
      case 'pending_payment':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-100 text-xs font-medium text-amber-700">
            Ожидает оплаты
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 text-xs font-medium text-[#718096]">
            Завершено
          </span>
        );
      case 'canceled':
      case 'no_show':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-50 text-xs font-medium text-red-600">
            Отменено
          </span>
        );
      case 'rescheduled':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#A8B5FF]/10 text-xs font-medium text-[#A8B5FF]">
            Перенесено
          </span>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-32">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-[#A8B5FF]" />
          <p className="text-[#718096]">Загрузка встреч...</p>
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
            onClick={() => window.location.reload()}
            className="px-6 py-3 rounded-xl border-2 border-gray-200 text-[#2D3748] font-medium hover:bg-gray-50"
          >
            Обновить
          </button>
          {onBack && (
            <button onClick={onBack} className="text-sm text-[#718096] hover:text-[#A8B5FF]">
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
        <div className="absolute inset-0 bg-gradient-to-b from-[#A8B5FF]/10 to-white -z-10" />
        
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <button
              onClick={onBack}
              className="inline-flex items-center gap-2 text-sm text-[#718096] hover:text-[#A8B5FF] transition-colors mb-6"
            >
              <ChevronLeft className="w-5 h-5" />
              Вернуться в кабинет
            </button>

            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-[32px] sm:text-4xl lg:text-5xl font-bold text-[#2D3748] mb-2 leading-tight">
                  Мои встречи
                </h1>
                <p className="text-base sm:text-lg text-[#718096]">
                  Управление консультациями
                </p>
              </div>

              {onNavigateToBooking && (
                <button
                  onClick={onNavigateToBooking}
                  type="button"
                  className="hidden sm:flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#A8B5FF] to-[#C8F5E8] text-white font-medium shadow-sm hover:shadow-md active:scale-[0.98] transition-all"
                >
                  <CalendarPlus className="w-5 h-5" />
                  Записаться
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Tabs */}
      <section className="px-4 sm:px-6 lg:px-8 pb-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-2 p-1 bg-gray-100 rounded-xl">
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`flex-1 px-6 py-3 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'upcoming'
                  ? 'bg-white text-[#2D3748] shadow-sm'
                  : 'text-[#718096] hover:text-[#2D3748]'
              }`}
            >
              Предстоящие ({upcomingAppointments.length})
            </button>
            <button
              onClick={() => setActiveTab('past')}
              className={`flex-1 px-6 py-3 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'past'
                  ? 'bg-white text-[#2D3748] shadow-sm'
                  : 'text-[#718096] hover:text-[#2D3748]'
              }`}
            >
              Прошедшие ({pastAppointments.length})
            </button>
          </div>
        </div>
      </section>

      {/* Appointments List */}
      <section className="px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16">
        <div className="max-w-4xl mx-auto">
          {displayed.length > 0 ? (
            <div className="space-y-4">
              {displayed.map((appointment, index) => {
                const startAt = appointment.slot?.start_at ?? '';
                const endAt = appointment.slot?.end_at ?? '';
                const durationMin = slotDurationMinutes(startAt, endAt);
                const serviceTitle = appointment.service?.title ?? 'Консультация';
                const format = appointment.format ?? 'online';
                return (
                  <motion.div
                    key={appointment.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 hover:border-gray-300 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg sm:text-xl font-semibold text-[#2D3748] mb-2">
                          {serviceTitle}
                        </h3>
                        <p className="text-sm text-[#718096]">
                          {getStatusBadge(appointment.status)}
                        </p>
                      </div>
                      <button className="w-10 h-10 rounded-lg hover:bg-gray-50 flex items-center justify-center transition-colors" type="button">
                        <MoreVertical className="w-5 h-5 text-[#718096]" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 pb-4 border-b border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#A8B5FF]/10 flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-[#A8B5FF]" />
                        </div>
                        <div>
                          <p className="text-xs text-[#718096]">Дата</p>
                          <p className="text-sm font-medium text-[#2D3748]">{formatSlotDate(startAt)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#7FD99A]/10 flex items-center justify-center">
                          <Clock className="w-5 h-5 text-[#7FD99A]" />
                        </div>
                        <div>
                          <p className="text-xs text-[#718096]">Время</p>
                          <p className="text-sm font-medium text-[#2D3748]">
                            {formatSlotTime(startAt)} • {durationMin} мин
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#FFD4B5]/10 flex items-center justify-center">
                          {format === 'online' ? (
                            <Video className="w-5 h-5 text-[#FFD4B5]" />
                          ) : (
                            <MapPin className="w-5 h-5 text-[#FFD4B5]" />
                          )}
                        </div>
                        <div>
                          <p className="text-xs text-[#718096]">Формат</p>
                          <p className="text-sm font-medium text-[#2D3748]">
                            {format === 'online' ? 'Онлайн' : 'В офисе'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {appointment.status === 'confirmed' && format === 'online' && appointment.payment?.payment_url && (
                      <div className="mb-4">
                        <a
                          href={appointment.payment.payment_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-[#A8B5FF] to-[#C8F5E8] text-white font-medium shadow-sm hover:shadow-md"
                        >
                          <ExternalLink className="w-4 h-4" />
                          Подключиться
                        </a>
                      </div>
                    )}

                    {appointment.status === 'pending_payment' && appointment.payment?.payment_url && (
                      <div className="mb-4">
                        <a
                          href={appointment.payment.payment_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-amber-500 text-white font-medium"
                        >
                          Оплатить
                        </a>
                      </div>
                    )}
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
              <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-6">
                <Calendar className="w-10 h-10 text-[#718096]" />
              </div>
              <h3 className="text-xl font-semibold text-[#2D3748] mb-2">
                {activeTab === 'upcoming' ? 'Нет предстоящих встреч' : 'Нет прошедших встреч'}
              </h3>
              <p className="text-base text-[#718096] mb-8 max-w-md mx-auto">
                {activeTab === 'upcoming'
                  ? 'Запишитесь на консультацию, чтобы начать работу с психологом'
                  : 'История ваших встреч появится здесь после первой консультации'}
              </p>
              {activeTab === 'upcoming' && onNavigateToBooking && (
                <button
                  onClick={onNavigateToBooking}
                  type="button"
                  className="px-8 py-4 rounded-xl bg-gradient-to-r from-[#A8B5FF] to-[#C8F5E8] text-white font-medium shadow-sm hover:shadow-md active:scale-[0.98] transition-all inline-flex items-center gap-2"
                >
                  <CalendarPlus className="w-5 h-5" />
                  Записаться на консультацию
                </button>
              )}
            </motion.div>
          )}
        </div>
      </section>

      {/* Mobile FAB */}
      {onNavigateToBooking && (
        <button
          onClick={onNavigateToBooking}
          type="button"
          className="sm:hidden fixed bottom-6 right-4 w-14 h-14 rounded-full bg-gradient-to-r from-[#A8B5FF] to-[#C8F5E8] text-white shadow-[0_8px_24px_-4px_rgba(168,181,255,0.5)] hover:shadow-[0_12px_32px_-4px_rgba(168,181,255,0.6)] active:scale-95 transition-all flex items-center justify-center z-40"
        >
          <CalendarPlus className="w-6 h-6" />
        </button>
      )}
    </>
  );
}
