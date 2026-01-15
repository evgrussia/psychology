import { IntakeForm as PrismaIntakeForm } from '@prisma/client';
import { IntakeForm } from '@domain/booking/entities/IntakeForm';

export class IntakeFormMapper {
  static toDomain(record: PrismaIntakeForm): IntakeForm {
    return IntakeForm.create({
      id: record.id,
      appointmentId: record.appointment_id,
      payloadEncrypted: record.payload_encrypted,
      submittedAt: record.submitted_at,
    });
  }
}
