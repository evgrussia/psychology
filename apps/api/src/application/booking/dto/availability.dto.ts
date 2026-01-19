export interface AvailableSlotDto {
  id: string;
  start_at_utc: string;
  end_at_utc: string;
}

export interface ListAvailableSlotsResponseDto {
  status: 'available';
  timezone: string;
  service_id: string;
  service_slug: string;
  service_title: string;
  range: {
    from: string;
    to: string;
  };
  slots: AvailableSlotDto[];
}
