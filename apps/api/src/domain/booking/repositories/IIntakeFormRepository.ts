import { IntakeForm } from '../entities/IntakeForm';

export interface IIntakeFormRepository {
  findByAppointmentId(appointmentId: string): Promise<IntakeForm | null>;
  upsert(form: IntakeForm): Promise<void>;
}
