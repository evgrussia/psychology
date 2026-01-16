import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '@infrastructure/database/prisma.service';
import { IEncryptionService } from '@domain/security/services/IEncryptionService';
import { AccountCleanupResult, IAccountCleanupService } from '@domain/cabinet/services/IAccountCleanupService';

@Injectable()
export class PrismaAccountCleanupService implements IAccountCleanupService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject('IEncryptionService')
    private readonly encryptionService: IEncryptionService,
  ) {}

  async cleanupUserData(userId: string): Promise<AccountCleanupResult> {
    const redactedJson = this.encryptionService.encrypt(JSON.stringify({ redacted: true }));
    const redactedText = this.encryptionService.encrypt('[redacted]');

    const appointmentIds = await this.prisma.appointment.findMany({
      where: { client_user_id: userId },
      select: { id: true },
    });
    const appointmentIdList = appointmentIds.map((appointment) => appointment.id);

    const [diaryResult, intakeResult, questionResult, answerResult, reviewResult, leadResult, waitlistResult] =
      await Promise.all([
        this.prisma.diaryEntry.updateMany({
          where: { user_id: userId },
          data: {
            deleted_at: new Date(),
            payload_encrypted: redactedJson,
            has_text: false,
          },
        }),
        appointmentIdList.length
          ? this.prisma.intakeForm.updateMany({
              where: { appointment_id: { in: appointmentIdList } },
              data: {
                status: 'deleted',
                submitted_at: null,
                payload_encrypted: redactedJson,
              },
            })
          : Promise.resolve({ count: 0 }),
        this.prisma.anonymousQuestion.updateMany({
          where: { user_id: userId },
          data: {
            status: 'rejected',
            question_text_encrypted: redactedText,
            contact_value_encrypted: null,
          },
        }),
        this.prisma.questionAnswer.updateMany({
          where: { answered_by_user_id: userId },
          data: {
            answer_text_encrypted: redactedText,
          },
        }),
        this.prisma.review.updateMany({
          where: { user_id: userId },
          data: {
            status: 'deleted',
            published_at: null,
            review_text_encrypted: redactedText,
          },
        }),
        this.prisma.leadIdentity.updateMany({
          where: { user_id: userId },
          data: {
            email_encrypted: null,
            phone_encrypted: null,
            telegram_user_id: null,
          },
        }),
        this.prisma.waitlistRequest.updateMany({
          where: { user_id: userId },
          data: {
            contact_value_encrypted: redactedText,
          },
        }),
      ]);

    return {
      diaryEntries: diaryResult.count,
      intakeForms: intakeResult.count,
      anonymousQuestions: questionResult.count,
      questionAnswers: answerResult.count,
      reviews: reviewResult.count,
      leadIdentities: leadResult.count,
      waitlistRequests: waitlistResult.count,
    };
  }
}
