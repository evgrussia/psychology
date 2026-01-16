import { PreferredContactMethod, PreferredTimeWindow, WaitlistStatus } from '@domain/booking/value-objects/BookingEnums';

export interface WaitlistConsentPayload {
  personal_data: boolean;
  communications: boolean;
}

export interface CreateWaitlistRequestDto {
  service_slug: string;
  preferred_contact: PreferredContactMethod;
  contact_value: string;
  preferred_time_window?: PreferredTimeWindow | null;
  consents: WaitlistConsentPayload;
  source?: 'web' | 'backend' | 'telegram' | 'admin';
}

export interface CreateWaitlistResponseDto {
  waitlist_id: string;
  status: WaitlistStatus;
  service_id: string;
  service_slug: string;
  created_at: string;
}
