"""
Payment Aggregate Root for Payments Context.
"""
from datetime import datetime, timezone
from typing import Optional
from domain.shared.aggregate_root import AggregateRoot
from domain.shared.entity_id import EntityId
from domain.shared.exceptions import DomainError
from domain.booking.value_objects.money import Money
from domain.payments.value_objects.payment_status import PaymentStatus
from domain.payments.value_objects.payment_provider import PaymentProvider
from domain.payments.domain_events import (
    PaymentIntentCreatedEvent,
    PaymentSucceededEvent,
    PaymentFailedEvent
)


class PaymentId(EntityId):
    """ID платежа."""
    pass


class Payment(AggregateRoot):
    """Aggregate Root для платежа.
    
    Бизнес-правила:
    - Платеж создается как Intent, затем переходит в Pending после создания в провайдере
    - Подтверждение платежа происходит только через webhook провайдера
    - Идемпотентность по provider_payment_id
    """
    
    def __init__(
        self,
        id: PaymentId,
        amount: Money,
        status: PaymentStatus,
        provider: PaymentProvider,
        provider_payment_id: str,
        created_at: datetime,
        confirmed_at: Optional[datetime] = None,
        failure_reason: Optional[str] = None
    ):
        super().__init__()
        self._id = id
        self._amount = amount
        self._status = status
        self._provider = provider
        self._provider_payment_id = provider_payment_id
        self._created_at = created_at
        self._confirmed_at = confirmed_at
        self._failure_reason = failure_reason
    
    @classmethod
    def create_intent(
        cls,
        amount: Money,
        provider: PaymentProvider
    ) -> "Payment":
        """Factory method для создания платежного намерения."""
        payment = cls(
            id=PaymentId.generate(),
            amount=amount,
            status=PaymentStatus.INTENT,
            provider=provider,
            provider_payment_id="",  # Будет установлен после создания в провайдере
            created_at=datetime.now(timezone.utc)
        )
        
        payment.add_domain_event(
            PaymentIntentCreatedEvent(
                payment_id=payment._id,
                amount=amount,
                provider=provider
            )
        )
        
        return payment
    
    def mark_as_pending(self, provider_payment_id: str) -> None:
        """Помечает платеж как pending после создания в провайдере."""
        if not self._status.value == 'intent':
            raise DomainError("Payment is not in intent state")
        
        self._status = PaymentStatus.PENDING
        self._provider_payment_id = provider_payment_id
    
    def mark_as_succeeded(self) -> None:
        """Помечает платеж как успешный (через webhook)."""
        if not self._status.value == 'pending':
            raise DomainError("Payment is not in pending state")
        
        self._status = PaymentStatus.SUCCEEDED
        self._confirmed_at = datetime.now(timezone.utc)
        
        self.add_domain_event(
            PaymentSucceededEvent(
                payment_id=self._id,
                amount=self._amount
            )
        )
    
    def mark_as_failed(self, reason: str) -> None:
        """Помечает платеж как неудачный."""
        if not self._status.value == 'pending':
            raise DomainError("Payment is not in pending state")
        
        self._status = PaymentStatus.FAILED
        self._failure_reason = reason
        
        self.add_domain_event(
            PaymentFailedEvent(
                payment_id=self._id,
                reason=reason
            )
        )
    
    @property
    def id(self) -> PaymentId:
        return self._id
    
    @property
    def amount(self) -> Money:
        return self._amount
    
    @property
    def status(self) -> PaymentStatus:
        return self._status
    
    @property
    def provider(self) -> PaymentProvider:
        return self._provider
    
    @property
    def provider_payment_id(self) -> str:
        return self._provider_payment_id
    
    @property
    def confirmed_at(self) -> Optional[datetime]:
        return self._confirmed_at
    
    @property
    def failure_reason(self) -> Optional[str]:
        return self._failure_reason
    
    def is_succeeded(self) -> bool:
        """Проверяет, успешен ли платеж."""
        return self._status.value == 'succeeded'
