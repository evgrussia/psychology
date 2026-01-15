import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { IIntakeFormRepository } from '@domain/booking/repositories/IIntakeFormRepository';
import { IntakeForm } from '@domain/booking/entities/IntakeForm';
import { IntakeFormMapper } from './intake-form.mapper';

@Injectable()
export class PrismaIntakeFormRepository implements IIntakeFormRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByAppointmentId(appointmentId: string): Promise<IntakeForm | null> {
    const record = await this.prisma.intakeForm.findUnique({
      where: { appointment_id: appointmentId },
    });
    if (!record) {
      return null;
    }
    return IntakeFormMapper.toDomain(record);
  }

  async upsert(form: IntakeForm): Promise<void> {
    await this.prisma.intakeForm.upsert({
      where: { appointment_id: form.appointmentId },
      update: {
        payload_encrypted: form.payloadEncrypted,
        submitted_at: form.submittedAt,
        status: 'submitted',
      },
      create: {
        id: form.id,
        appointment_id: form.appointmentId,
        payload_encrypted: form.payloadEncrypted,
        submitted_at: form.submittedAt,
        status: 'submitted',
      },
    });
  }
}
