import { Injectable } from '@nestjs/common';
import {
  ExperimentAssignmentInput,
  ExperimentAssignmentLookup,
  ExperimentAssignmentRecord,
  IExperimentAssignmentRepository,
} from '@domain/experiments/repositories/IExperimentAssignmentRepository';
import { PrismaService } from '../../../database/prisma.service';

@Injectable()
export class PrismaExperimentAssignmentRepository implements IExperimentAssignmentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findActiveAssignment(
    lookup: ExperimentAssignmentLookup,
  ): Promise<ExperimentAssignmentRecord | null> {
    const where: Record<string, any> = {
      experiment_id: lookup.experimentId,
      expires_at: { gt: lookup.at },
    };

    if (lookup.userId) {
      where.user_id = lookup.userId;
    } else if (lookup.anonymousId) {
      where.anonymous_id = lookup.anonymousId;
    } else {
      return null;
    }

    const record = await this.prisma.experimentAssignment.findFirst({
      where,
      orderBy: { assigned_at: 'desc' },
    });

    if (!record) return null;

    return {
      id: record.id,
      experimentId: record.experiment_id,
      variant: record.variant,
      anonymousId: record.anonymous_id,
      userId: record.user_id,
      assignedAt: record.assigned_at,
      expiresAt: record.expires_at,
      createdAt: record.created_at,
      updatedAt: record.updated_at,
    };
  }

  async create(input: ExperimentAssignmentInput): Promise<ExperimentAssignmentRecord> {
    const record = await this.prisma.experimentAssignment.create({
      data: {
        experiment_id: input.experimentId,
        variant: input.variant,
        anonymous_id: input.anonymousId ?? null,
        user_id: input.userId ?? null,
        assigned_at: input.assignedAt,
        expires_at: input.expiresAt,
      },
    });

    return {
      id: record.id,
      experimentId: record.experiment_id,
      variant: record.variant,
      anonymousId: record.anonymous_id,
      userId: record.user_id,
      assignedAt: record.assigned_at,
      expiresAt: record.expires_at,
      createdAt: record.created_at,
      updatedAt: record.updated_at,
    };
  }
}
