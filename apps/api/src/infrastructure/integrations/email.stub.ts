export interface IEmailService {
  sendEmail(to: string, subject: string, body: string): Promise<void>;
  sendEmailWithTemplate(
    to: string,
    templateId: string,
    data: Record<string, any>,
  ): Promise<void>;
}

export class EmailStub implements IEmailService {
  async sendEmail(to: string, subject: string, body: string): Promise<void> {
    console.log('Mock: Sending email', { to, subject, body });
    // In a real implementation, this would use an email provider (SendGrid, SES, etc.)
  }

  async sendEmailWithTemplate(
    to: string,
    templateId: string,
    data: Record<string, any>,
  ): Promise<void> {
    console.log('Mock: Sending email with template', { to, templateId, data });
    // In a real implementation, this would use a templating service
  }
}
