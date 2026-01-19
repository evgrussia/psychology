import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IEmailService } from '@domain/notifications/services/IEmailService';
import { IErrorReporter } from '@domain/observability/services/IErrorReporter';
import nodemailer, { Transporter } from 'nodemailer';

@Injectable()
export class EmailService implements IEmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly transporter: Transporter | null;
  private readonly fromAddress: string | null;
  private readonly enabled: boolean;
  private readonly isProduction: boolean;

  constructor(
    private readonly configService: ConfigService,
    @Inject('IErrorReporter')
    private readonly errorReporter: IErrorReporter,
  ) {
    this.isProduction = this.configService.get<string>('NODE_ENV') === 'production';

    const host = this.configService.get<string>('SMTP_HOST')?.trim();
    const portRaw = this.configService.get<string>('SMTP_PORT')?.trim();
    const port = portRaw ? Number(portRaw) : 0;
    const user = this.configService.get<string>('SMTP_USER')?.trim();
    const pass = this.configService.get<string>('SMTP_PASS')?.trim();
    const secureFlag = (this.configService.get<string>('SMTP_SECURE') || '').toLowerCase() === 'true';

    this.fromAddress = this.configService.get<string>('SMTP_FROM')?.trim() || null;
    this.enabled = Boolean(host && port && this.fromAddress);
    this.transporter = this.enabled
      ? nodemailer.createTransport({
          host,
          port,
          secure: secureFlag || port === 465,
          auth: user && pass ? { user, pass } : undefined,
        })
      : null;

    if (!this.enabled) {
      const message = 'SMTP is not configured. Email sending is disabled.';
      if (this.isProduction) {
        this.logger.error(message);
      } else {
        this.logger.warn(message);
      }
    }
  }

  async sendEmail(to: string, subject: string, body: string): Promise<void> {
    if (!this.enabled || !this.transporter || !this.fromAddress) {
      const reason = 'smtp_not_configured';
      if (this.isProduction) {
        this.errorReporter.captureMessage?.('Email sending failed: SMTP not configured', {
          source: 'email',
        });
        throw new Error('Email transport is not configured');
      }
      this.logger.warn('Email skipped because SMTP is not configured');
      return;
    }

    try {
      await this.transporter.sendMail({
        from: this.fromAddress,
        to,
        subject,
        text: body,
      });
    } catch (error: any) {
      this.errorReporter.captureException(error, {
        source: 'email',
      });
      throw error;
    }
  }

  async sendEmailWithTemplate(
    to: string,
    templateId: string,
    data: Record<string, any>,
  ): Promise<void> {
    const subject = `Template ${templateId}`;
    const body = JSON.stringify(data, null, 2);
    await this.sendEmail(to, subject, body);
  }
}
