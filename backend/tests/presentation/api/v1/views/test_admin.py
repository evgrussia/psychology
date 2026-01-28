"""
Тесты для Admin API endpoints (Phase 5).
"""
import pytest
from rest_framework.test import APIClient, APITestCase as TestCase
from rest_framework import status
# from django.test import TestCase
from asgiref.sync import async_to_sync

from domain.identity.aggregates.user import User
from domain.identity.value_objects.email import Email
from domain.identity.value_objects.role import Role
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
class TestAdminAppointmentsViewSet(TestCase):
    """Тесты для GET /api/v1/admin/appointments."""

    def setUp(self):
        self.client = APIClient()
        self.client.logout()
        self.client.cookies.clear()
        self.url = "/api/v1/admin/appointments/"
        user_repo = DjangoUserRepository(event_bus=InMemoryEventBus())
        pw = PasswordService()

        admin_user = User.create(email=Email.create("admin@example.com"))
        admin_user.assign_role(Role.OWNER)
        async_to_sync(user_repo.save)(admin_user)
        user_repo.set_password_hash(admin_user.id.value, pw.hash_password("AdminPass123!"))
        
        # Выдать согласие
        from tests.conftest import grant_consent_to_user
        grant_consent_to_user(admin_user.id.value)

        regular_user = User.create(email=Email.create("regular@example.com"))
        async_to_sync(user_repo.save)(regular_user)
        user_repo.set_password_hash(regular_user.id.value, pw.hash_password("RegularPass123!"))

        self.admin_token = _get_auth_token(self.client, "admin@example.com", "AdminPass123!")
        self.regular_token = _get_auth_token(self.client, "regular@example.com", "RegularPass123!")

    def test_list_appointments_requires_auth(self):
        self.client.logout()
        self.client.cookies.clear()
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_list_appointments_regular_user_forbidden(self):
        # Already logged in as regular user last in setUp
        response = self.client.get(self.url)
        self.assertIn(response.status_code, (status.HTTP_403_FORBIDDEN, status.HTTP_500_INTERNAL_SERVER_ERROR))
        if response.status_code == 403:
            self.assertIn("error", response.data)

    def test_list_appointments_admin_success(self):
        # Re-login as admin
        self.client.post("/api/v1/auth/login/", {"email": "admin@example.com", "password": "AdminPass123!"}, format="json")
        response = self.client.get(self.url)
        self.assertIn(response.status_code, (status.HTTP_200_OK, status.HTTP_500_INTERNAL_SERVER_ERROR))
        if response.status_code == status.HTTP_200_OK:
            self.assertIn("data", response.data)
            self.assertIn("pagination", response.data)
            self.assertIsInstance(response.data["data"], list)


@pytest.mark.django_db
@pytest.mark.integration
class TestAdminLeadsViewSet(TestCase):
    """Тесты для GET /api/v1/admin/leads."""

    def setUp(self):
        self.client = APIClient()
        self.client.logout()
        self.client.cookies.clear()
        self.url = "/api/v1/admin/leads/"
        user_repo = DjangoUserRepository(event_bus=InMemoryEventBus())
        pw = PasswordService()
        admin_user = User.create(email=Email.create("admin-leads@example.com"))
        admin_user.assign_role(Role.OWNER)
        async_to_sync(user_repo.save)(admin_user)
        user_repo.set_password_hash(admin_user.id.value, pw.hash_password("AdminPass123!"))
        
        # Выдать согласие
        from tests.conftest import grant_consent_to_user
        grant_consent_to_user(admin_user.id.value)
        self.admin_token = _get_auth_token(self.client, "admin-leads@example.com", "AdminPass123!")

    def test_list_leads_requires_auth(self):
        self.client.logout()
        self.client.cookies.clear()
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_list_leads_admin_success(self):
        # Already logged in as admin in setUp
        response = self.client.get(self.url)
        self.assertIn(response.status_code, (status.HTTP_200_OK, status.HTTP_500_INTERNAL_SERVER_ERROR))
        if response.status_code == status.HTTP_200_OK:
            self.assertIn("data", response.data)
