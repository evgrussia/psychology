import { AvailabilitySlot } from '../entities/AvailabilitySlot';

export interface IAvailabilitySlotRepository {
  findById(id: string): Promise<AvailabilitySlot | null>;
  findAvailableSlots(serviceId: string | null, from: Date, to: Date): Promise<AvailabilitySlot[]>;
  findBusySlots(from: Date, to: Date): Promise<AvailabilitySlot[]>;
  replaceBusySlots(from: Date, to: Date, busySlots: AvailabilitySlot[]): Promise<void>;
  reserveSlot(slotId: string): Promise<boolean>;
}
