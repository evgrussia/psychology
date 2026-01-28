/**
 * API эндпоинты для бронирования: услуги, слоты, записи
 */

import { request } from '@/api/client';
import type {
  ServicesResponse,
  SlotsResponse,
  AppointmentResponse,
  CreateAppointmentRequest,
  GetSlotsParams,
} from '@/api/types/booking';

export async function getServices(): Promise<ServicesResponse> {
  return request<ServicesResponse>('GET', 'booking/services/');
}

export async function getSlots(
  serviceId: string,
  params: GetSlotsParams
): Promise<SlotsResponse> {
  const searchParams = new URLSearchParams();
  searchParams.set('date_from', params.date_from);
  searchParams.set('date_to', params.date_to);
  searchParams.set('timezone', params.timezone);
  const query = searchParams.toString();
  return request<SlotsResponse>(
    'GET',
    `booking/services/${serviceId}/slots/?${query}`
  );
}

export async function createAppointment(
  body: CreateAppointmentRequest
): Promise<AppointmentResponse> {
  return request<AppointmentResponse>('POST', 'booking/appointments/', body);
}
