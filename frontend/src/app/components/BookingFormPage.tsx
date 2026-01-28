import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Shield, Info, Loader2, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react';
import { createAppointment } from '@/api/endpoints/booking';
import type { Service, Slot, Appointment } from '@/api/types/booking';
import { ApiError } from '@/api/client';
import { showApiError } from '@/lib/errorToast';

function getTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/Moscow';
  } catch {
    return 'Europe/Moscow';
  }
}

interface BookingFormPageProps {
  serviceId: string | null;
  slotId: string | null;
  service?: Service | null;
  slot?: Slot | null;
  format?: 'online' | 'offline';
  onSuccess?: () => void;
  onBack?: () => void;
}

export default function BookingFormPage({
  serviceId,
  slotId,
  service,
  slot,
  format = 'online',
  onSuccess,
  onBack,
}: BookingFormPageProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<(string | string[])[]>(new Array(6).fill(''));
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [appointmentResult, setAppointmentResult] = useState<Appointment | null>(null);
  const [consentPersonal, setConsentPersonal] = useState(true);
  const [consentCommunications, setConsentCommunications] = useState(false);

  const questions = [
    {
      id: 'name',
      type: 'text' as const,
      question: 'Как к вам обращаться?',
      hint: 'Можете использовать псевдоним, если вам так комфортнее',
      placeholder: 'Ваше имя',
      required: true
    },
    {
      id: 'contact',
      type: 'text' as const,
      question: 'Как с вами связаться?',
      hint: 'Email или телефон для подтверждения встречи',
      placeholder: 'Email или телефон',
      required: true
    },
    {
      id: 'reason',
      type: 'textarea' as const,
      question: 'С чем вы хотели бы поработать?',
      hint: 'Опишите кратко, что вас беспокоит. Это поможет мне лучше подготовиться к встрече',
      placeholder: 'Например: чувствую тревогу, сложности в отношениях, ищу поддержку...',
      required: false,
      skippable: true
    },
    {
      id: 'therapy_experience',
      type: 'choice' as const,
      question: 'Был ли у вас опыт работы с психологом?',
      hint: 'Это помогает понять, как лучше выстроить нашу работу',
      options: [
        'Да, работаю с психологом сейчас',
        'Да, работал(а) раньше',
        'Нет, это первый опыт',
        'Предпочитаю не отвечать'
      ],
      required: false,
      skippable: true
    },
    {
      id: 'expectations',
      type: 'multiple' as const,
      question: 'Что для вас важно на встрече?',
      hint: 'Выберите всё, что подходит',
      options: [
        'Быть выслушанным без осуждения',
        'Получить конкретные советы',
        'Разобраться в себе',
        'Научиться справляться с эмоциями',
        'Найти решение проблемы',
        'Просто поговорить'
      ],
      required: false,
      skippable: true
    },
    {
      id: 'notes',
      type: 'textarea' as const,
      question: 'Есть что-то ещё, что мне важно знать?',
      hint: 'Например, особенности здоровья, предпочтения по формату встречи или любая информация, которой хотите поделиться',
      placeholder: 'Необязательное поле...',
      required: false,
      skippable: true
    }
  ];

  const currentQ = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const isAnswered = currentQ.type === 'multiple' 
    ? (answers[currentQuestion] as string[])?.length > 0
    : answers[currentQuestion] !== '';
  const canProceed = !currentQ.required || isAnswered;

  const buildIntakeForm = (): Record<string, string | string[]> => {
    const form: Record<string, string | string[]> = {};
    questions.forEach((q, i) => {
      const v = answers[i];
      if (v === undefined || v === '') return;
      if (Array.isArray(v)) form[q.id] = v;
      else form[q.id] = String(v);
    });
    return form;
  };

  const handleNext = async () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      return;
    }
    if (!serviceId || !slotId) {
      setSubmitError('Не выбраны услуга или слот');
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await createAppointment({
        service_id: serviceId,
        slot_id: slotId,
        format,
        timezone: getTimezone(),
        intake_form: buildIntakeForm(),
        consents: { personal_data: consentPersonal, communications: consentCommunications },
      });
      setAppointmentResult(res.data);
    } catch (err) {
      showApiError(err);
      setSubmitError(err instanceof ApiError ? err.message : 'Не удалось создать запись');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setSubmitError(null);
    } else {
      onBack?.();
    }
  };

  const handleTextAnswer = (value: string) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = value;
    setAnswers(newAnswers);
  };

  const handleChoiceAnswer = (value: string) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = value;
    setAnswers(newAnswers);
  };

  const handleMultipleAnswer = (value: string) => {
    const newAnswers = [...answers];
    const current = (newAnswers[currentQuestion] as string[]) || [];
    if (current.includes(value)) {
      newAnswers[currentQuestion] = current.filter(v => v !== value);
    } else {
      newAnswers[currentQuestion] = [...current, value];
    }
    setAnswers(newAnswers);
  };

  const handleSkip = () => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = currentQ.type === 'multiple' ? [] : '';
    setAnswers(newAnswers);
    handleNext();
  };

  if (!serviceId || !slotId) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#FFD4B5]/5 to-white pt-24 sm:pt-28 pb-8 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center px-4">
          <p className="text-[#718096] mb-4">Сначала выберите услугу и время</p>
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-sm text-[#A8B5FF] hover:underline"
          >
            <ChevronLeft className="w-5 h-5" />
            Назад
          </button>
        </div>
      </div>
    );
  }

  if (appointmentResult) {
    const paymentUrl = appointmentResult.payment?.payment_url;
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#FFD4B5]/5 to-white pt-24 sm:pt-28 pb-8">
        <div className="max-w-lg mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#7FD99A]/20 text-[#7FD99A] mb-6">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#2D3748] mb-3">Запись создана</h1>
          <p className="text-[#718096] mb-6">
            {appointmentResult.service?.title} — {appointmentResult.slot?.start_at
              ? new Date(appointmentResult.slot.start_at).toLocaleString('ru-RU')
              : ''}
          </p>
          {paymentUrl && (
            <a
              href={paymentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#7FD99A] to-[#C8F5E8] text-white font-medium mb-4"
            >
              Перейти к оплате
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
          <button
            onClick={onSuccess}
            className="block w-full sm:inline-block px-6 py-3 rounded-xl border-2 border-[#FFD4B5] text-[#2D3748] font-medium hover:bg-[#FFD4B5]/10 transition-colors"
          >
            В кабинет
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFD4B5]/5 to-white pt-24 sm:pt-28 pb-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 sm:mb-12">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-sm text-[#718096] hover:text-[#A8B5FF] transition-colors mb-6"
          >
            <ChevronLeft className="w-5 h-5" />
            Назад
          </button>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#FFD4B5]/10 to-[#FFC97F]/10 text-sm font-medium text-[#2D3748] mb-4">
            Шаг 3 из 4
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#2D3748] mb-3">
            Несколько вопросов
          </h1>
          <p className="text-base text-[#718096]">
            Это поможет мне лучше подготовиться к нашей встрече
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-[#718096]">
              Вопрос {currentQuestion + 1} из {questions.length}
            </span>
            <span className="text-sm font-medium text-[#FFD4B5]">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-[#FFD4B5] to-[#FFC97F]"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Privacy Notice */}
        <div className="bg-gradient-to-r from-[#C8F5E8]/10 to-[#7FD99A]/10 border border-[#C8F5E8]/30 rounded-xl p-4 mb-8">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-[#7FD99A] flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-[#718096]">
                <span className="font-medium text-[#2D3748]">Конфиденциально:</span> Ваши ответы видны только мне. 
                Вы можете пропустить любой вопрос.
              </p>
            </div>
          </div>
        </div>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 mb-6"
          >
            {/* Question */}
            <div className="mb-6">
              <h2 className="text-xl sm:text-2xl font-semibold text-[#2D3748] mb-3 leading-relaxed">
                {currentQ.question}
              </h2>
              {currentQ.hint && (
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-[#718096] flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-[#718096] leading-relaxed">
                    {currentQ.hint}
                  </p>
                </div>
              )}
            </div>

            {/* Answer Input */}
            <div>
              {currentQ.type === 'text' && (
                <input
                  type="text"
                  value={answers[currentQuestion] as string}
                  onChange={(e) => handleTextAnswer(e.target.value)}
                  placeholder={currentQ.placeholder}
                  className="w-full px-5 py-4 rounded-xl border-2 border-gray-200 focus:border-[#FFD4B5] focus:outline-none text-[#2D3748] placeholder:text-[#718096] transition-colors"
                />
              )}

              {currentQ.type === 'textarea' && (
                <textarea
                  value={answers[currentQuestion] as string}
                  onChange={(e) => handleTextAnswer(e.target.value)}
                  placeholder={currentQ.placeholder}
                  rows={5}
                  className="w-full px-5 py-4 rounded-xl border-2 border-gray-200 focus:border-[#FFD4B5] focus:outline-none text-[#2D3748] placeholder:text-[#718096] transition-colors resize-none"
                />
              )}

              {currentQ.type === 'choice' && (
                <div className="space-y-3">
                  {currentQ.options?.map((option) => (
                    <button
                      key={option}
                      onClick={() => handleChoiceAnswer(option)}
                      className={`w-full p-4 sm:p-5 rounded-xl border-2 text-left transition-all ${
                        answers[currentQuestion] === option
                          ? 'border-[#FFD4B5] bg-[#FFD4B5]/5 shadow-sm'
                          : 'border-gray-200 hover:border-[#FFD4B5]/30 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                            answers[currentQuestion] === option
                              ? 'border-[#FFD4B5] bg-[#FFD4B5]'
                              : 'border-gray-300'
                          }`}
                        >
                          {answers[currentQuestion] === option && (
                            <div className="w-2 h-2 rounded-full bg-white" />
                          )}
                        </div>
                        <span
                          className={`text-base ${
                            answers[currentQuestion] === option
                              ? 'text-[#2D3748] font-medium'
                              : 'text-[#718096]'
                          }`}
                        >
                          {option}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {currentQ.type === 'multiple' && (
                <div className="space-y-3">
                  {currentQ.options?.map((option) => {
                    const isSelected = (answers[currentQuestion] as string[])?.includes(option);
                    return (
                      <button
                        key={option}
                        onClick={() => handleMultipleAnswer(option)}
                        className={`w-full p-4 sm:p-5 rounded-xl border-2 text-left transition-all ${
                          isSelected
                            ? 'border-[#FFD4B5] bg-[#FFD4B5]/5 shadow-sm'
                            : 'border-gray-200 hover:border-[#FFD4B5]/30 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                              isSelected
                                ? 'border-[#FFD4B5] bg-[#FFD4B5]'
                                : 'border-gray-300'
                            }`}
                          >
                            {isSelected && (
                              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                          <span
                            className={`text-base ${
                              isSelected
                                ? 'text-[#2D3748] font-medium'
                                : 'text-[#718096]'
                            }`}
                          >
                            {option}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Skip Button */}
            {currentQ.skippable && (
              <div className="mt-4 text-center">
                <button
                  onClick={handleSkip}
                  className="text-sm text-[#718096] hover:text-[#FFD4B5] transition-colors"
                >
                  Пропустить вопрос
                </button>
              </div>
            )}

            {/* Consents - on last question */}
            {currentQuestion === questions.length - 1 && (
              <div className="mt-6 pt-6 border-t border-gray-100 space-y-3">
                <p className="text-sm font-medium text-[#2D3748]">Согласия</p>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consentPersonal}
                    onChange={(e) => setConsentPersonal(e.target.checked)}
                    className="mt-1 rounded border-gray-300 text-[#FFD4B5] focus:ring-[#FFD4B5]"
                  />
                  <span className="text-sm text-[#718096]">Согласие на обработку персональных данных</span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consentCommunications}
                    onChange={(e) => setConsentCommunications(e.target.checked)}
                    className="mt-1 rounded border-gray-300 text-[#FFD4B5] focus:ring-[#FFD4B5]"
                  />
                  <span className="text-sm text-[#718096]">Согласие на коммуникации (напоминания, рассылка)</span>
                </label>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {submitError && (
          <div className="mb-4 p-4 rounded-xl bg-red-50 border border-red-100 flex items-center gap-2 text-red-700 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            {submitError}
          </div>
        )}

        {/* Navigation - Fixed on Mobile */}
        <div className="fixed bottom-0 left-0 right-0 sm:static bg-white sm:bg-transparent border-t sm:border-0 border-gray-100 p-4 sm:p-0">
          <div className="max-w-3xl mx-auto flex items-center gap-3">
            <button
              onClick={handlePrevious}
              className="px-6 py-3.5 rounded-xl border-2 border-gray-200 text-[#2D3748] font-medium hover:border-[#FFD4B5] hover:bg-[#FFD4B5]/5 active:scale-[0.98] transition-all flex items-center gap-2"
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Назад</span>
            </button>

            <button
              onClick={() => handleNext()}
              disabled={!canProceed || submitting}
              className={`flex-1 px-6 py-3.5 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                canProceed && !submitting
                  ? 'bg-gradient-to-r from-[#FFD4B5] to-[#FFC97F] text-white shadow-[0_4px_12px_-2px_rgba(255,212,181,0.4)] hover:shadow-[0_6px_16px_-2px_rgba(255,212,181,0.5)] active:scale-[0.98]'
                  : 'bg-gray-100 text-[#718096] cursor-not-allowed'
              }`}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Отправка...</span>
                </>
              ) : (
                <>
                  <span>{currentQuestion === questions.length - 1 ? 'Завершить' : 'Далее'}</span>
                  <ChevronRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Safe Area Spacer for Mobile */}
        <div className="h-20 sm:h-0" />
      </div>
    </div>
  );
}
