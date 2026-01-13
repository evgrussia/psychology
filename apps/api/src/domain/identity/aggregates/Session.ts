export class Session {
  private constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly userAgent: string | null,
    public readonly ipAddress: string | null,
    public readonly expiresAt: Date,
    public readonly createdAt: Date,
    private _revokedAt: Date | null,
  ) {}

  static create(
    id: string,
    userId: string,
    userAgent: string | null,
    ipAddress: string | null,
    ttlDays: number = 30,
  ): Session {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + ttlDays);

    return new Session(
      id,
      userId,
      userAgent,
      ipAddress,
      expiresAt,
      new Date(),
      null,
    );
  }

  static reconstitute(params: {
    id: string;
    userId: string;
    userAgent: string | null;
    ipAddress: string | null;
    expiresAt: Date;
    createdAt: Date;
    revokedAt: Date | null;
  }): Session {
    return new Session(
      params.id,
      params.userId,
      params.userAgent,
      params.ipAddress,
      params.expiresAt,
      params.createdAt,
      params.revokedAt,
    );
  }

  revoke(): void {
    if (this._revokedAt) {
      return;
    }
    this._revokedAt = new Date();
  }

  get revokedAt(): Date | null {
    return this._revokedAt;
  }

  isValid(): boolean {
    return !this._revokedAt && this.expiresAt > new Date();
  }
}
