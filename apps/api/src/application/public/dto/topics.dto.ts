import { ApiProperty } from '@nestjs/swagger';
import { ContentItemResponseDto } from '@application/admin/dto/content.dto';

export class TopicDto {
  @ApiProperty()
  code: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  isActive: boolean;
}

export class TopicLandingDto {
  @ApiProperty()
  topic: TopicDto;

  @ApiProperty({ type: () => ContentItemResponseDto, nullable: true })
  landing?: ContentItemResponseDto;

  @ApiProperty({ type: [ContentItemResponseDto] })
  relatedContent: ContentItemResponseDto[];

  @ApiProperty({ type: [Object] }) // TODO: Add Interactive DTO if available
  relatedInteractives: any[];

  @ApiProperty({ type: [Object] }) // TODO: Add Service DTO if available
  relatedServices: any[];
}
