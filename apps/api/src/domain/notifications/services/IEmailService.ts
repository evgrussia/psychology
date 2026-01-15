export interface IEmailService {
  sendEmail(to: string, subject: string, body: string): Promise<void>;
  sendEmailWithTemplate(
    to: string,
    templateId: string,
    data: Record<string, any>,
  ): Promise<void>;
}
