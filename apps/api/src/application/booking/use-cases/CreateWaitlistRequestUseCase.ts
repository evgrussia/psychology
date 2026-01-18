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
import { IUserRepository } from '@domain/identity/repositories/IUserRepository';
import { ConsentType } from '@domain/identity/value-objects/ConsentType';
import { User } from '@domain/identity/aggregates/User';
import { CreateWaitlistRequestDto, CreateWaitlistResponseDto } from '../dto/waitlist.dto';
import * as crypto from 'crypto';

const DEFAULT_CONSENT_VERSION = 'v1';
const DEFAULT_CONSENT_SOURCE = 'waitlist';

@Injectable()
export class CreateWaitlistRequestUseCase {
  constructor(
    @Inject('IServiceRepository')
    private readonly serviceRepository: IServiceRepository,
    @Inject('IWaitlistRequestRepository')
    private readonly waitlistRepository: IWaitlistRequestRepository,
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
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

    const service = await this.serviceRepository.findBySlug(dto.service_slug);
    if (!service || service.status !== ServiceStatus.published) {
      throw new NotFoundException('Service not found');
    }

    const normalizedContact = this.normalizeContact(dto.preferred_contact, dto.contact_value);
    const preferredTimeWindow = this.resolvePreferredTimeWindow(dto.preferred_time_window);
    const encryptedContact = this.encryptionService.encrypt(normalizedContact);
    const source = dto.source ?? DEFAULT_CONSENT_SOURCE;

    const { userId, consentChanges, currentCommunications } = await this.resolveUserAndConsents({
      preferredContact: dto.preferred_contact,
      normalizedContact,
      consents: dto.consents,
      source,
    });

    const waitlistRequest = WaitlistRequest.create({
      id: crypto.randomUUID(),
      userId,
      serviceId: service.id,
      preferredContact: dto.preferred_contact,
      contactValueEncrypted: encryptedContact,
      preferredTimeWindow,
      status: WaitlistStatus.new,
      createdAt: new Date(),
    });

    await this.waitlistRepository.create(waitlistRequest);

    const leadResult = await this.createOrUpdateLeadUseCase.execute({
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
      leadId: leadResult.leadId ?? null,
    });

    await this.sendConfirmationIfNeeded(
      dto.preferred_contact,
      normalizedContact,
      service.title,
      currentCommunications,
    );

    if (consentChanges.length > 0) {
      await Promise.all(
        consentChanges.map((change) =>
          this.trackingService.trackConsentUpdated({
            consentType: change.type,
            newValue: change.value,
            userId,
          }),
        ),
      );
    }

    return {
      waitlist_id: waitlistRequest.id,
      status: waitlistRequest.status,
      service_id: service.id,
      service_slug: service.slug,
      created_at: waitlistRequest.createdAt.toISOString(),
    };
  }

  private async resolveUserAndConsents(params: {
    preferredContact: PreferredContactMethod;
    normalizedContact: string;
    consents: CreateWaitlistRequestDto['consents'];
    source: string;
  }): Promise<{ userId: string | null; consentChanges: Array<{ type: string; value: boolean }>; currentCommunications: boolean }> {
    const { preferredContact, normalizedContact, consents, source } = params;
    const version = DEFAULT_CONSENT_VERSION;

    let user = await this.findExistingUser(preferredContact, normalizedContact);
    const wasCreated = !user;
    if (!user) {
      const email = preferredContact === PreferredContactMethod.email ? Email.create(normalizedContact) : null;
      const phone = preferredContact === PreferredContactMethod.phone ? normalizedContact : null;
      const telegramUserId = preferredContact === PreferredContactMethod.telegram ? normalizedContact : null;
      user = User.create(crypto.randomUUID(), email, phone, telegramUserId);
    }

    const previous = {
      personal_data: user.hasActiveConsent(ConsentType.PERSONAL_DATA),
      communications: user.hasActiveConsent(ConsentType.COMMUNICATIONS),
    };

    user.grantConsent(ConsentType.PERSONAL_DATA, version, source);

    if (consents.communications === true) {
      user.grantConsent(ConsentType.COMMUNICATIONS, version, source);
    } else if (consents.communications === false) {
      user.revokeConsent(ConsentType.COMMUNICATIONS);
    }

    if (wasCreated || previous.personal_data !== user.hasActiveConsent(ConsentType.PERSONAL_DATA) || previous.communications !== user.hasActiveConsent(ConsentType.COMMUNICATIONS)) {
      await this.userRepository.save(user);
    }

    const current = {
      personal_data: user.hasActiveConsent(ConsentType.PERSONAL_DATA),
      communications: user.hasActiveConsent(ConsentType.COMMUNICATIONS),
    };

    const consentChanges = [];
    if (previous.personal_data !== current.personal_data) {
      consentChanges.push({ type: 'personal_data', value: current.personal_data });
    }
    if (previous.communications !== current.communications) {
      consentChanges.push({ type: 'communications', value: current.communications });
    }

    return { userId: user.id, consentChanges, currentCommunications: current.communications };
  }

  private async findExistingUser(method: PreferredContactMethod, normalizedContact: string): Promise<User | null> {
    if (method === PreferredContactMethod.email) {
      return this.userRepository.findByEmail(Email.create(normalizedContact));
    }
    if (method === PreferredContactMethod.phone) {
      return this.userRepository.findByPhone(normalizedContact);
    }
    if (method === PreferredContactMethod.telegram) {
      return this.userRepository.findByTelegramUserId(normalizedContact);
    }
    return null;
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
    communicationsConsent: boolean,
  ): Promise<void> {
    if (method !== PreferredContactMethod.email || !communicationsConsent) {
      return;
    }

    await this.emailService.sendEmail(
      contactValue,
      'Мы получили вашу заявку',
      `Мы добавили вас в лист ожидания по услуге «${serviceTitle}». Как только появится подходящее время, мы свяжемся с вами.`,
    );
  }
}
