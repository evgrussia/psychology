'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cabinetService } from '@/services/api/cabinet';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { ErrorState } from '@/components/shared/ErrorState';
import { EmptyState } from '@/components/shared/EmptyState';
import { useTracking } from '@/hooks/useTracking';
import { Calendar, Clock, MapPin, Video, X } from 'lucide-react';
import { toast } from 'sonner';

export default function AppointmentsPage() {
  const { track } = useTracking();
  const queryClient = useQueryClient();

  const { data: appointments, isLoading, error } = useQuery({
    queryKey: ['appointments'],
    queryFn: () => cabinetService.getAppointments(),
  });

  const cancelMutation = useMutation({
    mutationFn: (appointmentId: string) => cabinetService.cancelAppointment(appointmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['cabinet-stats'] });
      toast.success('Встреча отменена');
      track('appointment_cancelled', {});
    },
    onError: () => {
      toast.error('Ошибка при отмене встречи');
    },
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  const upcoming = appointments?.filter((apt) => new Date(apt.datetime) > new Date()) || [];
  const past = appointments?.filter((apt) => new Date(apt.datetime) <= new Date()) || [];

  return (
    <main id="main-content" className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Мои встречи</h1>

        {upcoming.length === 0 && past.length === 0 && (
          <EmptyState
            message="У вас пока нет встреч"
            action={{
              label: 'Записаться',
              onClick: () => (window.location.href = '/booking'),
            }}
          />
        )}

        {upcoming.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Предстоящие встречи</h2>
            <div className="space-y-4">
              {upcoming.map((appointment) => (
                <Card key={appointment.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{appointment.service_name}</CardTitle>
                        <CardDescription>
                          {appointment.specialist_name || 'Специалист'}
                        </CardDescription>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (confirm('Вы уверены, что хотите отменить встречу?')) {
                            cancelMutation.mutate(appointment.id);
                          }
                        }}
                        disabled={cancelMutation.isPending}
                      >
                        <X className="h-4 w-4" aria-hidden="true" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                      <span>
                        {new Date(appointment.datetime).toLocaleDateString('ru-RU', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                      <span>
                        {new Date(appointment.datetime).toLocaleTimeString('ru-RU', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    {appointment.is_online ? (
                      <div className="flex items-center gap-2 text-sm">
                        <Video className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                        <span>Онлайн</span>
                      </div>
                    ) : (
                      appointment.location && (
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                          <span>{appointment.location}</span>
                        </div>
                      )
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {past.length > 0 && (
          <div>
            <h2 className="text-2xl font-semibold mb-4">Прошедшие встречи</h2>
            <div className="space-y-4">
              {past.map((appointment) => (
                <Card key={appointment.id} className="opacity-75">
                  <CardHeader>
                    <CardTitle>{appointment.service_name}</CardTitle>
                    <CardDescription>
                      {appointment.specialist_name || 'Специалист'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    <span>
                      {new Date(appointment.datetime).toLocaleDateString('ru-RU', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
