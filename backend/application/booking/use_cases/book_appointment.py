"""
Use Case: создание записи на консультацию.
"""
import json
from datetime import datetime
from typing import Optional
from dateutil import parser as date_parser
import pytz

from application.exceptions import (
    NotFoundError,
    ValidationError,
    ForbiddenError,
    ConflictError
)
from domain.booking.aggregates.appointment import Appointment, AppointmentId
from domain.booking.aggregates.service import Service, ServiceId
from domain.booking.repositories import (
    IAppointmentRepository,
    IServiceRepository,
    IAvailabilitySlotRepository
)
from domain.booking.domain_services import SlotAvailabilityService
from domain.booking.value_objects.time_slot import TimeSlot
from domain.booking.entities.availability_slot import AvailabilitySlotId
from domain.booking.value_objects.timezone import Timezone
from domain.booking.value_objects.appointment_format import AppointmentFormat
from domain.booking.value_objects.booking_metadata import BookingMetadata
from domain.booking.entities.intake_form import IntakeForm
from domain.booking.entities.payment import Payment
from domain.booking.value_objects.money import Money
from domain.booking.value_objects.currency import Currency
from domain.payments.repositories import IPaymentRepository
from domain.identity.repositories import IUserRepository
from domain.identity.aggregates.user import UserId
from domain.identity.value_objects.consent_type import ConsentType
from domain.analytics.repositories import ILeadRepository
from domain.analytics.aggregates.lead import Lead
from domain.analytics.value_objects.lead_identity import LeadIdentity
from domain.analytics.value_objects.lead_source import LeadSource
from domain.analytics.value_objects.timeline_event import TimelineEvent
from domain.analytics.value_objects.utm_params import UTMParams
from application.interfaces.encryption import IEncryptionService
from application.interfaces.event_bus import IEventBus
from application.interfaces.payment_adapter import IPaymentAdapter
from domain.shared.exceptions import ConflictError as DomainConflictError
import logging

logger = logging.getLogger(__name__)

from application.booking.dto import BookAppointmentDto, AppointmentResponseDto


class BookAppointmentUseCase:
    """Use Case для создания записи на консультацию."""
    
    def __init__(
        self,
        appointment_repository: IAppointmentRepository,
        service_repository: IServiceRepository,
        user_repository: IUserRepository,
        payment_repository: IPaymentRepository,
        availability_slot_repository: IAvailabilitySlotRepository,
        slot_availability_service: SlotAvailabilityService,
        payment_adapter: IPaymentAdapter,
        encryption_service: IEncryptionService,
        lead_repository: ILeadRepository,
        event_bus: IEventBus
    ):
        self._appointment_repository = appointment_repository
        self._service_repository = service_repository
        self._user_repository = user_repository
        self._payment_repository = payment_repository
        self._availability_slot_repository = availability_slot_repository
        self._slot_availability_service = slot_availability_service
        self._payment_adapter = payment_adapter
        self._encryption_service = encryption_service
        self._lead_repository = lead_repository
        self._event_bus = event_bus
    
    async def execute(self, dto: BookAppointmentDto) -> AppointmentResponseDto:
        """
        Создает новую запись на консультацию.
        
        Returns:
            AppointmentResponseDto с данными созданной записи.
        
        Raises:
            NotFoundError: Если услуга или пользователь не найдены
            ValidationError: Если входные данные невалидны
            ForbiddenError: Если нет согласия на ПДн
            ConflictError: Если слот недоступен или конфликтует
        """
        # 1. Валидация входных данных
        self._validate_input(dto)
        
        # 2. Получение агрегатов
        service = await self._get_service(dto.service_id)
        user = await self._get_user_if_provided(dto.user_id)
        
        # Проверка согласия на ПДн
        if user:
            if not user.has_active_consent(ConsentType.PERSONAL_DATA):
                raise ForbiddenError("Personal data consent is required")
        
        # 3. Создание TimeSlot
        slot = await self._create_time_slot(dto)
        
        # 4. Проверка бизнес-правил
        self._validate_business_rules(slot, service, dto.format)
        
        # Проверка доступности слота
        is_available = await self._slot_availability_service.is_slot_available(
            slot, service.id
        )
        if not is_available:
            raise ConflictError("Slot is not available")
        
        # 5. Создание агрегата Appointment
        if not dto.user_id:
            raise ValidationError("User ID is required")
        
        client_id = UserId(dto.user_id)
        
        metadata = self._create_booking_metadata(dto.metadata or {})
        format_vo = AppointmentFormat(dto.format)
        
        appointment = Appointment.create(
            service=service,
            client_id=client_id,
            slot=slot,
            format=format_vo,
            metadata=metadata
        )
        
        # 6. Прикрепление анкеты (если указана)
        if dto.intake_form:
            encrypted_form = self._encrypt_intake_form(dto.intake_form)
            intake_form = IntakeForm.create(encrypted_form)
            appointment.attach_intake_form(intake_form)
        
        # 7. Создание платежа
        payment_data = await self._create_payment_intent(appointment, service)
        
        # Создаем Payment агрегат
        amount = Money(service.price.amount, service.price.currency)
        payment = Payment.create(
            amount=amount,
            provider_id='yookassa',
            provider_payment_id=payment_data.get('payment_id', '')
        )
        
        # Сохраняем Payment
        await self._payment_repository.save(payment)
        
        # Присваиваем payment к appointment
        appointment.assign_payment(payment)
        
        # 8. Сохранение
        try:
            await self._appointment_repository.save_with_conflict_check(appointment)
            logger.info(f"Appointment {appointment.id.value} created successfully for user {client_id.value}")
        except DomainConflictError as e:
            logger.warning(f"Slot conflict detected for appointment {appointment.id.value}: {e}")
            raise ConflictError("Slot conflict detected. Please choose another slot.")
        
        # 9. Публикация событий
        events = appointment.get_domain_events()
        for event in events:
            await self._event_bus.publish(event)
        appointment.clear_domain_events()
        
        # 10. Создание/обновление Lead (если применимо)
        if metadata.deep_link_id:
            await self._update_lead(metadata.deep_link_id, dto)
        
        # 11. Возврат DTO
        return self._to_response_dto(appointment, service, payment_data)
    
    def _validate_input(self, dto: BookAppointmentDto) -> None:
        """Валидирует входные данные."""
        errors = []
        
        if not dto.service_id:
            errors.append("serviceId is required")
        
        # Либо slotId, либо startAt + endAt + timezone должны быть указаны
        if not dto.slot_id and not (dto.start_at and dto.end_at and dto.timezone):
            errors.append("Either slotId or (startAt, endAt, timezone) must be provided")
        
        if dto.consents and not dto.consents.get('personal_data') and not dto.consents.get('personalData'):
            errors.append("Personal data consent is required")
        
        if dto.format not in ['online', 'offline']:
            errors.append("Format must be 'online' or 'offline'")
        
        if errors:
            raise ValidationError(f"Validation failed: {', '.join(errors)}")
    
    async def _get_service(self, service_id: str) -> Service:
        """Получает услугу по ID."""
        try:
            service_id_vo = ServiceId(service_id)
        except Exception:
            raise ValidationError(f"Invalid service ID format: {service_id}")
        
        service = await self._service_repository.find_by_id(service_id_vo)
        if not service:
            raise NotFoundError("Service not found")
        
        return service
    
    async def _get_user_if_provided(self, user_id: Optional[str]):
        """Получает пользователя, если ID указан."""
        if not user_id:
            return None
        
        try:
            user_id_vo = UserId(user_id)
        except Exception:
            raise ValidationError(f"Invalid user ID format: {user_id}")
        
        user = await self._user_repository.find_by_id(user_id_vo)
        if not user:
            raise NotFoundError("User not found")
        
        return user
    
    async def _create_time_slot(self, dto: BookAppointmentDto) -> TimeSlot:
        """Создает TimeSlot из DTO."""
        if dto.slot_id:
            # Получаем слот из IAvailabilitySlotRepository
            try:
                slot_id = AvailabilitySlotId(dto.slot_id)
                availability_slot = await self._availability_slot_repository.find_by_id(slot_id)
                if not availability_slot:
                    raise NotFoundError(f"Availability slot not found: {dto.slot_id}")
                
                # Конвертируем слот в TimeSlot
                timezone = Timezone(dto.timezone)
                return availability_slot.to_time_slot(timezone)
            except Exception as e:
                if isinstance(e, NotFoundError):
                    raise
                raise ValidationError(f"Invalid slot ID format: {e}")
        
        # Если slot_id не указан, создаем TimeSlot из startAt/endAt
        if not dto.start_at or not dto.end_at:
            raise ValidationError("Either slotId or startAt/endAt must be provided")
        
        # Парсим даты из ISO8601
        try:
            start_at = date_parser.parse(dto.start_at)
            end_at = date_parser.parse(dto.end_at)
        except Exception as e:
            raise ValidationError(f"Invalid date format: {e}")
        
        # Убеждаемся, что даты в UTC
        if start_at.tzinfo is None:
            start_at = pytz.UTC.localize(start_at)
        else:
            start_at = start_at.astimezone(pytz.UTC)
        
        if end_at.tzinfo is None:
            end_at = pytz.UTC.localize(end_at)
        else:
            end_at = end_at.astimezone(pytz.UTC)
        
        # Создаем Timezone VO
        try:
            timezone_vo = Timezone(dto.timezone)
        except Exception:
            raise ValidationError(f"Invalid timezone format: {dto.timezone}")
        
        return TimeSlot(
            start_at=start_at,
            end_at=end_at,
            timezone=timezone_vo
        )
    
    def _validate_business_rules(
        self,
        slot: TimeSlot,
        service: Service,
        format_str: str
    ) -> None:
        """Проверяет бизнес-правила."""
        if slot.is_in_past():
            raise ValidationError("Cannot book appointment in the past")
        
        format_vo = AppointmentFormat(format_str)
        if not service.is_available_for(format_vo):
            raise ValidationError("Service does not support this format")
    
    def _create_booking_metadata(self, metadata_dict: dict) -> BookingMetadata:
        """Создает BookingMetadata из словаря."""
        utm_params = metadata_dict.get('utmParams', {})
        
        return BookingMetadata(
            deep_link_id=metadata_dict.get('deepLinkId'),
            utm_source=utm_params.get('source'),
            utm_medium=utm_params.get('medium'),
            utm_campaign=utm_params.get('campaign'),
            additional_data={
                'entryPoint': metadata_dict.get('entryPoint'),
                'topicCode': metadata_dict.get('topicCode')
            }
        )
    
    def _encrypt_intake_form(self, form_data: dict) -> dict:
        """Шифрует данные анкеты."""
        json_str = json.dumps(form_data)
        encrypted_str = self._encryption_service.encrypt(json_str)
        return {'encrypted': encrypted_str}
    
    async def _create_payment_intent(
        self,
        appointment: Appointment,
        service: Service
    ) -> dict:
        """Создает намерение оплаты."""
        amount = Money(service.price.amount, service.price.currency)
        
        payment_data = await self._payment_adapter.create_payment_intent(
            amount=amount,
            description=f"Консультация: {service.name}",
            return_url=self._get_return_url(),
            metadata={
                'appointment_id': str(appointment.id.value)
            }
        )
        
        # Обновляем provider_payment_id в payment_data для совместимости
        if 'id' in payment_data and 'payment_id' not in payment_data:
            payment_data['payment_id'] = payment_data['id']
        
        return payment_data
    
    async def _update_lead(self, deep_link_id: str, dto: BookAppointmentDto) -> None:
        """Создает или обновляет Lead."""
        # Ищем Lead по deep_link_id
        lead = await self._lead_repository.find_by_deep_link_id(deep_link_id)
        
        if not lead:
            # Создаем новый Lead, если не найден
            user_id_vo = None
            if dto.user_id:
                user_id_vo = UserId(dto.user_id)
            
            identity = LeadIdentity(
                user_id=user_id_vo,
                anonymous_id=dto.anonymous_id,
                email=None,
                phone=None,
                telegram_id=None
            )
            
            # Определяем source из metadata
            source_value = 'web'  # По умолчанию
            if dto.metadata:
                entry_point = dto.metadata.get('entryPoint')
                if entry_point == 'telegram':
                    source_value = 'telegram'
                elif entry_point == 'referral':
                    source_value = 'referral'
                elif dto.metadata.get('utmParams', {}).get('source') == 'organic':
                    source_value = 'organic'
            
            source = LeadSource(source_value)
            utm_params = None
            if dto.metadata and dto.metadata.get('utmParams'):
                utm_data = dto.metadata['utmParams']
                utm_params = UTMParams(
                    source=utm_data.get('source'),
                    medium=utm_data.get('medium'),
                    campaign=utm_data.get('campaign'),
                    term=utm_data.get('term'),
                    content=utm_data.get('content')
                )
            
            # Получаем topic_code из metadata
            topic_code = None
            if dto.metadata:
                topic_code = dto.metadata.get('topicCode')
            
            lead = Lead.create(
                identity=identity,
                source=source,
                utm_params=utm_params,
                topic_code=topic_code
            )
        
        # Добавляем событие в timeline
        from domain.analytics.value_objects.timeline_event import TimelineEvent
        timeline_event = TimelineEvent(
            event_type='booking_start',
            occurred_at=datetime.now(pytz.UTC),
            metadata={
                'source': 'web',
                'properties': {'service_id': dto.service_id},
                'deep_link_id': deep_link_id
            }
        )
        lead.add_timeline_event(timeline_event)
        
        # Сохраняем Lead
        await self._lead_repository.save(lead)
        user_id_vo = None
        if dto.user_id:
            user_id_vo = UserId(dto.user_id)
        
        identity = LeadIdentity(
            user_id=user_id_vo,
            anonymous_id=dto.anonymous_id,
            email=None,
            phone=None,
            telegram_id=None
        )
        
        # Определяем source из metadata
        source_value = 'web'  # По умолчанию
        if dto.metadata:
            entry_point = dto.metadata.get('entryPoint')
            if entry_point == 'telegram':
                source_value = 'telegram'
            elif entry_point == 'referral':
                source_value = 'referral'
            elif dto.metadata.get('utmParams', {}).get('source') == 'organic':
                source_value = 'organic'
        
        source = LeadSource(source_value)
        
        utm_params = None
        if dto.metadata and dto.metadata.get('utmParams'):
            utm = dto.metadata['utmParams']
            utm_params = UTMParams(
                source=utm.get('source'),
                medium=utm.get('medium'),
                campaign=utm.get('campaign')
            )
        
        # Получаем topic_code из metadata
        topic_code = None
        if dto.metadata:
            topic_code = dto.metadata.get('topicCode')
        
        lead = Lead.create(
            identity=identity,
            source=source,
            utm_params=utm_params,
            topic_code=topic_code
        )
        
        # Добавляем событие
        timeline_event = TimelineEvent(
            event_type='booking_start',
            occurred_at=datetime.utcnow(),
            metadata={'service_id': dto.service_id}
        )
        lead.add_timeline_event(timeline_event)
        
        await self._lead_repository.save(lead)
    
    def _get_return_url(self) -> str:
        """Получает return_url из конфигурации."""
        import os
        from django.conf import settings
        
        # Пытаемся получить из настроек Django
        return_url = getattr(settings, 'PAYMENT_RETURN_URL', None)
        if return_url:
            return return_url
        
        # Fallback на переменную окружения
        return_url = os.getenv('PAYMENT_RETURN_URL', 'https://example.com/payment/return')
        return return_url
    
    def _to_response_dto(
        self,
        appointment: Appointment,
        service: Service,
        payment_data: dict
    ) -> AppointmentResponseDto:
        """Преобразует доменные объекты в DTO."""
        payment_dto = None
        if payment_data:
            payment_dto = {
                'id': payment_data.get('payment_id'),
                'amount': service.price.amount,
                'paymentUrl': payment_data.get('confirmation_url'),
                'status': payment_data.get('status', 'intent')
            }
        
        return AppointmentResponseDto(
            id=str(appointment.id.value),
            service={
                'id': str(service.id.value),
                'slug': service.slug,
                'title': service.name,
                'durationMinutes': service.duration_minutes
            },
            slot={
                'id': str(appointment.metadata.slot_id) if hasattr(appointment.metadata, 'slot_id') and appointment.metadata.slot_id else None,
                'startAt': appointment.slot.start_at.isoformat(),
                'endAt': appointment.slot.end_at.isoformat(),
                'timezone': str(appointment.slot.timezone.value)
            },
            status=appointment.status.value,
            format=appointment.format.value,
            payment=payment_dto,
            created_at=appointment.created_at.isoformat() if hasattr(appointment, 'created_at') else datetime.utcnow().isoformat()
        )
