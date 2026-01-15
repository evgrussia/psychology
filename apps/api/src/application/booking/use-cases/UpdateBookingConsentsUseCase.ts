import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IAppointmentRepository } from '@domain/booking/repositories/IAppointmentRepository';
import { IUserRepository } from '@domain/identity/repositories/IUserRepository';
import { ConsentType } from '@domain/identity/value-objects/ConsentType';
import { Email } from '@domain/identity/value-objects/Email';
import { User } from '@domain/identity/aggregates/User';
import { UpdateBookingConsentsRequestDto, UpdateBookingConsentsResponseDto } from '../dto/booking.dto';
import * as crypto from 'crypto';

const DEFAULT_CONSENT_VERSION = 'v1';
const DEFAULT_CONSENT_SOURCE = 'booking';

@Injectable()
export class UpdateBookingConsentsUseCase {
  constructor(
    @Inject('IAppointmentRepository')
    private readonly appointmentRepository: IAppointmentRepository,
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(appointmentId: string, dto: UpdateBookingConsentsRequestDto): Promise<UpdateBookingConsentsResponseDto> {
    const appointment = await this.appointmentRepository.findById(appointmentId);
    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    if (!dto.consents?.personal_data) {
      throw new BadRequestException('Personal data consent is required');
    }

    if (!dto.email) {
      throw new BadRequestException('Email is required');
    }

    const email = Email.create(dto.email);
    const existingUser = await this.userRepository.findByEmail(email);
    const user = existingUser ?? User.create(
      crypto.randomUUID(),
      email,
      dto.phone ?? null,
      null,
    );

    const source = dto.source || DEFAULT_CONSENT_SOURCE;
    const version = DEFAULT_CONSENT_VERSION;

    user.grantConsent(ConsentType.PERSONAL_DATA, version, source);

    if (dto.consents.communications) {
      user.grantConsent(ConsentType.COMMUNICATIONS, version, source);
    } else {
      user.revokeConsent(ConsentType.COMMUNICATIONS);
    }

    if (dto.consents.telegram) {
      user.grantConsent(ConsentType.TELEGRAM, version, source);
    } else {
      user.revokeConsent(ConsentType.TELEGRAM);
    }

    await this.userRepository.save(user);

    if (appointment.clientUserId !== user.id) {
      await this.appointmentRepository.attachClientUser(appointment.id, user.id);
    }

    return {
      appointment_id: appointment.id,
      user_id: user.id,
      consents: {
        personal_data: true,
        communications: !!dto.consents.communications,
        telegram: !!dto.consents.telegram,
      },
    };
  }
}
