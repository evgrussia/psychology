import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface BookingState {
  serviceId: string | null;
  serviceSlug: string | null;
  slotId: string | null;
  slotStart: string | null;
  slotEnd: string | null;
  intakeForm: Record<string, string> | null;
  appointmentId: string | null;
  paymentUrl: string | null;
  clearBooking: () => void;
  setService: (serviceId: string, serviceSlug: string) => void;
  setSlot: (slotId: string, slotStart: string, slotEnd: string) => void;
  setIntakeForm: (form: Record<string, string>) => void;
  setAppointment: (appointmentId: string, paymentUrl?: string) => void;
}

export const useBookingStore = create<BookingState>()(
  persist(
    (set) => ({
      serviceId: null,
      serviceSlug: null,
      slotId: null,
      slotStart: null,
      slotEnd: null,
      intakeForm: null,
      appointmentId: null,
      paymentUrl: null,
      clearBooking: () =>
        set({
          serviceId: null,
          serviceSlug: null,
          slotId: null,
          slotStart: null,
          slotEnd: null,
          intakeForm: null,
          appointmentId: null,
          paymentUrl: null,
        }),
      setService: (serviceId, serviceSlug) =>
        set({ serviceId, serviceSlug }),
      setSlot: (slotId, slotStart, slotEnd) =>
        set({ slotId, slotStart, slotEnd }),
      setIntakeForm: (form) => set({ intakeForm: form }),
      setAppointment: (appointmentId, paymentUrl) =>
        set({ appointmentId, paymentUrl: paymentUrl || null }),
    }),
    {
      name: 'booking-storage',
    }
  )
);
