import { MessageTemplate } from '../entities/MessageTemplate';
import { MessageTemplateVersion } from '../entities/MessageTemplateVersion';

export interface MessageTemplateListFilters {
  channel?: string;
  category?: string;
  status?: string;
  search?: string;
}

export interface IMessageTemplateRepository {
  list(filters?: MessageTemplateListFilters): Promise<MessageTemplate[]>;
  findById(id: string): Promise<MessageTemplate | null>;
  listVersions(templateId: string): Promise<MessageTemplateVersion[]>;
  findVersionById(versionId: string): Promise<MessageTemplateVersion | null>;
  createTemplate(data: {
    channel: string;
    category: string;
    name: string;
    language: string;
  }): Promise<MessageTemplate>;
  createVersion(data: {
    templateId: string;
    subject?: string | null;
    bodyMarkdown: string;
    updatedByUserId: string;
  }): Promise<MessageTemplateVersion>;
  setActiveVersion(data: {
    templateId: string;
    versionId: string | null;
    status: string;
    activatedAt: Date | null;
  }): Promise<MessageTemplate>;
}
