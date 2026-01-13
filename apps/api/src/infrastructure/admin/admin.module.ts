import { Module } from '@nestjs/common';
import { AdminController } from '../../presentation/controllers/admin.controller';
import { AdminContentController } from '../../presentation/controllers/admin-content.controller';
import { ExportDataUseCase } from '../../application/admin/use-cases/ExportDataUseCase';
import { UpdateServicePriceUseCase } from '../../application/admin/use-cases/UpdateServicePriceUseCase';
import { UpdateSystemSettingsUseCase } from '../../application/admin/use-cases/UpdateSystemSettingsUseCase';
import { CreateContentItemUseCase } from '../../application/admin/use-cases/CreateContentItemUseCase';
import { UpdateContentItemUseCase } from '../../application/admin/use-cases/UpdateContentItemUseCase';
import { ListContentItemsUseCase } from '../../application/admin/use-cases/ListContentItemsUseCase';
import { GetContentItemUseCase } from '../../application/admin/use-cases/GetContentItemUseCase';
import { ListTopicsUseCase } from '../../application/admin/use-cases/ListTopicsUseCase';
import { ListTagsUseCase } from '../../application/admin/use-cases/ListTagsUseCase';
import { PublishContentItemUseCase } from '../../application/admin/use-cases/PublishContentItemUseCase';
import { ArchiveContentItemUseCase } from '../../application/admin/use-cases/ArchiveContentItemUseCase';
import { ListContentRevisionsUseCase } from '../../application/admin/use-cases/ListContentRevisionsUseCase';
import { RollbackContentRevisionUseCase } from '../../application/admin/use-cases/RollbackContentRevisionUseCase';
import { IdentityModule } from '../identity/identity.module';
import { AuditModule } from '../audit/audit.module';
import { DatabaseModule } from '../database/database.module';
import { ContentModule } from '../content/content.module';

@Module({
  imports: [IdentityModule, AuditModule, DatabaseModule, ContentModule],
  controllers: [AdminController, AdminContentController],
  providers: [
    ExportDataUseCase,
    UpdateServicePriceUseCase,
    UpdateSystemSettingsUseCase,
    CreateContentItemUseCase,
    UpdateContentItemUseCase,
    ListContentItemsUseCase,
    GetContentItemUseCase,
    ListTopicsUseCase,
    ListTagsUseCase,
    PublishContentItemUseCase,
    ArchiveContentItemUseCase,
    ListContentRevisionsUseCase,
    RollbackContentRevisionUseCase,
  ],
  exports: [
    ExportDataUseCase,
    UpdateServicePriceUseCase,
    UpdateSystemSettingsUseCase,
    CreateContentItemUseCase,
    UpdateContentItemUseCase,
    ListContentItemsUseCase,
    GetContentItemUseCase,
    ListTopicsUseCase,
    ListTagsUseCase,
    PublishContentItemUseCase,
    ArchiveContentItemUseCase,
    ListContentRevisionsUseCase,
    RollbackContentRevisionUseCase,
  ],
})
export class AdminModule {}
