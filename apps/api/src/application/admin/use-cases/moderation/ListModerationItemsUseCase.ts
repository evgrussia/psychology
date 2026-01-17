import { Inject, Injectable } from '@nestjs/common';
import { IUgcModerationRepository, ModerationListFilters } from '@domain/moderation/repositories/IUgcModerationRepository';
import { ModerationListResponseDto, ListModerationItemsQueryDto } from '../../dto/moderation.dto';
import { UgcStatus, UgcTriggerFlag, UgcType } from '@domain/moderation/value-objects/ModerationEnums';

@Injectable()
export class ListModerationItemsUseCase {
  constructor(
    @Inject('IUgcModerationRepository')
    private readonly moderationRepository: IUgcModerationRepository,
  ) {}

  async execute(query: ListModerationItemsQueryDto): Promise<ModerationListResponseDto> {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 30;

    const filters: ModerationListFilters = {
      type: this.parseTypes(query.type),
      status: this.parseEnumValues(query.status, UgcStatus),
      triggerFlags: this.parseEnumValues(query.trigger, UgcTriggerFlag),
      from: query.from ? new Date(query.from) : undefined,
      to: query.to ? new Date(query.to) : undefined,
      page,
      pageSize,
    };

    const result = await this.moderationRepository.listModerationItems(filters);

    return {
      items: result.items,
      statusCounts: result.statusCounts,
      pagination: {
        page,
        pageSize,
        total: result.total,
        totalPages: Math.max(1, Math.ceil(result.total / pageSize)),
      },
    };
  }

  private parseTypes(value?: string): UgcType[] | undefined {
    if (!value) return undefined;
    const values = value.split(',').map((item) => item.trim()).filter(Boolean) as UgcType[];
    return values.length ? values : undefined;
  }

  private parseEnumValues<T extends Record<string, string>>(
    value: string | undefined,
    enumType: T,
  ): T[keyof T][] | undefined {
    if (!value) return undefined;
    const allowed = new Set(Object.values(enumType));
    const parsed = value
      .split(',')
      .map((item) => item.trim())
      .filter((item) => allowed.has(item))
      .map((item) => item as T[keyof T]);
    return parsed.length ? parsed : undefined;
  }
}
