export class AdminInvite {
  private constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly roleCode: string,
    public readonly token: string,
    public readonly expiresAt: Date,
    public readonly createdAt: Date,
    private _usedAt: Date | null,
  ) {}

  static create(
    id: string,
    email: string,
    roleCode: string,
    token: string,
    ttlHours: number = 48,
  ): AdminInvite {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + ttlHours);

    return new AdminInvite(
      id,
      email,
      roleCode,
      token,
      expiresAt,
      new Date(),
      null,
    );
  }

  static reconstitute(params: {
    id: string;
    email: string;
    roleCode: string;
    token: string;
    expiresAt: Date;
    createdAt: Date;
    usedAt: Date | null;
  }): AdminInvite {
    return new AdminInvite(
      params.id,
      params.email,
      params.roleCode,
      params.token,
      params.expiresAt,
      params.createdAt,
      params.usedAt,
    );
  }

  markAsUsed(): void {
    if (this._usedAt) {
      throw new Error('Invite already used');
    }
    if (this.isExpired()) {
      throw new Error('Invite expired');
    }
    this._usedAt = new Date();
  }

  get usedAt(): Date | null {
    return this._usedAt;
  }

  isExpired(): boolean {
    return this.expiresAt < new Date();
  }

  isValid(): boolean {
    return !this._usedAt && !this.isExpired();
  }
}
