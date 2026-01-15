import { ListServicesUseCase } from './ListServicesUseCase';
import { IServiceRepository } from '@domain/booking/repositories/IServiceRepository';
import { Service } from '@domain/booking/entities/Service';
import { ServiceFormat, ServiceStatus } from '@domain/booking/value-objects/ServiceEnums';

describe('ListServicesUseCase', () => {
  let useCase: ListServicesUseCase;
  let serviceRepository: jest.Mocked<IServiceRepository>;

  beforeEach(() => {
    serviceRepository = {
      findBySlug: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      findByTopic: jest.fn(),
      save: jest.fn(),
    };
    useCase = new ListServicesUseCase(serviceRepository);
  });

  it('should return published services', async () => {
    const services = [
      Service.reconstitute({
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
      }),
    ];
    serviceRepository.findAll.mockResolvedValue(services);

    const result = await useCase.execute();

    expect(result).toHaveLength(1);
    expect(result[0].slug).toBe('intro-session');
    expect(serviceRepository.findAll).toHaveBeenCalledWith(ServiceStatus.published);
  });
});
