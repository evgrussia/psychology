"""
Django ORM реализация IPaymentRepository.
"""
from typing import Optional
from asgiref.sync import sync_to_async
from django.db import transaction

from domain.payments.aggregates.payment import Payment, PaymentId
from domain.payments.repositories import IPaymentRepository
from infrastructure.persistence.django_models.booking import PaymentModel
from infrastructure.persistence.mappers.payment_mapper import PaymentMapper
from application.interfaces.event_bus import IEventBus
from infrastructure.exceptions import InfrastructureError


class PostgresPaymentRepository(IPaymentRepository):
    """Реализация IPaymentRepository для PostgreSQL через Django ORM."""
    
    def __init__(self, event_bus: IEventBus):
        self._event_bus = event_bus
    
    async def find_by_id(self, id: PaymentId) -> Optional[Payment]:
        """Найти Payment по ID."""
        try:
            record = await PaymentModel.objects.aget(id=id.value)
            return await sync_to_async(PaymentMapper.to_domain)(record)
        except PaymentModel.DoesNotExist:
            return None
        except Exception as e:
            raise InfrastructureError(f"Failed to find payment: {e}") from e
    
    async def find_by_provider_payment_id(self, provider_payment_id: str) -> Optional[Payment]:
        """Найти Payment по provider_payment_id (для идемпотентности webhooks)."""
        try:
            record = await PaymentModel.objects.aget(provider_payment_id=provider_payment_id)
            return await sync_to_async(PaymentMapper.to_domain)(record)
        except PaymentModel.DoesNotExist:
            return None
        except Exception as e:
            raise InfrastructureError(f"Failed to find payment by provider_payment_id: {e}") from e
    
    async def save(self, payment: Payment) -> None:
        """Сохранить Payment (создать или обновить)."""
        try:
            await sync_to_async(self._save_sync)(payment)
            
            # Публикация Domain Events
            domain_events = payment.get_domain_events()
            if domain_events:
                await self._event_bus.publish_all(domain_events)
                payment.clear_domain_events()
        except Exception as e:
            raise InfrastructureError(f"Failed to save payment: {e}") from e
    
    @transaction.atomic
    def _save_sync(self, payment: Payment) -> None:
        """Синхронная версия save."""
        record_data = PaymentMapper.to_persistence(payment)
        
        PaymentModel.objects.update_or_create(
            id=record_data['id'],
            defaults=record_data
        )
