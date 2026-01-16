import { Inject, Injectable } from '@nestjs/common';
import JSZip from 'jszip';
import { IAccountDataExporter } from '@domain/cabinet/services/IAccountDataExporter';
import { WriteAuditLogUseCase } from '@application/audit/use-cases/WriteAuditLogUseCase';
import { ExportAccountDataRequestDto } from '../dto/cabinet.dto';

export interface ExportAccountDataResult {
  buffer: Buffer;
  filename: string;
  contentType: string;
}

export interface ExportAccountAuditContext {
  actorUserId: string;
  actorRole: string;
  ipAddress?: string | null;
  userAgent?: string | null;
}

@Injectable()
export class ExportAccountDataUseCase {
  constructor(
    @Inject('IAccountDataExporter')
    private readonly accountDataExporter: IAccountDataExporter,
    private readonly writeAuditLogUseCase: WriteAuditLogUseCase,
  ) {}

  async execute(
    userId: string,
    dto: ExportAccountDataRequestDto,
    audit: ExportAccountAuditContext,
  ): Promise<ExportAccountDataResult> {
    const format = dto.format === 'zip' ? 'zip' : 'json';
    const exportData = await this.accountDataExporter.exportUserData(userId);

    await this.writeAuditLogUseCase.execute({
      actorUserId: audit.actorUserId,
      actorRole: audit.actorRole,
      action: 'user_data_exported',
      entityType: 'user',
      entityId: userId,
      oldValue: null,
      newValue: {
        exportType: 'user_data',
        format,
      },
      ipAddress: audit.ipAddress ?? null,
      userAgent: audit.userAgent ?? null,
    });

    const payload = {
      schema_version: '1.0',
      generated_at: new Date().toISOString(),
      data: exportData,
    };
    const json = JSON.stringify(payload, null, 2);

    if (format === 'json') {
      return {
        buffer: Buffer.from(json, 'utf-8'),
        filename: `user-data-${this.formatDate(new Date())}.json`,
        contentType: 'application/json',
      };
    }

    const zip = new JSZip();
    zip.file('user-data.json', json);
    zip.file('meta.json', JSON.stringify({ exported_at: payload.generated_at }, null, 2));
    const buffer = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });

    return {
      buffer,
      filename: `user-data-${this.formatDate(new Date())}.zip`,
      contentType: 'application/zip',
    };
  }

  private formatDate(date: Date): string {
    return date.toISOString().slice(0, 10);
  }
}
