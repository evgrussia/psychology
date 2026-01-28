"""
Service Aggregate Root.
"""
from typing import Optional
from domain.shared.aggregate_root import AggregateRoot
from domain.shared.entity_id import EntityId
from domain.booking.value_objects.money import Money
from domain.booking.value_objects.appointment_format import AppointmentFormat


class ServiceId(EntityId):
    """ID услуги."""
    pass


class Service(AggregateRoot):
    """Aggregate Root для услуги.
    
    Бизнес-правила:
    - Услуга имеет цену и поддерживает форматы
    - Правила отмены и переноса определяются часами до начала
    """
    
    def __init__(
        self,
        id: ServiceId,
        slug: str,
        name: str,
        description: str,
        price: Money,
        duration_minutes: int,
        supported_formats: list[AppointmentFormat],
        cancel_free_hours: int,
        cancel_partial_hours: int,
        reschedule_min_hours: int,
        deposit_amount: Optional[Money] = None
    ):
        super().__init__()
        self._id = id
        self._slug = slug
        self._name = name
        self._description = description
        self._price = price
        self._duration_minutes = duration_minutes
        self._supported_formats = supported_formats
        self._cancel_free_hours = cancel_free_hours
        self._cancel_partial_hours = cancel_partial_hours
        self._reschedule_min_hours = reschedule_min_hours
        self._deposit_amount = deposit_amount
    
    def is_available_for(self, format: AppointmentFormat) -> bool:
        """Проверяет, поддерживает ли услуга формат."""
        return format in self._supported_formats
    
    @property
    def id(self) -> ServiceId:
        return self._id
    
    @property
    def slug(self) -> str:
        return self._slug
    
    @property
    def name(self) -> str:
        return self._name
    
    @property
    def price(self) -> Money:
        return self._price
    
    @property
    def deposit_amount(self) -> Optional[Money]:
        return self._deposit_amount
    
    @property
    def cancel_free_hours(self) -> int:
        return self._cancel_free_hours
    
    @property
    def cancel_partial_hours(self) -> int:
        return self._cancel_partial_hours
    
    @property
    def reschedule_min_hours(self) -> int:
        return self._reschedule_min_hours
    
    @property
    def duration_minutes(self) -> int:
        return self._duration_minutes
    
    @property
    def supported_formats(self) -> list[AppointmentFormat]:
        return list(self._supported_formats)
    
    @property
    def description(self) -> str:
        return self._description
