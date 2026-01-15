import { IEmailService } from '@domain/notifications/services/IEmailService';

export class EmailStub implements IEmailService {
  async sendEmail(to: string, subject: string, body: string): Promise<void> {
    console.log('Mock: Sending email', { to, subject, body });
  }

  async sendEmailWithTemplate(
    to: string,
    templateId: string,
    data: Record<string, any>,
  ): Promise<void> {
    console.log('Mock: Sending email with template', { to, templateId, data });
  }
}
