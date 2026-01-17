import { Appointment } from '../entities/Appointment';

export interface IAppointmentRepository {
  findById(id: string): Promise<Appointment | null>;
  findByClientRequestId(clientRequestId: string): Promise<Appointment | null>;
  findByClientUserId(clientUserId: string): Promise<Appointment[]>;
  findByRange(from: Date, to: Date): Promise<Appointment[]>;
  create(appointment: Appointment): Promise<void>;
  createWithConflictCheck(appointment: Appointment): Promise<void>;
  attachClientUser(appointmentId: string, clientUserId: string): Promise<void>;
  findConfirmedWithoutCalendarEvent(from: Date, to: Date): Promise<Appointment[]>;
  setExternalCalendarEventIdIfMatch(appointmentId: string, expectedValue: string | null, newValue: string): Promise<boolean>;
  clearExternalCalendarEventId(appointmentId: string, expectedValue: string): Promise<void>;
  markPaidIfPending(appointmentId: string): Promise<boolean>;
  confirmIfPending(appointmentId: string): Promise<boolean>;
  save(appointment: Appointment): Promise<void>;
}
