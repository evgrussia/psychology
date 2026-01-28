"""
Use Case: создание слота доступности.
"""
from datetime import datetime
from dateutil import parser as date_parser
from dateutil.rrule import rrule, DAILY, WEEKLY, MONTHLY
import pytz

from application.exceptions import ValidationError
from domain.booking.repositories import IAvailabilitySlotRepository, IServiceRepository
from domain.booking.aggregates.service import ServiceId
from domain.booking.entities.availability_slot import AvailabilitySlot, AvailabilitySlotId
from domain.booking.value_objects.time_slot import TimeSlot
from domain.booking.value_objects.timezone import Timezone

from application.admin.dto import CreateAvailabilitySlotDto


class CreateAvailabilitySlotUseCase:
    """Use Case для создания слота доступности."""
    
    def __init__(
        self,
        availability_slot_repository: IAvailabilitySlotRepository,
        service_repository: IServiceRepository
    ):
        self._availability_slot_repository = availability_slot_repository
        self._service_repository = service_repository
    
    async def execute(self, dto: CreateAvailabilitySlotDto) -> dict:
        """
        Создает слот(ы) доступности.
        
        Returns:
            dict с данными созданных слотов.
        
        Raises:
            ValidationError: Если данные невалидны
        """
        # 1. Валидация входных данных
        try:
            start_at = date_parser.parse(dto.start_at)
            end_at = date_parser.parse(dto.end_at)
        except Exception as e:
            raise ValidationError(f"Invalid date format: {e}")
        
        if end_at <= start_at:
            raise ValidationError("endAt must be after startAt")
        
        # Убеждаемся, что даты в UTC
        if start_at.tzinfo is None:
            start_at = pytz.UTC.localize(start_at)
        else:
            start_at = start_at.astimezone(pytz.UTC)
        
        if end_at.tzinfo is None:
            end_at = pytz.UTC.localize(end_at)
        else:
            end_at = end_at.astimezone(pytz.UTC)
        
        # 2. Получение service_id (если указан)
        service_id = None
        if dto.service_id:
            try:
                service_id = ServiceId(dto.service_id)
                service = await self._service_repository.find_by_id(service_id)
                if not service:
                    raise ValidationError(f"Service not found: {dto.service_id}")
            except Exception as e:
                raise ValidationError(f"Invalid service ID: {e}")
        
        # 3. Создание слотов
        timezone = Timezone(dto.timezone)
        slots = []
        
        if dto.recurrence:
            # Создание серии слотов
            frequency_map = {
                'daily': DAILY,
                'weekly': WEEKLY,
                'monthly': MONTHLY
            }
            frequency = frequency_map.get(dto.recurrence.get('frequency', 'daily'))
            interval = dto.recurrence.get('interval', 1)
            end_date = None
            if dto.recurrence.get('endDate'):
                end_date = date_parser.parse(dto.recurrence['endDate'])
                if end_date.tzinfo is None:
                    end_date = pytz.UTC.localize(end_date)
                else:
                    end_date = end_date.astimezone(pytz.UTC)
            
            # Генерируем даты по правилу повторения
            dates = list(rrule(
                freq=frequency,
                interval=interval,
                dtstart=start_at,
                until=end_date
            ))
            
            for date in dates:
                slot_start = date
                # Вычисляем end_at для каждого слота (сохраняем длительность)
                duration = end_at - start_at
                slot_end = slot_start + duration
                
                slot = AvailabilitySlot(
                    id=AvailabilitySlotId.generate(),
                    service_id=service_id,
                    start_at=slot_start,
                    end_at=slot_end,
                    status='available',
                    source='product'
                )
                slots.append(slot)
        else:
            # Создание одного слота
            slot = AvailabilitySlot(
                id=AvailabilitySlotId.generate(),
                service_id=service_id,
                start_at=start_at,
                end_at=end_at,
                status='available',
                source='product'
            )
            slots.append(slot)
        
        # 4. Сохранение слотов
        for slot in slots:
            await self._availability_slot_repository.save(slot)
        
        # 5. Возврат результата
        return {
            'slots_created': len(slots),
            'slot_ids': [str(slot.id.value) for slot in slots]
        }
