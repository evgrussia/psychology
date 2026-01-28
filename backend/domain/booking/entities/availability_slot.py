"""
AvailabilitySlot Entity.
"""
from datetime import datetime
from typing import Optional
from domain.shared.entity_id import EntityId
from domain.booking.aggregates.service import ServiceId
from domain.booking.value_objects.time_slot import TimeSlot


class AvailabilitySlotId(EntityId):
    """ID слота доступности."""
    pass


class AvailabilitySlot:
    """Entity для представления слота доступности.
    
    Это не агрегат, а просто представление слота из БД или внешнего источника.
    """
    
    def __init__(
        self,
        id: AvailabilitySlotId,
        service_id: Optional[ServiceId],
        start_at: datetime,
        end_at: datetime,
        status: str,  # 'available' | 'reserved' | 'blocked'
        source: str,  # 'product' | 'google_calendar'
        external_event_id: Optional[str] = None
    ):
        self._id = id
        self._service_id = service_id
        self._start_at = start_at
        self._end_at = end_at
        self._status = status
        self._source = source
        self._external_event_id = external_event_id
    
    @property
    def id(self) -> AvailabilitySlotId:
        return self._id
    
    @property
    def service_id(self) -> Optional[ServiceId]:
        return self._service_id
    
    @property
    def start_at(self) -> datetime:
        return self._start_at
    
    @property
    def end_at(self) -> datetime:
        return self._end_at
    
    @property
    def status(self) -> str:
        return self._status
    
    @property
    def source(self) -> str:
        return self._source
    
    @property
    def external_event_id(self) -> Optional[str]:
        return self._external_event_id
    
    def to_time_slot(self, timezone: "Timezone") -> TimeSlot:
        """Конвертирует слот в TimeSlot Value Object."""
        from domain.booking.value_objects.timezone import Timezone
        return TimeSlot(
            start_at=self._start_at,
            end_at=self._end_at,
            timezone=timezone
        )
