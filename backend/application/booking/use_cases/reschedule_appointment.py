"""
Use Case: перенос записи на другой слот.
"""
from datetime import datetime
from dateutil import parser as date_parser
import pytz

from application.exceptions import NotFoundError, ValidationError, ForbiddenError, ConflictError
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
from domain.identity.aggregates.user import UserId
from domain.identity.repositories import IUserRepository
from application.interfaces.event_bus import IEventBus
from application.interfaces.email_service import IEmailService
import logging

logger = logging.getLogger(__name__)

from application.booking.dto import RescheduleAppointmentDto, AppointmentResponseDto


class RescheduleAppointmentUseCase:
    """Use Case для переноса записи на другой слот."""
    
    def __init__(
        self,
        appointment_repository: IAppointmentRepository,
        service_repository: IServiceRepository,
        user_repository: IUserRepository,
        availability_slot_repository: IAvailabilitySlotRepository,
        slot_availability_service: SlotAvailabilityService,
        event_bus: IEventBus,
        email_service: IEmailService
    ):
        self._appointment_repository = appointment_repository
        self._service_repository = service_repository
        self._user_repository = user_repository
        self._availability_slot_repository = availability_slot_repository
        self._slot_availability_service = slot_availability_service
        self._event_bus = event_bus
        self._email_service = email_service
    
    async def execute(self, dto: RescheduleAppointmentDto) -> AppointmentResponseDto:
        """
        Переносит запись на новый слот.
        
        Returns:
            AppointmentResponseDto с обновлённой записью.
        
        Raises:
            NotFoundError: Если запись или услуга не найдены
            ForbiddenError: Если пользователь не имеет прав
            ValidationError: Если запись нельзя перенести
            ConflictError: Если новый слот недоступен
        """
        # 1. Получение агрегатов
        appointment_id = AppointmentId(dto.appointment_id)
        appointment = await self._appointment_repository.find_by_id(appointment_id)
        if not appointment:
            raise NotFoundError("Appointment not found")
        
        service = await self._service_repository.find_by_id(appointment.service_id)
        if not service:
            raise NotFoundError("Service not found")
        
        # 2. Проверка прав
        user_id = UserId(dto.user_id)
        user = await self._user_repository.find_by_id(user_id)
        if not user:
            raise NotFoundError("User not found")
        
        is_owner = appointment.client_id == user_id
        is_admin = any(role.code == 'admin' for role in user.roles)
        
        if not (is_owner or is_admin):
            raise ForbiddenError("You don't have permission to reschedule this appointment")
        
        # 3. Проверка возможности переноса
        # Используем доменную логику через reschedule, которая сама проверит _can_be_rescheduled
        # Но сначала проверим явно для более понятной ошибки
        if not appointment.status.is_confirmed():
            raise ValidationError("Only confirmed appointments can be rescheduled")
        
        # 4. Создание нового TimeSlot
        new_slot = await self._create_time_slot(dto)
        
        # 5. Проверка доступности нового слота
        is_available = await self._slot_availability_service.is_slot_available(
            new_slot, service.id
        )
        if not is_available:
            raise ConflictError("New slot is not available")
        
        # 6. Перенос
        try:
            appointment.reschedule(new_slot, service)
            logger.info(f"Appointment {appointment.id.value} rescheduled to {new_slot.start_at.isoformat()}")
        except Exception as e:
            logger.error(f"Failed to reschedule appointment {appointment.id.value}: {e}")
            raise ValidationError(f"Appointment cannot be rescheduled: {e}")
        
        # 7. Сохранение
        await self._appointment_repository.save(appointment)
        
        # 8. Публикация событий
        events = appointment.get_domain_events()
        for event in events:
            await self._event_bus.publish(event)
        appointment.clear_domain_events()
        
        # 9. Отправка уведомлений
        if user.email:
            await self._email_service.send_reschedule_notification(
                to_email=user.email.value,
                appointment_details={
                    'appointment_id': str(appointment.id.value),
                    'old_start_at': appointment.slot.start_at.isoformat() if hasattr(appointment, '_old_slot') else None,
                    'new_start_at': appointment.slot.start_at.isoformat(),
                    'new_end_at': appointment.slot.end_at.isoformat()
                }
            )
        
        # 10. Возврат DTO
        return self._to_response_dto(appointment, service)
    
    async def _create_time_slot(self, dto: RescheduleAppointmentDto) -> TimeSlot:
        """Создает TimeSlot из DTO."""
        if dto.new_slot_id:
            # Получаем слот из IAvailabilitySlotRepository
            try:
                slot_id = AvailabilitySlotId(dto.new_slot_id)
                availability_slot = await self._availability_slot_repository.find_by_id(slot_id)
                if not availability_slot:
                    raise NotFoundError(f"Availability slot not found: {dto.new_slot_id}")
                
                # Конвертируем слот в TimeSlot
                if not dto.timezone:
                    raise ValidationError("timezone is required when newSlotId is provided")
                timezone = Timezone(dto.timezone)
                return availability_slot.to_time_slot(timezone)
            except Exception as e:
                if isinstance(e, (NotFoundError, ValidationError)):
                    raise
                raise ValidationError(f"Invalid slot ID format: {e}")
        
        # Если new_slot_id не указан, создаем TimeSlot из new_start_at/new_end_at
        if not dto.new_start_at or not dto.new_end_at or not dto.timezone:
            raise ValidationError("Either newSlotId or newStartAt/newEndAt/timezone must be provided")
        
        # Парсим даты из ISO8601
        try:
            start_at = date_parser.parse(dto.new_start_at)
            end_at = date_parser.parse(dto.new_end_at)
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
    
    def _to_response_dto(
        self,
        appointment: Appointment,
        service: Service
    ) -> AppointmentResponseDto:
        """Преобразует доменные объекты в DTO."""
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
            payment=None,
            created_at=appointment.created_at.isoformat() if hasattr(appointment, 'created_at') else datetime.utcnow().isoformat()
        )
