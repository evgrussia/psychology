"""
Payments Domain Events.
"""
from __future__ import annotations
from dataclasses import dataclass
from domain.shared.domain_event import DomainEvent
from domain.booking.value_objects.money import Money
from domain.payments.value_objects.payment_provider import PaymentProvider


@dataclass(frozen=True, kw_only=True)
class PaymentIntentCreatedEvent(DomainEvent):
    """Событие создания платежного намерения."""
    payment_id: "PaymentId"
    amount: Money
    provider: PaymentProvider
    
    @property
    def aggregate_id(self) -> str:
        return self.payment_id.value
    
    @property
    def event_name(self) -> str:
        return "PaymentIntentCreated"


@dataclass(frozen=True, kw_only=True)
class PaymentSucceededEvent(DomainEvent):
    """Событие успешного платежа."""
    payment_id: "PaymentId"
    amount: Money
    
    @property
    def aggregate_id(self) -> str:
        return self.payment_id.value
    
    @property
    def event_name(self) -> str:
        return "PaymentSucceeded"


@dataclass(frozen=True, kw_only=True)
class PaymentFailedEvent(DomainEvent):
    """Событие неудачного платежа."""
    payment_id: "PaymentId"
    reason: str
    
    @property
    def aggregate_id(self) -> str:
        return self.payment_id.value
    
    @property
    def event_name(self) -> str:
        return "PaymentFailed"
