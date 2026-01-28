"""
Integration тесты для Auth API endpoints.
"""
import pytest
from rest_framework.test import APIClient, APITestCase as TestCase
from rest_framework import status
# from django.test import TestCase
from uuid import uuid4, UUID

from infrastructure.persistence.django_models.user import UserModel
from domain.identity.aggregates.user import User, UserId
from domain.identity.value_objects.email import Email
from infrastructure.persistence.repositories.user_repository import DjangoUserRepository
from infrastructure.identity.password_service import PasswordService
from infrastructure.events.in_memory_event_bus import InMemoryEventBus


@pytest.mark.django_db
@pytest.mark.integration
class TestAuthRegisterEndpoint(TestCase):
    """Интеграционные тесты для POST /api/v1/auth/register."""
    
    def setUp(self):
        self.client = APIClient()
        self.client.logout()
        self.client.cookies.clear()
        self.url = '/api/v1/auth/register/'
        self.user_repository = DjangoUserRepository(event_bus=InMemoryEventBus())
        self.password_service = PasswordService()
    
    def test_register_user_success(self):
        """Тест успешной регистрации пользователя."""
        # Arrange
        payload = {
            'email': 'newuser@example.com',
            'password': 'SecurePass123!',
            'display_name': 'New User',
            'consents': {
                'personal_data': True,
                'communications': False,
            }
        }
        
        # Act
        response = self.client.post(self.url, payload, format='json')
        
        # Assert
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('data', response.data)
        self.assertIn('user', response.data['data'])
        self.assertIn('access_token', response.cookies)
        self.assertIn('refresh_token', response.cookies)
    
    def test_register_duplicate_email(self):
        """Тест регистрации с существующим email."""
        # Arrange - создать пользователя
        user = User.create(email=Email.create('existing@example.com'))
        from presentation.api.v1.dependencies import get_sync_user_repository
        sync_repo = get_sync_user_repository()
        sync_repo.save(user)
        
        payload = {
            'email': 'existing@example.com',
            'password': 'SecurePass123!',
        }
        
        # Act
        response = self.client.post(self.url, payload, format='json')
        
        # Assert
        self.assertEqual(response.status_code, status.HTTP_409_CONFLICT)
        self.assertIn('error', response.data)


@pytest.mark.django_db
@pytest.mark.integration
class TestAuthLoginEndpoint(TestCase):
    """Интеграционные тесты для POST /api/v1/auth/login."""
    
    def setUp(self):
        self.client = APIClient()
        self.client.logout()
        self.client.cookies.clear()
        self.url = '/api/v1/auth/login/'
        self.user_repository = DjangoUserRepository(event_bus=InMemoryEventBus())
        self.password_service = PasswordService()
    
    def test_login_success(self):
        """Тест успешного логина."""
        # Arrange - создать пользователя с паролем
        user = User.create(email=Email.create('test@example.com'))
        # Использовать sync версию репозитория для тестов
        from presentation.api.v1.dependencies import get_sync_user_repository
        sync_repo = get_sync_user_repository()
        saved_user = sync_repo.save(user)
        
        password_hash = self.password_service.hash_password('SecurePass123!')
        sync_repo.set_password_hash(UUID(saved_user.id.value), password_hash)
        
        payload = {
            'email': 'test@example.com',
            'password': 'SecurePass123!',
        }
        
        # Act
        response = self.client.post(self.url, payload, format='json')
        
        # Assert
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('data', response.data)
        self.assertIn('user', response.data['data'])
        self.assertIn('access_token', response.cookies)
        self.assertIn('refresh_token', response.cookies)
    
    def test_login_invalid_credentials(self):
        """Тест логина с неверными учетными данными."""
        payload = {
            'email': 'nonexistent@example.com',
            'password': 'WrongPassword123!',
        }
        
        # Act
        response = self.client.post(self.url, payload, format='json')
        
        # Assert
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn('error', response.data)
