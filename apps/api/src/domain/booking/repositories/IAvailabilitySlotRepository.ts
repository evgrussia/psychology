import { AvailabilitySlot } from '../entities/AvailabilitySlot';

export interface IAvailabilitySlotRepository {
  findById(id: string): Promise<AvailabilitySlot | null>;
  findAvailableSlots(serviceId: string | null, from: Date, to: Date): Promise<AvailabilitySlot[]>;
  findBusySlots(from: Date, to: Date): Promise<AvailabilitySlot[]>;
  findBlockedSlots(from: Date, to: Date): Promise<AvailabilitySlot[]>;
  listSlots(from: Date, to: Date, filters?: { serviceId?: string | null; statuses?: string[]; sources?: string[] }): Promise<AvailabilitySlot[]>;
  createSlots(slots: AvailabilitySlot[]): Promise<void>;
  updateSlot(slot: AvailabilitySlot): Promise<void>;
  deleteSlots(ids: string[]): Promise<number>;
  releaseSlot(slotId: string): Promise<boolean>;
  replaceBusySlots(from: Date, to: Date, busySlots: AvailabilitySlot[]): Promise<void>;
  reserveSlot(slotId: string): Promise<boolean>;
}
