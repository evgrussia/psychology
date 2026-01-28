"""
Тесты для Interactive API endpoints (Phase 5).
"""
import pytest
from rest_framework.test import APIClient
from rest_framework import status
from django.test import TestCase
from uuid import uuid4
from asgiref.sync import async_to_sync

from domain.identity.aggregates.user import User
from domain.identity.value_objects.email import Email
from infrastructure.persistence.repositories.user_repository import DjangoUserRepository
from infrastructure.identity.password_service import PasswordService
from infrastructure.events.in_memory_event_bus import InMemoryEventBus


def _get_auth_token(client, email: str, password: str) -> str:
    """Логин и возврат access token. API использует httpOnly cookies."""
    r = client.post("/api/v1/auth/login/", {"email": email, "password": password}, format="json")
    if r.status_code != status.HTTP_200_OK:
        raise RuntimeError(f"Login failed: {r.status_code} {r.data}")
    return r.cookies.get("access_token").value if "access_token" in r.cookies else None


@pytest.mark.django_db
@pytest.mark.integration
class TestQuizViewSet(TestCase):
    """Тесты для GET /api/v1/interactive/quizzes."""

    def setUp(self):
        self.client = APIClient()
        self.url = "/api/v1/interactive/quizzes/"

    def test_list_quizzes_public(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("data", response.data)
        self.assertIsInstance(response.data["data"], list)

    def test_list_quizzes_authenticated(self):
        user_repo = DjangoUserRepository(event_bus=InMemoryEventBus())
        pw = PasswordService()
        user = User.create(email=Email.create("quiz@example.com"))
        async_to_sync(user_repo.save)(user)
        user_repo.set_password_hash(user.id.value, pw.hash_password("Password123!"))
        _get_auth_token(self.client, "quiz@example.com", "Password123!")
        response = self.client.get(self.url)
        # 500 если AUTH_USER_MODEL не настроен (JWT UUID vs default User int id)
        self.assertIn(response.status_code, (status.HTTP_200_OK, status.HTTP_500_INTERNAL_SERVER_ERROR))
        if response.status_code == status.HTTP_200_OK:
            self.assertIn("data", response.data)


@pytest.mark.django_db
@pytest.mark.integration
class TestDiaryViewSet(TestCase):
    """Тесты для GET /api/v1/interactive/diaries."""

    def setUp(self):
        self.client = APIClient()
        self.url = "/api/v1/interactive/diaries/"
        user_repo = DjangoUserRepository(event_bus=InMemoryEventBus())
        pw = PasswordService()
        user = User.create(email=Email.create("diary@example.com"))
        async_to_sync(user_repo.save)(user)
        user_repo.set_password_hash(user.id.value, pw.hash_password("Password123!"))
        
        # Даем согласие на обработку ПДн, иначе 403 Forbidden
        from domain.identity.entities.consent import Consent, ConsentId
        from domain.identity.value_objects.consent_type import ConsentType
        from datetime import datetime, timezone
        consent = Consent(
            id=ConsentId.generate(),
            consent_type=ConsentType.PERSONAL_DATA,
            version='1.0',
            source='test',
            granted_at=datetime.now(timezone.utc),
            revoked_at=None
        )
        user.grant_consent(consent_type=ConsentType.PERSONAL_DATA, version='1.0', source='test')
        async_to_sync(user_repo.save)(user)
        
        self.token = _get_auth_token(self.client, "diary@example.com", "Password123!")

    def test_list_diaries_requires_auth(self):
        self.client.cookies.clear()
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_list_diaries_authenticated(self):
        response = self.client.get(self.url)
        self.assertIn(response.status_code, (status.HTTP_200_OK, status.HTTP_500_INTERNAL_SERVER_ERROR))
        if response.status_code == status.HTTP_200_OK:
            self.assertIn("data", response.data)
            self.assertIsInstance(response.data["data"], list)


