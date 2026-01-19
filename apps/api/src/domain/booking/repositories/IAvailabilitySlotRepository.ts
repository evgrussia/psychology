import { AvailabilitySlot } from '../entities/AvailabilitySlot';

export interface IAvailabilitySlotRepository {
  findById(id: string): Promise<AvailabilitySlot | null>;
  findAvailableSlots(serviceId: string | null, from: Date, to: Date): Promise<AvailabilitySlot[]>;
  findReservedSlots(from: Date, to: Date): Promise<AvailabilitySlot[]>;
  findBlockedSlots(from: Date, to: Date): Promise<AvailabilitySlot[]>;
  listSlots(from: Date, to: Date, filters?: { serviceId?: string | null; statuses?: string[]; sources?: string[] }): Promise<AvailabilitySlot[]>;
  createSlots(slots: AvailabilitySlot[]): Promise<void>;
  updateSlot(slot: AvailabilitySlot): Promise<void>;
  deleteSlots(ids: string[]): Promise<number>;
  releaseSlot(slotId: string): Promise<boolean>;
  reserveSlot(slotId: string): Promise<boolean>;
}
