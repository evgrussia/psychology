"""
Booking Domain Events.
"""
from __future__ import annotations
from dataclasses import dataclass
from typing import Optional
from domain.shared.domain_event import DomainEvent
from domain.booking.value_objects.time_slot import TimeSlot
from domain.booking.value_objects.money import Money


@dataclass(frozen=True, kw_only=True)
class AppointmentCreatedEvent(DomainEvent):
    """Событие создания встречи."""
    appointment_id: "AppointmentId"
    service_id: "ServiceId"
    slot: TimeSlot
    deep_link_id: Optional[str] = None
    
    @property
    def aggregate_id(self) -> str:
        return self.appointment_id.value
    
    @property
    def event_name(self) -> str:
        return "AppointmentCreated"


@dataclass(frozen=True, kw_only=True)
class AppointmentConfirmedEvent(DomainEvent):
    """Событие подтверждения встречи."""
    appointment_id: "AppointmentId"
    client_id: "UserId"
    slot: TimeSlot
    service_slug: str
    paid_amount: Money
    
    @property
    def aggregate_id(self) -> str:
        return self.appointment_id.value
    
    @property
    def event_name(self) -> str:
        return "AppointmentConfirmed"


@dataclass(frozen=True, kw_only=True)
class AppointmentCanceledEvent(DomainEvent):
    """Событие отмены встречи."""
    appointment_id: "AppointmentId"
    reason: str
    refund_amount: Optional[Money] = None
    
    @property
    def aggregate_id(self) -> str:
        return self.appointment_id.value
    
    @property
    def event_name(self) -> str:
        return "AppointmentCanceled"


@dataclass(frozen=True, kw_only=True)
class AppointmentRescheduledEvent(DomainEvent):
    """Событие переноса встречи."""
    appointment_id: "AppointmentId"
    old_slot: TimeSlot
    new_slot: TimeSlot
    
    @property
    def aggregate_id(self) -> str:
        return self.appointment_id.value
    
    @property
    def event_name(self) -> str:
        return "AppointmentRescheduled"


@dataclass(frozen=True, kw_only=True)
class AppointmentNoShowEvent(DomainEvent):
    """Событие неявки на встречу."""
    appointment_id: "AppointmentId"
    client_id: "UserId"
    
    @property
    def aggregate_id(self) -> str:
        return self.appointment_id.value
    
    @property
    def event_name(self) -> str:
        return "AppointmentNoShow"
