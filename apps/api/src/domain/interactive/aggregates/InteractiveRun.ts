import { ResultLevel } from '../value-objects/ResultLevel';

export class InteractiveRun {
  private constructor(
    public readonly id: string,
    public readonly interactiveDefinitionId: string,
    public readonly userId: string | null,
    public readonly anonymousId: string | null,
    public readonly startedAt: Date,
    private _completedAt: Date | null,
    private _resultLevel: ResultLevel | null,
    private _resultProfile: string | null,
    private _durationMs: number | null,
    private _crisisTriggered: boolean,
    private _crisisTriggerType: string | null,
    public readonly deepLinkId: string | null,
  ) {}

  public get completedAt(): Date | null {
    return this._completedAt;
  }

  public get resultLevel(): ResultLevel | null {
    return this._resultLevel;
  }

  public get resultProfile(): string | null {
    return this._resultProfile;
  }

  public get durationMs(): number | null {
    return this._durationMs;
  }

  public get crisisTriggered(): boolean {
    return this._crisisTriggered;
  }

  public get crisisTriggerType(): string | null {
    return this._crisisTriggerType;
  }

  public static create(params: {
    id: string;
    interactiveDefinitionId: string;
    userId?: string | null;
    anonymousId?: string | null;
    deepLinkId?: string | null;
  }): InteractiveRun {
    return new InteractiveRun(
      params.id,
      params.interactiveDefinitionId,
      params.userId ?? null,
      params.anonymousId ?? null,
      new Date(),
      null,
      null,
      null,
      null,
      false,
      null,
      params.deepLinkId ?? null,
    );
  }

  public complete(params: {
    resultLevel: ResultLevel | null;
    resultProfile?: string | null;
    durationMs: number;
    crisisTriggered?: boolean;
    crisisTriggerType?: string | null;
  }): void {
    if (this._completedAt) {
      // Idempotency: already completed
      return;
    }

    this._completedAt = new Date();
    this._resultLevel = params.resultLevel;
    this._resultProfile = params.resultProfile ?? null;
    this._durationMs = params.durationMs;
    this._crisisTriggered = params.crisisTriggered ?? false;
    this._crisisTriggerType = params.crisisTriggerType ?? null;
  }

  public static reconstitute(params: {
    id: string;
    interactiveDefinitionId: string;
    userId: string | null;
    anonymousId: string | null;
    startedAt: Date;
    completedAt: Date | null;
    resultLevel: ResultLevel | null;
    resultProfile: string | null;
    durationMs: number | null;
    crisisTriggered: boolean;
    crisisTriggerType: string | null;
    deepLinkId: string | null;
  }): InteractiveRun {
    return new InteractiveRun(
      params.id,
      params.interactiveDefinitionId,
      params.userId,
      params.anonymousId,
      params.startedAt,
      params.completedAt,
      params.resultLevel,
      params.resultProfile,
      params.durationMs,
      params.crisisTriggered,
      params.crisisTriggerType,
      params.deepLinkId,
    );
  }
}
