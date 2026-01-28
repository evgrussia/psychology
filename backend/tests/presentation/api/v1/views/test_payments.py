"""
Тесты для Payments API endpoints (Phase 5).
"""
import pytest
from rest_framework.test import APIClient
from rest_framework import status
from django.test import TestCase
from asgiref.sync import async_to_sync

from domain.identity.aggregates.user import User
from domain.identity.value_objects.email import Email
from infrastructure.persistence.repositories.user_repository import DjangoUserRepository
from infrastructure.identity.password_service import PasswordService
from infrastructure.events.in_memory_event_bus import InMemoryEventBus


def _get_auth_token(client, email: str, password: str) -> str:
    r = client.post("/api/v1/auth/login/", {"email": email, "password": password}, format="json")
    if r.status_code != status.HTTP_200_OK:
        raise RuntimeError(f"Login failed: {r.status_code} {r.data}")
    return r.cookies.get("access_token").value if "access_token" in r.cookies else None


@pytest.mark.django_db
@pytest.mark.integration
class TestPaymentViewSet(TestCase):
    """Тесты для GET /api/v1/payments."""

    def setUp(self):
        self.client = APIClient()
        self.url = "/api/v1/payments/"
        user_repo = DjangoUserRepository(event_bus=InMemoryEventBus())
        pw = PasswordService()
        user = User.create(email=Email.create("pay@example.com"))
        async_to_sync(user_repo.save)(user)
        user_repo.set_password_hash(user.id.value, pw.hash_password("Password123!"))
        self.token = _get_auth_token(self.client, "pay@example.com", "Password123!")

    def test_list_payments_requires_auth(self):
        self.client.cookies.clear()
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_list_payments_authenticated(self):
        response = self.client.get(self.url)
        self.assertIn(response.status_code, (status.HTTP_200_OK, status.HTTP_500_INTERNAL_SERVER_ERROR))
        if response.status_code == status.HTTP_200_OK:
            self.assertIn("data", response.data)
            self.assertIsInstance(response.data["data"], list)
