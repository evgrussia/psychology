"""
HTTP клиент для работы с ЮKassa API.
"""
import httpx
from typing import Dict, Any, Optional
from dataclasses import dataclass
from infrastructure.exceptions import InfrastructureError


@dataclass
class YooKassaConfig:
    """Конфигурация ЮKassa."""
    shop_id: str
    secret_key: str
    api_url: str = "https://api.yookassa.ru/v3"
    test_mode: bool = False


class YooKassaClient:
    """HTTP клиент для работы с ЮKassa API."""
    
    def __init__(self, config: YooKassaConfig):
        self.config = config
        self._client = httpx.AsyncClient(
            base_url=config.api_url,
            auth=(config.shop_id, config.secret_key),
            timeout=30.0
        )
    
    async def create_payment(
        self,
        amount: float,
        currency: str,
        description: str,
        return_url: str,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Создать платеж в ЮKassa."""
        payload = {
            "amount": {
                "value": str(amount),
                "currency": currency
            },
            "confirmation": {
                "type": "redirect",
                "return_url": return_url
            },
            "description": description,
            "metadata": metadata or {}
        }
        
        try:
            response = await self._client.post("/payments", json=payload)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            raise InfrastructureError(f"Failed to create payment in YooKassa: {e}") from e
    
    async def get_payment(self, payment_id: str) -> Dict[str, Any]:
        """Получить информацию о платеже."""
        try:
            response = await self._client.get(f"/payments/{payment_id}")
            response.raise_for_status()
            return response.json()
        except Exception as e:
            raise InfrastructureError(f"Failed to get payment from YooKassa: {e}") from e
    
    async def cancel_payment(self, payment_id: str) -> Dict[str, Any]:
        """Отменить платеж."""
        try:
            response = await self._client.post(f"/payments/{payment_id}/cancel")
            response.raise_for_status()
            return response.json()
        except Exception as e:
            raise InfrastructureError(f"Failed to cancel payment in YooKassa: {e}") from e
    
    async def create_refund(
        self,
        payment_id: str,
        amount: float,
        currency: str,
        reason: Optional[str] = None
    ) -> Dict[str, Any]:
        """Создать возврат средств для платежа."""
        payload = {
            "amount": {
                "value": str(amount),
                "currency": currency
            }
        }
        if reason:
            payload["description"] = reason
        
        try:
            response = await self._client.post(f"/refunds", json=payload)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            raise InfrastructureError(f"Failed to create refund in YooKassa: {e}") from e
    
    async def close(self):
        """Закрыть HTTP клиент."""
        await self._client.aclose()
