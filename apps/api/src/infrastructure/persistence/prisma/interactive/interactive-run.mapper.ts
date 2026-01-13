import { InteractiveRun as PrismaInteractiveRun, ResultLevel as PrismaResultLevel } from '@prisma/client';
import { InteractiveRun } from '../../../../domain/interactive/aggregates/InteractiveRun';
import { ResultLevel } from '../../../../domain/interactive/value-objects/ResultLevel';

export class InteractiveRunMapper {
  static toDomain(prismaRun: PrismaInteractiveRun): InteractiveRun {
    return InteractiveRun.reconstitute({
      id: prismaRun.id,
      interactiveDefinitionId: prismaRun.interactive_definition_id,
      userId: prismaRun.user_id,
      anonymousId: prismaRun.anonymous_id,
      startedAt: prismaRun.started_at,
      completedAt: prismaRun.completed_at,
      resultLevel: prismaRun.result_level ? this.mapResultLevelToDomain(prismaRun.result_level) : null,
      resultProfile: prismaRun.result_profile,
      durationMs: prismaRun.duration_ms,
      crisisTriggered: prismaRun.crisis_triggered,
      crisisTriggerType: prismaRun.crisis_trigger_type,
      deepLinkId: prismaRun.deep_link_id,
    });
  }

  static toPrisma(domainRun: InteractiveRun): PrismaInteractiveRun {
    return {
      id: domainRun.id,
      interactive_definition_id: domainRun.interactiveDefinitionId,
      user_id: domainRun.userId,
      anonymous_id: domainRun.anonymousId,
      started_at: domainRun.startedAt,
      completed_at: domainRun.completedAt,
      result_level: domainRun.resultLevel ? this.mapResultLevelToPrisma(domainRun.resultLevel) : null,
      result_profile: domainRun.resultProfile,
      duration_ms: domainRun.durationMs,
      crisis_triggered: domainRun.crisisTriggered,
      crisis_trigger_type: domainRun.crisisTriggerType,
      deep_link_id: domainRun.deepLinkId,
    };
  }

  private static mapResultLevelToDomain(prismaLevel: PrismaResultLevel): ResultLevel {
    switch (prismaLevel) {
      case PrismaResultLevel.low:
        return ResultLevel.LOW;
      case PrismaResultLevel.moderate:
        return ResultLevel.MODERATE;
      case PrismaResultLevel.high:
        return ResultLevel.HIGH;
      default:
        throw new Error(`Unknown ResultLevel: ${prismaLevel}`);
    }
  }

  private static mapResultLevelToPrisma(domainLevel: ResultLevel): PrismaResultLevel {
    switch (domainLevel) {
      case ResultLevel.LOW:
        return PrismaResultLevel.low;
      case ResultLevel.MODERATE:
        return PrismaResultLevel.moderate;
      case ResultLevel.HIGH:
        return PrismaResultLevel.high;
      default:
        throw new Error(`Unknown ResultLevel: ${domainLevel}`);
    }
  }
}
