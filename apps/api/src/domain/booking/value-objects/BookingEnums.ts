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
