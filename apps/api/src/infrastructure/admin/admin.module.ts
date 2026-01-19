import { Module } from '@nestjs/common';
import { AdminController } from '../../presentation/controllers/admin.controller';
import { AdminAnalyticsController } from '../../presentation/controllers/admin-analytics.controller';
import { AdminContentController } from '../../presentation/controllers/admin-content.controller';
import { AdminInteractiveController } from '../../presentation/controllers/admin-interactive.controller';
import { AdminServicesController } from '../../presentation/controllers/admin-services.controller';
import { AdminEventsController } from '../../presentation/controllers/admin-events.controller';
import { AdminTemplatesController } from '../../presentation/controllers/admin-templates.controller';
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
import { GetInteractiveOverviewUseCase } from '../../application/admin/use-cases/interactive/GetInteractiveOverviewUseCase';
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
import { AdminSettingsController } from '../../presentation/controllers/admin-settings.controller';
import { AdminScheduleController } from '../../presentation/controllers/admin-schedule.controller';
import { AdminLeadsController } from '../../presentation/controllers/admin-leads.controller';
import { AdminModerationController } from '../../presentation/controllers/admin-moderation.controller';
import { SettingsModule } from '../settings/settings.module';
import { GetAdminDashboardUseCase } from '../../application/admin/use-cases/GetAdminDashboardUseCase';
import { GetAdminBookingFunnelUseCase } from '../../application/admin/use-cases/analytics/GetAdminBookingFunnelUseCase';
import { GetAdminTelegramFunnelUseCase } from '../../application/admin/use-cases/analytics/GetAdminTelegramFunnelUseCase';
import { GetAdminInteractiveFunnelUseCase } from '../../application/admin/use-cases/analytics/GetAdminInteractiveFunnelUseCase';
import { GetAdminInteractiveDetailsUseCase } from '../../application/admin/use-cases/analytics/GetAdminInteractiveDetailsUseCase';
import { GetAdminNoShowStatsUseCase } from '../../application/admin/use-cases/analytics/GetAdminNoShowStatsUseCase';
import { GetAdminExperimentResultsUseCase } from '../../application/admin/use-cases/analytics/GetAdminExperimentResultsUseCase';
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
import { NotificationsModule } from '../notifications/notifications.module';
import { ListModerationItemsUseCase } from '../../application/admin/use-cases/moderation/ListModerationItemsUseCase';
import { GetModerationItemUseCase } from '../../application/admin/use-cases/moderation/GetModerationItemUseCase';
import { ApproveModerationItemUseCase } from '../../application/admin/use-cases/moderation/ApproveModerationItemUseCase';
import { RejectModerationItemUseCase } from '../../application/admin/use-cases/moderation/RejectModerationItemUseCase';
import { EscalateModerationItemUseCase } from '../../application/admin/use-cases/moderation/EscalateModerationItemUseCase';
import { AnswerModerationItemUseCase } from '../../application/admin/use-cases/moderation/AnswerModerationItemUseCase';
import { ListModerationTemplatesUseCase } from '../../application/admin/use-cases/moderation/ListModerationTemplatesUseCase';
import { GetModerationMetricsUseCase } from '../../application/admin/use-cases/moderation/GetModerationMetricsUseCase';
import { ModerationAlertsScheduler } from '../moderation/moderation-alerts.scheduler';
import { ListAdminServicesUseCase } from '../../application/admin/use-cases/services/ListAdminServicesUseCase';
import { GetAdminServiceUseCase } from '../../application/admin/use-cases/services/GetAdminServiceUseCase';
import { UpsertAdminServiceUseCase } from '../../application/admin/use-cases/services/UpsertAdminServiceUseCase';
import { PublishAdminServiceUseCase } from '../../application/admin/use-cases/services/PublishAdminServiceUseCase';
import { ListAdminEventsUseCase } from '../../application/admin/use-cases/events/ListAdminEventsUseCase';
import { GetAdminEventUseCase } from '../../application/admin/use-cases/events/GetAdminEventUseCase';
import { UpsertAdminEventUseCase } from '../../application/admin/use-cases/events/UpsertAdminEventUseCase';
import { PublishAdminEventUseCase } from '../../application/admin/use-cases/events/PublishAdminEventUseCase';
import { ListAdminEventRegistrationsUseCase } from '../../application/admin/use-cases/events/ListAdminEventRegistrationsUseCase';
import { ListTemplatesUseCase } from '../../application/admin/use-cases/templates/ListTemplatesUseCase';
import { GetTemplateUseCase } from '../../application/admin/use-cases/templates/GetTemplateUseCase';
import { CreateTemplateUseCase } from '../../application/admin/use-cases/templates/CreateTemplateUseCase';
import { CreateTemplateVersionUseCase } from '../../application/admin/use-cases/templates/CreateTemplateVersionUseCase';
import { PreviewTemplateUseCase } from '../../application/admin/use-cases/templates/PreviewTemplateUseCase';
import { ActivateTemplateUseCase } from '../../application/admin/use-cases/templates/ActivateTemplateUseCase';
import { RollbackTemplateUseCase } from '../../application/admin/use-cases/templates/RollbackTemplateUseCase';
import { GetSystemSettingsUseCase } from '../../application/admin/use-cases/GetSystemSettingsUseCase';
import { GetAdminProfileUseCase } from '../../application/admin/use-cases/settings/GetAdminProfileUseCase';
import { UpdateAdminProfileUseCase } from '../../application/admin/use-cases/settings/UpdateAdminProfileUseCase';
import { ListAdminUsersUseCase } from '../../application/admin/use-cases/settings/ListAdminUsersUseCase';
import { UpdateAdminUserRoleUseCase } from '../../application/admin/use-cases/settings/UpdateAdminUserRoleUseCase';
import { UpdateAdminUserStatusUseCase } from '../../application/admin/use-cases/settings/UpdateAdminUserStatusUseCase';
import { DeleteAdminUserUseCase } from '../../application/admin/use-cases/settings/DeleteAdminUserUseCase';

@Module({
  imports: [
    IdentityModule,
    AuditModule,
    DatabaseModule,
    ContentModule,
    InteractiveModule,
    SettingsModule,
    BookingModule,
    CrmModule,
    ModerationModule,
    AnalyticsModule,
    NotificationsModule,
  ],
  controllers: [
    AdminController, 
    AdminAnalyticsController,
    AdminContentController, 
    AdminInteractiveController, 
    AdminServicesController,
    AdminEventsController,
    AdminTemplatesController,
    AdminGlossaryController,
    AdminCuratedController,
    AdminSettingsController,
    AdminScheduleController,
    AdminLeadsController,
    AdminModerationController,
  ],
  providers: [
    ExportDataUseCase,
    UpdateServicePriceUseCase,
    UpdateSystemSettingsUseCase,
    GetSystemSettingsUseCase,
    GetAdminDashboardUseCase,
    GetAdminBookingFunnelUseCase,
    GetAdminTelegramFunnelUseCase,
    GetAdminInteractiveFunnelUseCase,
    GetAdminInteractiveDetailsUseCase,
    GetAdminNoShowStatsUseCase,
    GetAdminExperimentResultsUseCase,
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
    GetInteractiveOverviewUseCase,
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
    ListAdminServicesUseCase,
    GetAdminServiceUseCase,
    UpsertAdminServiceUseCase,
    PublishAdminServiceUseCase,
    ListAdminEventsUseCase,
    GetAdminEventUseCase,
    UpsertAdminEventUseCase,
    PublishAdminEventUseCase,
    ListAdminEventRegistrationsUseCase,
    ListTemplatesUseCase,
    GetTemplateUseCase,
    CreateTemplateUseCase,
    CreateTemplateVersionUseCase,
    PreviewTemplateUseCase,
    ActivateTemplateUseCase,
    RollbackTemplateUseCase,
    GetAdminProfileUseCase,
    UpdateAdminProfileUseCase,
    ListAdminUsersUseCase,
    UpdateAdminUserRoleUseCase,
    UpdateAdminUserStatusUseCase,
    DeleteAdminUserUseCase,
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
  ],
})
export class AdminModule {}
