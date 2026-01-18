import { Module } from '@nestjs/common';
import { AdminController } from '../../presentation/controllers/admin.controller';
import { AdminAnalyticsController } from '../../presentation/controllers/admin-analytics.controller';
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
import { GetPublishedInteractiveDefinitionByIdUseCase } from '../../application/admin/use-cases/interactive/GetPublishedInteractiveDefinitionByIdUseCase';
import { ListInteractiveDefinitionsUseCase } from '../../application/admin/use-cases/interactive/ListInteractiveDefinitionsUseCase';
import { PublishInteractiveDefinitionUseCase } from '../../application/admin/use-cases/interactive/PublishInteractiveDefinitionUseCase';
import { ListInteractiveDefinitionVersionsUseCase } from '../../application/admin/use-cases/interactive/ListInteractiveDefinitionVersionsUseCase';
import { GetInteractiveDefinitionVersionUseCase } from '../../application/admin/use-cases/interactive/GetInteractiveDefinitionVersionUseCase';
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
import { AdminGoogleCalendarController } from '../../presentation/controllers/admin-google-calendar.controller';
import { AdminScheduleController } from '../../presentation/controllers/admin-schedule.controller';
import { AdminLeadsController } from '../../presentation/controllers/admin-leads.controller';
import { AdminModerationController } from '../../presentation/controllers/admin-moderation.controller';
import { ConnectGoogleCalendarUseCase } from '../../application/integrations/use-cases/ConnectGoogleCalendarUseCase';
import { GetGoogleCalendarStatusUseCase } from '../../application/integrations/use-cases/GetGoogleCalendarStatusUseCase';
import { IntegrationsModule } from '../integrations/integrations.module';
import { GetAdminDashboardUseCase } from '../../application/admin/use-cases/GetAdminDashboardUseCase';
import { GetAdminBookingFunnelUseCase } from '../../application/admin/use-cases/analytics/GetAdminBookingFunnelUseCase';
import { GetAdminTelegramFunnelUseCase } from '../../application/admin/use-cases/analytics/GetAdminTelegramFunnelUseCase';
import { GetAdminInteractiveFunnelUseCase } from '../../application/admin/use-cases/analytics/GetAdminInteractiveFunnelUseCase';
import { GetAdminInteractiveDetailsUseCase } from '../../application/admin/use-cases/analytics/GetAdminInteractiveDetailsUseCase';
import { GetAdminNoShowStatsUseCase } from '../../application/admin/use-cases/analytics/GetAdminNoShowStatsUseCase';
import { TrackingService } from '../tracking/tracking.service';
import { AdminAuthTrackingHandler } from '../tracking/admin-auth-tracking.handler';
import { BookingModule } from '../booking/booking.module';
import { CrmModule } from '../crm/crm.module';
import { AnalyticsModule } from '../analytics/analytics.module';
import { ListScheduleSlotsUseCase } from '../../application/admin/use-cases/schedule/ListScheduleSlotsUseCase';
import { ListScheduleAppointmentsUseCase } from '../../application/admin/use-cases/schedule/ListScheduleAppointmentsUseCase';
import { CreateScheduleSlotsUseCase } from '../../application/admin/use-cases/schedule/CreateScheduleSlotsUseCase';
import { UpdateScheduleSlotUseCase } from '../../application/admin/use-cases/schedule/UpdateScheduleSlotUseCase';
import { DeleteScheduleSlotsUseCase } from '../../application/admin/use-cases/schedule/DeleteScheduleSlotsUseCase';
import { GetScheduleSettingsUseCase } from '../../application/admin/use-cases/schedule/GetScheduleSettingsUseCase';
import { UpdateScheduleSettingsUseCase } from '../../application/admin/use-cases/schedule/UpdateScheduleSettingsUseCase';
import { CancelAppointmentUseCase } from '../../application/admin/use-cases/schedule/CancelAppointmentUseCase';
import { RecordAppointmentOutcomeUseCase } from '../../application/admin/use-cases/schedule/RecordAppointmentOutcomeUseCase';
import { ListLeadsUseCase } from '../../application/admin/use-cases/leads/ListLeadsUseCase';
import { GetLeadDetailsUseCase } from '../../application/admin/use-cases/leads/GetLeadDetailsUseCase';
import { UpdateLeadStatusUseCase } from '../../application/admin/use-cases/leads/UpdateLeadStatusUseCase';
import { AddLeadNoteUseCase } from '../../application/admin/use-cases/leads/AddLeadNoteUseCase';
import { ModerationModule } from '../moderation/moderation.module';
import { ListModerationItemsUseCase } from '../../application/admin/use-cases/moderation/ListModerationItemsUseCase';
import { GetModerationItemUseCase } from '../../application/admin/use-cases/moderation/GetModerationItemUseCase';
import { ApproveModerationItemUseCase } from '../../application/admin/use-cases/moderation/ApproveModerationItemUseCase';
import { RejectModerationItemUseCase } from '../../application/admin/use-cases/moderation/RejectModerationItemUseCase';
import { EscalateModerationItemUseCase } from '../../application/admin/use-cases/moderation/EscalateModerationItemUseCase';
import { AnswerModerationItemUseCase } from '../../application/admin/use-cases/moderation/AnswerModerationItemUseCase';
import { ListModerationTemplatesUseCase } from '../../application/admin/use-cases/moderation/ListModerationTemplatesUseCase';
import { GetModerationMetricsUseCase } from '../../application/admin/use-cases/moderation/GetModerationMetricsUseCase';
import { ModerationAlertsScheduler } from '../moderation/moderation-alerts.scheduler';

@Module({
  imports: [IdentityModule, AuditModule, DatabaseModule, ContentModule, InteractiveModule, IntegrationsModule, BookingModule, CrmModule, ModerationModule, AnalyticsModule],
  controllers: [
    AdminController, 
    AdminAnalyticsController,
    AdminContentController, 
    AdminInteractiveController, 
    AdminGlossaryController,
    AdminCuratedController,
    AdminGoogleCalendarController,
    AdminScheduleController,
    AdminLeadsController,
    AdminModerationController,
  ],
  providers: [
    ExportDataUseCase,
    UpdateServicePriceUseCase,
    UpdateSystemSettingsUseCase,
    GetAdminDashboardUseCase,
    GetAdminBookingFunnelUseCase,
    GetAdminTelegramFunnelUseCase,
    GetAdminInteractiveFunnelUseCase,
    GetAdminInteractiveDetailsUseCase,
    GetAdminNoShowStatsUseCase,
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
    GetPublishedInteractiveDefinitionByIdUseCase,
    ListInteractiveDefinitionsUseCase,
    PublishInteractiveDefinitionUseCase,
    ListInteractiveDefinitionVersionsUseCase,
    GetInteractiveDefinitionVersionUseCase,
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
    ConnectGoogleCalendarUseCase,
    GetGoogleCalendarStatusUseCase,
    ListScheduleSlotsUseCase,
    ListScheduleAppointmentsUseCase,
    CreateScheduleSlotsUseCase,
    UpdateScheduleSlotUseCase,
    DeleteScheduleSlotsUseCase,
    GetScheduleSettingsUseCase,
    UpdateScheduleSettingsUseCase,
    CancelAppointmentUseCase,
    RecordAppointmentOutcomeUseCase,
    ListLeadsUseCase,
    GetLeadDetailsUseCase,
    UpdateLeadStatusUseCase,
    AddLeadNoteUseCase,
    ListModerationItemsUseCase,
    GetModerationItemUseCase,
    ApproveModerationItemUseCase,
    RejectModerationItemUseCase,
    EscalateModerationItemUseCase,
    AnswerModerationItemUseCase,
    ListModerationTemplatesUseCase,
    GetModerationMetricsUseCase,
    ModerationAlertsScheduler,
    TrackingService,
    AdminAuthTrackingHandler,
  ],
  exports: [
    ExportDataUseCase,
    UpdateServicePriceUseCase,
    UpdateSystemSettingsUseCase,
    GetAdminDashboardUseCase,
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
    GetPublishedInteractiveDefinitionByIdUseCase,
    ListInteractiveDefinitionsUseCase,
    PublishInteractiveDefinitionUseCase,
    ListInteractiveDefinitionVersionsUseCase,
    GetInteractiveDefinitionVersionUseCase,
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
    ConnectGoogleCalendarUseCase,
    GetGoogleCalendarStatusUseCase,
  ],
})
export class AdminModule {}
