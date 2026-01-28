"""
Обработчик webhooks от ЮKassa.
"""
import hmac
import hashlib
import json
from typing import Dict, Any
from django.http import HttpRequest, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from asgiref.sync import sync_to_async

from application.interfaces.payment_adapter import IPaymentAdapter as YooKassaAdapter
from application.interfaces.event_bus import IEventBus
from infrastructure.persistence.django_models.booking import WebhookEventModel
from infrastructure.persistence.repositories.payments.payment_repository import PostgresPaymentRepository
from infrastructure.exceptions import InfrastructureError


class YooKassaWebhookHandler:
    """Обработчик webhooks от ЮKassa."""
    
    def __init__(
        self,
        adapter: YooKassaAdapter,
        event_bus: IEventBus,
        payment_repository: PostgresPaymentRepository,
        secret_key: str
    ):
        self._adapter = adapter
        self._event_bus = event_bus
        self._payment_repository = payment_repository
        self._secret_key = secret_key
    
    def verify_signature(self, request_body: bytes, signature: str) -> bool:
        """Проверить подпись webhook от ЮKassa.
        
        Примечание: ЮKassa использует SHA-256 HMAC для подписи webhook'ов.
        Подпись передается в заголовке X-YooMoney-Signature.
        """
        if not signature:
            return False
        
        expected_signature = hmac.new(
            self._secret_key.encode('utf-8'),
            request_body,
            hashlib.sha256
        ).hexdigest()
        
        return hmac.compare_digest(expected_signature, signature)
    
    @csrf_exempt
    @require_POST
    async def handle_webhook(self, request: HttpRequest) -> HttpResponse:
        """Обработать webhook от ЮKassa."""
        # Получаем тело запроса
        request_body = request.body
        
        # Валидация подписи
        signature = request.headers.get('X-YooMoney-Signature', '')
        if not self.verify_signature(request_body, signature):
            return HttpResponse(status=401, content="Invalid signature")
        
        # Парсинг payload
        try:
            payload = json.loads(request_body.decode('utf-8'))
            event_type = payload.get('event')
            payment_data = payload.get('object', {})
        except (json.JSONDecodeError, KeyError, UnicodeDecodeError) as e:
            return HttpResponse(status=400, content=f"Invalid payload: {e}")
        
        if not event_type or not payment_data:
            return HttpResponse(status=400, content="Missing event or object")
        
        # Идемпотентность: проверяем, не обрабатывали ли мы уже этот webhook
        provider_payment_id = payment_data.get('id')
        if not provider_payment_id:
            return HttpResponse(status=400, content="Missing payment ID")
        
        if await self._is_already_processed(provider_payment_id, event_type):
            return HttpResponse(status=200, content="Already processed")  # Идемпотентность
        
        # Обработка события
        try:
            if event_type == 'payment.succeeded':
                await self._handle_payment_succeeded(payment_data)
            elif event_type == 'payment.canceled':
                await self._handle_payment_canceled(payment_data)
            elif event_type == 'payment.waiting_for_capture':
                await self._handle_payment_waiting(payment_data)
            else:
                # Игнорируем неизвестные события, но отмечаем как обработанные
                pass
            
            # Отмечаем как обработанное
            await self._mark_as_processed(provider_payment_id, event_type)
            
            return HttpResponse(status=200, content="OK")
        except Exception as e:
            # Логируем ошибку, но возвращаем 200 (чтобы ЮKassa не повторял)
            # В production: отправляем в систему мониторинга
            # TODO: добавить логирование
            return HttpResponse(status=200, content=f"Error processed: {e}")
    
    async def _handle_payment_succeeded(self, payment_data: Dict[str, Any]) -> None:
        """Обработать событие успешной оплаты."""
        provider_payment_id = payment_data.get('id')
        if not provider_payment_id:
            raise InfrastructureError("Payment ID not found in webhook data")
        
        # Находим платеж по provider_payment_id
        payment = await self._payment_repository.find_by_provider_payment_id(provider_payment_id)
        if not payment:
            raise InfrastructureError(f"Payment not found for provider_payment_id: {provider_payment_id}")
        
        # Обновляем статус платежа
        payment.mark_as_succeeded()
        
        # Сохраняем платеж (это также опубликует PaymentSucceededEvent через event_bus)
        await self._payment_repository.save(payment)
    
    async def _handle_payment_canceled(self, payment_data: Dict[str, Any]) -> None:
        """Обработать событие отмены платежа."""
        provider_payment_id = payment_data.get('id')
        if not provider_payment_id:
            raise InfrastructureError("Payment ID not found in webhook data")
        
        # Находим платеж по provider_payment_id
        payment = await self._payment_repository.find_by_provider_payment_id(provider_payment_id)
        if not payment:
            raise InfrastructureError(f"Payment not found for provider_payment_id: {provider_payment_id}")
        
        # Обновляем статус платежа
        cancellation_reason = payment_data.get('cancellation_details', {}).get('reason', 'Canceled by user')
        payment.mark_as_failed(cancellation_reason)
        
        # Сохраняем платеж
        await self._payment_repository.save(payment)
    
    async def _handle_payment_waiting(self, payment_data: Dict[str, Any]) -> None:
        """Обработать событие ожидания подтверждения платежа."""
        # Для Release 1: просто логируем, статус уже должен быть pending
        # В будущем можно добавить логику для обработки этого состояния
        pass
    
    async def _is_already_processed(self, provider_payment_id: str, event_type: str) -> bool:
        """Проверить, был ли webhook уже обработан (идемпотентность)."""
        return await WebhookEventModel.objects.filter(
            provider_payment_id=provider_payment_id,
            event_type=event_type
        ).aexists()
    
    async def _mark_as_processed(self, provider_payment_id: str, event_type: str) -> None:
        """Отметить webhook как обработанный."""
        await WebhookEventModel.objects.acreate(
            provider_payment_id=provider_payment_id,
            event_type=event_type
        )
