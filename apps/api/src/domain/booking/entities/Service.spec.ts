import { Service } from './Service';
import { ServiceFormat, ServiceStatus } from '../value-objects/ServiceEnums';

const baseProps = {
  id: 'service-1',
  slug: 'intro-session',
  title: 'Ознакомительная сессия',
  descriptionMarkdown: 'Описание услуги',
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
};

describe('Service entity', () => {
  it('should create service with valid props', () => {
    const service = Service.create(baseProps);
    expect(service.slug).toBe(baseProps.slug);
    expect(service.format).toBe(ServiceFormat.online);
    expect(service.cancelFreeHours).toBe(24);
  });

  it('should throw when duration is invalid', () => {
    expect(() => Service.create({ ...baseProps, durationMinutes: 0 })).toThrow(
      'Service duration must be greater than 0',
    );
  });

  it('should throw when deposit exceeds price', () => {
    expect(() => Service.create({ ...baseProps, depositAmount: 6000 })).toThrow(
      'Service deposit cannot exceed price',
    );
  });

  it('should throw when cancel policy is inconsistent', () => {
    expect(() => Service.create({ ...baseProps, cancelFreeHours: 8, cancelPartialHours: 12 })).toThrow(
      'Cancel free hours must be greater than or equal to partial hours',
    );
  });

  it('should require offline address for offline services', () => {
    expect(() => Service.create({ ...baseProps, format: ServiceFormat.offline, offlineAddress: null })).toThrow(
      'Offline services require an address',
    );
  });
});
