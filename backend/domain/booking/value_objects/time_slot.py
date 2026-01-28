"""
TimeSlot Value Object.
"""
from datetime import datetime, timezone
from domain.shared.value_object import ValueObject
from domain.shared.exceptions import DomainError
from domain.booking.value_objects.timezone import Timezone


class TimeSlot(ValueObject):
    """Value Object для временного интервала.
    
    Бизнес-правила:
    - Конец должен быть после начала
    - Всегда хранится в UTC
    - Имеет таймзону для отображения
    """
    
    def __init__(
        self,
        start_at: datetime,
        end_at: datetime,
        timezone: Timezone
    ):
        if end_at <= start_at:
            raise DomainError("End time must be after start time")
        
        self._start_at = start_at
        self._end_at = end_at
        self._timezone = timezone
    
    def is_in_past(self) -> bool:
        """Проверяет, находится ли слот в прошлом."""
        return self._start_at < datetime.now(timezone.utc)
    
    def is_in_future(self) -> bool:
        """Проверяет, находится ли слот в будущем."""
        return self._start_at > datetime.now(timezone.utc)
    
    def hours_until_start(self) -> float:
        """Возвращает количество часов до начала."""
        now = datetime.now(timezone.utc)
        delta = self._start_at - now
        return delta.total_seconds() / 3600.0
    
    def overlaps(self, other: "TimeSlot") -> bool:
        """Проверяет пересечение с другим слотом."""
        return (self._start_at < other._end_at and 
                self._end_at > other._start_at)
    
    def duration_minutes(self) -> int:
        """Возвращает длительность в минутах."""
        delta = self._end_at - self._start_at
        return int(delta.total_seconds() / 60)
    
    @property
    def start_at(self) -> datetime:
        return self._start_at
    
    @property
    def end_at(self) -> datetime:
        return self._end_at
    
    @property
    def timezone(self) -> Timezone:
        return self._timezone
