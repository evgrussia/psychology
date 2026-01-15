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

  @ApiProperty({ type: [Object], required: false })
  relatedInteractives: any[];

  @ApiProperty({
    type: [Object],
    required: false,
    example: [{ id: '1', slug: 'session', title: 'Session', format: 'online', duration_minutes: 50, price_amount: 4000 }]
  })
  relatedServices: {
    id: string;
    slug: string;
    title: string;
    format: string;
    duration_minutes: number;
    price_amount: number;
  }[];
}
