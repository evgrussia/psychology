import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@infrastructure/database/prisma.service';
import { IEncryptionService } from '@domain/security/services/IEncryptionService';
import { AccountExportData, IAccountDataExporter } from '@domain/cabinet/services/IAccountDataExporter';

@Injectable()
export class PrismaAccountDataExporter implements IAccountDataExporter {
  constructor(
    private readonly prisma: PrismaService,
    @Inject('IEncryptionService')
    private readonly encryptionService: IEncryptionService,
  ) {}

  async exportUserData(userId: string): Promise<AccountExportData> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { consents: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const appointments = await this.prisma.appointment.findMany({
      where: { client_user_id: userId },
    });
    const appointmentIds = appointments.map((appointment) => appointment.id);

    const [materials, intakeForms, diaryEntries, waitlistRequests, anonymousQuestions, questionAnswers, reviews, leadIdentities] =
      await Promise.all([
        appointmentIds.length
          ? this.prisma.appointmentMaterial.findMany({
              where: { appointment_id: { in: appointmentIds } },
            })
          : Promise.resolve([]),
        appointmentIds.length
          ? this.prisma.intakeForm.findMany({
              where: { appointment_id: { in: appointmentIds } },
            })
          : Promise.resolve([]),
        this.prisma.diaryEntry.findMany({
          where: { user_id: userId },
          orderBy: [{ entry_date: 'desc' }, { created_at: 'desc' }],
        }),
        this.prisma.waitlistRequest.findMany({
          where: { user_id: userId },
        }),
        this.prisma.anonymousQuestion.findMany({
          where: { user_id: userId },
        }),
        this.prisma.questionAnswer.findMany({
          where: { answered_by_user_id: userId },
        }),
        this.prisma.review.findMany({
          where: { user_id: userId },
        }),
        this.prisma.leadIdentity.findMany({
          where: { user_id: userId },
        }),
      ]);

    return {
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        telegram_user_id: user.telegram_user_id,
        telegram_username: user.telegram_username,
        display_name: user.display_name,
        status: user.status,
        created_at: user.created_at.toISOString(),
        deleted_at: user.deleted_at ? user.deleted_at.toISOString() : null,
      },
      consents: user.consents.map((consent) => ({
        id: consent.id,
        consent_type: consent.consent_type,
        granted: consent.granted,
        version: consent.version,
        source: consent.source,
        granted_at: consent.granted_at.toISOString(),
        revoked_at: consent.revoked_at ? consent.revoked_at.toISOString() : null,
      })),
      appointments: appointments.map((appointment) => ({
        id: appointment.id,
        service_id: appointment.service_id,
        client_request_id: appointment.client_request_id,
        start_at_utc: appointment.start_at_utc.toISOString(),
        end_at_utc: appointment.end_at_utc.toISOString(),
        timezone: appointment.timezone,
        format: appointment.format,
        status: appointment.status,
        created_at: appointment.created_at.toISOString(),
        updated_at: appointment.updated_at.toISOString(),
      })),
      appointment_materials: materials.map((material) => ({
        id: material.id,
        appointment_id: material.appointment_id,
        material_type: material.material_type,
        title: material.title,
        description: material.description,
        link_url: material.link_url,
        media_asset_id: material.media_asset_id,
        created_at: material.created_at.toISOString(),
        updated_at: material.updated_at.toISOString(),
      })),
      diary_entries: diaryEntries.map((entry) => ({
        id: entry.id,
        diary_type: entry.diary_type,
        entry_date: entry.entry_date.toISOString().slice(0, 10),
        created_at: entry.created_at.toISOString(),
        has_text: entry.has_text,
        deleted_at: entry.deleted_at ? entry.deleted_at.toISOString() : null,
        payload: this.decryptJson(entry.payload_encrypted),
      })),
      intake_forms: intakeForms.map((form) => ({
        id: form.id,
        appointment_id: form.appointment_id,
        status: form.status,
        submitted_at: form.submitted_at ? form.submitted_at.toISOString() : null,
        payload: this.decryptJson(form.payload_encrypted),
      })),
      waitlist_requests: waitlistRequests.map((request) => ({
        id: request.id,
        service_id: request.service_id,
        preferred_contact: request.preferred_contact,
        preferred_time_window: request.preferred_time_window,
        status: request.status,
        created_at: request.created_at.toISOString(),
        contact_value: this.decryptValue(request.contact_value_encrypted),
      })),
      anonymous_questions: anonymousQuestions.map((question) => ({
        id: question.id,
        status: question.status,
        publish_allowed: question.publish_allowed,
        submitted_at: question.submitted_at.toISOString(),
        answered_at: question.answered_at ? question.answered_at.toISOString() : null,
        question_text: this.decryptValue(question.question_text_encrypted),
        contact_value: this.decryptValue(question.contact_value_encrypted),
      })),
      question_answers: questionAnswers.map((answer) => ({
        id: answer.id,
        question_id: answer.question_id,
        published_at: answer.published_at.toISOString(),
        answer_text: this.decryptValue(answer.answer_text_encrypted),
      })),
      reviews: reviews.map((review) => ({
        id: review.id,
        status: review.status,
        anonymity_level: review.anonymity_level,
        submitted_at: review.submitted_at.toISOString(),
        published_at: review.published_at ? review.published_at.toISOString() : null,
        review_text: this.decryptValue(review.review_text_encrypted),
      })),
      lead_identities: leadIdentities.map((identity) => ({
        id: identity.id,
        lead_id: identity.lead_id,
        anonymous_id: identity.anonymous_id,
        email: this.decryptValue(identity.email_encrypted),
        phone: this.decryptValue(identity.phone_encrypted),
        telegram_user_id: identity.telegram_user_id,
        is_primary: identity.is_primary,
        created_at: identity.created_at.toISOString(),
      })),
    };
  }

  private decryptJson(ciphertext: string): Record<string, unknown> | null {
    const plaintext = this.decryptValue(ciphertext);
    if (!plaintext) {
      return null;
    }
    try {
      return JSON.parse(plaintext);
    } catch {
      return null;
    }
  }

  private decryptValue(ciphertext?: string | null): string | null {
    if (!ciphertext) {
      return null;
    }
    try {
      return this.encryptionService.decrypt(ciphertext);
    } catch {
      return null;
    }
  }
}
