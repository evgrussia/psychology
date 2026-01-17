import { RequestTimeoutException } from '@nestjs/common';
import { StartBookingUseCase } from './StartBookingUseCase';
import { IServiceRepository } from '@domain/booking/repositories/IServiceRepository';
import { IAvailabilitySlotRepository } from '@domain/booking/repositories/IAvailabilitySlotRepository';
import { IAppointmentRepository } from '@domain/booking/repositories/IAppointmentRepository';
import { Service } from '@domain/booking/entities/Service';
import { AvailabilitySlot } from '@domain/booking/entities/AvailabilitySlot';
import { ServiceFormat, ServiceStatus } from '@domain/booking/value-objects/ServiceEnums';
import { SlotSource, SlotStatus } from '@domain/booking/value-objects/BookingEnums';
import { BookingTimeoutError } from '@domain/booking/errors/BookingErrors';

describe('StartBookingUseCase', () => {
  let useCase: StartBookingUseCase;
  let serviceRepository: jest.Mocked<IServiceRepository>;
  let slotRepository: jest.Mocked<IAvailabilitySlotRepository>;
  let appointmentRepository: jest.Mocked<IAppointmentRepository>;
  const trackingService = {
    trackBookingConflict: jest.fn(),
  };

  beforeEach(() => {
    serviceRepository = {
      findBySlug: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      findByTopic: jest.fn(),
      save: jest.fn(),
    };
    slotRepository = {
      findById: jest.fn(),
      findAvailableSlots: jest.fn(),
      findBusySlots: jest.fn(),
      findBlockedSlots: jest.fn(),
      listSlots: jest.fn(),
      createSlots: jest.fn(),
      updateSlot: jest.fn(),
      deleteSlots: jest.fn(),
      replaceBusySlots: jest.fn(),
      reserveSlot: jest.fn(),
      releaseSlot: jest.fn(),
    };
    appointmentRepository = {
      findById: jest.fn(),
      findByClientRequestId: jest.fn(),
      create: jest.fn(),
      createWithConflictCheck: jest.fn(),
      attachClientUser: jest.fn(),
      findConfirmedWithoutCalendarEvent: jest.fn(),
      setExternalCalendarEventIdIfMatch: jest.fn(),
      clearExternalCalendarEventId: jest.fn(),
      markPaidIfPending: jest.fn(),
      confirmIfPending: jest.fn(),
      save: jest.fn(),
    } as any;
    useCase = new StartBookingUseCase(
      serviceRepository,
      slotRepository,
      appointmentRepository,
      trackingService as any,
    );
  });

  it('should map transaction timeout to RequestTimeoutException', async () => {
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

    const slot = AvailabilitySlot.create({
      id: 'slot-1',
      serviceId: service.id,
      startAtUtc: new Date(Date.now() + 60 * 60 * 1000),
      endAtUtc: new Date(Date.now() + 2 * 60 * 60 * 1000),
      status: SlotStatus.available,
      source: SlotSource.product,
      externalEventId: null,
      createdAt: new Date(),
    });

    serviceRepository.findBySlug.mockResolvedValue(service);
    slotRepository.findById.mockResolvedValue(slot);
    appointmentRepository.findByClientRequestId.mockResolvedValue(null);
    appointmentRepository.createWithConflictCheck.mockRejectedValue(new BookingTimeoutError('timeout'));

    await expect(
      useCase.execute({
        service_slug: service.slug,
        slot_id: slot.id,
        timezone: 'Europe/Moscow',
      }),
    ).rejects.toBeInstanceOf(RequestTimeoutException);
  });
});
