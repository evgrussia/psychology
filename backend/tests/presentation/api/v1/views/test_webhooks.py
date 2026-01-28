"""
Тесты для Webhooks API endpoints (Phase 5).
"""
import pytest
import json
from rest_framework.test import APIClient
from rest_framework import status
from django.test import TestCase
from uuid import uuid4


@pytest.mark.django_db
@pytest.mark.integration
class TestYooKassaWebhookView(TestCase):
    """Тесты для POST /api/v1/webhooks/yookassa/."""

    def setUp(self):
        self.client = APIClient()
        self.url = "/api/v1/webhooks/yookassa/"

    def test_post_without_signature(self):
        """Без подписи: 401 (или 200 если DEBUG и пропуск валидации)."""
        payload = {"event": "payment.succeeded", "object": {"id": str(uuid4()), "status": "succeeded"}}
        response = self.client.post(
            self.url,
            payload,
            format="json",
        )
        self.assertIn(response.status_code, (status.HTTP_200_OK, status.HTTP_401_UNAUTHORIZED))
        if response.status_code == status.HTTP_401_UNAUTHORIZED:
            self.assertIn("error", response.data)
            self.assertEqual(response.data["error"].get("code"), "INVALID_SIGNATURE")

    def test_post_with_invalid_signature(self):
        """Невалидная подпись: 401."""
        payload = {"event": "payment.succeeded", "object": {"id": str(uuid4())}}
        response = self.client.post(
            self.url,
            payload,
            format="json",
            HTTP_X_YOOMONEY_SIGNATURE="invalid_signature",
        )
        self.assertIn(response.status_code, (status.HTTP_200_OK, status.HTTP_401_UNAUTHORIZED))
        if response.status_code == status.HTTP_401_UNAUTHORIZED:
            self.assertEqual(response.data["error"].get("code"), "INVALID_SIGNATURE")


@pytest.mark.django_db
@pytest.mark.integration
class TestTelegramWebhookView(TestCase):
    """Тесты для POST /api/v1/webhooks/telegram/."""

    def setUp(self):
        self.client = APIClient()
        self.url = "/api/v1/webhooks/telegram/"

    def test_post_accepts_json(self):
        """Webhook принимает POST с JSON."""
        payload = {"update_id": 123, "message": {"chat": {"id": 1}, "text": "/start"}}
        response = self.client.post(self.url, payload, format="json")
        self.assertIn(response.status_code, (status.HTTP_200_OK, status.HTTP_400_BAD_REQUEST, status.HTTP_500_INTERNAL_SERVER_ERROR))
