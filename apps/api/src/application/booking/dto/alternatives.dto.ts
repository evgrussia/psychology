import { PreferredTimeWindow } from '@domain/booking/value-objects/BookingEnums';
import { ServiceFormat } from '@domain/booking/value-objects/ServiceEnums';

export interface AlternativeSlotDto {
  id: string;
  start_at_utc: string;
  end_at_utc: string;
}

export interface AlternativeDayDto {
  date: string;
  slot_count: number;
  first_slot: AlternativeSlotDto;
}

export interface TimeWindowAlternativeDto {
  window: PreferredTimeWindow;
  slot: AlternativeSlotDto | null;
}

export interface FormatAlternativeServiceDto {
  id: string;
  slug: string;
  title: string;
  format: ServiceFormat;
  duration_minutes: number;
  price_amount: number;
  deposit_amount?: number | null;
  offline_address?: string | null;
}

export interface FormatAlternativeDto {
  service: FormatAlternativeServiceDto;
  earliest_slot: AlternativeSlotDto | null;
}

export interface BookingAlternativesResponseDto {
  status: 'available';
  timezone: string;
  service: {
    id: string;
    slug: string;
    title: string;
    format: ServiceFormat;
    topic_code?: string | null;
  };
  base_range: {
    from: string;
    to: string;
  };
  alternative_range: {
    from: string;
    to: string;
  };
  has_slots_in_range: boolean;
  next_slots: AlternativeSlotDto[];
  next_days: AlternativeDayDto[];
  time_windows: TimeWindowAlternativeDto[];
  format_alternatives: FormatAlternativeDto[];
}
