import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { IngestAnalyticsEventUseCase } from '@application/analytics/use-cases/IngestAnalyticsEventUseCase';
import { AnalyticsIngestDto, AnalyticsIngestResultDto } from '@application/analytics/dto/analytics.dto';

@ApiTags('analytics')
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly ingestAnalyticsEventUseCase: IngestAnalyticsEventUseCase) {}

  @Post('ingest')
  @ApiOperation({ summary: 'Ingest analytics event payload' })
  @ApiResponse({ status: 201, description: 'Event ingested' })
  async ingest(@Body() dto: AnalyticsIngestDto): Promise<AnalyticsIngestResultDto> {
    return this.ingestAnalyticsEventUseCase.execute(dto);
  }
}
