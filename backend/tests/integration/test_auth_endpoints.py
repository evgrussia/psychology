"""
Интеграционные тесты для Authentication API endpoints.
"""
import pytest
from rest_framework.test import APIClient, APITestCase as TestCase
from rest_framework import status
# from django.test import TestCase
from uuid import uuid4
from datetime import datetime

from infrastructure.persistence.django_models.user import UserModel
from domain.identity.aggregates.user import User, UserId
from domain.identity.value_objects.user_status import UserStatus
from domain.identity.value_objects.email import Email
from infrastructure.persistence.repositories.user_repository import DjangoUserRepository
from infrastructure.identity.password_service import PasswordService
from asgiref.sync import async_to_sync


@pytest.mark.django_db
@pytest.mark.integration
class TestAuthRegisterEndpoint(TestCase):
    """Интеграционные тесты для POST /api/v1/auth/register."""
    
    def setUp(self):
        self.client = APIClient()
        self.client.cookies.clear()
        self.url = '/api/v1/auth/register/'
        from infrastructure.events.in_memory_event_bus import InMemoryEventBus
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
        
        # Проверить куки (вместо тела ответа)
        self.assertIn('access_token', response.cookies)
        self.assertIn('refresh_token', response.cookies)
        
        # Проверить данные пользователя
        user_data = response.data['data']['user']
        self.assertEqual(user_data['email'], 'newuser@example.com')
        self.assertIn('id', user_data)
        
        # Проверить, что пользователь создан в БД
        user_id = user_data['id']
        user_model = UserModel.objects.get(id=user_id)
        self.assertEqual(user_model.email, 'newuser@example.com')
        
        # Проверить, что токены в куках не пустые
        self.assertIsNotNone(response.cookies['access_token'].value)
        self.assertIsNotNone(response.cookies['refresh_token'].value)
    
    def test_register_user_duplicate_email(self):
        """Тест регистрации с дубликатом email."""
        # Arrange - создать существующего пользователя
        existing_user = User.create(email=Email.create('existing@example.com'))
        async_to_sync(self.user_repository.save)(existing_user)
        
        payload = {
            'email': 'existing@example.com',
            'password': 'SecurePass123!',
            'display_name': 'Existing User',
        }
        
        # Act
        response = self.client.post(self.url, payload, format='json')
        
        # Assert
        self.assertEqual(response.status_code, status.HTTP_409_CONFLICT)
        self.assertIn('error', response.data)
    
    def test_register_user_invalid_email(self):
        """Тест регистрации с невалидным email."""
        # Arrange
        payload = {
            'email': 'invalid-email',
            'password': 'SecurePass123!',
        }
        
        # Act
        response = self.client.post(self.url, payload, format='json')
        
        # Assert
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_register_user_short_password(self):
        """Тест регистрации с коротким паролем."""
        # Arrange
        payload = {
            'email': 'user@example.com',
            'password': 'Short1!',  # Меньше 12 символов
        }
        
        # Act
        response = self.client.post(self.url, payload, format='json')
        
        # Assert
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_register_user_missing_required_fields(self):
        """Тест регистрации без обязательных полей."""
        # Arrange
        payload = {
            'email': 'user@example.com',
            # password отсутствует
        }
        
        # Act
        response = self.client.post(self.url, payload, format='json')
        
        # Assert
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


@pytest.mark.django_db
@pytest.mark.integration
class TestAuthLoginEndpoint(TestCase):
    """Интеграционные тесты для POST /api/v1/auth/login."""
    
    def setUp(self):
        self.client = APIClient()
        self.client.cookies.clear()
        self.url = '/api/v1/auth/login/'
        from infrastructure.events.in_memory_event_bus import InMemoryEventBus
        self.user_repository = DjangoUserRepository(event_bus=InMemoryEventBus())
        self.password_service = PasswordService()
        
        # Создать тестового пользователя
        self.test_email = 'testuser@example.com'
        self.test_password = 'TestPassword123!'
        
        user = User.create(email=Email.create(self.test_email))
        async_to_sync(self.user_repository.save)(user)
        
        # Установить пароль
        password_hash = self.password_service.hash_password(self.test_password)
        self.user_repository.set_password_hash(user.id.value, password_hash)
    
    def test_login_success(self):
        """Тест успешного входа."""
        # Arrange
        payload = {
            'email': self.test_email,
            'password': self.test_password,
        }
        
        # Act
        response = self.client.post(self.url, payload, format='json')
        
        # Assert
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('data', response.data)
        self.assertIn('user', response.data['data'])
        self.assertIn('access_token', response.cookies)
        self.assertIn('refresh_token', response.cookies)
        
        user_data = response.data['data']['user']
        self.assertEqual(user_data['email'], self.test_email)
    
    def test_login_invalid_credentials(self):
        """Тест входа с неверными credentials."""
        # Arrange
        payload = {
            'email': self.test_email,
            'password': 'WrongPassword123!',
        }
        
        # Act
        response = self.client.post(self.url, payload, format='json')
        
        # Assert
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn('error', response.data)
        self.assertEqual(response.data['error']['code'], 'UNAUTHORIZED')
    
    def test_login_nonexistent_user(self):
        """Тест входа несуществующего пользователя."""
        # Arrange
        payload = {
            'email': 'nonexistent@example.com',
            'password': 'SomePassword123!',
        }
        
        # Act
        response = self.client.post(self.url, payload, format='json')
        
        # Assert
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn('error', response.data)
    
    def test_login_inactive_user(self):
        """Тест входа неактивного пользователя."""
        # Arrange - создать неактивного пользователя
        inactive_user = User.create(email=Email.create('inactive@example.com'))
        inactive_user.block("Test block")
        async_to_sync(self.user_repository.save)(inactive_user)
        
        password_hash = self.password_service.hash_password('Password123!')
        self.user_repository.set_password_hash(inactive_user.id.value, password_hash)
        
        payload = {
            'email': 'inactive@example.com',
            'password': 'Password123!',
        }
        
        # Act
        response = self.client.post(self.url, payload, format='json')
        
        # Assert
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_login_missing_fields(self):
        """Тест входа без обязательных полей."""
        # Arrange
        payload = {
            'email': self.test_email,
            # password отсутствует
        }
        
        # Act
        response = self.client.post(self.url, payload, format='json')
        
        # Assert
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


@pytest.mark.django_db
@pytest.mark.integration
class TestAuthRefreshEndpoint(TestCase):
    """Интеграционные тесты для POST /api/v1/auth/refresh."""
    
    def setUp(self):
        self.client = APIClient()
        self.client.cookies.clear()
        self.url = '/api/v1/auth/refresh/'
        from infrastructure.events.in_memory_event_bus import InMemoryEventBus
        self.user_repository = DjangoUserRepository(event_bus=InMemoryEventBus())
        self.password_service = PasswordService()
        
        # Создать пользователя и получить токены
        user = User.create(email=Email.create('refreshuser@example.com'))
        async_to_sync(self.user_repository.save)(user)
        
        password_hash = self.password_service.hash_password('Password123!')
        self.user_repository.set_password_hash(user.id.value, password_hash)
        
        # Получить refresh token через login
        login_response = self.client.post('/api/v1/auth/login/', {
            'email': 'refreshuser@example.com',
            'password': 'Password123!',
        }, format='json')
        
        self.refresh_token = login_response.cookies.get('refresh_token').value
    
    def test_refresh_token_success(self):
        """Тест успешного обновления токена."""
        # Arrange
        payload = {
            'refresh': self.refresh_token,
        }
        
        # Act
        response = self.client.post(self.url, payload, format='json')
        
        # Assert
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access_token', response.cookies)
    
    def test_refresh_token_invalid(self):
        """Тест обновления с невалидным токеном."""
        # Arrange
        self.client.cookies.clear()
        payload = {
            'refresh': 'invalid_token_here',
        }
        
        # Act
        response = self.client.post(self.url, payload, format='json')
        
        # Assert
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_refresh_token_missing(self):
        """Тест обновления без токена."""
        # Arrange
        self.client.cookies.clear()
        payload = {}
        
        # Act
        response = self.client.post(self.url, payload, format='json')
        
        # Assert
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


@pytest.mark.django_db
@pytest.mark.integration
class TestAuthLogoutEndpoint(TestCase):
    """Интеграционные тесты для POST /api/v1/auth/logout."""
    
    def setUp(self):
        self.client = APIClient()
        self.client.cookies.clear()
        self.url = '/api/v1/auth/logout/'
        from infrastructure.events.in_memory_event_bus import InMemoryEventBus
        self.user_repository = DjangoUserRepository(event_bus=InMemoryEventBus())
        self.password_service = PasswordService()
        
        # Создать пользователя и получить токены
        user = User.create(email=Email.create('logoutuser@example.com'))
        async_to_sync(self.user_repository.save)(user)
        
        password_hash = self.password_service.hash_password('Password123!')
        self.user_repository.set_password_hash(user.id.value, password_hash)
        
        # Получить токены через login
        login_response = self.client.post('/api/v1/auth/login/', {
            'email': 'logoutuser@example.com',
            'password': 'Password123!',
        }, format='json')
        
        self.access_token = login_response.cookies.get('access_token').value
        self.refresh_token = login_response.cookies.get('refresh_token').value
    
    def test_logout_success(self):
        """Тест успешного выхода."""
        # Arrange
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.access_token}')
        payload = {
            'refresh_token': self.refresh_token,
        }
        
        # Act
        response = self.client.post(self.url, payload, format='json')
        
        # Assert
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
    
    def test_logout_without_auth(self):
        """Тест выхода без аутентификации."""
        # Arrange
        self.client.cookies.clear()
        payload = {
            'refresh_token': self.refresh_token,
        }
        
        # Act
        response = self.client.post(self.url, payload, format='json')
        
        # Assert
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_logout_without_refresh_token(self):
        """Тест выхода без refresh token (должен работать)."""
        # Arrange
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.access_token}')
        payload = {}
        
        # Act
        response = self.client.post(self.url, payload, format='json')
        
        # Assert
        # Logout должен работать даже без refresh_token
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)


@pytest.mark.django_db
@pytest.mark.integration
class TestMfaVerifyEndpoint(TestCase):
    """Интеграционные тесты для POST /api/v1/auth/mfa/verify/."""

    def setUp(self):
        self.client = APIClient()
        self.client.cookies.clear()
        self.url = '/api/v1/auth/mfa/verify/'
        from infrastructure.events.in_memory_event_bus import InMemoryEventBus
        from infrastructure.encryption.fernet_encryption import FernetEncryptionService
        from django.core.signing import TimestampSigner
        self.user_repository = DjangoUserRepository(event_bus=InMemoryEventBus())
        self.encryption_service = FernetEncryptionService()
        self.signer = TimestampSigner()

        # Создать пользователя с MFA
        user = User.create(email=Email.create('mfauser@example.com'))
        async_to_sync(self.user_repository.save)(user)
        password_hash = PasswordService().hash_password('Password123!')
        self.user_repository.set_password_hash(user.id.value, password_hash)

        # MFA secret (plain) и зашифрованный
        import pyotp
        self.totp_secret = pyotp.random_base32()
        encrypted = self.encryption_service.encrypt(self.totp_secret)
        self.user_repository.set_mfa_secret(user.id.value, encrypted)
        self.user_repository.set_mfa_enabled(user.id.value, True)

        self.user_id = user.id.value
        self.mfa_pending_value = self.signer.sign(str(self.user_id))

    def test_mfa_verify_success(self):
        """Успешная верификация MFA кода — выдаются access/refresh cookies и user."""
        import pyotp
        totp = pyotp.TOTP(self.totp_secret)
        code = totp.now()

        self.client.cookies['mfa_pending'] = self.mfa_pending_value
        payload = {'code': code}

        response = self.client.post(self.url, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('data', response.data)
        self.assertIn('user', response.data['data'])
        self.assertEqual(response.data['data']['user']['email'], 'mfauser@example.com')
        self.assertIn('access_token', response.cookies)
        self.assertIn('refresh_token', response.cookies)
        # mfa_pending при успехе удаляется (max_age=0 или пустое value)
        if 'mfa_pending' in response.cookies:
            self.assertTrue(
                response.cookies['mfa_pending'].value == '' or
                getattr(response.cookies['mfa_pending'], 'max_age', None) == 0
            )

    def test_mfa_verify_invalid_code(self):
        """Неверный TOTP код — 401."""
        self.client.cookies['mfa_pending'] = self.mfa_pending_value
        payload = {'code': '000000'}

        response = self.client.post(self.url, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn('error', response.data)
        self.assertNotIn('access_token', response.cookies)

    def test_mfa_verify_missing_cookie(self):
        """Без cookie mfa_pending — 401."""
        payload = {'code': '123456'}

        response = self.client.post(self.url, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn('error', response.data)
