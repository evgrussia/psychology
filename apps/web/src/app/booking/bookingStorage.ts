export interface BookingDraft {
  serviceId?: string;
  serviceSlug?: string;
  serviceTitle?: string;
  serviceFormat?: 'online' | 'offline' | 'hybrid';
  serviceDuration?: number;
  priceAmount?: number;
  depositAmount?: number | null;
  slotId?: string;
  slotStartAtUtc?: string;
  slotEndAtUtc?: string;
  timezone?: string;
  appointmentId?: string;
  clientRequestId?: string;
  contactEmail?: string;
}

const STORAGE_KEY = 'booking_flow_v1';

export function loadBookingDraft(): BookingDraft | null {
  if (typeof window === 'undefined') {
    return null;
  }
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw) as BookingDraft;
  } catch {
    return null;
  }
}

export function saveBookingDraft(update: Partial<BookingDraft>): BookingDraft {
  const current = loadBookingDraft() ?? {};
  const next = { ...current, ...update };
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }
  return next;
}

export function clearBookingDraft() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem('booking_start_tracked');
  }
}
