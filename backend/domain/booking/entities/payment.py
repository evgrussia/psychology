"""
Payment Entity.
"""
from datetime import datetime, timezone
from domain.shared.aggregate_root import AggregateRoot
from domain.shared.entity_id import EntityId
from domain.shared.exceptions import DomainError
from domain.booking.value_objects.money import Money
from domain.booking.value_objects.payment_status import PaymentStatus


class PaymentId(EntityId):
    """ID платежа."""
    pass


class Payment(AggregateRoot):
    """Entity: Платеж внутри Appointment aggregate.
    
    Бизнес-правила:
    - Платеж может быть помечен как успешный только из pending статуса
    - Провайдер payment ID должен быть уникальным
    """
    
    def __init__(
        self,
        id: PaymentId,
        amount: Money,
        status: PaymentStatus,
        provider_id: str,
        provider_payment_id: str,
        created_at: datetime,
        confirmed_at: datetime | None = None
    ):
        super().__init__()
        self._id = id
        self._amount = amount
        self._status = status
        self._provider_id = provider_id
        self._provider_payment_id = provider_payment_id
        self._created_at = created_at
        self._confirmed_at = confirmed_at
    
    @classmethod
    def create(
        cls,
        amount: Money,
        provider_id: str,
        provider_payment_id: str
    ) -> "Payment":
        """Factory method для создания платежа."""
        return cls(
            id=PaymentId.generate(),
            amount=amount,
            status=PaymentStatus.PENDING,
            provider_id=provider_id,
            provider_payment_id=provider_payment_id,
            created_at=datetime.now(timezone.utc)
        )
    
    def mark_as_succeeded(self) -> None:
        """Помечает платеж как успешный."""
        if not self._status.is_pending():
            raise DomainError("Payment is not in pending state")
        
        self._status = PaymentStatus.SUCCEEDED
        self._confirmed_at = datetime.now(timezone.utc)
    
    def mark_as_failed(self, reason: str) -> None:
        """Помечает платеж как неудачный."""
        if not self._status.is_pending():
            raise DomainError("Payment is not in pending state")
        
        self._status = PaymentStatus.FAILED
    
    def is_succeeded(self) -> bool:
        """Проверяет, успешен ли платеж."""
        return self._status.is_succeeded()
    
    @property
    def id(self) -> PaymentId:
        return self._id
    
    @property
    def amount(self) -> Money:
        return self._amount
    
    @property
    def status(self) -> PaymentStatus:
        return self._status
