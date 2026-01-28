"""
Dependency injection helpers для API views.
"""
from typing import Optional, TYPE_CHECKING
from asgiref.sync import async_to_sync
import functools

# Repositories
from infrastructure.persistence.repositories.user_repository import DjangoUserRepository
from infrastructure.persistence.repositories.booking.service_repository import PostgresServiceRepository
from infrastructure.persistence.repositories.booking.appointment_repository import PostgresAppointmentRepository
from infrastructure.persistence.repositories.booking.availability_slot_repository import PostgresAvailabilitySlotRepository
from infrastructure.persistence.repositories.payments.payment_repository import PostgresPaymentRepository
from infrastructure.persistence.repositories.crm.lead_repository import PostgresLeadRepository
from infrastructure.persistence.repositories.interactive.interactive_definition_repository import PostgresInteractiveDefinitionRepository
from infrastructure.persistence.repositories.interactive.interactive_run_repository import PostgresInteractiveRunRepository
from infrastructure.persistence.repositories.client_cabinet.diary_repository import PostgresDiaryEntryRepository
from infrastructure.persistence.repositories.client_cabinet.favorite_repository import PostgresFavoriteRepository
from infrastructure.persistence.repositories.consent_repository import DjangoConsentRepository

from infrastructure.persistence.repositories.content.content_repository import PostgresContentItemRepository
from infrastructure.persistence.repositories.moderation.moderation_repository import PostgresModerationItemRepository
from infrastructure.persistence.repositories.telegram.deep_link_repository import PostgresDeepLinkRepository

from infrastructure.persistence.repositories.payments.webhook_repository import DjangoWebhookEventRepository
from infrastructure.persistence.repositories.content.boundary_script_repository import DjangoBoundaryScriptRepository

# Services & Adapters
from infrastructure.events.in_memory_event_bus import InMemoryEventBus
from infrastructure.external.calendar.mock_calendar_adapter import MockGoogleCalendarAdapter
from infrastructure.external.payments.yookassa_adapter import YooKassaAdapter
from infrastructure.external.payments.yookassa_client import YooKassaClient, YooKassaConfig
from infrastructure.external.email.email_service import EmailService
from infrastructure.external.email.email_client import ConsoleEmailClient
from infrastructure.external.telegram.telegram_adapter import TelegramAdapter
from infrastructure.external.telegram.telegram_bot_client import MockTelegramBotClient
from django.conf import settings
from infrastructure.encryption.fernet_encryption import FernetEncryptionService as EncryptionService
from infrastructure.pdf.pdf_generator_service import ReportLabPdfGeneratorService
from infrastructure.identity.password_service import PasswordService
from domain.booking.domain_services import SlotAvailabilityService

# Use Cases
from application.booking.use_cases.book_appointment import BookAppointmentUseCase
from application.booking.use_cases.get_available_slots import GetAvailableSlotsUseCase
from application.content.use_cases.list_articles import ListArticlesUseCase
from application.content.use_cases.get_article import GetArticleUseCase
from application.content.use_cases.get_resource import GetResourceUseCase
from application.identity.use_cases.register_user import RegisterUserUseCase
from application.identity.use_cases.authenticate_user import AuthenticateUserUseCase
from application.identity.use_cases.grant_consent import GrantConsentUseCase
from application.identity.use_cases.revoke_consent import RevokeConsentUseCase
from application.identity.use_cases.setup_mfa import SetupMfaUseCase
from application.identity.use_cases.verify_mfa import VerifyMfaUseCase
from application.interactive.use_cases.start_interactive_run import StartInteractiveRunUseCase
from application.interactive.use_cases.complete_interactive_run import CompleteInteractiveRunUseCase
from application.client_cabinet.use_cases.create_diary_entry import CreateDiaryEntryUseCase
from application.client_cabinet.use_cases.update_diary_entry import UpdateDiaryEntryUseCase
from application.client_cabinet.use_cases.delete_diary_entry import DeleteDiaryEntryUseCase
from application.client_cabinet.use_cases.get_client_appointments import GetClientAppointmentsUseCase
from application.client_cabinet.use_cases.export_diary_to_pdf import ExportDiaryToPdfUseCase
from application.client_cabinet.use_cases.delete_user_data import DeleteUserDataUseCase
from application.client_cabinet.use_cases.list_favorites import ListFavoritesUseCase
from application.client_cabinet.use_cases.add_favorite import AddFavoriteUseCase
from application.client_cabinet.use_cases.remove_favorite import RemoveFavoriteUseCase
from application.interactive.use_cases.get_boundary_scripts import GetBoundaryScriptsUseCase
from application.payments.use_cases.handle_payment_webhook import HandlePaymentWebhookUseCase
from application.booking.use_cases.confirm_payment import ConfirmPaymentUseCase
from application.telegram.use_cases.handle_telegram_webhook import HandleTelegramWebhookUseCase

from application.admin.use_cases.get_leads_list import GetLeadsListUseCase
from application.admin.use_cases.record_appointment_outcome_admin import RecordAppointmentOutcomeAdminUseCase
from application.admin.use_cases.moderate_ugc_item import ModerateUGCItemUseCase
from application.admin.use_cases.answer_ugc_question import AnswerUGCQuestionUseCase
from application.admin.use_cases.publish_content_item import PublishContentItemUseCase
from application.ugc_moderation.use_cases.submit_question import SubmitQuestionUseCase
from application.audit.use_cases.log_audit_event import LogAuditEventUseCase
from infrastructure.persistence.repositories.audit_log_repository import DjangoAuditLogRepository

# Domain
from domain.identity.value_objects.email import Email
from domain.identity.aggregates.user import User


# Singleton instances
_event_bus = None
_user_repository = None
_service_repository = None
_appointment_repository = None
_availability_slot_repository = None
_payment_repository = None
_lead_repository = None
_interactive_definition_repository = None
_interactive_run_repository = None
_diary_entry_repository = None
_favorite_repository = None
_consent_repository = None
_content_item_repository = None
_moderation_item_repository = None
_telegram_deep_link_repository = None
_webhook_event_repository = None
_boundary_script_repository = None
_password_service = None
_encryption_service = None
_email_service = None
_telegram_service = None


def get_event_bus() -> InMemoryEventBus:
    """Получить экземпляр Event Bus."""
    global _event_bus
    if _event_bus is None:
        _event_bus = InMemoryEventBus()
    return _event_bus


def get_user_repository() -> DjangoUserRepository:
    """Получить экземпляр User Repository."""
    global _user_repository
    if _user_repository is None:
        _user_repository = DjangoUserRepository(event_bus=get_event_bus())
    return _user_repository


def get_service_repository() -> PostgresServiceRepository:
    """Получить экземпляр Service Repository."""
    global _service_repository
    if _service_repository is None:
        _service_repository = PostgresServiceRepository()
    return _service_repository


def get_appointment_repository() -> PostgresAppointmentRepository:
    """Получить экземпляр Appointment Repository."""
    global _appointment_repository
    if _appointment_repository is None:
        _appointment_repository = PostgresAppointmentRepository(event_bus=get_event_bus())
    return _appointment_repository


def get_availability_slot_repository() -> PostgresAvailabilitySlotRepository:
    """Получить экземпляр Availability Slot Repository."""
    global _availability_slot_repository
    if _availability_slot_repository is None:
        _availability_slot_repository = PostgresAvailabilitySlotRepository()
    return _availability_slot_repository


def get_payment_repository() -> PostgresPaymentRepository:
    """Получить экземпляр Payment Repository."""
    global _payment_repository
    if _payment_repository is None:
        _payment_repository = PostgresPaymentRepository(event_bus=get_event_bus())
    return _payment_repository


def get_lead_repository() -> PostgresLeadRepository:
    """Получить экземпляр Lead Repository."""
    global _lead_repository
    if _lead_repository is None:
        _lead_repository = PostgresLeadRepository(event_bus=get_event_bus())
    return _lead_repository


def get_interactive_definition_repository() -> PostgresInteractiveDefinitionRepository:
    """Получить экземпляр Interactive Definition Repository."""
    global _interactive_definition_repository
    if _interactive_definition_repository is None:
        _interactive_definition_repository = PostgresInteractiveDefinitionRepository()
    return _interactive_definition_repository


def get_interactive_run_repository() -> PostgresInteractiveRunRepository:
    """Получить экземпляр Interactive Run Repository."""
    global _interactive_run_repository
    if _interactive_run_repository is None:
        _interactive_run_repository = PostgresInteractiveRunRepository(event_bus=get_event_bus())
    return _interactive_run_repository


def get_diary_entry_repository() -> PostgresDiaryEntryRepository:
    """Получить экземпляр Diary Entry Repository."""
    global _diary_entry_repository
    if _diary_entry_repository is None:
        _diary_entry_repository = PostgresDiaryEntryRepository(event_bus=get_event_bus())
    return _diary_entry_repository


def get_favorite_repository() -> PostgresFavoriteRepository:
    """Получить экземпляр Favorite Repository."""
    global _favorite_repository
    if _favorite_repository is None:
        _favorite_repository = PostgresFavoriteRepository()
    return _favorite_repository


def get_consent_repository() -> DjangoConsentRepository:
    """Получить экземпляр Consent Repository."""
    global _consent_repository
    if _consent_repository is None:
        _consent_repository = DjangoConsentRepository()
    return _consent_repository


def get_content_item_repository() -> PostgresContentItemRepository:
    """Получить экземпляр Content Item Repository."""
    global _content_item_repository
    if _content_item_repository is None:
        _content_item_repository = PostgresContentItemRepository(event_bus=get_event_bus())
    return _content_item_repository


def get_moderation_item_repository() -> PostgresModerationItemRepository:
    """Получить экземпляр Moderation Item Repository."""
    global _moderation_item_repository
    if _moderation_item_repository is None:
        _moderation_item_repository = PostgresModerationItemRepository(event_bus=get_event_bus())
    return _moderation_item_repository


def get_telegram_deep_link_repository() -> PostgresDeepLinkRepository:
    """Получить экземпляр Telegram Deep Link Repository."""
    global _telegram_deep_link_repository
    if _telegram_deep_link_repository is None:
        _telegram_deep_link_repository = PostgresDeepLinkRepository(event_bus=get_event_bus())
    return _telegram_deep_link_repository


def get_webhook_repository() -> DjangoWebhookEventRepository:
    """Получить экземпляр Webhook Event Repository."""
    global _webhook_event_repository
    if _webhook_event_repository is None:
        _webhook_event_repository = DjangoWebhookEventRepository()
    return _webhook_event_repository


def get_boundary_script_repository() -> DjangoBoundaryScriptRepository:
    """Получить экземпляр Boundary Script Repository."""
    global _boundary_script_repository
    if _boundary_script_repository is None:
        _boundary_script_repository = DjangoBoundaryScriptRepository()
    return _boundary_script_repository


def get_password_service() -> PasswordService:
    """Получить экземпляр Password Service."""
    global _password_service
    if _password_service is None:
        _password_service = PasswordService()
    return _password_service


def get_encryption_service():
    """Получить экземпляр Encryption Service."""
    global _encryption_service
    if _encryption_service is None:
        _encryption_service = EncryptionService()
    return _encryption_service


def get_email_service() -> EmailService:
    """Получить экземпляр Email Service."""
    global _email_service
    if _email_service is None:
        _email_service = EmailService(client=ConsoleEmailClient())
    return _email_service


def get_telegram_service() -> TelegramAdapter:
    """Получить экземпляр Telegram Service."""
    global _telegram_service
    if _telegram_service is None:
        _telegram_service = TelegramAdapter(client=MockTelegramBotClient())
    return _telegram_service


def get_yookassa_adapter() -> YooKassaAdapter:
    """Получить экземпляр YooKassa Adapter."""
    config = YooKassaConfig(
        shop_id=getattr(settings, 'YOOKASSA_SHOP_ID', 'test_shop_id'),
        secret_key=getattr(settings, 'YOOKASSA_SECRET_KEY', 'test_secret_key'),
    )
    client = YooKassaClient(config)
    return YooKassaAdapter(
        client=client,
        webhook_secret_key=getattr(settings, 'YOOKASSA_SECRET_KEY', 'test_secret_key')
    )


# Providers for Use Cases

def get_book_appointment_use_case() -> BookAppointmentUseCase:
    """Получить экземпляр BookAppointmentUseCase."""
    return BookAppointmentUseCase(
        appointment_repository=get_appointment_repository(),
        service_repository=get_service_repository(),
        user_repository=get_user_repository(),
        payment_repository=get_payment_repository(),
        availability_slot_repository=get_availability_slot_repository(),
        slot_availability_service=SlotAvailabilityService(
            appointment_repository=get_appointment_repository(),
            google_calendar_service=MockGoogleCalendarAdapter(),
        ),
        payment_adapter=get_yookassa_adapter(),
        encryption_service=EncryptionService(),
        lead_repository=get_lead_repository(),
        event_bus=get_event_bus(),
    )


def get_get_available_slots_use_case() -> GetAvailableSlotsUseCase:
    """Получить экземпляр GetAvailableSlotsUseCase."""
    return GetAvailableSlotsUseCase(
        service_repository=get_service_repository(),
        appointment_repository=get_appointment_repository(),
        availability_slot_repository=get_availability_slot_repository(),
        slot_availability_service=SlotAvailabilityService(
            appointment_repository=get_appointment_repository(),
            google_calendar_service=MockGoogleCalendarAdapter(),
        ),
    )


def get_register_user_use_case() -> RegisterUserUseCase:
    """Получить экземпляр RegisterUserUseCase."""
    return RegisterUserUseCase(
        user_repository=get_user_repository(),
        event_bus=get_event_bus(),
    )


def get_authenticate_user_use_case() -> AuthenticateUserUseCase:
    """Получить экземпляр AuthenticateUserUseCase."""
    return AuthenticateUserUseCase(
        user_repository=get_sync_user_repository(),
        password_service=get_password_service(),
    )


def get_grant_consent_use_case() -> GrantConsentUseCase:
    """Получить экземпляр GrantConsentUseCase."""
    return GrantConsentUseCase(
        consent_repository=get_consent_repository(),
        event_bus=get_event_bus(),
    )


def get_revoke_consent_use_case() -> RevokeConsentUseCase:
    """Получить экземпляр RevokeConsentUseCase."""
    return RevokeConsentUseCase(
        consent_repository=get_consent_repository(),
        event_bus=get_event_bus(),
    )


def get_setup_mfa_use_case() -> SetupMfaUseCase:
    """Получить экземпляр SetupMfaUseCase."""
    return SetupMfaUseCase(
        user_repository=get_sync_user_repository(),
        encryption_service=get_encryption_service(),
    )


def get_verify_mfa_use_case() -> VerifyMfaUseCase:
    """Получить экземпляр VerifyMfaUseCase."""
    return VerifyMfaUseCase(
        user_repository=get_sync_user_repository(),
        encryption_service=get_encryption_service(),
    )


def get_start_interactive_run_use_case() -> StartInteractiveRunUseCase:
    """Получить экземпляр StartInteractiveRunUseCase."""
    return StartInteractiveRunUseCase(
        interactive_definition_repository=get_interactive_definition_repository(),
        interactive_run_repository=get_interactive_run_repository(),
        lead_repository=get_lead_repository(),
        event_bus=get_event_bus(),
    )


def get_complete_interactive_run_use_case() -> CompleteInteractiveRunUseCase:
    """Получить экземпляр CompleteInteractiveRunUseCase."""
    return CompleteInteractiveRunUseCase(
        interactive_run_repository=get_interactive_run_repository(),
        interactive_definition_repository=get_interactive_definition_repository(),
        lead_repository=get_lead_repository(),
        event_bus=get_event_bus(),
    )


def get_create_diary_entry_use_case() -> CreateDiaryEntryUseCase:
    """Получить экземпляр CreateDiaryEntryUseCase."""
    return CreateDiaryEntryUseCase(
        diary_entry_repository=get_diary_entry_repository(),
        user_repository=get_user_repository(),
        encryption_service=EncryptionService(),
        event_bus=get_event_bus(),
    )


def get_update_diary_entry_use_case() -> UpdateDiaryEntryUseCase:
    """Получить экземпляр UpdateDiaryEntryUseCase."""
    return UpdateDiaryEntryUseCase(
        diary_entry_repository=get_diary_entry_repository(),
        user_repository=get_user_repository(),
        encryption_service=get_encryption_service(),
    )


def get_delete_diary_entry_use_case() -> DeleteDiaryEntryUseCase:
    """Получить экземпляр DeleteDiaryEntryUseCase."""
    return DeleteDiaryEntryUseCase(
        diary_entry_repository=get_diary_entry_repository(),
        user_repository=get_user_repository(),
        event_bus=get_event_bus(),
    )


def get_get_client_appointments_use_case() -> GetClientAppointmentsUseCase:
    """Получить экземпляр GetClientAppointmentsUseCase."""
    return GetClientAppointmentsUseCase(
        appointment_repository=get_appointment_repository(),
        user_repository=get_user_repository(),
    )


def get_export_diary_to_pdf_use_case() -> ExportDiaryToPdfUseCase:
    """Получить экземпляр ExportDiaryToPdfUseCase."""
    from domain.client_cabinet.repositories import IDataExportRepository
    class SimpleDataExportRepository(IDataExportRepository):
        async def save_export(self, export):
            pass
            
    return ExportDiaryToPdfUseCase(
        diary_entry_repository=get_diary_entry_repository(),
        data_export_repository=SimpleDataExportRepository(),
        user_repository=get_user_repository(),
        encryption_service=EncryptionService(),
        pdf_generator_service=ReportLabPdfGeneratorService(),
        event_bus=get_event_bus(),
    )


def get_delete_user_data_use_case() -> DeleteUserDataUseCase:
    """Получить экземпляр DeleteUserDataUseCase."""
    return DeleteUserDataUseCase(
        user_repository=get_user_repository(),
        appointment_repository=get_appointment_repository(),
        diary_entry_repository=get_diary_entry_repository(),
        interactive_run_repository=get_interactive_run_repository(),
        event_bus=get_event_bus(),
    )


def get_list_favorites_use_case() -> ListFavoritesUseCase:
    """Получить экземпляр ListFavoritesUseCase."""
    return ListFavoritesUseCase(
        favorite_repository=get_favorite_repository(),
        user_repository=get_user_repository(),
    )


def get_add_favorite_use_case() -> AddFavoriteUseCase:
    """Получить экземпляр AddFavoriteUseCase."""
    return AddFavoriteUseCase(
        favorite_repository=get_favorite_repository(),
        user_repository=get_user_repository(),
    )


def get_remove_favorite_use_case() -> RemoveFavoriteUseCase:
    """Получить экземпляр RemoveFavoriteUseCase."""
    return RemoveFavoriteUseCase(
        favorite_repository=get_favorite_repository(),
        user_repository=get_user_repository(),
    )


def get_confirm_payment_use_case() -> ConfirmPaymentUseCase:
    """Получить экземпляр ConfirmPaymentUseCase."""
    return ConfirmPaymentUseCase(
        appointment_repository=get_appointment_repository(),
        service_repository=get_service_repository(),
        user_repository=get_user_repository(),
        lead_repository=get_lead_repository(),
        event_bus=get_event_bus(),
        email_service=get_email_service(),
    )


def get_get_boundary_scripts_use_case() -> GetBoundaryScriptsUseCase:
    """Получить экземпляр GetBoundaryScriptsUseCase."""
    return GetBoundaryScriptsUseCase(
        boundary_script_repository=get_boundary_script_repository(),
    )


def get_list_articles_use_case() -> ListArticlesUseCase:
    """Получить экземпляр ListArticlesUseCase."""
    return ListArticlesUseCase(
        content_repository=get_content_item_repository(),
    )


def get_get_article_use_case() -> GetArticleUseCase:
    """Получить экземпляр GetArticleUseCase."""
    return GetArticleUseCase(
        content_repository=get_content_item_repository(),
    )


def get_get_resource_use_case() -> GetResourceUseCase:
    """Получить экземпляр GetResourceUseCase."""
    return GetResourceUseCase(
        content_repository=get_content_item_repository(),
    )


def get_handle_payment_webhook_use_case() -> HandlePaymentWebhookUseCase:
    """Получить экземпляр HandlePaymentWebhookUseCase."""
    return HandlePaymentWebhookUseCase(
        payment_repository=get_payment_repository(),
        appointment_repository=get_appointment_repository(),
        payment_adapter=get_yookassa_adapter(),
        event_bus=get_event_bus(),
        confirm_payment_use_case=get_confirm_payment_use_case(),
        webhook_repository=get_webhook_repository(),
    )


def get_handle_telegram_webhook_use_case() -> HandleTelegramWebhookUseCase:
    """Получить экземпляр HandleTelegramWebhookUseCase."""
    return HandleTelegramWebhookUseCase(
        telegram_adapter=get_telegram_service(),
        lead_repository=get_lead_repository(),
        event_bus=get_event_bus(),
    )


def get_leads_list_use_case() -> GetLeadsListUseCase:
    """Получить экземпляр GetLeadsListUseCase."""
    return GetLeadsListUseCase(
        lead_repository=get_lead_repository(),
    )


def get_submit_question_use_case() -> SubmitQuestionUseCase:
    """Получить экземпляр SubmitQuestionUseCase."""
    return SubmitQuestionUseCase(
        moderation_repository=get_moderation_item_repository(),
        encryption_service=get_encryption_service(),
        event_bus=get_event_bus(),
    )


def get_log_audit_event_use_case() -> LogAuditEventUseCase:
    """Получить экземпляр LogAuditEventUseCase для аудит-логирования админских действий."""
    return LogAuditEventUseCase(audit_repository=DjangoAuditLogRepository())


def get_record_appointment_outcome_admin_use_case() -> RecordAppointmentOutcomeAdminUseCase:
    """Получить экземпляр RecordAppointmentOutcomeAdminUseCase."""
    return RecordAppointmentOutcomeAdminUseCase(
        appointment_repository=get_appointment_repository(),
        user_repository=get_user_repository(),
        event_bus=get_event_bus(),
    )


def get_moderate_ugc_item_use_case() -> ModerateUGCItemUseCase:
    """Получить экземпляр ModerateUGCItemUseCase."""
    return ModerateUGCItemUseCase(
        moderation_repository=get_moderation_item_repository(),
        event_bus=get_event_bus(),
    )


def get_answer_ugc_question_use_case() -> AnswerUGCQuestionUseCase:
    """Получить экземпляр AnswerUGCQuestionUseCase."""
    return AnswerUGCQuestionUseCase(
        moderation_repository=get_moderation_item_repository(),
        encryption_service=get_encryption_service(),
        event_bus=get_event_bus(),
    )


def get_publish_content_item_use_case() -> PublishContentItemUseCase:
    """Получить экземпляр PublishContentItemUseCase."""
    return PublishContentItemUseCase(content_repository=get_content_item_repository())


class SyncUserRepositoryWrapper:
    """Синхронная обертка для асинхронного репозитория пользователей."""
    
    def __init__(self, async_repo: DjangoUserRepository):
        self._async_repo = async_repo
    
    def get_by_email(self, email: str):
        """Синхронная версия get_by_email."""
        email_vo = Email(email)
        return async_to_sync(self._async_repo.find_by_email)(email_vo)
    
    def save(self, user: User) -> User:
        """Синхронная версия save."""
        async_to_sync(self._async_repo.save)(user)
        return user
    
    def get_password_hash(self, user_id):
        """Получить hash пароля (синхронный метод)."""
        return self._async_repo.get_password_hash(user_id)
    
    def set_password_hash(self, user_id, password_hash: str) -> None:
        """Установить hash пароля (синхронный метод)."""
        return self._async_repo.set_password_hash(user_id, password_hash)
    
    def get_django_model(self, user_id):
        """Получить Django модель пользователя (для JWT генерации)."""
        return self._async_repo.get_django_model(user_id)

    def get_mfa_secret_encrypted(self, user_id):
        """Получить зашифрованный MFA secret."""
        return self._async_repo.get_mfa_secret_encrypted(user_id)

    def set_mfa_secret(self, user_id, encrypted_secret: str) -> None:
        """Установить зашифрованный MFA secret."""
        return self._async_repo.set_mfa_secret(user_id, encrypted_secret)

    def set_mfa_enabled(self, user_id, enabled: bool) -> None:
        """Включить/выключить MFA."""
        return self._async_repo.set_mfa_enabled(user_id, enabled)
        
    def get_user_roles(self, user_id):
        """Получить роли пользователя (синхронный метод)."""
        return self._async_repo.get_user_roles(user_id)


def get_sync_user_repository() -> SyncUserRepositoryWrapper:
    """Получить синхронную обертку для User Repository."""
    return SyncUserRepositoryWrapper(get_user_repository())
