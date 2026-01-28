import pytest
import hmac
import hashlib
import base64
import json
from rest_framework import status

@pytest.mark.django_db
class TestWebhookSecurity:
    def test_yookassa_webhook_valid_signature(self, client, settings):
        """Проверка webhook с валидной подписью."""
        secret_key = "test_secret_key"
        settings.YOOKASSA_SECRET_KEY = secret_key
        settings.DEBUG = False
        
        payload = {
            "event": "payment.succeeded",
            "object": {
                "id": "22d62fca-000f-5000-8000-11528c06d96a",
                "status": "succeeded",
                "amount": {"value": "100.00", "currency": "RUB"}
            }
        }
        body = json.dumps(payload).encode('utf-8')
        
        # Генерируем подпись (YooKassa использует hex-encoded HMAC-SHA256)
        signature = hmac.new(
            secret_key.encode('utf-8'),
            body,
            hashlib.sha256
        ).hexdigest()
        
        response = client.post(
            '/api/v1/webhooks/yookassa/',
            data=payload,
            content_type='application/json',
            HTTP_X_YOOMONEY_SIGNATURE=signature
        )
        
        # Ожидаем 200 (даже если платеж не найден, подпись валидна)
        assert response.status_code == status.HTTP_200_OK

    def test_yookassa_webhook_invalid_signature(self, client, settings):
        """Проверка webhook с невалидной подписью."""
        secret_key = "test_secret_key"
        settings.YOOKASSA_SECRET_KEY = secret_key
        settings.DEBUG = False
        
        payload = {"event": "payment.succeeded"}
        signature = "invalid_signature"
        
        response = client.post(
            '/api/v1/webhooks/yookassa/',
            data=payload,
            content_type='application/json',
            HTTP_X_YOOMONEY_SIGNATURE=signature
        )
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_yookassa_webhook_missing_signature(self, client, settings):
        """Проверка webhook без подписи."""
        settings.DEBUG = False
        # Убеждаемся что ключ есть, иначе вернет True в DEBUG=True (но мы поставили False)
        settings.YOOKASSA_SECRET_KEY = "some_key"
        
        payload = {"event": "payment.succeeded"}
        response = client.post(
            '/api/v1/webhooks/yookassa/',
            data=payload,
            content_type='application/json'
        )
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
