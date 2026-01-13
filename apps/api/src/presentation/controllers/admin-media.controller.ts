import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  UseGuards,
  SetMetadata,
  UseInterceptors,
  UploadedFile,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '../guards/auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { UploadMediaAssetUseCase } from '../../application/media/use-cases/UploadMediaAssetUseCase';
import { DeleteMediaAssetUseCase } from '../../application/media/use-cases/DeleteMediaAssetUseCase';
import { ListMediaAssetsUseCase } from '../../application/media/use-cases/ListMediaAssetsUseCase';
import { MediaAssetResponseDto, UploadMediaDto } from '../../application/media/dto/media-asset.dto';

const Roles = (...roles: string[]) => SetMetadata('roles', roles);

@ApiTags('admin-media')
@Controller('admin/media')
@UseGuards(AuthGuard, RolesGuard)
export class AdminMediaController {
  constructor(
    private readonly uploadMediaUseCase: UploadMediaAssetUseCase,
    private readonly deleteMediaUseCase: DeleteMediaAssetUseCase,
    private readonly listMediaUseCase: ListMediaAssetsUseCase,
    private readonly configService: ConfigService,
  ) {}

  @Post()
  @Roles('owner', 'editor')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload media asset' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        title: { type: 'string' },
        altText: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Media uploaded successfully' })
  @ApiResponse({ status: 403, description: 'Media upload is disabled' })
  async uploadFile(
    @UploadedFile() file: any, // Express.Multer.File
    @Body() dto: UploadMediaDto,
    @Request() req: any,
  ): Promise<MediaAssetResponseDto> {
    // Check feature flag
    const mediaUploadEnabled = this.configService.get<string>('MEDIA_UPLOAD_ENABLED', 'true');
    if (mediaUploadEnabled !== 'true') {
      throw new ForbiddenException('Media upload is currently disabled');
    }

    return this.uploadMediaUseCase.execute(req.user.id, file, dto);
  }

  @Get()
  @Roles('owner', 'editor')
  @ApiOperation({ summary: 'List all media assets' })
  @ApiResponse({ status: 200, description: 'Return list of media assets' })
  async listMedia(): Promise<MediaAssetResponseDto[]> {
    return this.listMediaUseCase.execute();
  }

  @Delete(':id')
  @Roles('owner', 'editor')
  @ApiOperation({ summary: 'Delete media asset' })
  @ApiResponse({ status: 204, description: 'Media deleted successfully' })
  @ApiResponse({ status: 400, description: 'Cannot delete (in use)' })
  @ApiResponse({ status: 404, description: 'Media not found' })
  async deleteMedia(@Param('id') id: string, @Request() req: any): Promise<void> {
    return this.deleteMediaUseCase.execute(id, req.user.id);
  }
}
