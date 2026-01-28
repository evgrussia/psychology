"""
PaymentStatus Value Object.
"""
from domain.shared.value_object import ValueObject


class PaymentStatus(ValueObject):
    """Value Object для статуса платежа."""
    
    def __init__(self, value: str):
        valid_statuses = ['pending', 'succeeded', 'failed', 'refunded']
        if value not in valid_statuses:
            raise ValueError(f"Invalid payment status: {value}")
        self._value = value
    
    def is_pending(self) -> bool:
        return self._value == 'pending'
    
    def is_succeeded(self) -> bool:
        return self._value == 'succeeded'
    
    def is_failed(self) -> bool:
        return self._value == 'failed'
    
    @property
    def value(self) -> str:
        return self._value
    
    # Предопределенные статусы
    PENDING = None
    SUCCEEDED = None
    FAILED = None
    REFUNDED = None


PaymentStatus.PENDING = PaymentStatus('pending')
PaymentStatus.SUCCEEDED = PaymentStatus('succeeded')
PaymentStatus.FAILED = PaymentStatus('failed')
PaymentStatus.REFUNDED = PaymentStatus('refunded')
