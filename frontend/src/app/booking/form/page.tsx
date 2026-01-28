'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useBookingStore } from '@/store/bookingStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTracking } from '@/hooks/useTracking';
import { useMutation } from '@tanstack/react-query';
import { bookingService } from '@/services/api/booking';
import { toast } from 'sonner';

const intakeFormSchema = z.object({
  question_1: z.string().min(1, 'Обязательное поле'),
  question_2: z.string().min(1, 'Обязательное поле'),
  question_3: z.string().optional(),
  personal_data_consent: z.boolean().refine((val) => val === true, {
    message: 'Необходимо согласие на обработку персональных данных',
  }),
  communications_consent: z.boolean().optional(),
});

type IntakeFormData = z.infer<typeof intakeFormSchema>;

export default function BookingFormPage() {
  const router = useRouter();
  const { track } = useTracking();
  const { serviceId, slotId, setIntakeForm, setAppointment } = useBookingStore();

  useEffect(() => {
    if (!serviceId || !slotId) {
      router.push('/booking');
    }
  }, [serviceId, slotId, router]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<IntakeFormData>({
    resolver: zodResolver(intakeFormSchema),
    defaultValues: {
      personal_data_consent: false,
      communications_consent: false,
    },
  });

  const createBookingMutation = useMutation({
    mutationFn: (data: IntakeFormData) => {
      const intakeForm = {
        question_1: data.question_1,
        question_2: data.question_2,
        question_3: data.question_3 || '',
      };
      setIntakeForm(intakeForm);

      return bookingService.createBooking({
        service_id: serviceId!,
        slot_id: slotId!,
        intake_form: intakeForm,
        consents: {
          personal_data: data.personal_data_consent,
          communications: data.communications_consent || false,
        },
      });
    },
    onSuccess: (booking) => {
      track('booking_created', {
        booking_id: booking.id,
        service_id: serviceId,
        slot_id: slotId,
      });
      setAppointment(booking.id, booking.payment?.payment_url || undefined);
      router.push('/booking/payment');
    },
    onError: (error) => {
      toast.error('Ошибка при создании записи. Попробуйте снова.');
      console.error('Booking creation error:', error);
    },
  });

  const onSubmit = (data: IntakeFormData) => {
    createBookingMutation.mutate(data);
  };

  if (!serviceId || !slotId) {
    return null;
  }

  return (
    <main id="main-content" className="min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-3xl font-bold mb-6">Анкета</h1>

        <Card>
          <CardHeader>
            <CardTitle>Пожалуйста, заполните анкету</CardTitle>
            <CardDescription>
              Эта информация поможет психологу лучше подготовиться к встрече
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <Label htmlFor="question_1">Что вас привело к решению обратиться за помощью?</Label>
                <Textarea
                  id="question_1"
                  {...register('question_1')}
                  aria-invalid={errors.question_1 ? 'true' : 'false'}
                  aria-describedby={errors.question_1 ? 'question_1-error' : undefined}
                  className="mt-2"
                />
                {errors.question_1 && (
                  <p id="question_1-error" className="text-sm text-destructive mt-1" role="alert">
                    {errors.question_1.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="question_2">
                  Есть ли у вас опыт работы с психологом ранее?
                </Label>
                <Textarea
                  id="question_2"
                  {...register('question_2')}
                  aria-invalid={errors.question_2 ? 'true' : 'false'}
                  aria-describedby={errors.question_2 ? 'question_2-error' : undefined}
                  className="mt-2"
                />
                {errors.question_2 && (
                  <p id="question_2-error" className="text-sm text-destructive mt-1" role="alert">
                    {errors.question_2.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="question_3">Дополнительная информация (необязательно)</Label>
                <Textarea
                  id="question_3"
                  {...register('question_3')}
                  className="mt-2"
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-start space-x-2">
                  <input
                    type="checkbox"
                    id="personal_data_consent"
                    {...register('personal_data_consent')}
                    aria-invalid={errors.personal_data_consent ? 'true' : 'false'}
                    aria-describedby={errors.personal_data_consent ? 'personal_data_consent-error' : undefined}
                    className="mt-1"
                  />
                  <Label htmlFor="personal_data_consent" className="font-normal cursor-pointer">
                    Я согласен(а) на обработку персональных данных
                  </Label>
                </div>
                {errors.personal_data_consent && (
                  <p id="personal_data_consent-error" className="text-sm text-destructive" role="alert">
                    {errors.personal_data_consent.message}
                  </p>
                )}

                <div className="flex items-start space-x-2">
                  <input
                    type="checkbox"
                    id="communications_consent"
                    {...register('communications_consent')}
                    className="mt-1"
                  />
                  <Label htmlFor="communications_consent" className="font-normal cursor-pointer">
                    Я согласен(а) получать информационные сообщения
                  </Label>
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/booking/slot')}
                  disabled={isSubmitting}
                >
                  Назад
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Отправка...' : 'Продолжить'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
