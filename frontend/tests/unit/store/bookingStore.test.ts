import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useBookingStore } from '@/store/bookingStore';

describe('bookingStore', () => {
  beforeEach(() => {
    useBookingStore.getState().clearBooking();
  });

  afterEach(() => {
    useBookingStore.getState().clearBooking();
  });

  it('initializes with empty state', () => {
    const state = useBookingStore.getState();
    expect(state.serviceId).toBeNull();
    expect(state.serviceSlug).toBeNull();
    expect(state.slotId).toBeNull();
    expect(state.slotStart).toBeNull();
    expect(state.slotEnd).toBeNull();
    expect(state.intakeForm).toBeNull();
    expect(state.appointmentId).toBeNull();
    expect(state.paymentUrl).toBeNull();
  });

  it('sets service correctly', () => {
    useBookingStore.getState().setService('service-1', 'consultation');

    const state = useBookingStore.getState();
    expect(state.serviceId).toBe('service-1');
    expect(state.serviceSlug).toBe('consultation');
  });

  it('sets slot correctly', () => {
    useBookingStore.getState().setSlot('slot-1', '2026-01-27T10:00:00Z', '2026-01-27T11:00:00Z');

    const state = useBookingStore.getState();
    expect(state.slotId).toBe('slot-1');
    expect(state.slotStart).toBe('2026-01-27T10:00:00Z');
    expect(state.slotEnd).toBe('2026-01-27T11:00:00Z');
  });

  it('sets intake form correctly', () => {
    const form = { question_1: 'Answer 1', question_2: 'Answer 2' };
    useBookingStore.getState().setIntakeForm(form);

    const state = useBookingStore.getState();
    expect(state.intakeForm).toEqual(form);
  });

  it('sets appointment with payment URL', () => {
    useBookingStore.getState().setAppointment('appointment-1', 'https://payment.url');

    const state = useBookingStore.getState();
    expect(state.appointmentId).toBe('appointment-1');
    expect(state.paymentUrl).toBe('https://payment.url');
  });

  it('sets appointment without payment URL', () => {
    useBookingStore.getState().setAppointment('appointment-1');

    const state = useBookingStore.getState();
    expect(state.appointmentId).toBe('appointment-1');
    expect(state.paymentUrl).toBeNull();
  });

  it('clears booking state', () => {
    useBookingStore.getState().setService('service-1', 'consultation');
    useBookingStore.getState().setSlot('slot-1', '2026-01-27T10:00:00Z', '2026-01-27T11:00:00Z');
    useBookingStore.getState().setIntakeForm({ question_1: 'Answer' });
    useBookingStore.getState().setAppointment('appointment-1', 'https://payment.url');

    useBookingStore.getState().clearBooking();

    const state = useBookingStore.getState();
    expect(state.serviceId).toBeNull();
    expect(state.serviceSlug).toBeNull();
    expect(state.slotId).toBeNull();
    expect(state.slotStart).toBeNull();
    expect(state.slotEnd).toBeNull();
    expect(state.intakeForm).toBeNull();
    expect(state.appointmentId).toBeNull();
    expect(state.paymentUrl).toBeNull();
  });
});
