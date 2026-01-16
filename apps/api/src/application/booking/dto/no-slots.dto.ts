import { PreferredContactMethod, PreferredTimeWindow } from '@domain/booking/value-objects/BookingEnums';

export interface NoSlotsServiceDto {
  id: string;
  slug: string;
  title: string;
}

export interface NoSlotsModelDto {
  service: NoSlotsServiceDto | null;
  contact_methods: PreferredContactMethod[];
  time_windows: PreferredTimeWindow[];
}
