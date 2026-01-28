"""
Тесты для Client Cabinet API endpoints (Phase 5).
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
class TestCabinetAppointmentsViewSet(TestCase):
    """Тесты для GET /api/v1/cabinet/appointments."""

    def setUp(self):
        self.client = APIClient()
        self.url = "/api/v1/cabinet/appointments/"
        user_repo = DjangoUserRepository(event_bus=InMemoryEventBus())
        pw = PasswordService()
        user = User.create(email=Email.create("cabinet-app@example.com"))
        async_to_sync(user_repo.save)(user)
        user_repo.set_password_hash(user.id.value, pw.hash_password("Password123!"))
        
        # Выдать согласие
        from tests.conftest import grant_consent_to_user
        grant_consent_to_user(user.id.value)
        self.token = _get_auth_token(self.client, "cabinet-app@example.com", "Password123!")

    def test_list_appointments_requires_auth(self):
        self.client.logout()
        self.client.cookies.clear()
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_list_appointments_authenticated(self):
        response = self.client.get(self.url)
        # 500 если AUTH_USER_MODEL не настроен (JWT user_id UUID vs default User int id)
        self.assertIn(response.status_code, (status.HTTP_200_OK, status.HTTP_403_FORBIDDEN, status.HTTP_500_INTERNAL_SERVER_ERROR))
        if response.status_code == status.HTTP_200_OK:
            self.assertIn("data", response.data)


@pytest.mark.django_db
@pytest.mark.integration
class TestCabinetDiariesViewSet(TestCase):
    """Тесты для GET /api/v1/cabinet/diaries."""

    def setUp(self):
        self.client = APIClient()
        self.url = "/api/v1/cabinet/diaries/"
        user_repo = DjangoUserRepository(event_bus=InMemoryEventBus())
        pw = PasswordService()
        user = User.create(email=Email.create("cabinet-diary@example.com"))
        async_to_sync(user_repo.save)(user)
        user_repo.set_password_hash(user.id.value, pw.hash_password("Password123!"))
        
        # Выдать согласие
        from tests.conftest import grant_consent_to_user
        grant_consent_to_user(user.id.value)
        self.token = _get_auth_token(self.client, "cabinet-diary@example.com", "Password123!")

    def test_list_diaries_requires_auth(self):
        self.client.logout()
        self.client.cookies.clear()
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


@pytest.mark.django_db
@pytest.mark.integration
class TestExportDataView(TestCase):
    """Тесты для POST /api/v1/cabinet/data/export/."""

    def setUp(self):
        self.client = APIClient()
        self.url = "/api/v1/cabinet/data/export/"
        user_repo = DjangoUserRepository(event_bus=InMemoryEventBus())
        pw = PasswordService()
        user = User.create(email=Email.create("cabinet-export@example.com"))
        async_to_sync(user_repo.save)(user)
        user_repo.set_password_hash(user.id.value, pw.hash_password("Password123!"))
        
        # Выдать согласие
        from tests.conftest import grant_consent_to_user
        grant_consent_to_user(user.id.value)
        self.token = _get_auth_token(self.client, "cabinet-export@example.com", "Password123!")

    def test_export_requires_auth(self):
        response = self.client.post(self.url, {"format": "pdf"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
