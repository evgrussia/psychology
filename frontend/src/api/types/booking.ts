/**
 * Типы для Booking API по контракту docs/api/api-contracts.md
 */

export interface Service {
  id: string;
  slug: string;
  title: string;
  description: string;
  duration_minutes: number;
  price_amount: number;
  deposit_amount?: number | null;
  format: 'online' | 'offline' | 'hybrid';
  cancel_free_hours?: number;
  cancel_partial_hours?: number;
  reschedule_min_hours?: number;
}

export interface ServicesResponse {
  data: Service[];
}

export interface Slot {
  id: string;
  start_at: string; // ISO8601
  end_at: string;
  status: string;
  local_start_at: string;
  local_end_at: string;
}

export interface SlotsResponse {
  data: Slot[];
}

export interface AppointmentSlot {
  id: string;
  start_at: string;
}

export interface AppointmentService {
  id: string;
  title: string;
}

export interface PaymentInfo {
  id: string;
  amount: number;
  deposit_amount?: number;
  payment_url?: string;
  status?: string;
}

export interface Appointment {
  id: string;
  service: AppointmentService;
  slot: AppointmentSlot;
  status: string;
  format?: 'online' | 'offline';
  payment?: PaymentInfo | null;
  created_at: string;
  updated_at?: string | null;
}

export interface AppointmentResponse {
  data: Appointment;
}

export interface CreateAppointmentRequest {
  service_id: string;
  slot_id: string;
  timezone?: string;
  format: 'online' | 'offline';
  intake_form?: Record<string, string | string[]>;
  consents?: Record<string, boolean>;
  entry_point?: string;
}

export interface GetSlotsParams {
  date_from: string; // ISO8601
  date_to: string;
  timezone: string;
}
