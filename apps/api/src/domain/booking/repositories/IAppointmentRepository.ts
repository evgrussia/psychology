import { Appointment } from '../entities/Appointment';

export interface IAppointmentRepository {
  findById(id: string): Promise<Appointment | null>;
  findByClientRequestId(clientRequestId: string): Promise<Appointment | null>;
  create(appointment: Appointment): Promise<void>;
  createWithConflictCheck(appointment: Appointment): Promise<void>;
  attachClientUser(appointmentId: string, clientUserId: string): Promise<void>;
  findConfirmedWithoutCalendarEvent(from: Date, to: Date): Promise<Appointment[]>;
  setExternalCalendarEventIdIfMatch(appointmentId: string, expectedValue: string | null, newValue: string): Promise<boolean>;
  clearExternalCalendarEventId(appointmentId: string, expectedValue: string): Promise<void>;
  confirmIfPending(appointmentId: string): Promise<boolean>;
  save(appointment: Appointment): Promise<void>;
}
