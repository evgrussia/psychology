import { BadRequestException } from '@nestjs/common';
import { CreateWaitlistRequestUseCase } from './CreateWaitlistRequestUseCase';
import { IServiceRepository } from '@domain/booking/repositories/IServiceRepository';
import { IWaitlistRequestRepository } from '@domain/booking/repositories/IWaitlistRequestRepository';
import { IEncryptionService } from '@domain/security/services/IEncryptionService';
import { IEmailService } from '@domain/notifications/services/IEmailService';
import { CreateOrUpdateLeadUseCase } from '@application/crm/use-cases/CreateOrUpdateLeadUseCase';
import { TrackingService } from '@infrastructure/tracking/tracking.service';
import { Service } from '@domain/booking/entities/Service';
import { ServiceFormat, ServiceStatus } from '@domain/booking/value-objects/ServiceEnums';
import { PreferredContactMethod, PreferredTimeWindow } from '@domain/booking/value-objects/BookingEnums';
import { IUserRepository } from '@domain/identity/repositories/IUserRepository';

describe('CreateWaitlistRequestUseCase', () => {
  let useCase: CreateWaitlistRequestUseCase;
  let serviceRepository: jest.Mocked<IServiceRepository>;
  let waitlistRepository: jest.Mocked<IWaitlistRequestRepository>;
  let userRepository: jest.Mocked<IUserRepository>;
  let encryptionService: jest.Mocked<IEncryptionService>;
  let emailService: jest.Mocked<IEmailService>;
  let createOrUpdateLeadUseCase: jest.Mocked<CreateOrUpdateLeadUseCase>;
  let trackingService: jest.Mocked<TrackingService>;

  beforeEach(() => {
    serviceRepository = {
      findBySlug: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      findByTopic: jest.fn(),
      save: jest.fn(),
    };
    waitlistRepository = {
      create: jest.fn(),
      findById: jest.fn(),
    };
    userRepository = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findByPhone: jest.fn(),
      findByTelegramUserId: jest.fn(),
      save: jest.fn(),
    };
    encryptionService = {
      encrypt: jest.fn(),
      decrypt: jest.fn(),
    };
    emailService = {
      sendEmail: jest.fn(),
      sendEmailWithTemplate: jest.fn(),
    };
    createOrUpdateLeadUseCase = {
      execute: jest.fn(),
    } as any;
    trackingService = {
      trackWaitlistSubmitted: jest.fn(),
      trackConsentUpdated: jest.fn(),
    } as any;

    useCase = new CreateWaitlistRequestUseCase(
      serviceRepository,
      waitlistRepository,
      userRepository,
      encryptionService,
      emailService,
      createOrUpdateLeadUseCase,
      trackingService,
    );
  });

  it('should create waitlist request and track event', async () => {
    const service = Service.reconstitute({
      id: 'service-1',
      slug: 'intro-session',
      title: 'Ознакомительная сессия',
      descriptionMarkdown: 'Описание',
      format: ServiceFormat.online,
      offlineAddress: null,
      durationMinutes: 50,
      priceAmount: 4000,
      depositAmount: 1000,
      cancelFreeHours: 24,
      cancelPartialHours: 12,
      rescheduleMinHours: 24,
      rescheduleMaxCount: 1,
      status: ServiceStatus.published,
      topicCode: 'anxiety',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    serviceRepository.findBySlug.mockResolvedValue(service);
    encryptionService.encrypt.mockReturnValue('encrypted');
    createOrUpdateLeadUseCase.execute.mockResolvedValue({ leadId: 'lead-1' });

    const result = await useCase.execute({
      service_slug: 'intro-session',
      preferred_contact: PreferredContactMethod.email,
      contact_value: 'test@example.com',
      preferred_time_window: PreferredTimeWindow.any,
      consents: { personal_data: true, communications: true },
      source: 'web',
    });

    expect(result.service_slug).toBe('intro-session');
    expect(waitlistRepository.create).toHaveBeenCalledTimes(1);
    expect(trackingService.trackWaitlistSubmitted).toHaveBeenCalledWith({
      serviceId: 'service-1',
      serviceSlug: 'intro-session',
      preferredContact: PreferredContactMethod.email,
      preferredTimeWindow: PreferredTimeWindow.any,
      leadId: 'lead-1',
    });
    expect(emailService.sendEmail).toHaveBeenCalled();
  });

  it('should reject when personal data consent is missing', async () => {
    await expect(
      useCase.execute({
        service_slug: 'intro-session',
        preferred_contact: PreferredContactMethod.email,
        contact_value: 'test@example.com',
        preferred_time_window: PreferredTimeWindow.any,
        consents: { personal_data: false },
        source: 'web',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('should allow submission without communications consent', async () => {
    const service = Service.reconstitute({
      id: 'service-1',
      slug: 'intro-session',
      title: 'Ознакомительная сессия',
      descriptionMarkdown: 'Описание',
      format: ServiceFormat.online,
      offlineAddress: null,
      durationMinutes: 50,
      priceAmount: 4000,
      depositAmount: 1000,
      cancelFreeHours: 24,
      cancelPartialHours: 12,
      rescheduleMinHours: 24,
      rescheduleMaxCount: 1,
      status: ServiceStatus.published,
      topicCode: 'anxiety',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    serviceRepository.findBySlug.mockResolvedValue(service);
    encryptionService.encrypt.mockReturnValue('encrypted');
    createOrUpdateLeadUseCase.execute.mockResolvedValue({ leadId: 'lead-1' });

    const result = await useCase.execute({
      service_slug: 'intro-session',
      preferred_contact: PreferredContactMethod.email,
      contact_value: 'test@example.com',
      preferred_time_window: PreferredTimeWindow.any,
      consents: { personal_data: true, communications: false },
      source: 'web',
    });

    expect(result.waitlist_id).toBeDefined();
    expect(emailService.sendEmail).not.toHaveBeenCalled();
  });
});
