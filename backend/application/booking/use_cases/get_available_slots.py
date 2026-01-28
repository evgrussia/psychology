"""
Use Case: получение доступных слотов для услуги.
"""
from datetime import datetime
from dateutil import parser as date_parser
import pytz
from typing import List

from application.exceptions import NotFoundError, ValidationError
from domain.booking.aggregates.service import Service, ServiceId
from domain.booking.repositories import (
    IServiceRepository,
    IAppointmentRepository,
    IAvailabilitySlotRepository
)
from domain.booking.value_objects.time_slot import TimeSlot
from domain.booking.value_objects.timezone import Timezone
from domain.booking.domain_services import SlotAvailabilityService

from application.booking.dto import GetAvailableSlotsDto, AvailableSlotDto


class GetAvailableSlotsUseCase:
    """Use Case для получения доступных слотов."""
    
    def __init__(
        self,
        service_repository: IServiceRepository,
        appointment_repository: IAppointmentRepository,
        availability_slot_repository: IAvailabilitySlotRepository,
        slot_availability_service: SlotAvailabilityService
    ):
        self._service_repository = service_repository
        self._appointment_repository = appointment_repository
        self._availability_slot_repository = availability_slot_repository
        self._slot_availability_service = slot_availability_service
    
    async def execute(self, dto: GetAvailableSlotsDto) -> List[AvailableSlotDto]:
        """
        Получает доступные слоты для услуги.
        
        Returns:
            List[AvailableSlotDto] список доступных слотов.
        
        Raises:
            NotFoundError: Если услуга не найдена
            ValidationError: Если входные данные невалидны
        """
        # 1. Валидация входных данных
        try:
            service_id = ServiceId(dto.service_id)
        except Exception:
            raise ValidationError(f"Invalid service ID format: {dto.service_id}")
        
        try:
            date_from = date_parser.parse(dto.date_from)
            date_to = date_parser.parse(dto.date_to)
        except Exception as e:
            raise ValidationError(f"Invalid date format: {e}")
        
        if date_to <= date_from:
            raise ValidationError("dateTo must be after dateFrom")
        
        # 2. Получение услуги
        service = await self._service_repository.find_by_id(service_id)
        if not service:
            raise NotFoundError("Service not found")
        
        # 3. Получение слотов из репозитория
        slots = await self._availability_slot_repository.find_available_slots(
            service_id, date_from, date_to
        )
        
        # 4. Проверка доступности каждого слота и фильтрация конфликтов
        available_slots = []
        user_timezone = Timezone(dto.timezone)
        
        for slot in slots:
            # Конвертируем слот в TimeSlot для проверки доступности
            time_slot = slot.to_time_slot(user_timezone)
            
            # Проверяем доступность через SlotAvailabilityService
            is_available = await self._slot_availability_service.is_slot_available(
                time_slot, service_id
            )
            
            if is_available and slot.status == 'available':
                available_slots.append(slot)
        
        # 5. Конвертация таймзон и маппинг в DTO
        result = []
        user_tz = pytz.timezone(dto.timezone)
        
        for slot in available_slots:
            # Конвертируем UTC в таймзону пользователя
            local_start = slot.start_at.astimezone(user_tz) if slot.start_at.tzinfo else pytz.utc.localize(slot.start_at).astimezone(user_tz)
            local_end = slot.end_at.astimezone(user_tz) if slot.end_at.tzinfo else pytz.utc.localize(slot.end_at).astimezone(user_tz)
            
            result.append(AvailableSlotDto(
                id=str(slot.id.value),
                start_at=slot.start_at.isoformat() if slot.start_at.tzinfo else pytz.utc.localize(slot.start_at).isoformat(),
                end_at=slot.end_at.isoformat() if slot.end_at.tzinfo else pytz.utc.localize(slot.end_at).isoformat(),
                status=slot.status,
                local_start_at=local_start.isoformat(),
                local_end_at=local_end.isoformat()
            ))
        
        return result
