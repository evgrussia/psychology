import { AppointmentStatus } from '@domain/booking/value-objects/BookingEnums';
import { ServiceFormat } from '@domain/booking/value-objects/ServiceEnums';

export interface StartBookingRequestDto {
  service_slug: string;
  slot_id: string;
  timezone: string;
  format?: ServiceFormat;
  entry_point?: string | null;
  topic_code?: string | null;
  client_request_id?: string | null;
  lead_id?: string | null;
}

export interface StartBookingResponseDto {
  appointment_id: string;
  status: AppointmentStatus;
  service: {
    id: string;
    slug: string;
    title: string;
    format: ServiceFormat;
    duration_minutes: number;
    price_amount: number;
    deposit_amount?: number | null;
  };
  slot: {
    id: string;
    start_at_utc: string;
    end_at_utc: string;
  };
}

export interface SubmitIntakeRequestDto {
  payload: Record<string, unknown>;
}

export interface SubmitIntakeResponseDto {
  appointment_id: string;
  submitted_at: string;
}

export interface BookingConsentPayload {
  personal_data: boolean;
  communications?: boolean;
  telegram?: boolean;
}

export interface UpdateBookingConsentsRequestDto {
  email: string;
  phone?: string | null;
  consents: BookingConsentPayload;
  source?: string;
}

export interface UpdateBookingConsentsResponseDto {
  appointment_id: string;
  user_id: string;
  consents: BookingConsentPayload;
}

export interface BookingStatusResponseDto {
  appointment_id: string;
  status: AppointmentStatus;
  service_slug: string;
  format: ServiceFormat;
  timezone: string;
  start_at_utc: string;
  end_at_utc: string;
}
