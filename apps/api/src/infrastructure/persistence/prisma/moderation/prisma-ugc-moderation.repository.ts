import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../database/prisma.service';
import {
  AnonymousQuestionDetails,
  CreateAnonymousQuestionInput,
  CreateAnswerInput,
  CreateModerationActionInput,
  IUgcModerationRepository,
  ModerationListFilters,
  ModerationListResult,
} from '@domain/moderation/repositories/IUgcModerationRepository';
import { ModerationActionType, ModerationReasonCategory, UgcStatus, UgcTriggerFlag, UgcType } from '@domain/moderation/value-objects/ModerationEnums';

@Injectable()
export class PrismaUgcModerationRepository implements IUgcModerationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async listModerationItems(filters: ModerationListFilters): Promise<ModerationListResult> {
    const page = filters.page ?? 1;
    const pageSize = filters.pageSize ?? 20;

    if (filters.type && !filters.type.includes('anonymous_question')) {
      return { items: [], total: 0, statusCounts: {} };
    }

    const where = this.buildWhere(filters);
    const statusCountWhere = this.buildWhere({ ...filters, status: undefined });

    const [records, total, grouped] = await this.prisma.$transaction([
      this.prisma.anonymousQuestion.findMany({
        where,
        orderBy: { submitted_at: 'asc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          moderations: {
            orderBy: { created_at: 'desc' },
            take: 1,
            include: {
              moderator: {
                select: {
                  id: true,
                  email: true,
                  display_name: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.anonymousQuestion.count({ where }),
      (this.prisma.anonymousQuestion as any).groupBy({
        by: ['status'],
        where: statusCountWhere,
        _count: { status: true },
      }),
    ]);

    const statusCounts = (grouped as any[]).reduce<Record<string, number>>((acc, item) => {
      acc[item.status] = item._count.status;
      return acc;
    }, {});

    return {
      items: records.map((record) => {
        const lastAction = record.moderations[0];
        return {
          id: record.id,
          type: 'anonymous_question' as UgcType,
          status: record.status as UgcStatus,
          submittedAt: record.submitted_at,
          answeredAt: record.answered_at ?? null,
          triggerFlags: this.toTriggerFlags(record.trigger_flags),
          hasContact: Boolean(record.contact_value_encrypted),
          lastAction: lastAction
            ? {
                action: lastAction.action as ModerationActionType,
                reasonCategory: (lastAction.reason_category as ModerationReasonCategory) ?? null,
                createdAt: lastAction.created_at,
                moderator: lastAction.moderator
                  ? {
                      id: lastAction.moderator.id,
                      email: lastAction.moderator.email,
                      displayName: lastAction.moderator.display_name,
                    }
                  : null,
              }
            : null,
        };
      }),
      total,
      statusCounts,
    };
  }

  async getAnonymousQuestionById(id: string): Promise<AnonymousQuestionDetails | null> {
    const record = await this.prisma.anonymousQuestion.findUnique({
      where: { id },
      include: {
        answers: {
          orderBy: { published_at: 'desc' },
          include: {
            answered_by: {
              select: {
                id: true,
                email: true,
                display_name: true,
              },
            },
          },
        },
        moderations: {
          orderBy: { created_at: 'desc' },
          include: {
            moderator: {
              select: {
                id: true,
                email: true,
                display_name: true,
              },
            },
          },
        },
      },
    });

    if (!record) {
      return null;
    }

    return {
      id: record.id,
      status: record.status as UgcStatus,
      submittedAt: record.submitted_at,
      answeredAt: record.answered_at ?? null,
      triggerFlags: this.toTriggerFlags(record.trigger_flags),
      questionTextEncrypted: record.question_text_encrypted,
      contactValueEncrypted: record.contact_value_encrypted ?? null,
      publishAllowed: record.publish_allowed,
      answers: record.answers.map((answer) => ({
        id: answer.id,
        answerTextEncrypted: answer.answer_text_encrypted,
        publishedAt: answer.published_at,
        answeredBy: answer.answered_by
          ? {
              id: answer.answered_by.id,
              email: answer.answered_by.email,
              displayName: answer.answered_by.display_name,
            }
          : null,
      })),
      moderations: record.moderations.map((action) => ({
        id: action.id,
        action: action.action as ModerationActionType,
        reasonCategory: (action.reason_category as ModerationReasonCategory) ?? null,
        createdAt: action.created_at,
        moderator: action.moderator
          ? {
              id: action.moderator.id,
              email: action.moderator.email,
              displayName: action.moderator.display_name,
            }
          : null,
      })),
    };
  }

  async createAnonymousQuestion(input: CreateAnonymousQuestionInput): Promise<{ id: string; status: UgcStatus; submittedAt: Date }> {
    const record = await this.prisma.anonymousQuestion.create({
      data: {
        user_id: input.userId ?? null,
        status: input.status,
        trigger_flags: input.triggerFlags ?? [],
        question_text_encrypted: input.questionTextEncrypted,
        contact_value_encrypted: input.contactValueEncrypted ?? null,
        publish_allowed: input.publishAllowed,
      },
    });

    return {
      id: record.id,
      status: record.status as UgcStatus,
      submittedAt: record.submitted_at,
    };
  }

  async updateQuestionStatus(id: string, status: UgcStatus, answeredAt?: Date | null): Promise<void> {
    await this.prisma.anonymousQuestion.update({
      where: { id },
      data: {
        status,
        answered_at: answeredAt ?? undefined,
      },
    });
  }

  async addModerationAction(input: CreateModerationActionInput): Promise<void> {
    await this.prisma.ugcModerationAction.create({
      data: {
        ugc_type: input.ugcType,
        ugc_id: input.ugcId,
        moderator_user_id: input.moderatorUserId,
        action: input.action,
        reason_category: input.reasonCategory ?? null,
      },
    });
  }

  async addAnswer(input: CreateAnswerInput): Promise<{ id: string; answerTextEncrypted: string; publishedAt: Date; answeredBy: { id: string; email: string | null; displayName: string | null } | null }> {
    const record = await this.prisma.questionAnswer.create({
      data: {
        question_id: input.questionId,
        answered_by_user_id: input.answeredByUserId,
        answer_text_encrypted: input.answerTextEncrypted,
        published_at: input.publishedAt ?? new Date(),
      },
      include: {
        answered_by: {
          select: {
            id: true,
            email: true,
            display_name: true,
          },
        },
      },
    });

    return {
      id: record.id,
      answerTextEncrypted: record.answer_text_encrypted,
      publishedAt: record.published_at,
      answeredBy: record.answered_by
        ? {
            id: record.answered_by.id,
            email: record.answered_by.email,
            displayName: record.answered_by.display_name,
          }
        : null,
    };
  }

  private buildWhere(filters: ModerationListFilters): Prisma.AnonymousQuestionWhereInput {
    const where: Prisma.AnonymousQuestionWhereInput = {};

    if (filters.status?.length) {
      where.status = { in: filters.status };
    }

    if (filters.from || filters.to) {
      where.submitted_at = {
        gte: filters.from,
        lte: filters.to,
      };
    }

    if (filters.triggerFlags?.length) {
      where.trigger_flags = {
        array_contains: filters.triggerFlags as any,
      };
    }

    return where;
  }

  private toTriggerFlags(value: Prisma.JsonValue | null): UgcTriggerFlag[] {
    if (!value) return [];
    if (Array.isArray(value)) {
      return value.filter((item): item is UgcTriggerFlag => typeof item === 'string') as UgcTriggerFlag[];
    }
    return [];
  }
}
