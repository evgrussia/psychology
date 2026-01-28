"""
Use Case: создание запроса в лист ожидания.
"""
from application.exceptions import NotFoundError, ValidationError
from domain.booking.aggregates.service import Service, ServiceId
from domain.booking.aggregates.waitlist_request import WaitlistRequest, WaitlistRequestId
from domain.booking.repositories import IServiceRepository, IWaitlistRequestRepository
from domain.identity.aggregates.user import UserId
from domain.identity.repositories import IUserRepository
from domain.analytics.repositories import ILeadRepository
from application.interfaces.encryption import IEncryptionService
from application.interfaces.event_bus import IEventBus
from application.interfaces.email_service import IEmailService
import os
import logging

logger = logging.getLogger(__name__)

from application.booking.dto import SubmitWaitlistRequestDto


class SubmitWaitlistRequestUseCase:
    """Use Case для создания запроса в лист ожидания."""
    
    def __init__(
        self,
        service_repository: IServiceRepository,
        user_repository: IUserRepository,
        waitlist_repository: IWaitlistRequestRepository,
        lead_repository: ILeadRepository,
        encryption_service: IEncryptionService,
        email_service: IEmailService,
        event_bus: IEventBus
    ):
        self._service_repository = service_repository
        self._user_repository = user_repository
        self._waitlist_repository = waitlist_repository
        self._lead_repository = lead_repository
        self._encryption_service = encryption_service
        self._email_service = email_service
        self._event_bus = event_bus
    
    async def execute(self, dto: SubmitWaitlistRequestDto) -> dict:
        """
        Создает запрос в лист ожидания.
        
        Returns:
            dict с данными созданного запроса.
        
        Raises:
            NotFoundError: Если услуга не найдена
            ValidationError: Если данные невалидны
        """
        # 1. Валидация входных данных
        if not dto.consents or not dto.consents.get('communications'):
            raise ValidationError("Communications consent is required for waitlist")
        
        if not dto.contact_info or not dto.contact_info.get('value'):
            raise ValidationError("Contact info is required")
        
        # 2. Получение услуги
        try:
            service_id = ServiceId(dto.service_id)
        except Exception:
            raise ValidationError(f"Invalid service ID format: {dto.service_id}")
        
        service = await self._service_repository.find_by_id(service_id)
        if not service:
            raise NotFoundError("Service not found")
        
        # 3. Шифрование контакта
        contact_value = dto.contact_info['value']
        encrypted_contact = self._encryption_service.encrypt(contact_value)
        
        # 4. Получение client_id (опционально)
        client_id = None
        if dto.user_id:
            try:
                client_id = UserId(dto.user_id)
                user = await self._user_repository.find_by_id(client_id)
                if not user:
                    raise NotFoundError("User not found")
            except Exception as e:
                raise ValidationError(f"Invalid user ID: {e}")
        
        # 5. Создание агрегата
        waitlist_request = WaitlistRequest.create(
            service_id=service_id,
            client_id=client_id
        )
        
        # 6. Сохранение
        await self._waitlist_repository.save(waitlist_request)
        
        # 7. Публикация событий
        events = waitlist_request.get_domain_events()
        for event in events:
            await self._event_bus.publish(event)
        waitlist_request.clear_domain_events()
        
        # 8. Создание/обновление Lead (если есть deep_link_id в metadata)
        # Примечание: deep_link_id должен передаваться через metadata в DTO
        # Для текущей реализации оставляем как есть, так как WaitlistRequest не хранит metadata
        
        # 9. Уведомление админа
        try:
            from django.conf import settings
            admin_email = getattr(settings, 'ADMIN_EMAIL', os.getenv('ADMIN_EMAIL', 'admin@example.com'))
            
            await self._email_service.send_admin_notification(
                to_email=admin_email,
                subject=f"Новый запрос в лист ожидания - {service.name}",
                message=f"""
Поступил новый запрос в лист ожидания:

ID запроса: {waitlist_request.id.value}
Услуга: {service.name} (ID: {service.id.value})
Статус: pending

Проверьте запрос в админ-панели.
                """
            )
        except Exception as e:
            logger.error(f"Failed to send admin notification for waitlist request {waitlist_request.id.value}: {e}")
            # Не прерываем выполнение, если уведомление не отправилось
        
        # 10. Возврат результата
        return {
            'waitlist_request_id': str(waitlist_request.id.value),
            'service_id': dto.service_id,
            'status': 'pending'
        }
