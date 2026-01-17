import { Inject, Injectable } from '@nestjs/common';
import { ILeadRepository, LeadListFilters } from '@domain/crm/repositories/ILeadRepository';
import { LeadListResponseDto, ListLeadsQueryDto } from '../../dto/leads.dto';

@Injectable()
export class ListLeadsUseCase {
  constructor(
    @Inject('ILeadRepository')
    private readonly leadRepository: ILeadRepository,
  ) {}

  async execute(query: ListLeadsQueryDto): Promise<LeadListResponseDto> {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 30;
    const filters: LeadListFilters = {
      status: query.status ? query.status.split(',').map((value) => value.trim()).filter(Boolean) : undefined,
      source: query.source ? query.source.split(',').map((value) => value.trim()).filter(Boolean) : undefined,
      topicCode: query.topic ?? undefined,
      createdFrom: query.from ? new Date(query.from) : undefined,
      createdTo: query.to ? new Date(query.to) : undefined,
      hasContact: query.hasContact ? query.hasContact === 'true' : undefined,
      search: query.search ?? undefined,
      page,
      pageSize,
    };

    const result = await this.leadRepository.listLeads(filters);

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
}
