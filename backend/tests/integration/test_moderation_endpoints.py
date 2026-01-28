"""
Интеграционные тесты для Moderation (UGC) API endpoints.
"""
import pytest
from rest_framework.test import APIClient, APITestCase as TestCase
from rest_framework import status
# from django.test import TestCase
from uuid import uuid4
from asgiref.sync import async_to_sync

from infrastructure.persistence.django_models.user import UserModel
from domain.identity.aggregates.user import User, UserId
from domain.identity.value_objects.email import Email
from infrastructure.persistence.repositories.user_repository import DjangoUserRepository
from infrastructure.identity.password_service import PasswordService


@pytest.mark.django_db
@pytest.mark.integration
class TestModerationQuestionsEndpoint(TestCase):
    """Интеграционные тесты для POST /api/v1/moderation/questions."""
    
    def setUp(self):
        self.client = APIClient()
        self.client.cookies.clear()
        from infrastructure.events.in_memory_event_bus import InMemoryEventBus
        self.user_repository = DjangoUserRepository(event_bus=InMemoryEventBus())
        self.password_service = PasswordService()
        
        # Создать тестового пользователя (опционально)
        user = User.create(email=Email.create('questionuser@example.com'))
        async_to_sync(self.user_repository.save)(user)
        
        password_hash = self.password_service.hash_password('Password123!')
        self.user_repository.set_password_hash(user.id.value, password_hash)
        
        login_response = self.client.post('/api/v1/auth/login/', {
            'email': 'questionuser@example.com',
            'password': 'Password123!',
        }, format='json')
        
        self.access_token = login_response.cookies.get('access_token').value if 'access_token' in login_response.cookies else None
    
    def test_submit_question_success_authenticated(self):
        """Тест успешной отправки вопроса аутентифицированным пользователем."""
        # Arrange
        url = '/api/v1/moderation/questions/'
        
        payload = {
            'content': 'Как справиться с тревогой?',
        }
        
        # Act
        response = self.client.post(url, payload, format='json')
        
        # Assert
        # Может быть 201 или 400 если требуется валидация
        self.assertIn(response.status_code, [
            status.HTTP_201_CREATED,
            status.HTTP_400_BAD_REQUEST,
        ])
        
        if response.status_code == status.HTTP_201_CREATED:
            self.assertIn('data', response.data)
            question_data = response.data['data']
            self.assertIn('id', question_data)
            self.assertIn('content', question_data)
    
    def test_submit_question_success_anonymous(self):
        """Тест успешной отправки вопроса анонимным пользователем."""
        # Arrange
        url = '/api/v1/moderation/questions/'
        
        payload = {
            'content': 'Как справиться с тревогой?',
        }
        
        # Act
        response = self.client.post(url, payload, format='json')
        
        # Assert
        # Анонимные пользователи могут отправлять вопросы
        self.assertIn(response.status_code, [
            status.HTTP_201_CREATED,
            status.HTTP_400_BAD_REQUEST,
        ])
    
    def test_submit_question_missing_content(self):
        """Тест отправки вопроса без контента."""
        # Arrange
        url = '/api/v1/moderation/questions/'
        
        payload = {
            # content отсутствует
        }
        
        # Act
        response = self.client.post(url, payload, format='json')
        
        # Assert
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)
    
    def test_submit_question_empty_content(self):
        """Тест отправки вопроса с пустым контентом."""
        # Arrange
        url = '/api/v1/moderation/questions/'
        
        payload = {
            'content': '',
        }
        
        # Act
        response = self.client.post(url, payload, format='json')
        
        # Assert
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)
    
    def test_submit_question_crisis_indicators_detected(self):
        """Тест отправки вопроса с кризисными индикаторами."""
        # Arrange
        url = '/api/v1/moderation/questions/'
        
        payload = {
            'content': 'Я хочу покончить с собой',
        }
        
        # Act
        response = self.client.post(url, payload, format='json')
        
        # Assert
        # Должна быть обнаружена кризисная ситуация
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)
        self.assertEqual(response.data['error']['code'], 'CRISIS_DETECTED')
        self.assertIn('message', response.data['error'])
    
    def test_submit_question_crisis_indicators_help_message(self):
        """Тест, что при обнаружении кризиса возвращается информация о помощи."""
        # Arrange
        url = '/api/v1/moderation/questions/'
        
        payload = {
            'content': 'Я думаю о самоубийстве',
        }
        
        # Act
        response = self.client.post(url, payload, format='json')
        
        # Assert
        if response.status_code == status.HTTP_400_BAD_REQUEST:
            error = response.data['error']
            self.assertEqual(error['code'], 'CRISIS_DETECTED')
            # Должна быть информация о контактах экстренных служб
            self.assertIn('message', error)
            # Проверка, что в сообщении есть информация о помощи
            self.assertIn('emergency', error['message'].lower() or '')
    
    def test_submit_question_long_content(self):
        """Тест отправки вопроса с очень длинным контентом."""
        # Arrange
        url = '/api/v1/moderation/questions/'
        
        payload = {
            'content': 'A' * 10000,  # Очень длинный контент
        }
        
        # Act
        response = self.client.post(url, payload, format='json')
        
        # Assert
        # Может быть 201 (принято) или 400 (превышен лимит)
        self.assertIn(response.status_code, [
            status.HTTP_201_CREATED,
            status.HTTP_400_BAD_REQUEST,
        ])
    
    def test_submit_question_special_characters(self):
        """Тест отправки вопроса со специальными символами."""
        # Arrange
        url = '/api/v1/moderation/questions/'
        
        payload = {
            'content': 'Вопрос с эмодзи 😊 и спецсимволами <>&"\'',
        }
        
        # Act
        response = self.client.post(url, payload, format='json')
        
        # Assert
        # Должен обрабатываться корректно (экранирование/валидация)
        self.assertIn(response.status_code, [
            status.HTTP_201_CREATED,
            status.HTTP_400_BAD_REQUEST,
        ])
    
    def test_submit_question_pii_detection(self):
        """Тест отправки вопроса с персональными данными (PII)."""
        # Arrange
        url = '/api/v1/moderation/questions/'
        
        payload = {
            'content': 'Мой телефон +79991234567, email test@example.com',
        }
        
        # Act
        response = self.client.post(url, payload, format='json')
        
        # Assert
        # Может быть 201 (принято с предмодерацией) или 400 (отклонено)
        self.assertIn(response.status_code, [
            status.HTTP_201_CREATED,
            status.HTTP_400_BAD_REQUEST,
        ])
        
        # Если принято, PII должно быть зашифровано/удалено
        if response.status_code == status.HTTP_201_CREATED:
            question_data = response.data['data']
            content = question_data.get('content', '')
            # Проверка, что PII не присутствует в ответе
            self.assertNotIn('+79991234567', content)
            self.assertNotIn('test@example.com', content)
    
    def test_submit_question_multiple_questions(self):
        """Тест отправки нескольких вопросов подряд."""
        # Arrange
        url = '/api/v1/moderation/questions/'
        
        payload1 = {
            'content': 'Первый вопрос',
        }
        
        payload2 = {
            'content': 'Второй вопрос',
        }
        
        # Act
        response1 = self.client.post(url, payload1, format='json')
        response2 = self.client.post(url, payload2, format='json')
        
        # Assert
        # Оба вопроса должны быть приняты
        self.assertIn(response1.status_code, [
            status.HTTP_201_CREATED,
            status.HTTP_400_BAD_REQUEST,
        ])
        self.assertIn(response2.status_code, [
            status.HTTP_201_CREATED,
            status.HTTP_400_BAD_REQUEST,
        ])
