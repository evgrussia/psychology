"""
Unit тесты для YooKassaWebhookHandler.
"""
import pytest
import hmac
import hashlib
import json
from unittest.mock import Mock, AsyncMock, MagicMock
from django.http import HttpRequest, HttpResponse
from infrastructure.external.payments.yookassa_webhook_handler import YooKassaWebhookHandler
from infrastructure.events.in_memory_event_bus import InMemoryEventBus


@pytest.mark.django_db
class TestYooKassaWebhookHandler:
    """Unit тесты для YooKassaWebhookHandler."""
    
    @pytest.fixture
    def secret_key(self):
        return "test-secret-key"
    
    @pytest.fixture
    def adapter(self):
        return Mock()
    
    @pytest.fixture
    def event_bus(self):
        return InMemoryEventBus()
    
    @pytest.fixture
    def payment_repository(self):
        repo = Mock()
        repo.find_by_provider_payment_id = AsyncMock()
        repo.save = AsyncMock()
        return repo
    
    @pytest.fixture
    def handler(self, adapter, event_bus, payment_repository, secret_key):
        return YooKassaWebhookHandler(
            adapter=adapter,
            event_bus=event_bus,
            payment_repository=payment_repository,
            secret_key=secret_key
        )
    
    def test_verify_signature_valid(self, handler):
        """Тест проверки валидной подписи."""
        request_body = b'{"event": "payment.succeeded", "object": {"id": "test-id"}}'
        signature = hmac.new(
            handler._secret_key.encode('utf-8'),
            request_body,
            hashlib.sha256
        ).hexdigest()
        
        result = handler.verify_signature(request_body, signature)
        
        assert result is True
    
    def test_verify_signature_invalid(self, handler):
        """Тест проверки невалидной подписи."""
        request_body = b'{"event": "payment.succeeded", "object": {"id": "test-id"}}'
        invalid_signature = "invalid-signature"
        
        result = handler.verify_signature(request_body, invalid_signature)
        
        assert result is False
    
    def test_verify_signature_empty(self, handler):
        """Тест проверки пустой подписи."""
        request_body = b'{"event": "payment.succeeded"}'
        
        result = handler.verify_signature(request_body, "")
        
        assert result is False
    
    @pytest.mark.asyncio
    async def test_handle_webhook_invalid_signature(self, handler):
        """Тест обработки webhook с невалидной подписью."""
        # Создаем правильный мок request
        request = MagicMock()
        request.body = b'{"event": "payment.succeeded"}'
        request.headers = MagicMock()
        request.headers.get = Mock(return_value='invalid-signature')
        
        # Вызываем метод напрямую, обходя декораторы через __wrapped__
        # Декораторы применяются в обратном порядке, поэтому нужно пройти через оба
        method = handler.handle_webhook
        # Получаем оригинальную функцию после всех декораторов
        while hasattr(method, '__wrapped__'):
            method = method.__wrapped__
        
        response = await method(handler, request)
        
        assert response.status_code == 401
    
    @pytest.mark.asyncio
    async def test_handle_webhook_invalid_json(self, handler):
        """Тест обработки webhook с невалидным JSON."""
        request_body = b'invalid json'
        signature = hmac.new(
            handler._secret_key.encode('utf-8'),
            request_body,
            hashlib.sha256
        ).hexdigest()
        
        # Создаем правильный мок request
        request = MagicMock()
        request.body = request_body
        request.headers = MagicMock()
        request.headers.get = Mock(return_value=signature)
        
        # Вызываем метод напрямую, обходя декораторы через __wrapped__
        method = handler.handle_webhook
        while hasattr(method, '__wrapped__'):
            method = method.__wrapped__
        
        response = await method(handler, request)
        
        assert response.status_code == 400
