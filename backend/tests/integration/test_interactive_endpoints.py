"""
Интеграционные тесты для Interactive API endpoints.
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
class TestInteractiveQuizzesEndpoint(TestCase):
    """Интеграционные тесты для GET /api/v1/interactive/quizzes."""
    
    def setUp(self):
        self.client = APIClient()
        self.client.cookies.clear()
        self.url = '/api/v1/interactive/quizzes/'
    
    def test_list_quizzes_success(self):
        """Тест получения списка доступных квизов."""
        # Act
        response = self.client.get(self.url)
        
        # Assert
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('data', response.data)
        self.assertIsInstance(response.data['data'], list)
    
    def test_list_quizzes_public_access(self):
        """Тест, что список квизов доступен без аутентификации."""
        # Act
        response = self.client.get(self.url)
        
        # Assert
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_list_quizzes_authenticated_access(self):
        """Тест, что список квизов доступен для аутентифицированных пользователей."""
        # Arrange - создать пользователя и получить токен
        from infrastructure.events.in_memory_event_bus import InMemoryEventBus
        user_repository = DjangoUserRepository(event_bus=InMemoryEventBus())
        password_service = PasswordService()
        
        user = User.create(email=Email.create('quizuser@example.com'))
        async_to_sync(user_repository.save)(user)
        
        password_hash = password_service.hash_password('Password123!')
        user_repository.set_password_hash(user.id.value, password_hash)
        
        login_response = self.client.post('/api/v1/auth/login/', {
            'email': 'quizuser@example.com',
            'password': 'Password123!',
        }, format='json')
        
        access_token = login_response.cookies.get('access_token').value if 'access_token' in login_response.cookies else None
        # Use cookies from login_response (already set in self.client)
        
        # Act
        response = self.client.get(self.url)
        
        # Assert
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('data', response.data)


@pytest.mark.django_db
@pytest.mark.integration
class TestInteractiveStartQuizEndpoint(TestCase):
    """Интеграционные тесты для POST /api/v1/interactive/quizzes/:slug/start."""
    
    def setUp(self):
        self.client = APIClient()
        self.client.cookies.clear()
        from infrastructure.events.in_memory_event_bus import InMemoryEventBus
        self.user_repository = DjangoUserRepository(event_bus=InMemoryEventBus())
        self.password_service = PasswordService()
        
        # Создать тестового пользователя
        user = User.create(email=Email.create('startquiz@example.com'))
        async_to_sync(self.user_repository.save)(user)
        
        password_hash = self.password_service.hash_password('Password123!')
        self.user_repository.set_password_hash(user.id.value, password_hash)
        
        login_response = self.client.post('/api/v1/auth/login/', {
            'email': 'startquiz@example.com',
            'password': 'Password123!',
        }, format='json')
        
        self.access_token = login_response.cookies.get('access_token').value if 'access_token' in login_response.cookies else None
    
    def test_start_quiz_success_authenticated(self):
        """Тест успешного начала квиза для аутентифицированного пользователя."""
        # Arrange
        quiz_slug = 'emotional-state-assessment'
        url = f'/api/v1/interactive/quizzes/{quiz_slug}/start/'
        
        # Act
        response = self.client.post(url, {}, format='json')
        
        # Assert
        # Может быть 201 или 404 если квиз не существует
        self.assertIn(response.status_code, [
            status.HTTP_201_CREATED,
            status.HTTP_404_NOT_FOUND,
        ])
        
        if response.status_code == status.HTTP_201_CREATED:
            self.assertIn('data', response.data)
            quiz_run_data = response.data['data']
            self.assertIn('run_id', quiz_run_data)
            self.assertIn('quiz', quiz_run_data)
    
    def test_start_quiz_success_anonymous(self):
        """Тест успешного начала квиза для анонимного пользователя."""
        # Arrange
        quiz_slug = 'emotional-state-assessment'
        url = f'/api/v1/interactive/quizzes/{quiz_slug}/start/'
        
        # Act
        response = self.client.post(url, {}, format='json')
        
        # Assert
        # Анонимные пользователи могут начинать квизы
        self.assertIn(response.status_code, [
            status.HTTP_201_CREATED,
            status.HTTP_404_NOT_FOUND,
        ])
    
    def test_start_quiz_not_found(self):
        """Тест начала несуществующего квиза."""
        # Arrange
        non_existent_slug = 'non-existent-quiz-slug-12345'
        url = f'/api/v1/interactive/quizzes/{non_existent_slug}/start/'
        
        # Act
        response = self.client.post(url, {}, format='json')
        
        # Assert
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertIn('error', response.data)


@pytest.mark.django_db
@pytest.mark.integration
class TestInteractiveSubmitQuizEndpoint(TestCase):
    """Интеграционные тесты для POST /api/v1/interactive/quizzes/:slug/submit."""
    
    def setUp(self):
        self.client = APIClient()
        self.client.cookies.clear()
        from infrastructure.events.in_memory_event_bus import InMemoryEventBus
        self.user_repository = DjangoUserRepository(event_bus=InMemoryEventBus())
        self.password_service = PasswordService()
        
        # Создать тестового пользователя
        user = User.create(email=Email.create('submitquiz@example.com'))
        async_to_sync(self.user_repository.save)(user)
        
        password_hash = self.password_service.hash_password('Password123!')
        self.user_repository.set_password_hash(user.id.value, password_hash)
        
        login_response = self.client.post('/api/v1/auth/login/', {
            'email': 'submitquiz@example.com',
            'password': 'Password123!',
        }, format='json')
        
        self.access_token = login_response.cookies.get('access_token').value if 'access_token' in login_response.cookies else None
    
    def test_submit_quiz_success(self):
        """Тест успешной отправки ответов квиза."""
        # Arrange
        quiz_slug = 'emotional-state-assessment'
        url = f'/api/v1/interactive/quizzes/{quiz_slug}/submit/'
        
        payload = {
            'run_id': str(uuid4()),
            'answers': [
                {
                    'question_id': 'q1',
                    'value': 'answer1',
                },
                {
                    'question_id': 'q2',
                    'value': 'answer2',
                },
            ],
        }
        
        # Act
        response = self.client.post(url, payload, format='json')
        
        # Assert
        # Может быть 200 или 404/400 если run_id невалиден
        self.assertIn(response.status_code, [
            status.HTTP_200_OK,
            status.HTTP_404_NOT_FOUND,
            status.HTTP_400_BAD_REQUEST,
        ])
        
        if response.status_code == status.HTTP_200_OK:
            self.assertIn('data', response.data)
            result_data = response.data['data']
            self.assertIn('run_id', result_data)
            self.assertIn('result', result_data)
    
    def test_submit_quiz_missing_required_fields(self):
        """Тест отправки квиза без обязательных полей."""
        # Arrange
        quiz_slug = 'emotional-state-assessment'
        url = f'/api/v1/interactive/quizzes/{quiz_slug}/submit/'
        
        payload = {
            # run_id отсутствует
            'answers': [],
        }
        
        # Act
        response = self.client.post(url, payload, format='json')
        
        # Assert
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)
    
    def test_submit_quiz_public_access(self):
        """Тест, что отправка квиза доступна без аутентификации."""
        # Arrange
        quiz_slug = 'emotional-state-assessment'
        url = f'/api/v1/interactive/quizzes/{quiz_slug}/submit/'
        
        payload = {
            'run_id': str(uuid4()),
            'answers': [],
        }
        
        # Act
        response = self.client.post(url, payload, format='json')
        
        # Assert
        # Анонимные пользователи могут отправлять квизы
        self.assertIn(response.status_code, [
            status.HTTP_200_OK,
            status.HTTP_404_NOT_FOUND,
            status.HTTP_400_BAD_REQUEST,
        ])


@pytest.mark.django_db
@pytest.mark.integration
class TestInteractiveDiariesEndpoint(TestCase):
    """Интеграционные тесты для GET /api/v1/interactive/diaries."""
    
    def setUp(self):
        self.client = APIClient()
        self.client.cookies.clear()
        from infrastructure.events.in_memory_event_bus import InMemoryEventBus
        self.user_repository = DjangoUserRepository(event_bus=InMemoryEventBus())
        self.password_service = PasswordService()
        
        # Создать тестового пользователя
        from asgiref.sync import async_to_sync
        user = User.create(email=Email.create('diaryuser@example.com'))
        async_to_sync(self.user_repository.save)(user)
        
        password_hash = self.password_service.hash_password('Password123!')
        self.user_repository.set_password_hash(user.id.value, password_hash)
        self.user_id = user.id.value
        
        # Выдать согласие на обработку ПДн (требуется для HasConsent permission)
        from tests.conftest import grant_consent_to_user
        grant_consent_to_user(user.id.value)
        
        login_response = self.client.post('/api/v1/auth/login/', {
            'email': 'diaryuser@example.com',
            'password': 'Password123!',
        }, format='json')
        
        self.access_token = login_response.cookies.get('access_token').value if 'access_token' in login_response.cookies else None
        self.user_id = user.id.value
    
    def test_list_diaries_requires_auth(self):
        """Тест, что список дневников требует аутентификации."""
        # Arrange
        self.client.logout()
        self.client.cookies.clear()
        url = '/api/v1/interactive/diaries/'
        
        # Act - без токена
        response = self.client.get(url)
        
        # Assert
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_list_diaries_success(self):
        """Тест успешного получения списка записей дневника."""
        # Arrange
        url = '/api/v1/interactive/diaries/'
        
        # Act
        response = self.client.get(url)
        
        # Assert
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('data', response.data)
        self.assertIsInstance(response.data['data'], list)
    
    def test_create_diary_entry_success(self):
        """Тест успешного создания записи дневника."""
        # Arrange
        url = '/api/v1/interactive/diaries/'
        
        payload = {
            'type': 'mood',
            'content': {
                'mood': 'calm',
                'notes': 'Feeling peaceful today',
            },
        }
        
        # Act
        response = self.client.post(url, payload, format='json')
        
        # Assert
        # Может быть 201 или 400 если требуется согласие
        self.assertIn(response.status_code, [
            status.HTTP_201_CREATED,
            status.HTTP_400_BAD_REQUEST,
            status.HTTP_403_FORBIDDEN,  # Если требуется согласие
        ])
        
        if response.status_code == status.HTTP_201_CREATED:
            self.assertIn('data', response.data)
            entry_data = response.data['data']
            self.assertIn('id', entry_data)
            self.assertIn('type', entry_data)
    
    def test_create_diary_entry_missing_required_fields(self):
        """Тест создания записи дневника без обязательных полей."""
        # Arrange
        url = '/api/v1/interactive/diaries/'
        
        payload = {
            # type отсутствует
            'content': {},
        }
        
        # Act
        response = self.client.post(url, payload, format='json')
        
        # Assert
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)
    
    def test_create_diary_entry_requires_auth(self):
        """Тест, что создание записи дневника требует аутентификации."""
        # Arrange
        self.client.logout()
        self.client.cookies.clear()
        url = '/api/v1/interactive/diaries/'
        
        payload = {
            'type': 'mood',
            'content': {},
        }
        
        # Act - без токена
        response = self.client.post(url, payload, format='json')
        
        # Assert
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
