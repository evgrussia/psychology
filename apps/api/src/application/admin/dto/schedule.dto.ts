import { SlotSource, SlotStatus, ScheduleBlockType } from '@domain/booking/value-objects/BookingEnums';
import { AppointmentStatus } from '@domain/booking/value-objects/BookingEnums';

export interface ScheduleSlotDto {
  id: string;
  service_id: string | null;
  start_at_utc: string;
  end_at_utc: string;
  status: SlotStatus;
  source: SlotSource;
  block_type?: ScheduleBlockType | null;
  note?: string | null;
}

export interface ScheduleAppointmentDto {
  id: string;
  service_id: string;
  service_slug: string;
  service_title: string;
  start_at_utc: string;
  end_at_utc: string;
  status: AppointmentStatus;
  timezone: string;
}

export interface ScheduleSettingsDto {
  timezone: string;
  buffer_minutes: number;
}

export interface CreateScheduleSlotRequestDto {
  start_at_utc: string;
  end_at_utc: string;
  service_id?: string | null;
  note?: string | null;
  repeat?: {
    frequency: 'none' | 'weekly' | 'biweekly' | 'custom';
    interval_days?: number;
    until_at_utc?: string;
  };
}

export interface CreateScheduleSlotsRequestDto {
  slots: CreateScheduleSlotRequestDto[];
}

export interface UpdateScheduleSlotRequestDto {
  start_at_utc: string;
  end_at_utc: string;
  service_id?: string | null;
  note?: string | null;
}

export interface UpdateScheduleSettingsRequestDto {
  timezone: string;
  buffer_minutes: number;
}

export interface DeleteScheduleSlotsRequestDto {
  slot_ids: string[];
}
