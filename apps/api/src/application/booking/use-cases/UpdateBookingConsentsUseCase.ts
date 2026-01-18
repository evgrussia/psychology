import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IAppointmentRepository } from '@domain/booking/repositories/IAppointmentRepository';
import { IUserRepository } from '@domain/identity/repositories/IUserRepository';
import { ConsentType } from '@domain/identity/value-objects/ConsentType';
import { Email } from '@domain/identity/value-objects/Email';
import { User } from '@domain/identity/aggregates/User';
import { UpdateBookingConsentsRequestDto, UpdateBookingConsentsResponseDto } from '../dto/booking.dto';
import { TrackingService } from '@infrastructure/tracking/tracking.service';
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
    private readonly trackingService: TrackingService,
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

    const previous = {
      personal_data: user.hasActiveConsent(ConsentType.PERSONAL_DATA),
      communications: user.hasActiveConsent(ConsentType.COMMUNICATIONS),
      telegram: user.hasActiveConsent(ConsentType.TELEGRAM),
    };

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

    const current = {
      personal_data: user.hasActiveConsent(ConsentType.PERSONAL_DATA),
      communications: user.hasActiveConsent(ConsentType.COMMUNICATIONS),
      telegram: user.hasActiveConsent(ConsentType.TELEGRAM),
    };

    if (previous.personal_data !== current.personal_data) {
      await this.trackingService.trackConsentUpdated({
        consentType: 'personal_data',
        newValue: current.personal_data,
        userId: user.id,
      });
    }

    if (previous.communications !== current.communications) {
      await this.trackingService.trackConsentUpdated({
        consentType: 'communications',
        newValue: current.communications,
        userId: user.id,
      });
    }

    if (previous.telegram !== current.telegram) {
      await this.trackingService.trackConsentUpdated({
        consentType: 'telegram',
        newValue: current.telegram,
        userId: user.id,
      });
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
