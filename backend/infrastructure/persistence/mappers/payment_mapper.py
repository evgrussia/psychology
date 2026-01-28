"""
Mapper для преобразования Payment Domain Entity ↔ DB Record.
"""
from typing import Dict, Any
from domain.payments.aggregates.payment import Payment, PaymentId
from domain.payments.value_objects.payment_status import PaymentStatus
from domain.payments.value_objects.payment_provider import PaymentProvider
from domain.booking.value_objects.money import Money
from domain.booking.value_objects.currency import Currency
from infrastructure.persistence.django_models.booking import PaymentModel


class PaymentMapper:
    """Mapper для преобразования Payment Domain Entity ↔ DB Record."""
    
    @staticmethod
    def to_domain(record: PaymentModel) -> Payment:
        """Преобразовать DB Record → Domain Entity."""
        # Восстановление Value Objects
        currency = Currency(record.currency)
        amount = Money(
            amount=record.amount,
            currency=currency
        )
        
        # Создаем Value Objects напрямую
        provider = PaymentProvider(record.provider_id)
        status = PaymentStatus(record.status)
        
        # Восстановление агрегата через конструктор
        return Payment(
            id=PaymentId(record.id),
            amount=amount,
            status=status,
            provider=provider,
            provider_payment_id=record.provider_payment_id,
            created_at=record.created_at,
            confirmed_at=record.confirmed_at,
            failure_reason=record.failure_reason
        )
    
    @staticmethod
    def to_persistence(payment: Payment) -> Dict[str, Any]:
        """Преобразовать Domain Entity → DB Record."""
        return {
            'id': payment.id.value,
            'appointment_id': None,  # Для Payment aggregate appointment_id не используется
            'amount': payment.amount.amount,
            'currency': payment.amount.currency.code,
            'provider_id': payment.provider.value,
            'provider_payment_id': payment.provider_payment_id,
            'status': payment.status.value,
            'failure_reason': payment.failure_reason,
            'confirmed_at': payment.confirmed_at,
        }
