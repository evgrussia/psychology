"""
PaymentProvider Value Object.
"""
from domain.shared.value_object import ValueObject


class PaymentProvider(ValueObject):
    """Value Object для провайдера платежей."""
    
    def __init__(self, value: str):
        valid_providers = ['yookassa', 'stripe', 'paypal']
        if value not in valid_providers:
            raise ValueError(f"Invalid payment provider: {value}")
        self._value = value
    
    @property
    def value(self) -> str:
        return self._value
    
    # Предопределенные провайдеры
    YOOKASSA = None
    STRIPE = None
    PAYPAL = None


PaymentProvider.YOOKASSA = PaymentProvider('yookassa')
PaymentProvider.STRIPE = PaymentProvider('stripe')
PaymentProvider.PAYPAL = PaymentProvider('paypal')
