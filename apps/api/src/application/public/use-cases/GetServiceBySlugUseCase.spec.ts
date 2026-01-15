import { NotFoundException } from '@nestjs/common';
import { GetServiceBySlugUseCase } from './GetServiceBySlugUseCase';
import { IServiceRepository } from '@domain/booking/repositories/IServiceRepository';
import { Service } from '@domain/booking/entities/Service';
import { ServiceFormat, ServiceStatus } from '@domain/booking/value-objects/ServiceEnums';

describe('GetServiceBySlugUseCase', () => {
  let useCase: GetServiceBySlugUseCase;
  let serviceRepository: jest.Mocked<IServiceRepository>;

  beforeEach(() => {
    serviceRepository = {
      findBySlug: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      findByTopic: jest.fn(),
      save: jest.fn(),
    };
    useCase = new GetServiceBySlugUseCase(serviceRepository);
  });

  it('should return service details when published', async () => {
    const service = Service.reconstitute({
      id: 'service-1',
      slug: 'intro-session',
      title: 'Ознакомительная сессия',
      descriptionMarkdown: 'Описание',
      format: ServiceFormat.online,
      durationMinutes: 50,
      priceAmount: 4000,
      depositAmount: 1000,
      cancelFreeHours: 24,
      cancelPartialHours: 12,
      rescheduleMinHours: 24,
      rescheduleMaxCount: 1,
      status: ServiceStatus.published,
      topicCode: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    serviceRepository.findBySlug.mockResolvedValue(service);

    const result = await useCase.execute('intro-session');

    expect(result.slug).toBe('intro-session');
    expect(result.cancel_free_hours).toBe(24);
  });

  it('should throw when service not found', async () => {
    serviceRepository.findBySlug.mockResolvedValue(null);
    await expect(useCase.execute('missing')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('should throw when service is not published', async () => {
    const service = Service.reconstitute({
      id: 'service-1',
      slug: 'intro-session',
      title: 'Ознакомительная сессия',
      descriptionMarkdown: 'Описание',
      format: ServiceFormat.online,
      durationMinutes: 50,
      priceAmount: 4000,
      depositAmount: 1000,
      cancelFreeHours: 24,
      cancelPartialHours: 12,
      rescheduleMinHours: 24,
      rescheduleMaxCount: 1,
      status: ServiceStatus.draft,
      topicCode: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    serviceRepository.findBySlug.mockResolvedValue(service);

    await expect(useCase.execute('intro-session')).rejects.toBeInstanceOf(NotFoundException);
  });
});
