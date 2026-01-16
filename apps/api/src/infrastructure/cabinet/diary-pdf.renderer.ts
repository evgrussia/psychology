import { Injectable } from '@nestjs/common';
import { IDiaryExportRenderer, DiaryExportDocument, DiaryExportEntry } from '@domain/cabinet/services/IDiaryExportRenderer';
import { DiaryType } from '@domain/cabinet/value-objects/DiaryEnums';

// pdfmake exports the PdfPrinter class from the compiled build.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const PdfPrinterModule = require('pdfmake/js/printer');
const PdfPrinter = PdfPrinterModule.default ?? PdfPrinterModule;
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfFonts = require('pdfmake/build/vfs_fonts');
const vfsFonts =
  pdfFonts?.pdfMake?.vfs ??
  pdfFonts?.vfs ??
  pdfFonts?.default?.pdfMake?.vfs ??
  pdfFonts?.default?.vfs ??
  pdfFonts;

if (!vfsFonts) {
  throw new Error('PDF fonts are not available');
}

const fonts = {
  Roboto: {
    normal: Buffer.from(vfsFonts['Roboto-Regular.ttf'], 'base64'),
    bold: Buffer.from(vfsFonts['Roboto-Medium.ttf'], 'base64'),
    italics: Buffer.from(vfsFonts['Roboto-Italic.ttf'], 'base64'),
    bolditalics: Buffer.from(vfsFonts['Roboto-MediumItalic.ttf'], 'base64'),
  },
};

@Injectable()
export class PdfMakeDiaryExportRenderer implements IDiaryExportRenderer {
  private readonly printer = new PdfPrinter(fonts);

  async renderDiaryPdf(document: DiaryExportDocument): Promise<Buffer> {
    const docDefinition: any = {
      content: [
        { text: document.title, style: 'header' },
        { text: `Период: ${document.periodLabel}`, style: 'subheader' },
        { text: `Сформировано: ${this.formatDateTime(document.generatedAt)}`, style: 'meta' },
        { text: ' ', margin: [0, 4] },
        ...this.renderEntries(document.entries),
      ],
      styles: {
        header: { fontSize: 18, bold: true },
        subheader: { fontSize: 12, margin: [0, 4, 0, 2] },
        meta: { fontSize: 9, color: '#6B7280', margin: [0, 0, 0, 10] },
        entryTitle: { fontSize: 12, bold: true, margin: [0, 0, 0, 4] },
        entryMeta: { fontSize: 9, color: '#6B7280', margin: [0, 0, 0, 4] },
        entryText: { fontSize: 10, margin: [0, 0, 0, 4] },
        emptyState: { fontSize: 11, italics: true, color: '#6B7280' },
      },
      defaultStyle: {
        font: 'Roboto',
      },
    };

    const pdfDoc = await this.printer.createPdfKitDocument(docDefinition);
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      pdfDoc.on('data', (chunk: Buffer) => chunks.push(chunk));
      pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));
      pdfDoc.on('error', reject);
      pdfDoc.end();
    });
  }

  private renderEntries(entries: DiaryExportEntry[]): Array<Record<string, unknown>> {
    if (!entries.length) {
      return [{ text: 'За выбранный период записей нет.', style: 'emptyState' }];
    }

    return entries.map((entry) => ({
      stack: [
        { text: `${this.formatDate(entry.entryDate)} — ${this.getDiaryLabel(entry.diaryType)}`, style: 'entryTitle' },
        { text: `Создано: ${this.formatDateTime(entry.createdAt)}`, style: 'entryMeta' },
        ...this.renderEntryPayload(entry),
      ],
      margin: [0, 0, 0, 12],
    }));
  }

  private renderEntryPayload(entry: DiaryExportEntry): Array<Record<string, unknown>> {
    if (entry.diaryType === DiaryType.emotions) {
      return this.buildKeyValues([
        ['Эмоция', this.valueOrPlaceholder(entry.payload?.emotion)],
        ['Интенсивность', this.valueOrPlaceholder(entry.payload?.intensity)],
        ['Ситуация или фон', this.valueOrPlaceholder(entry.payload?.context)],
        ['Заметки', this.valueOrPlaceholder(entry.payload?.notes)],
      ]);
    }

    if (entry.diaryType === DiaryType.abc) {
      return this.buildKeyValues([
        ['A — Ситуация', this.valueOrPlaceholder(entry.payload?.activating_event)],
        ['B — Мысли и убеждения', this.valueOrPlaceholder(entry.payload?.beliefs)],
        ['C — Реакции и последствия', this.valueOrPlaceholder(entry.payload?.consequences)],
        ['Заметки', this.valueOrPlaceholder(entry.payload?.notes)],
      ]);
    }

    return this.buildKeyValues([
      ['Данные записи', this.valueOrPlaceholder(this.stringifyPayload(entry.payload))],
    ]);
  }

  private buildKeyValues(items: Array<[string, string]>): Array<Record<string, unknown>> {
    return items.map(([label, value]) => ({
      text: `${label}: ${value}`,
      style: 'entryText',
    }));
  }

  private valueOrPlaceholder(value: unknown): string {
    if (value === null || value === undefined) {
      return '—';
    }
    if (typeof value === 'string') {
      return value.trim().length > 0 ? value.trim() : '—';
    }
    if (typeof value === 'number' || typeof value === 'boolean') {
      return String(value);
    }
    return this.stringifyPayload(value);
  }

  private stringifyPayload(payload: unknown): string {
    try {
      const raw = JSON.stringify(payload);
      if (!raw || raw === '{}' || raw === '[]') {
        return '—';
      }
      return raw.length > 2000 ? `${raw.slice(0, 2000)}…` : raw;
    } catch {
      return '—';
    }
  }

  private formatDate(date: Date): string {
    return date.toISOString().slice(0, 10);
  }

  private formatDateTime(date: Date): string {
    return date.toISOString().replace('T', ' ').slice(0, 19);
  }

  private getDiaryLabel(type: DiaryType): string {
    switch (type) {
      case DiaryType.emotions:
        return 'Эмоции';
      case DiaryType.abc:
        return 'ABC-дневник';
      case DiaryType.sleep_energy:
        return 'Сон и энергия';
      case DiaryType.gratitude:
        return 'Благодарность';
      default:
        return 'Дневник';
    }
  }
}
