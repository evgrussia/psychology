import { PrismaAppointmentRepository } from './prisma-appointment.repository';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { Appointment } from '@domain/booking/entities/Appointment';
import { AppointmentStatus } from '@domain/booking/value-objects/BookingEnums';
import { ServiceFormat } from '@domain/booking/value-objects/ServiceEnums';

describe('PrismaAppointmentRepository', () => {
  it('retries when transaction hits a write conflict', async () => {
    const tx = {
      availabilitySlot: { updateMany: jest.fn().mockResolvedValue({ count: 1 }) },
      appointment: {
        findFirst: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue({}),
      },
    };

    const conflictError = new PrismaClientKnownRequestError('write conflict', {
      code: 'P2034',
      clientVersion: 'test',
    });

    const prisma = {
      $transaction: jest
        .fn()
        .mockRejectedValueOnce(conflictError)
        .mockImplementationOnce(async (cb: (tx: any) => Promise<void>) => cb(tx)),
    } as any;

    const repository = new PrismaAppointmentRepository(prisma);
    const appointment = Appointment.create({
      id: 'appointment-1',
      serviceId: 'service-1',
      clientUserId: null,
      leadId: null,
      clientRequestId: 'req-1',
      startAtUtc: new Date(Date.now() + 60 * 60 * 1000),
      endAtUtc: new Date(Date.now() + 2 * 60 * 60 * 1000),
      timezone: 'Europe/Moscow',
      format: ServiceFormat.online,
      status: AppointmentStatus.pending_payment,
      slotId: 'slot-1',
      externalCalendarEventId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await repository.createWithConflictCheck(appointment);

    expect(prisma.$transaction).toHaveBeenCalledTimes(2);
  });
});
