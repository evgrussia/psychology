import { Module } from '@nestjs/common';
import { AdminController } from '../../presentation/controllers/admin.controller';
import { AdminContentController } from '../../presentation/controllers/admin-content.controller';
import { AdminInteractiveController } from '../../presentation/controllers/admin-interactive.controller';
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
import { UpdateInteractiveDefinitionUseCase } from '../../application/admin/use-cases/interactive/UpdateInteractiveDefinitionUseCase';
import { GetInteractiveDefinitionByIdUseCase } from '../../application/admin/use-cases/interactive/GetInteractiveDefinitionByIdUseCase';
import { ListInteractiveDefinitionsUseCase } from '../../application/admin/use-cases/interactive/ListInteractiveDefinitionsUseCase';
import { PublishInteractiveDefinitionUseCase } from '../../application/admin/use-cases/interactive/PublishInteractiveDefinitionUseCase';
import { ListGlossaryTermsUseCase } from '../../application/admin/use-cases/ListGlossaryTermsUseCase';
import { GetGlossaryTermUseCase } from '../../application/admin/use-cases/GetGlossaryTermUseCase';
import { UpsertGlossaryTermUseCase } from '../../application/admin/use-cases/UpsertGlossaryTermUseCase';
import { PublishGlossaryTermUseCase } from '../../application/admin/use-cases/PublishGlossaryTermUseCase';
import { DeleteGlossaryTermUseCase } from '../../application/admin/use-cases/DeleteGlossaryTermUseCase';
import { ListCuratedCollectionsUseCase } from '../../application/admin/use-cases/ListCuratedCollectionsUseCase';
import { GetCuratedCollectionUseCase } from '../../application/admin/use-cases/GetCuratedCollectionUseCase';
import { UpsertCuratedCollectionUseCase } from '../../application/admin/use-cases/UpsertCuratedCollectionUseCase';
import { PublishCuratedCollectionUseCase } from '../../application/admin/use-cases/PublishCuratedCollectionUseCase';
import { ReorderCuratedItemsUseCase } from '../../application/admin/use-cases/ReorderCuratedItemsUseCase';
import { IdentityModule } from '../identity/identity.module';
import { AuditModule } from '../audit/audit.module';
import { DatabaseModule } from '../database/database.module';
import { ContentModule } from '../content/content.module';
import { InteractiveModule } from '../interactive/interactive.module';
import { AdminGlossaryController } from '../../presentation/controllers/admin-glossary.controller';
import { AdminCuratedController } from '../../presentation/controllers/admin-curated.controller';

@Module({
  imports: [IdentityModule, AuditModule, DatabaseModule, ContentModule, InteractiveModule],
  controllers: [
    AdminController, 
    AdminContentController, 
    AdminInteractiveController, 
    AdminGlossaryController,
    AdminCuratedController
  ],
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
    UpdateInteractiveDefinitionUseCase,
    GetInteractiveDefinitionByIdUseCase,
    ListInteractiveDefinitionsUseCase,
    PublishInteractiveDefinitionUseCase,
    ListGlossaryTermsUseCase,
    GetGlossaryTermUseCase,
    UpsertGlossaryTermUseCase,
    PublishGlossaryTermUseCase,
    DeleteGlossaryTermUseCase,
    ListCuratedCollectionsUseCase,
    GetCuratedCollectionUseCase,
    UpsertCuratedCollectionUseCase,
    PublishCuratedCollectionUseCase,
    ReorderCuratedItemsUseCase,
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
    UpdateInteractiveDefinitionUseCase,
    GetInteractiveDefinitionByIdUseCase,
    ListInteractiveDefinitionsUseCase,
    PublishInteractiveDefinitionUseCase,
    ListGlossaryTermsUseCase,
    GetGlossaryTermUseCase,
    UpsertGlossaryTermUseCase,
    PublishGlossaryTermUseCase,
    DeleteGlossaryTermUseCase,
    ListCuratedCollectionsUseCase,
    GetCuratedCollectionUseCase,
    UpsertCuratedCollectionUseCase,
    PublishCuratedCollectionUseCase,
    ReorderCuratedItemsUseCase,
  ],
})
export class AdminModule {}
