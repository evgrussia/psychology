"""
Payments Repository Interfaces.
"""
from abc import ABC, abstractmethod
from typing import Optional
from domain.payments.aggregates.payment import Payment, PaymentId


class IPaymentRepository(ABC):
    """Интерфейс репозитория платежей."""
    
    @abstractmethod
    async def find_by_id(self, id: PaymentId) -> Optional[Payment]:
        """Находит платеж по ID."""
        pass
    
    @abstractmethod
    async def find_by_provider_payment_id(
        self,
        provider_payment_id: str
    ) -> Optional[Payment]:
        """Находит платеж по ID провайдера (для идемпотентности)."""
        pass
    
    @abstractmethod
    async def save(self, payment: Payment) -> None:
        """Сохраняет платеж."""
        pass


class IWebhookEventRepository(ABC):
    """Интерфейс репозитория webhook событий."""
    
    @abstractmethod
    async def is_processed(self, provider_payment_id: str, event_type: str) -> bool:
        """Проверяет, был ли уже обработан этот webhook."""
        pass
    
    @abstractmethod
    async def mark_as_processed(self, provider_payment_id: str, event_type: str) -> None:
        """Отмечает webhook как обработанный."""
        pass
