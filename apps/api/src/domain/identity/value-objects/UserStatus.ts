export enum UserStatusValue {
  ACTIVE = 'active',
  BLOCKED = 'blocked',
  DELETED = 'deleted',
}

export class UserStatus {
  private constructor(public readonly value: UserStatusValue) {}

  static readonly ACTIVE = new UserStatus(UserStatusValue.ACTIVE);
  static readonly BLOCKED = new UserStatus(UserStatusValue.BLOCKED);
  static readonly DELETED = new UserStatus(UserStatusValue.DELETED);

  static fromValue(value: string): UserStatus {
    switch (value) {
      case UserStatusValue.ACTIVE:
        return UserStatus.ACTIVE;
      case UserStatusValue.BLOCKED:
        return UserStatus.BLOCKED;
      case UserStatusValue.DELETED:
        return UserStatus.DELETED;
      default:
        throw new Error(`Unknown user status: ${value}`);
    }
  }

  isActive(): boolean {
    return this.value === UserStatusValue.ACTIVE;
  }

  equals(other: UserStatus): boolean {
    return this.value === other.value;
  }
}
