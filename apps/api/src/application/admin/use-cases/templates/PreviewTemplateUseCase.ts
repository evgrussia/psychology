import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { IMessageTemplateRepository } from '@domain/notifications/repositories/IMessageTemplateRepository';
import { PreviewTemplateRequestDto, PreviewTemplateResponseDto } from '../../dto/templates.dto';

const ALLOWED_VARIABLES = [
  'client_name',
  'appointment_date',
  'appointment_time',
  'timezone',
  'appointment_link',
  'service_name',
  'psychologist_name',
];

const DEFAULT_VARIABLES: Record<string, string> = {
  client_name: 'Анна',
  appointment_date: '2026-01-20',
  appointment_time: '12:30',
  timezone: 'Europe/Moscow',
  appointment_link: 'https://example.com/meeting',
  service_name: 'Первичная консультация',
  psychologist_name: 'Елена Иванова',
};

@Injectable()
export class PreviewTemplateUseCase {
  constructor(
    @Inject('IMessageTemplateRepository')
    private readonly templateRepository: IMessageTemplateRepository,
  ) {}

  async execute(templateId: string, dto: PreviewTemplateRequestDto): Promise<PreviewTemplateResponseDto> {
    let subject = dto.subject ?? null;
    let bodyMarkdown = dto.body_markdown ?? null;

    if (dto.version_id) {
      const version = await this.templateRepository.findVersionById(dto.version_id);
      if (!version || version.templateId !== templateId) {
        throw new BadRequestException('Version does not belong to template');
      }
      subject = version.subject ?? null;
      bodyMarkdown = version.bodyMarkdown;
    }

    if (!bodyMarkdown) {
      throw new BadRequestException('Template body is required');
    }

    const allowedSet = new Set(ALLOWED_VARIABLES);
    const variables = { ...DEFAULT_VARIABLES, ...(dto.variables ?? {}) };
    const sanitizedVariables: Record<string, string> = {};
    for (const key of Object.keys(variables)) {
      if (allowedSet.has(key)) {
        sanitizedVariables[key] = variables[key];
      }
    }

    const renderedSubject = subject ? renderTemplate(subject, sanitizedVariables, allowedSet) : null;
    const renderedBody = renderTemplate(bodyMarkdown, sanitizedVariables, allowedSet);

    return {
      subject,
      body_markdown: bodyMarkdown,
      rendered_subject: renderedSubject,
      rendered_body: renderedBody,
      variables: sanitizedVariables,
      allowed_variables: ALLOWED_VARIABLES,
    };
  }
}

function renderTemplate(input: string, variables: Record<string, string>, allowed: Set<string>): string {
  return input.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (match, key) => {
    if (!allowed.has(key)) {
      return match;
    }
    return variables[key] ?? '';
  });
}
