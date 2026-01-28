"""
PaymentStatus Value Object for Payments Context.
"""
from domain.shared.value_object import ValueObject


class PaymentStatus(ValueObject):
    """Value Object для статуса платежа."""
    
    def __init__(self, value: str):
        valid_statuses = ['intent', 'pending', 'succeeded', 'failed', 'refunded']
        if value not in valid_statuses:
            raise ValueError(f"Invalid payment status: {value}")
        self._value = value
    
    @property
    def value(self) -> str:
        return self._value
    
    # Предопределенные статусы
    INTENT = None
    PENDING = None
    SUCCEEDED = None
    FAILED = None
    REFUNDED = None


PaymentStatus.INTENT = PaymentStatus('intent')
PaymentStatus.PENDING = PaymentStatus('pending')
PaymentStatus.SUCCEEDED = PaymentStatus('succeeded')
PaymentStatus.FAILED = PaymentStatus('failed')
PaymentStatus.REFUNDED = PaymentStatus('refunded')
