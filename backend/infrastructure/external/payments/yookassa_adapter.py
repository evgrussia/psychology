"""
Адаптер для интеграции с ЮKassa (Anti-Corruption Layer).
"""
import hmac
import hashlib
import json
from typing import Optional, Dict, Any
from domain.booking.value_objects.money import Money
from application.interfaces.payment_adapter import IPaymentAdapter
from infrastructure.external.payments.yookassa_client import YooKassaClient
from infrastructure.exceptions import InfrastructureError


class YooKassaAdapter(IPaymentAdapter):
    """Адаптер для интеграции с ЮKassa (Anti-Corruption Layer)."""
    
    def __init__(self, client: YooKassaClient, webhook_secret_key: Optional[str] = None):
        self._client = client
        self._webhook_secret_key = webhook_secret_key
    
    async def create_payment_intent(
        self,
        amount: Money,
        description: str,
        return_url: str,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Создать намерение оплаты в ЮKassa."""
        try:
            result = await self._client.create_payment(
                amount=float(amount.amount),
                currency=amount.currency.code,
                description=description,
                return_url=return_url,
                metadata=metadata
            )
            
            # Преобразование ответа ЮKassa в доменный формат
            return {
                'payment_id': result['id'],
                'status': result['status'],
                'confirmation_url': result.get('confirmation', {}).get('confirmation_url'),
            }
        except Exception as e:
            raise InfrastructureError(f"Failed to create payment in YooKassa: {e}") from e
    
    async def get_payment_status(self, provider_payment_id: str) -> Dict[str, Any]:
        """Получить статус платежа из ЮKassa."""
        try:
            result = await self._client.get_payment(provider_payment_id)
            
            return {
                'payment_id': result['id'],
                'status': result['status'],
                'amount': float(result['amount']['value']),
                'currency': result['amount']['currency'],
                'paid': result.get('paid', False),
                'cancelled': result.get('cancelled', False),
            }
        except Exception as e:
            raise InfrastructureError(f"Failed to get payment status from YooKassa: {e}") from e
    
    async def cancel_payment(self, provider_payment_id: str) -> bool:
        """Отменить платеж в ЮKassa."""
        try:
            await self._client.cancel_payment(provider_payment_id)
            return True
        except Exception as e:
            raise InfrastructureError(f"Failed to cancel payment in YooKassa: {e}") from e
    
    async def create_refund(
        self,
        payment_id: str,
        amount: Money,
        reason: Optional[str] = None
    ) -> Dict[str, Any]:
        """Создать возврат средств для платежа.
        
        Args:
            payment_id: ID платежа в ЮKassa
            amount: Сумма возврата
            reason: Причина возврата (опционально)
        
        Returns:
            dict с данными возврата
        """
        try:
            result = await self._client.create_refund(
                payment_id=payment_id,
                amount=float(amount.amount),
                currency=amount.currency.code,
                reason=reason
            )
            
            return {
                'refund_id': result.get('id'),
                'status': result.get('status'),
                'amount': float(result.get('amount', {}).get('value', 0)),
                'currency': result.get('amount', {}).get('currency', 'RUB')
            }
        except Exception as e:
            raise InfrastructureError(f"Failed to create refund in YooKassa: {e}") from e
    
    def verify_webhook_signature(self, request_body: bytes, signature: str) -> bool:
        """Проверить подпись webhook от ЮKassa.
        
        Args:
            request_body: Тело запроса в байтах
            signature: Подпись из заголовка X-YooMoney-Signature
        
        Returns:
            True если подпись валидна, иначе False
        """
        if not self._webhook_secret_key:
            raise InfrastructureError("Webhook secret key is not configured")
        
        if not signature:
            return False
        
        # ЮKassa использует SHA-256 HMAC для подписи webhook'ов
        expected_signature = hmac.new(
            self._webhook_secret_key.encode('utf-8'),
            request_body,
            hashlib.sha256
        ).hexdigest()
        
        return hmac.compare_digest(expected_signature, signature)
