export enum LeadStatus {
  new = 'new',
  engaged = 'engaged',
  booking_started = 'booking_started',
  booked_confirmed = 'booked_confirmed',
  paid = 'paid',
  completed_session = 'completed_session',
  follow_up_needed = 'follow_up_needed',
  inactive = 'inactive',
}

export enum LeadSource {
  quiz = 'quiz',
  telegram = 'telegram',
  waitlist = 'waitlist',
  question = 'question',
  booking = 'booking',
}
