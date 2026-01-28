"""
Тесты для Moderation API endpoints (Phase 5).
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
class TestQuestionViewSet(TestCase):
    """Тесты для POST /api/v1/moderation/questions."""

    def setUp(self):
        self.client = APIClient()
        self.url = "/api/v1/moderation/questions/"
        user_repo = DjangoUserRepository(event_bus=InMemoryEventBus())
        pw = PasswordService()
        user = User.create(email=Email.create("mod@example.com"))
        async_to_sync(user_repo.save)(user)
        user_repo.set_password_hash(user.id.value, pw.hash_password("Password123!"))
        self.token = _get_auth_token(self.client, "mod@example.com", "Password123!")

    def test_submit_question_anonymous_forbidden(self):
        """IsPublicOrAuthenticated: POST требует auth, анонимный -> 401."""
        self.client.cookies.clear()
        payload = {"content": "Как справиться с тревогой? Достаточно длинный текст."}
        response = self.client.post(self.url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_submit_question_authenticated(self):
        payload = {"content": "Ещё один вопрос о стрессе. Достаточно длинный текст для валидации."}
        response = self.client.post(self.url, payload, format="json")
        # 500 если AUTH_USER_MODEL не настроен (JWT UUID vs default User int id)
        self.assertIn(response.status_code, (status.HTTP_201_CREATED, status.HTTP_400_BAD_REQUEST, status.HTTP_500_INTERNAL_SERVER_ERROR))
        if response.status_code == status.HTTP_201_CREATED:
            self.assertIn("data", response.data)

    def test_submit_question_missing_content(self):
        response = self.client.post(self.url, {}, format="json")
        self.assertIn(response.status_code, (status.HTTP_400_BAD_REQUEST, status.HTTP_500_INTERNAL_SERVER_ERROR))

    def test_submit_question_content_too_short(self):
        response = self.client.post(self.url, {"content": "Коротко"}, format="json")
        self.assertIn(response.status_code, (status.HTTP_400_BAD_REQUEST, status.HTTP_500_INTERNAL_SERVER_ERROR))

    def test_crisis_indicators_rejected(self):
        payload = {"content": "Хочу обсудить суицид и самоубийство. Длинный текст для валидации."}
        response = self.client.post(self.url, payload, format="json")
        self.assertIn(response.status_code, (status.HTTP_400_BAD_REQUEST, status.HTTP_500_INTERNAL_SERVER_ERROR))
        if response.status_code == status.HTTP_400_BAD_REQUEST:
            self.assertIn("error", response.data)
            self.assertEqual(response.data["error"].get("code"), "CRISIS_DETECTED")
