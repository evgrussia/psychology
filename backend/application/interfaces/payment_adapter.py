from abc import ABC, abstractmethod
from typing import Optional, Dict, Any
from domain.booking.value_objects.money import Money


class IPaymentAdapter(ABC):
    """Интерфейс платежного адаптера (Anti-Corruption Layer)."""
    
    @abstractmethod
    async def create_payment_intent(
        self,
        amount: Money,
        description: str,
        return_url: str,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Создать намерение оплаты."""
        pass
    
    @abstractmethod
    async def get_payment_status(self, provider_payment_id: str) -> Dict[str, Any]:
        """Получить статус платежа."""
        pass
    
    @abstractmethod
    async def cancel_payment(self, provider_payment_id: str) -> bool:
        """Отменить платеж."""
        pass
    
    @abstractmethod
    async def create_refund(
        self,
        payment_id: str,
        amount: Money,
        reason: Optional[str] = None
    ) -> Dict[str, Any]:
        """Создать возврат средств."""
        pass
    
    @abstractmethod
    def verify_webhook_signature(self, request_body: bytes, signature: str) -> bool:
        """Проверить подпись webhook."""
        pass
