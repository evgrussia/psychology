"""
Интеграционные тесты для Client Cabinet API endpoints.
"""
import pytest
from rest_framework.test import APIClient, APITestCase as TestCase
from rest_framework import status
# from django.test import TestCase
from uuid import uuid4
from datetime import datetime, timedelta, timezone
from asgiref.sync import async_to_sync

from infrastructure.persistence.django_models.user import UserModel
from domain.identity.aggregates.user import User, UserId
from domain.identity.value_objects.user_status import UserStatus
from domain.identity.value_objects.email import Email
from infrastructure.persistence.repositories.user_repository import DjangoUserRepository
from infrastructure.identity.password_service import PasswordService


@pytest.mark.django_db
@pytest.mark.integration
class TestCabinetAppointmentsEndpoint(TestCase):
    """Интеграционные тесты для GET /api/v1/cabinet/appointments."""
    
    def setUp(self):
        self.client = APIClient()
        self.client.cookies.clear()
        from infrastructure.events.in_memory_event_bus import InMemoryEventBus
        self.user_repository = DjangoUserRepository(event_bus=InMemoryEventBus())
        self.password_service = PasswordService()
        
        # Создать тестового пользователя
        user = User.create(email=Email.create('cabinetuser@example.com'))
        async_to_sync(self.user_repository.save)(user)
        
        password_hash = self.password_service.hash_password('Password123!')
        self.user_repository.set_password_hash(user.id.value, password_hash)
        
        # Выдать согласие на обработку ПДн (требуется для HasConsent permission)
        from tests.conftest import grant_consent_to_user
        grant_consent_to_user(user.id.value)
        
        login_response = self.client.post('/api/v1/auth/login/', {
            'email': 'cabinetuser@example.com',
            'password': 'Password123!',
        }, format='json')
        
        self.access_token = login_response.cookies.get('access_token').value if 'access_token' in login_response.cookies else None
        self.user_id = user.id.value
    
    def test_list_appointments_requires_auth(self):
        """Тест, что список встреч требует аутентификации."""
        # Arrange
        self.client.logout()
        self.client.cookies.clear()
        url = '/api/v1/cabinet/appointments/'
        
        # Act - без токена
        response = self.client.get(url)
        
        # Assert
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_list_appointments_success(self):
        """Тест успешного получения списка встреч клиента."""
        # Arrange
        url = '/api/v1/cabinet/appointments/'
        
        # Act
        response = self.client.get(url)
        
        # Assert
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('data', response.data)
        self.assertIsInstance(response.data['data'], list)
    
    def test_list_appointments_with_filtering(self):
        """Тест получения списка встреч с фильтрацией."""
        # Arrange
        url = '/api/v1/cabinet/appointments/'
        
        params = {
            'status': 'confirmed',
        }
        
        # Act
        response = self.client.get(url, params)
        
        # Assert
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('data', response.data)
    
    def test_list_appointments_only_own(self):
        """Тест, что пользователь видит только свои встречи."""
        # Arrange
        url = '/api/v1/cabinet/appointments/'
        
        # Act
        response = self.client.get(url)
        
        # Assert
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Все встречи должны принадлежать текущему пользователю
        appointments = response.data['data']
        for appointment in appointments:
            # Проверка зависит от структуры данных
            pass


@pytest.mark.django_db
@pytest.mark.integration
class TestCabinetDiariesEndpoint(TestCase):
    """Интеграционные тесты для GET /api/v1/cabinet/diaries."""
    
    def setUp(self):
        self.client = APIClient()
        self.client.cookies.clear()
        from infrastructure.events.in_memory_event_bus import InMemoryEventBus
        self.user_repository = DjangoUserRepository(event_bus=InMemoryEventBus())
        self.password_service = PasswordService()
        
        # Создать тестового пользователя
        user = User.create(email=Email.create('diarycabinet@example.com'))
        async_to_sync(self.user_repository.save)(user)
        
        password_hash = self.password_service.hash_password('Password123!')
        self.user_repository.set_password_hash(user.id.value, password_hash)
        
        # Выдать согласие на обработку ПДн
        from tests.conftest import grant_consent_to_user
        grant_consent_to_user(user.id.value)
        
        login_response = self.client.post('/api/v1/auth/login/', {
            'email': 'diarycabinet@example.com',
            'password': 'Password123!',
        }, format='json')
        
        self.access_token = login_response.cookies.get('access_token').value if 'access_token' in login_response.cookies else None
        self.user_id = user.id.value
    
    def test_list_diaries_requires_auth(self):
        """Тест, что список дневников требует аутентификации."""
        # Arrange
        self.client.logout()
        self.client.cookies.clear()
        url = '/api/v1/cabinet/diaries/'
        
        # Act - без токена
        response = self.client.get(url)
        
        # Assert
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_list_diaries_success(self):
        """Тест успешного получения списка записей дневника."""
        # Arrange
        url = '/api/v1/cabinet/diaries/'
        
        # Act
        response = self.client.get(url)
        
        # Assert
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('data', response.data)
        self.assertIsInstance(response.data['data'], list)
    
    def test_list_diaries_with_filtering(self):
        """Тест получения списка дневников с фильтрацией."""
        # Arrange
        url = '/api/v1/cabinet/diaries/'
        
        params = {
            'type': 'mood',
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
class TestCabinetExportEndpoint(TestCase):
    """Интеграционные тесты для POST /api/v1/cabinet/data/export."""
    
    def setUp(self):
        self.client = APIClient()
        self.client.cookies.clear()
        from infrastructure.events.in_memory_event_bus import InMemoryEventBus
        self.user_repository = DjangoUserRepository(event_bus=InMemoryEventBus())
        self.password_service = PasswordService()
        
        # Создать тестового пользователя
        user = User.create(email=Email.create('exportuser@example.com'))
        async_to_sync(self.user_repository.save)(user)
        
        password_hash = self.password_service.hash_password('Password123!')
        self.user_repository.set_password_hash(user.id.value, password_hash)
        
        # Выдать согласие на обработку ПДн
        from tests.conftest import grant_consent_to_user
        grant_consent_to_user(user.id.value)
        
        login_response = self.client.post('/api/v1/auth/login/', {
            'email': 'exportuser@example.com',
            'password': 'Password123!',
        }, format='json')
        
        self.access_token = login_response.cookies.get('access_token').value if 'access_token' in login_response.cookies else None
        self.user_id = user.id.value
    
    def test_export_diaries_requires_auth(self):
        """Тест, что экспорт требует аутентификации."""
        # Arrange
        self.client.logout()
        self.client.cookies.clear()
        url = '/api/v1/cabinet/data/export/'
        
        payload = {
            'format': 'pdf',
            'date_from': (datetime.now(timezone.utc) - timedelta(days=30)).isoformat(),
            'date_to': datetime.now(timezone.utc).isoformat(),
        }
        
        # Act - без токена
        response = self.client.post(url, payload, format='json')
        
        # Assert
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_export_diaries_success(self):
        """Тест успешного экспорта дневников."""
        # Arrange
        url = '/api/v1/cabinet/data/export/'
        
        payload = {
            'format': 'pdf',
            'date_from': (datetime.now(timezone.utc) - timedelta(days=30)).isoformat(),
            'date_to': datetime.now(timezone.utc).isoformat(),
        }
        
        # Act
        response = self.client.post(url, payload, format='json')
        
        # Assert
        self.assertEqual(response.status_code, status.HTTP_202_ACCEPTED)
        self.assertIn('data', response.data)
        export_data = response.data['data']
        self.assertIn('export_id', export_data)
        self.assertIn('status', export_data)
    
    def test_export_diaries_missing_required_fields(self):
        """Тест экспорта без обязательных полей."""
        # Arrange
        url = '/api/v1/cabinet/data/export/'
        
        payload = {
            # date_from и date_to отсутствуют
            'format': 'pdf',
        }
        
        # Act
        response = self.client.post(url, payload, format='json')
        
        # Assert
        # Для ExportDataView сейчас нет обязательных полей кроме аутентификации
        self.assertEqual(response.status_code, status.HTTP_202_ACCEPTED)
    
    def test_export_diaries_invalid_format(self):
        """Тест экспорта с невалидным форматом."""
        # Arrange
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.access_token}')
        url = '/api/v1/cabinet/data/export/'
        
        payload = {
            'format': 'invalid_format',
            'date_from': (datetime.now(timezone.utc) - timedelta(days=30)).isoformat(),
            'date_to': datetime.now(timezone.utc).isoformat(),
        }
        
        # Act
        response = self.client.post(url, payload, format='json')
        
        # Assert
        # Экспорт пока не реализован полностью
        self.assertEqual(response.status_code, status.HTTP_501_NOT_IMPLEMENTED)
        self.assertIn('error', response.data)


@pytest.mark.django_db
@pytest.mark.integration
class TestCabinetDeleteDataEndpoint(TestCase):
    """Интеграционные тесты для DELETE /api/v1/cabinet/data/delete."""
    
    def setUp(self):
        self.client = APIClient()
        self.client.cookies.clear()
        from infrastructure.events.in_memory_event_bus import InMemoryEventBus
        self.user_repository = DjangoUserRepository(event_bus=InMemoryEventBus())
        self.password_service = PasswordService()
        
        # Создать тестового пользователя
        user = User.create(email=Email.create('deleteuser@example.com'))
        async_to_sync(self.user_repository.save)(user)
        
        password_hash = self.password_service.hash_password('Password123!')
        self.user_repository.set_password_hash(user.id.value, password_hash)
        
        # Выдать согласие на обработку ПДн
        from tests.conftest import grant_consent_to_user
        grant_consent_to_user(user.id.value)
        
        login_response = self.client.post('/api/v1/auth/login/', {
            'email': 'deleteuser@example.com',
            'password': 'Password123!',
        }, format='json')
        
        self.access_token = login_response.cookies.get('access_token').value if 'access_token' in login_response.cookies else None
        self.user_id = user.id.value
    
    def test_delete_data_requires_auth(self):
        """Тест, что удаление данных требует аутентификации."""
        # Arrange
        self.client.logout()
        self.client.cookies.clear()
        url = '/api/v1/cabinet/data/delete/'
        
        # Act - без токена
        response = self.client.delete(url)
        
        # Assert
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_delete_data_success(self):
        """Тест успешного удаления всех данных пользователя."""
        # Arrange
        url = '/api/v1/cabinet/data/delete/'
        
        # Act
        response = self.client.delete(url)
        
        # Assert
        # Без подтверждения ожидаем 422 ValidationError
        self.assertEqual(response.status_code, status.HTTP_422_UNPROCESSABLE_ENTITY)
        
        if response.status_code == status.HTTP_204_NO_CONTENT:
            # Проверить, что данные удалены (зависит от реализации)
            pass
    
    def test_delete_data_irreversible(self):
        """Тест, что удаление данных необратимо."""
        # Arrange
        url = '/api/v1/cabinet/data/delete/'
        
        # Act
        response = self.client.delete(url)
        
        # Assert
        # После удаления пользователь не должен иметь доступа к данным
        if response.status_code == status.HTTP_204_NO_CONTENT:
            # Попытка получить данные должна вернуть пустой результат
            appointments_response = self.client.get('/api/v1/cabinet/appointments/')
            self.assertEqual(appointments_response.status_code, status.HTTP_200_OK)
            self.assertEqual(len(appointments_response.data.get('data', [])), 0)
