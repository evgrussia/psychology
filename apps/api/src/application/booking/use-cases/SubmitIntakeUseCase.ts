import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IAppointmentRepository } from '@domain/booking/repositories/IAppointmentRepository';
import { IIntakeFormRepository } from '@domain/booking/repositories/IIntakeFormRepository';
import { IEncryptionService } from '@domain/security/services/IEncryptionService';
import { IntakeForm } from '@domain/booking/entities/IntakeForm';
import { IUserRepository } from '@domain/identity/repositories/IUserRepository';
import { ConsentType } from '@domain/identity/value-objects/ConsentType';
import { SubmitIntakeRequestDto, SubmitIntakeResponseDto } from '../dto/booking.dto';
import * as crypto from 'crypto';

const MAX_PAYLOAD_LENGTH = 10000;

@Injectable()
export class SubmitIntakeUseCase {
  constructor(
    @Inject('IAppointmentRepository')
    private readonly appointmentRepository: IAppointmentRepository,
    @Inject('IIntakeFormRepository')
    private readonly intakeFormRepository: IIntakeFormRepository,
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    @Inject('IEncryptionService')
    private readonly encryptionService: IEncryptionService,
  ) {}

  async execute(appointmentId: string, dto: SubmitIntakeRequestDto): Promise<SubmitIntakeResponseDto> {
    if (!dto.payload || Object.keys(dto.payload).length === 0) {
      throw new BadRequestException('Intake payload is required');
    }

    const appointment = await this.appointmentRepository.findById(appointmentId);
    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    if (!appointment.clientUserId) {
      throw new BadRequestException('Personal data consent is required');
    }

    const user = await this.userRepository.findById(appointment.clientUserId);
    if (!user || !user.hasActiveConsent(ConsentType.PERSONAL_DATA)) {
      throw new BadRequestException('Personal data consent is required');
    }

    const payloadString = JSON.stringify(dto.payload);
    if (payloadString.length > MAX_PAYLOAD_LENGTH) {
      throw new BadRequestException('Intake payload is too large');
    }

    const encrypted = this.encryptionService.encrypt(payloadString);
    const form = IntakeForm.create({
      id: crypto.randomUUID(),
      appointmentId: appointment.id,
      payloadEncrypted: encrypted,
      submittedAt: new Date(),
    });

    await this.intakeFormRepository.upsert(form);

    return {
      appointment_id: appointment.id,
      submitted_at: form.submittedAt?.toISOString() ?? new Date().toISOString(),
    };
  }
}
