import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IServiceRepository } from '@domain/booking/repositories/IServiceRepository';
import { IWaitlistRequestRepository } from '@domain/booking/repositories/IWaitlistRequestRepository';
import { WaitlistRequest } from '@domain/booking/entities/WaitlistRequest';
import { PreferredContactMethod, PreferredTimeWindow, WaitlistStatus } from '@domain/booking/value-objects/BookingEnums';
import { ServiceStatus } from '@domain/booking/value-objects/ServiceEnums';
import { IEncryptionService } from '@domain/security/services/IEncryptionService';
import { IEmailService } from '@domain/notifications/services/IEmailService';
import { CreateOrUpdateLeadUseCase } from '@application/crm/use-cases/CreateOrUpdateLeadUseCase';
import { LeadSource } from '@domain/crm/value-objects/LeadEnums';
import { TrackingService } from '@infrastructure/tracking/tracking.service';
import { Email } from '@domain/identity/value-objects/Email';
import { CreateWaitlistRequestDto, CreateWaitlistResponseDto } from '../dto/waitlist.dto';
import * as crypto from 'crypto';

@Injectable()
export class CreateWaitlistRequestUseCase {
  constructor(
    @Inject('IServiceRepository')
    private readonly serviceRepository: IServiceRepository,
    @Inject('IWaitlistRequestRepository')
    private readonly waitlistRepository: IWaitlistRequestRepository,
    @Inject('IEncryptionService')
    private readonly encryptionService: IEncryptionService,
    @Inject('IEmailService')
    private readonly emailService: IEmailService,
    private readonly createOrUpdateLeadUseCase: CreateOrUpdateLeadUseCase,
    private readonly trackingService: TrackingService,
  ) {}

  async execute(dto: CreateWaitlistRequestDto): Promise<CreateWaitlistResponseDto> {
    if (!dto.service_slug || !dto.preferred_contact || !dto.contact_value || !dto.consents) {
      throw new BadRequestException('Missing required fields');
    }

    if (!dto.consents.personal_data) {
      throw new BadRequestException('Personal data consent is required');
    }

    if (!dto.consents.communications) {
      throw new BadRequestException('Communications consent is required');
    }

    const service = await this.serviceRepository.findBySlug(dto.service_slug);
    if (!service || service.status !== ServiceStatus.published) {
      throw new NotFoundException('Service not found');
    }

    const normalizedContact = this.normalizeContact(dto.preferred_contact, dto.contact_value);
    const preferredTimeWindow = this.resolvePreferredTimeWindow(dto.preferred_time_window);
    const encryptedContact = this.encryptionService.encrypt(normalizedContact);

    const waitlistRequest = WaitlistRequest.create({
      id: crypto.randomUUID(),
      userId: null,
      serviceId: service.id,
      preferredContact: dto.preferred_contact,
      contactValueEncrypted: encryptedContact,
      preferredTimeWindow,
      status: WaitlistStatus.new,
      createdAt: new Date(),
    });

    await this.waitlistRepository.create(waitlistRequest);

    await this.createOrUpdateLeadUseCase.execute({
      source: LeadSource.waitlist,
      topicCode: service.topicCode ?? null,
      contact: {
        method: dto.preferred_contact,
        encryptedValue: dto.preferred_contact === PreferredContactMethod.telegram ? null : encryptedContact,
      },
      timelineEvent: {
        eventName: 'waitlist_submitted',
        source: dto.source ?? 'web',
        properties: {
          service_id: service.id,
          service_slug: service.slug,
          preferred_contact: dto.preferred_contact,
          preferred_time_window: preferredTimeWindow,
        },
      },
    });

    await this.trackingService.trackWaitlistSubmitted({
      serviceId: service.id,
      serviceSlug: service.slug,
      preferredContact: dto.preferred_contact,
      preferredTimeWindow,
    });

    await this.sendConfirmationIfNeeded(dto.preferred_contact, normalizedContact, service.title);

    return {
      waitlist_id: waitlistRequest.id,
      status: waitlistRequest.status,
      service_id: service.id,
      service_slug: service.slug,
      created_at: waitlistRequest.createdAt.toISOString(),
    };
  }

  private normalizeContact(method: PreferredContactMethod, value: string): string {
    const trimmed = value.trim();
    if (!trimmed) {
      throw new BadRequestException('Contact value is required');
    }

    if (method === PreferredContactMethod.email) {
      const email = Email.create(trimmed);
      return email.value;
    }

    if (method === PreferredContactMethod.phone) {
      const digits = trimmed.replace(/\D/g, '');
      if (digits.length < 10 || digits.length > 15) {
        throw new BadRequestException('Invalid phone number');
      }
      return digits;
    }

    if (method === PreferredContactMethod.telegram) {
      if (trimmed.length < 3) {
        throw new BadRequestException('Invalid Telegram contact');
      }
      return trimmed.startsWith('@') ? trimmed : `@${trimmed}`;
    }

    throw new BadRequestException('Unsupported contact method');
  }

  private resolvePreferredTimeWindow(value?: PreferredTimeWindow | null): PreferredTimeWindow {
    if (!value) {
      return PreferredTimeWindow.any;
    }

    if (!Object.values(PreferredTimeWindow).includes(value)) {
      throw new BadRequestException('Invalid preferred time window');
    }

    return value;
  }

  private async sendConfirmationIfNeeded(
    method: PreferredContactMethod,
    contactValue: string,
    serviceTitle: string,
  ): Promise<void> {
    if (method !== PreferredContactMethod.email) {
      return;
    }

    await this.emailService.sendEmail(
      contactValue,
      'Мы получили вашу заявку',
      `Мы добавили вас в лист ожидания по услуге «${serviceTitle}». Как только появится подходящее время, мы свяжемся с вами.`,
    );
  }
}
