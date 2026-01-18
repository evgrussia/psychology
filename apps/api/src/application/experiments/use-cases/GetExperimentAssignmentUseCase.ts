import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IExperimentAssignmentRepository } from '@domain/experiments/repositories/IExperimentAssignmentRepository';
import { ExperimentAssignmentRequestDto, ExperimentAssignmentResponseDto } from '../dto/experiments.dto';
import { getExperimentById } from '../experiments-catalog';

@Injectable()
export class GetExperimentAssignmentUseCase {
  constructor(
    @Inject('IExperimentAssignmentRepository')
    private readonly assignmentRepository: IExperimentAssignmentRepository,
  ) {}

  async execute(dto: ExperimentAssignmentRequestDto): Promise<ExperimentAssignmentResponseDto> {
    if (!dto.experiment_id) {
      throw new BadRequestException('experiment_id is required');
    }

    const experiment = getExperimentById(dto.experiment_id);
    if (!experiment) {
      throw new NotFoundException('Experiment not found');
    }

    if (experiment.status !== 'active') {
      return {
        experiment_id: experiment.id,
        variant: null,
        assigned_at: null,
        expires_at: null,
        is_new: false,
        status: experiment.status,
        surface: experiment.surface,
      };
    }

    const anonymousId = dto.anonymous_id ?? null;
    const userId = dto.user_id ?? null;
    if (!anonymousId && !userId) {
      throw new BadRequestException('anonymous_id or user_id is required');
    }

    const now = new Date();
    let assignment = null;

    if (userId) {
      assignment = await this.assignmentRepository.findActiveAssignment({
        experimentId: experiment.id,
        userId,
        at: now,
      });
    }

    let anonymousAssignment = null;
    if (!assignment && anonymousId) {
      anonymousAssignment = await this.assignmentRepository.findActiveAssignment({
        experimentId: experiment.id,
        anonymousId,
        at: now,
      });
      assignment = anonymousAssignment;
    }

    if (assignment && userId && assignment.userId !== userId) {
      const stitched = await this.assignmentRepository.create({
        experimentId: experiment.id,
        variant: assignment.variant,
        userId,
        assignedAt: now,
        expiresAt: assignment.expiresAt,
      });
      return this.toResponse(experiment.id, experiment.status, experiment.surface, stitched, true);
    }

    if (assignment) {
      return this.toResponse(experiment.id, experiment.status, experiment.surface, assignment, false);
    }

    const variant = chooseVariant(experiment.variants);
    const expiresAt = addDays(now, 30);
    const created = await this.assignmentRepository.create({
      experimentId: experiment.id,
      variant,
      anonymousId,
      userId,
      assignedAt: now,
      expiresAt,
    });

    return this.toResponse(experiment.id, experiment.status, experiment.surface, created, true);
  }

  private toResponse(
    experimentId: string,
    status: ExperimentAssignmentResponseDto['status'],
    surface: string,
    assignment: { variant: string; assignedAt: Date; expiresAt: Date },
    isNew: boolean,
  ): ExperimentAssignmentResponseDto {
    return {
      experiment_id: experimentId,
      variant: assignment.variant,
      assigned_at: assignment.assignedAt.toISOString(),
      expires_at: assignment.expiresAt.toISOString(),
      is_new: isNew,
      status,
      surface,
    };
  }
}

function chooseVariant(variants: { key: string; weight: number }[]): string {
  const total = variants.reduce((sum, variant) => sum + variant.weight, 0);
  const target = Math.random() * total;
  let cumulative = 0;
  for (const variant of variants) {
    cumulative += variant.weight;
    if (target <= cumulative) {
      return variant.key;
    }
  }
  return variants[variants.length - 1]?.key ?? 'A';
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}
