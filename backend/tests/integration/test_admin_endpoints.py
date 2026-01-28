"""
Интеграционные тесты для Admin API endpoints.
"""
import pytest
from rest_framework.test import APIClient
from rest_framework import status
from rest_framework.test import APITestCase as TestCase
from uuid import uuid4
from datetime import datetime, timedelta, timezone
from asgiref.sync import async_to_sync

from infrastructure.persistence.django_models.user import UserModel
from domain.identity.aggregates.user import User, UserId
from domain.identity.value_objects.user_status import UserStatus
from domain.identity.value_objects.email import Email
from domain.identity.value_objects.role import Role
from infrastructure.persistence.repositories.user_repository import DjangoUserRepository
from infrastructure.identity.password_service import PasswordService


@pytest.mark.django_db
@pytest.mark.integration
class TestAdminAppointmentsEndpoint(TestCase):
    """Интеграционные тесты для GET /api/v1/admin/appointments."""
    
    def setUp(self):
        self.client = APIClient()
        self.client.cookies.clear()
        from infrastructure.events.in_memory_event_bus import InMemoryEventBus
        self.user_repository = DjangoUserRepository(event_bus=InMemoryEventBus())
        self.password_service = PasswordService()
        
        # Создать админа
        admin_user = User.create(email=Email.create('admin@example.com'))
        async_to_sync(self.user_repository.save)(admin_user)
        admin_user.assign_role(Role.OWNER)
        async_to_sync(self.user_repository.save)(admin_user)
        
        # Выдать согласие
        from tests.conftest import grant_consent_to_user
        grant_consent_to_user(admin_user.id.value)
        
        password_hash = self.password_service.hash_password('AdminPass123!')
        self.user_repository.set_password_hash(admin_user.id.value, password_hash)
        
        login_response = self.client.post('/api/v1/auth/login/', {
            'email': 'admin@example.com',
            'password': 'AdminPass123!',
        }, format='json')
        
        self.admin_token = login_response.cookies.get('access_token').value if 'access_token' in login_response.cookies else None
        
        # Создать обычного пользователя
        # Role.CLIENT уже назначена при создании через User.create()
        regular_user = User.create(email=Email.create('regular@example.com'))
        async_to_sync(self.user_repository.save)(regular_user)
        
        password_hash = self.password_service.hash_password('RegularPass123!')
        self.user_repository.set_password_hash(regular_user.id.value, password_hash)
        
        login_response2 = self.client.post('/api/v1/auth/login/', {
            'email': 'regular@example.com',
            'password': 'RegularPass123!',
        }, format='json')
        
        self.regular_token = login_response2.cookies.get('access_token').value if 'access_token' in login_response2.cookies else None
    
    def test_list_appointments_requires_admin(self):
        """Тест, что список всех бронирований требует прав админа."""
        # Arrange
        self.client.cookies.clear()
        url = '/api/v1/admin/appointments/'
        
        # Act - без токена
        response = self.client.get(url)
        
        # Assert
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_list_appointments_requires_owner_role(self):
        """Тест, что обычный пользователь не может получить список всех бронирований."""
        # Arrange
        # Use regular user's cookies
        url = '/api/v1/admin/appointments/'
        # We need to switch client state or use another client. 
        # In TestCase, self.client is shared. 
        # Since we just did login for regular user in setUp, cookies are for regular user.
        
        # Act
        response = self.client.get(url)
        
        # Assert
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertIn('error', response.data)
    
    def test_list_appointments_success(self):
        """Тест успешного получения списка всех бронирований для админа."""
        # Arrange
        # Need admin cookies. Re-login as admin.
        self.client.post('/api/v1/auth/login/', {
            'email': 'admin@example.com',
            'password': 'AdminPass123!',
        }, format='json')
        url = '/api/v1/admin/appointments/'
        
        # Act
        response = self.client.get(url)
        
        # Assert
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('data', response.data)
        self.assertIn('pagination', response.data)
        self.assertIsInstance(response.data['data'], list)
    
    def test_list_appointments_with_pagination(self):
        """Тест получения списка бронирований с пагинацией."""
        # Arrange
        self.client.post('/api/v1/auth/login/', {
            'email': 'admin@example.com',
            'password': 'AdminPass123!',
        }, format='json')
        url = '/api/v1/admin/appointments/'
        
        params = {
            'page': 1,
            'per_page': 50,
        }
        
        # Act
        response = self.client.get(url, params)
        
        # Assert
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('pagination', response.data)
        
        pagination = response.data['pagination']
        self.assertIn('page', pagination)
        self.assertIn('per_page', pagination)
        self.assertIn('total', pagination)
    
    def test_list_appointments_with_filtering(self):
        """Тест получения списка бронирований с фильтрацией."""
        # Arrange
        self.client.post('/api/v1/auth/login/', {
            'email': 'admin@example.com',
            'password': 'AdminPass123!',
        }, format='json')
        url = '/api/v1/admin/appointments/'
        
        params = {
            'status': 'confirmed',
            'date_from': (datetime.now(timezone.utc) - timedelta(days=7)).isoformat(),
            'date_to': datetime.now(timezone.utc).isoformat(),
        }
        
        # Act
        response = self.client.get(url, params)
        
        # Assert
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('data', response.data)


@pytest.mark.django_db
@pytest.mark.integration
class TestAdminLeadsEndpoint(TestCase):
    """Интеграционные тесты для GET /api/v1/admin/leads."""
    
    def setUp(self):
        self.client = APIClient()
        self.client.cookies.clear()
        from infrastructure.events.in_memory_event_bus import InMemoryEventBus
        self.user_repository = DjangoUserRepository(event_bus=InMemoryEventBus())
        self.password_service = PasswordService()
        
        # Создать админа
        admin_user = User.create(email=Email.create('adminleads@example.com'))
        async_to_sync(self.user_repository.save)(admin_user)
        admin_user.assign_role(Role.OWNER)
        async_to_sync(self.user_repository.save)(admin_user)
        
        # Выдать согласие
        from tests.conftest import grant_consent_to_user
        grant_consent_to_user(admin_user.id.value)
        
        password_hash = self.password_service.hash_password('AdminPass123!')
        self.user_repository.set_password_hash(admin_user.id.value, password_hash)
        
        login_response = self.client.post('/api/v1/auth/login/', {
            'email': 'adminleads@example.com',
            'password': 'AdminPass123!',
        }, format='json')
        
        self.admin_token = login_response.cookies.get('access_token').value if 'access_token' in login_response.cookies else None
    
    def test_list_leads_requires_admin(self):
        """Тест, что список лидов требует прав админа."""
        # Arrange
        self.client.cookies.clear()
        url = '/api/v1/admin/leads/'
        
        # Act - без токена
        response = self.client.get(url)
        
        # Assert
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_list_leads_success(self):
        """Тест успешного получения списка лидов для админа."""
        # Arrange
        self.client.post('/api/v1/auth/login/', {
            'email': 'adminleads@example.com',
            'password': 'AdminPass123!',
        }, format='json')
        url = '/api/v1/admin/leads/'
        
        # Act
        response = self.client.get(url)
        
        # Assert
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('data', response.data)
        self.assertIn('pagination', response.data)
        self.assertIsInstance(response.data['data'], list)
    
    def test_list_leads_with_filtering(self):
        """Тест получения списка лидов с фильтрацией."""
        # Arrange
        self.client.post('/api/v1/auth/login/', {
            'email': 'adminleads@example.com',
            'password': 'AdminPass123!',
        }, format='json')
        url = '/api/v1/admin/leads/'
        
        params = {
            'status': 'new',
            'source': 'web',
        }
        
        # Act
        response = self.client.get(url, params)
        
        # Assert
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('data', response.data)
    
    def test_list_leads_with_pagination(self):
        """Тест получения списка лидов с пагинацией."""
        # Arrange
        self.client.post('/api/v1/auth/login/', {
            'email': 'adminleads@example.com',
            'password': 'AdminPass123!',
        }, format='json')
        url = '/api/v1/admin/leads/'
        
        params = {
            'page': 1,
            'per_page': 50,
        }
        
        # Act
        response = self.client.get(url, params)
        
        # Assert
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('pagination', response.data)


@pytest.mark.django_db
@pytest.mark.integration
class TestAdminContentEndpoint(TestCase):
    """Интеграционные тесты для GET /api/v1/admin/content."""
    
    def setUp(self):
        self.client = APIClient()
        self.client.cookies.clear()
        from infrastructure.events.in_memory_event_bus import InMemoryEventBus
        self.user_repository = DjangoUserRepository(event_bus=InMemoryEventBus())
        self.password_service = PasswordService()
        
        # Создать админа/редактора
        editor_user = User.create(email=Email.create('editor@example.com'))
        async_to_sync(self.user_repository.save)(editor_user)
        editor_user.assign_role(Role.EDITOR)
        async_to_sync(self.user_repository.save)(editor_user)
        
        password_hash = self.password_service.hash_password('EditorPass123!')
        self.user_repository.set_password_hash(editor_user.id.value, password_hash)
        
        login_response = self.client.post('/api/v1/auth/login/', {
            'email': 'editor@example.com',
            'password': 'EditorPass123!',
        }, format='json')
        
        self.editor_token = login_response.cookies.get('access_token').value if 'access_token' in login_response.cookies else None
    
    def test_list_content_requires_admin_or_editor(self):
        """Тест, что список контента требует прав админа или редактора."""
        # Arrange
        self.client.cookies.clear()
        url = '/api/v1/admin/content/'
        
        # Act - без токена
        response = self.client.get(url)
        
        # Assert
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_list_content_success(self):
        """Тест успешного получения списка контента для редактора."""
        # Arrange
        self.client.post('/api/v1/auth/login/', {
            'email': 'editor@example.com',
            'password': 'EditorPass123!',
        }, format='json')
        url = '/api/v1/admin/content/'
        
        # Act
        response = self.client.get(url)
        
        # Assert
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('data', response.data)
        self.assertIn('pagination', response.data)
        self.assertIsInstance(response.data['data'], list)
    
    def test_list_content_with_filtering(self):
        """Тест получения списка контента с фильтрацией."""
        # Arrange
        self.client.post('/api/v1/auth/login/', {
            'email': 'editor@example.com',
            'password': 'EditorPass123!',
        }, format='json')
        url = f'/api/v1/admin/content/'
        
        params = {
            'status': 'draft',
            'type': 'article',
        }
        
        # Act
        response = self.client.get(url, params)
        
        # Assert
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('data', response.data)


@pytest.mark.django_db
@pytest.mark.integration
class TestAdminModerationEndpoint(TestCase):
    """Интеграционные тесты для GET /api/v1/admin/moderation."""
    
    def setUp(self):
        self.client = APIClient()
        self.client.cookies.clear()
        from infrastructure.events.in_memory_event_bus import InMemoryEventBus
        self.user_repository = DjangoUserRepository(event_bus=InMemoryEventBus())
        self.password_service = PasswordService()
        
        # Создать админа
        admin_user = User.create(email=Email.create('adminmod@example.com'))
        async_to_sync(self.user_repository.save)(admin_user)
        admin_user.assign_role(Role.OWNER)
        async_to_sync(self.user_repository.save)(admin_user)
        
        # Выдать согласие
        from tests.conftest import grant_consent_to_user
        grant_consent_to_user(admin_user.id.value)
        
        password_hash = self.password_service.hash_password('AdminPass123!')
        self.user_repository.set_password_hash(admin_user.id.value, password_hash)
        
        login_response = self.client.post('/api/v1/auth/login/', {
            'email': 'adminmod@example.com',
            'password': 'AdminPass123!',
        }, format='json')
        
        self.admin_token = login_response.cookies.get('access_token').value if 'access_token' in login_response.cookies else None
    
    def test_list_moderation_requires_admin(self):
        """Тест, что список модерации требует прав админа."""
        # Arrange
        self.client.cookies.clear()
        url = '/api/v1/admin/moderation/'
        
        # Act - без токена
        response = self.client.get(url)
        
        # Assert
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_list_moderation_success(self):
        """Тест успешного получения списка элементов модерации для админа."""
        # Arrange
        self.client.post('/api/v1/auth/login/', {
            'email': 'adminmod@example.com',
            'password': 'AdminPass123!',
        }, format='json')
        url = '/api/v1/admin/moderation/'
        
        # Act
        response = self.client.get(url)
        
        # Assert
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('data', response.data)
        self.assertIn('pagination', response.data)
        self.assertIsInstance(response.data['data'], list)
    
    def test_list_moderation_with_filtering(self):
        """Тест получения списка модерации с фильтрацией."""
        # Arrange
        self.client.post('/api/v1/auth/login/', {
            'email': 'adminmod@example.com',
            'password': 'AdminPass123!',
        }, format='json')
        url = '/api/v1/admin/moderation/'
        
        params = {
            'status': 'pending',
            'type': 'question',
        }
        
        # Act
        response = self.client.get(url, params)
        
        # Assert
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('data', response.data)
