export enum SlotStatus {
  available = 'available',
  reserved = 'reserved',
  blocked = 'blocked',
}

export enum SlotSource {
  product = 'product',
  google_calendar = 'google_calendar',
}

export enum AppointmentStatus {
  pending_payment = 'pending_payment',
  paid = 'paid',
  confirmed = 'confirmed',
  canceled = 'canceled',
  rescheduled = 'rescheduled',
  completed = 'completed',
}

export enum WaitlistStatus {
  new = 'new',
  contacted = 'contacted',
  closed = 'closed',
}

export enum PreferredContactMethod {
  email = 'email',
  phone = 'phone',
  telegram = 'telegram',
}

export enum PreferredTimeWindow {
  weekday_morning = 'weekday_morning',
  weekday_evening = 'weekday_evening',
  weekend = 'weekend',
  any = 'any',
}
