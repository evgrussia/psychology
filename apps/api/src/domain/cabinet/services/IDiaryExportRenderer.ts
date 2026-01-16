import { DiaryType } from '../value-objects/DiaryEnums';

export interface DiaryExportEntry {
  id: string;
  diaryType: DiaryType;
  entryDate: Date;
  createdAt: Date;
  payload: Record<string, unknown>;
  hasText: boolean;
}

export interface DiaryExportDocument {
  title: string;
  periodLabel: string;
  generatedAt: Date;
  entries: DiaryExportEntry[];
}

export interface IDiaryExportRenderer {
  renderDiaryPdf(document: DiaryExportDocument): Promise<Buffer>;
}
