import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { Request } from 'express';

export interface WebhookVerificationResult {
  ok: boolean;
  reason?: string;
}

@Injectable()
export class YooKassaWebhookVerifier {
  private readonly logger = new Logger(YooKassaWebhookVerifier.name);
  private readonly webhookSecret: string | null;
  private readonly signatureHeader: string;
  private readonly allowedIps: Set<string>;
  private readonly defaultYooKassaIps = [
    '185.71.76.0/27',
    '185.71.77.0/27',
    '77.75.153.0/25',
    '77.75.156.11',
    '77.75.156.35',
    '77.75.154.128/25',
    '2a02:5180::/32',
  ];
  private readonly requireBasicAuth: boolean;
  private readonly shopId: string | null;
  private readonly secretKey: string | null;
  private readonly requireVerificationInProd: boolean;

  constructor(private readonly configService: ConfigService) {
    this.webhookSecret = this.normalizeValue(this.configService.get<string>('YOOKASSA_WEBHOOK_SECRET'));
    this.signatureHeader =
      (this.normalizeValue(this.configService.get<string>('YOOKASSA_WEBHOOK_SIGNATURE_HEADER')) || 'x-yookassa-signature')
        .toLowerCase();
    this.allowedIps = this.parseIpAllowlist(this.configService.get<string>('YOOKASSA_WEBHOOK_IP_ALLOWLIST'));
    this.requireBasicAuth = this.normalizeValue(this.configService.get<string>('YOOKASSA_WEBHOOK_BASIC_AUTH')) === 'true';
    this.shopId = this.normalizeValue(this.configService.get<string>('YOOKASSA_SHOP_ID'));
    this.secretKey = this.normalizeValue(this.configService.get<string>('YOOKASSA_SECRET_KEY'));
    this.requireVerificationInProd = this.configService.get<string>('NODE_ENV') === 'production';
  }

  verify(request: Request): WebhookVerificationResult {
    if (this.allowedIps.size > 0) {
      const requestIp = this.extractRequestIp(request);
      if (!requestIp || !this.allowedIps.has(requestIp)) {
        return { ok: false, reason: 'ip_not_allowed' };
      }
    }

    if (this.requireBasicAuth) {
      if (!this.verifyBasicAuth(request)) {
        return { ok: false, reason: 'basic_auth_invalid' };
      }
    }

    if (this.webhookSecret) {
      const rawBody = (request as any).rawBody as Buffer | undefined;
      if (!rawBody) {
        return { ok: false, reason: 'raw_body_missing' };
      }

      const providedSignature = this.extractSignature(request);
      if (!providedSignature) {
        return { ok: false, reason: 'signature_missing' };
      }

      const expectedHex = this.buildHmac(rawBody, 'hex');
      const expectedBase64 = this.buildHmac(rawBody, 'base64');
      if (!this.compareSignatures(providedSignature, expectedHex, expectedBase64)) {
        return { ok: false, reason: 'signature_mismatch' };
      }
    }

    if (!this.webhookSecret && this.allowedIps.size === 0 && !this.requireBasicAuth) {
      if (this.requireVerificationInProd) {
        return { ok: false, reason: 'verification_not_configured' };
      }
      this.logger.warn('Webhook verification is not configured. Accepting request in non-production.');
    }

    return { ok: true };
  }

  private normalizeValue(value?: string | null): string | null {
    const trimmed = value?.trim();
    return trimmed ? trimmed : null;
  }

  private parseIpAllowlist(value?: string | null): Set<string> {
    if (!value) {
      return new Set();
    }
    return new Set(
      value
        .split(',')
        .map((ip) => ip.trim())
        .filter((ip) => ip.length > 0),
    );
  }

  private extractRequestIp(request: Request): string | null {
    const forwarded = request.headers['x-forwarded-for'];
    if (typeof forwarded === 'string') {
      return forwarded.split(',')[0]?.trim() || null;
    }
    return request.ip || null;
  }

  private verifyBasicAuth(request: Request): boolean {
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Basic ')) {
      return false;
    }
    if (!this.shopId || !this.secretKey) {
      return false;
    }
    const encoded = authHeader.slice('Basic '.length).trim();
    const decoded = Buffer.from(encoded, 'base64').toString('utf-8');
    return decoded === `${this.shopId}:${this.secretKey}`;
  }

  private extractSignature(request: Request): string | null {
    const headerValue = request.headers[this.signatureHeader];
    const rawHeader =
      (Array.isArray(headerValue) ? headerValue[0] : headerValue) ||
      request.headers['authorization'];
    if (!rawHeader) {
      return null;
    }
    if (rawHeader.startsWith('Basic ')) {
      return null;
    }
    if (rawHeader.startsWith('Signature ')) {
      return rawHeader.slice('Signature '.length).trim();
    }
    if (rawHeader.startsWith('Bearer ')) {
      return rawHeader.slice('Bearer '.length).trim();
    }
    return rawHeader.toString().trim();
  }

  private buildHmac(rawBody: Buffer, digest: crypto.BinaryToTextEncoding): string {
    return crypto.createHmac('sha256', this.webhookSecret as string).update(rawBody).digest(digest);
  }

  private compareSignatures(provided: string, expectedHex: string, expectedBase64: string): boolean {
    const normalized = provided.replace(/^sha256=/i, '').trim();
    if (this.safeCompare(normalized, expectedHex)) {
      return true;
    }
    return this.safeCompare(normalized, expectedBase64);
  }

  private safeCompare(a: string, b: string): boolean {
    try {
      const aBuf = Buffer.from(a);
      const bBuf = Buffer.from(b);
      if (aBuf.length !== bBuf.length) {
        return false;
      }
      return crypto.timingSafeEqual(aBuf, bBuf);
    } catch {
      return false;
    }
  }
}
