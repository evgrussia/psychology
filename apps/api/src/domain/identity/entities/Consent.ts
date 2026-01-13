import { ConsentType } from '../value-objects/ConsentType';

export class Consent {
  private constructor(
    public readonly id: string,
    public readonly type: ConsentType,
    public readonly version: string,
    public readonly source: string,
    public readonly grantedAt: Date,
    private _revokedAt: Date | null,
  ) {}

  static create(
    id: string,
    type: ConsentType,
    version: string,
    source: string,
  ): Consent {
    return new Consent(id, type, version, source, new Date(), null);
  }

  static reconstitute(
    id: string,
    type: ConsentType,
    version: string,
    source: string,
    grantedAt: Date,
    revokedAt: Date | null,
  ): Consent {
    return new Consent(id, type, version, source, grantedAt, revokedAt);
  }

  revoke(): void {
    if (this._revokedAt) {
      throw new Error('Consent is already revoked');
    }
    this._revokedAt = new Date();
  }

  get revokedAt(): Date | null {
    return this._revokedAt;
  }

  isActive(): boolean {
    return this._revokedAt === null;
  }
}
