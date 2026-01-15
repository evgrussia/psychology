import { ServiceFormat } from '@domain/booking/value-objects/ServiceEnums';

export interface ServiceListItemDto {
  id: string;
  slug: string;
  title: string;
  format: ServiceFormat;
  duration_minutes: number;
  price_amount: number;
  deposit_amount?: number | null;
  offline_address?: string | null;
  description_markdown: string;
}

export interface ServiceDetailsDto extends ServiceListItemDto {
  cancel_free_hours?: number | null;
  cancel_partial_hours?: number | null;
  reschedule_min_hours?: number | null;
  reschedule_max_count?: number | null;
}
