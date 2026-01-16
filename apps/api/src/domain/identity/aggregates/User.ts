import { DomainEvent } from '../../events/event-bus.interface';
import { Consent } from '../entities/Consent';
import { ConsentType } from '../value-objects/ConsentType';
import { Email } from '../value-objects/Email';
import { Role } from '../value-objects/Role';
import { UserStatus } from '../value-objects/UserStatus';
import { UserCreatedEvent } from '../events/UserCreatedEvent';
import * as crypto from 'crypto';

export class User {
  private _domainEvents: DomainEvent[] = [];

  private constructor(
    public readonly id: string,
    private _email: Email | null,
    private _phone: string | null,
    private _telegramUserId: string | null,
    private _displayName: string | null,
    private _passwordHash: string | null,
    private _status: UserStatus,
    private _roles: Role[],
    private _consents: Consent[],
    private _deletedAt: Date | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static create(
    id: string,
    email: Email | null,
    phone: string | null,
    telegramUserId: string | null,
    passwordHash?: string,
  ): User {
    if (!email && !phone && !telegramUserId) {
      throw new Error('At least one contact method is required');
    }

    const now = new Date();
    const user = new User(
      id,
      email,
      phone,
      telegramUserId,
      null,
      passwordHash || null,
      UserStatus.ACTIVE,
      [Role.CLIENT],
      [],
      null,
      now,
      now,
    );

    user.addDomainEvent(
      new UserCreatedEvent(user.id, email, phone, telegramUserId),
    );

    return user;
  }

  static reconstitute(params: {
    id: string;
    email: Email | null;
    phone: string | null;
    telegramUserId: string | null;
    displayName: string | null;
    passwordHash: string | null;
    status: UserStatus;
    roles: Role[];
    consents: Consent[];
    deletedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
  }): User {
    return new User(
      params.id,
      params.email,
      params.phone,
      params.telegramUserId,
      params.displayName,
      params.passwordHash,
      params.status,
      params.roles,
      params.consents,
      params.deletedAt,
      params.createdAt,
      params.updatedAt,
    );
  }

  get email(): Email | null { return this._email; }
  get phone(): string | null { return this._phone; }
  get telegramUserId(): string | null { return this._telegramUserId; }
  get displayName(): string | null { return this._displayName; }
  get passwordHash(): string | null { return this._passwordHash; }
  get status(): UserStatus { return this._status; }
  get roles(): Role[] { return [...this._roles]; }
  get consents(): Consent[] { return [...this._consents]; }
  get deletedAt(): Date | null { return this._deletedAt; }

  assignRole(role: Role): void {
    if (this._roles.some((r) => r.equals(role))) {
      return;
    }
    this._roles.push(role);
  }

  grantConsent(type: ConsentType, version: string, source: string): void {
    const existing = this._consents.find((c) => c.type.equals(type) && c.isActive());
    if (existing) {
      return;
    }
    const consent = Consent.create(
      crypto.randomUUID(),
      type,
      version,
      source,
    );
    this._consents.push(consent);
  }

  revokeConsent(type: ConsentType): void {
    const consent = this._consents.find((c) => c.type.equals(type) && c.isActive());
    if (!consent) {
      return;
    }
    consent.revoke();
  }

  hasActiveConsent(type: ConsentType): boolean {
    return this._consents.some((c) => c.type.equals(type) && c.isActive());
  }

  hasRole(roleCode: string): boolean {
    return this._roles.some((r) => r.code === roleCode);
  }

  updatePassword(passwordHash: string): void {
    this._passwordHash = passwordHash;
  }

  unlinkTelegram(): void {
    this._telegramUserId = null;
  }

  deleteAccount(): void {
    this._status = UserStatus.DELETED;
    this._deletedAt = new Date();
    this._email = null;
    this._phone = null;
    this._telegramUserId = null;
    this._displayName = null;
    this._passwordHash = null;
  }

  get domainEvents(): DomainEvent[] {
    return [...this._domainEvents];
  }

  clearDomainEvents(): void {
    this._domainEvents = [];
  }

  private addDomainEvent(event: DomainEvent): void {
    this._domainEvents.push(event);
  }
}
