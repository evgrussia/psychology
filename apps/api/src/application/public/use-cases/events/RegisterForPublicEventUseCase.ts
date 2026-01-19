import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@infrastructure/database/prisma.service';
import { IEncryptionService } from '@domain/security/services/IEncryptionService';
import * as crypto from 'crypto';

export interface RegisterForPublicEventDto {
  preferred_contact: 'email' | 'telegram' | 'phone';
  contact_value: string;
  consents: {
    personal_data: boolean;
    communications: boolean;
  };
}

@Injectable()
export class RegisterForPublicEventUseCase {
  constructor(
    private readonly prisma: PrismaService,
    @Inject('IEncryptionService')
    private readonly encryptionService: IEncryptionService,
  ) {}

  async execute(slug: string, dto: RegisterForPublicEventDto): Promise<{ registration_id: string; status: string }> {
    if (!dto?.preferred_contact || !dto?.contact_value || !dto?.consents) {
      throw new BadRequestException('Missing required fields');
    }
    if (!dto.consents.personal_data) {
      throw new BadRequestException('Personal data consent is required');
    }

    const event = await this.prisma.event.findUnique({ where: { slug } });
    if (!event || event.status !== 'published') {
      throw new NotFoundException('Event not found');
    }
    if (!event.registration_open) {
      throw new BadRequestException('Registration is closed');
    }

    if (event.capacity !== null) {
      const count = await this.prisma.eventRegistration.count({ where: { event_id: event.id } });
      if (count >= event.capacity) {
        throw new BadRequestException('Event is full');
      }
    }

    const normalized = this.normalizeContact(dto.preferred_contact, dto.contact_value);
    const encrypted = this.encryptionService.encrypt(normalized);

    const registrationId = crypto.randomUUID();
    await this.prisma.eventRegistration.create({
      data: {
        id: registrationId,
        event_id: event.id,
        user_id: null,
        preferred_contact: dto.preferred_contact,
        contact_value_encrypted: encrypted,
        consent_personal_data: dto.consents.personal_data,
        consent_communications: dto.consents.communications,
      },
    });

    return { registration_id: registrationId, status: 'submitted' };
  }

  private normalizeContact(method: RegisterForPublicEventDto['preferred_contact'], value: string): string {
    const trimmed = value.trim();
    if (!trimmed) {
      throw new BadRequestException('Contact value is required');
    }
    if (method === 'telegram') {
      return trimmed.startsWith('@') ? trimmed : `@${trimmed}`;
    }
    if (method === 'phone') {
      const digits = trimmed.replace(/\D/g, '');
      if (digits.length < 10 || digits.length > 15) {
        throw new BadRequestException('Invalid phone number');
      }
      return digits;
    }
    // email (light validation)
    if (method === 'email') {
      const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!pattern.test(trimmed)) {
        throw new BadRequestException('Invalid email');
      }
      return trimmed.toLowerCase();
    }
    throw new BadRequestException('Unsupported contact method');
  }
}

