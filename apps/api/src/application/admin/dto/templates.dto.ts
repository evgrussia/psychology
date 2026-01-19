export interface MessageTemplateListItemDto {
  id: string;
  channel: string;
  category: string;
  name: string;
  status: string;
  language: string;
  active_version_id?: string | null;
  activated_at?: string | null;
  created_at: string;
}

export interface MessageTemplateVersionDto {
  id: string;
  template_id: string;
  version: number;
  subject?: string | null;
  body_markdown: string;
  updated_by_user_id: string;
  created_at: string;
}

export interface MessageTemplateDetailDto extends MessageTemplateListItemDto {
  versions: MessageTemplateVersionDto[];
}

export interface ListTemplatesRequestDto {
  channel?: string;
  category?: string;
  status?: string;
  search?: string;
}

export interface CreateTemplateRequestDto {
  name: string;
  channel: string;
  category: string;
  language?: string;
  subject?: string | null;
  body_markdown: string;
}

export interface CreateTemplateVersionRequestDto {
  subject?: string | null;
  body_markdown: string;
}

export interface ActivateTemplateRequestDto {
  version_id?: string | null;
}

export interface RollbackTemplateRequestDto {
  version_id: string;
}

export interface PreviewTemplateRequestDto {
  version_id?: string;
  subject?: string | null;
  body_markdown?: string | null;
  variables?: Record<string, string>;
}

export interface PreviewTemplateResponseDto {
  subject: string | null;
  body_markdown: string;
  rendered_subject: string | null;
  rendered_body: string;
  variables: Record<string, string>;
  allowed_variables: string[];
}
