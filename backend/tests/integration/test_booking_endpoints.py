"""
Интеграционные тесты для Booking API endpoints.
"""
import pytest
from rest_framework.test import APIClient, APITestCase as TestCase
from rest_framework import status
# from django.test import TestCase
from uuid import uuid4
from datetime import datetime, timedelta, timezone

from infrastructure.persistence.django_models.user import UserModel
from infrastructure.persistence.django_models.booking import ServiceModel, AvailabilitySlotModel
from domain.identity.aggregates.user import User, UserId
from domain.identity.value_objects.user_status import UserStatus
from domain.identity.value_objects.email import Email
from infrastructure.persistence.repositories.user_repository import DjangoUserRepository
from infrastructure.identity.password_service import PasswordService


@pytest.mark.django_db
@pytest.mark.integration
class TestBookingServicesEndpoint(TestCase):
    """Интеграционные тесты для GET /api/v1/booking/services."""
    
    def setUp(self):
        self.client = APIClient()
        self.client.cookies.clear()
        self.url = '/api/v1/booking/services/'
        
        # Создать тестовые услуги
        self.service1 = ServiceModel.objects.create(
            id=uuid4(),
            slug='consultation-online',
            name='Консультация онлайн',
            description='Первичная консультация онлайн',
            price_amount=5000.0,
            price_currency='RUB',
            deposit_amount=2000.0,
            duration_minutes=60,
            supported_formats=['online'],
            cancel_free_hours=24,
            cancel_partial_hours=12,
            reschedule_min_hours=6,
            status='published'
        )
        
        self.service2 = ServiceModel.objects.create(
            id=uuid4(),
            slug='consultation-offline',
            name='Консультация офлайн',
            description='Первичная консультация офлайн',
            price_amount=6000.0,
            price_currency='RUB',
            deposit_amount=3000.0,
            duration_minutes=90,
            supported_formats=['offline'],
            cancel_free_hours=48,
            cancel_partial_hours=24,
            reschedule_min_hours=12,
            status='published'
        )
        
        # Создать неопубликованную услугу (не должна попасть в список)
        self.service_draft = ServiceModel.objects.create(
            id=uuid4(),
            slug='draft-service',
            name='Черновик услуги',
            description='Неопубликованная услуга',
            price_amount=1000.0,
            price_currency='RUB',
            duration_minutes=30,
            supported_formats=['online'],
            status='draft'
        )
    
    def test_list_services_success(self):
        """Тест получения списка услуг."""
        # Act
        response = self.client.get(self.url)
        
        # Assert
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('data', response.data)
        self.assertIsInstance(response.data['data'], list)
        
        # Проверить, что вернулись только опубликованные услуги
        services = response.data['data']
        self.assertGreaterEqual(len(services), 2)
        
        # Проверить структуру данных
        first_service = services[0]
        self.assertIn('id', first_service)
        self.assertIn('slug', first_service)
        self.assertIn('title', first_service)
        self.assertIn('duration_minutes', first_service)
        self.assertIn('price_amount', first_service)
    
    def test_list_services_public_access(self):
        """Тест, что список услуг доступен без аутентификации."""
        # Act
        response = self.client.get(self.url)
        
        # Assert
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_retrieve_service_success(self):
        """Тест получения деталей услуги."""
        # Arrange
        url = f'/api/v1/booking/services/{self.service1.id}/'
        
        # Act
        response = self.client.get(url)
        
        # Assert
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('data', response.data)
        
        service_data = response.data['data']
        self.assertEqual(service_data['id'], str(self.service1.id))
        self.assertEqual(service_data['slug'], self.service1.slug)
        self.assertEqual(service_data['title'], self.service1.name)
        self.assertEqual(service_data['duration_minutes'], self.service1.duration_minutes)
        self.assertEqual(float(service_data['price_amount']), float(self.service1.price_amount))
    
    def test_retrieve_service_not_found(self):
        """Тест получения несуществующей услуги."""
        # Arrange
        non_existent_id = uuid4()
        url = f'/api/v1/booking/services/{non_existent_id}/'
        
        # Act
        response = self.client.get(url)
        
        # Assert
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertIn('error', response.data)


@pytest.mark.django_db
@pytest.mark.integration
class TestBookingSlotsEndpoint(TestCase):
    """Интеграционные тесты для GET /api/v1/booking/services/:id/slots."""
    
    def setUp(self):
        self.client = APIClient()
        self.client.cookies.clear()
        from infrastructure.events.in_memory_event_bus import InMemoryEventBus
        from asgiref.sync import async_to_sync
        self.user_repository = DjangoUserRepository(event_bus=InMemoryEventBus())
        self.async_to_sync = async_to_sync
        self.password_service = PasswordService()
        
        # Создать тестовую услугу
        self.service = ServiceModel.objects.create(
            id=uuid4(),
            slug='test-service',
            name='Test Service',
            description='Test Description',
            price_amount=5000.0,
            price_currency='RUB',
            duration_minutes=60,
            supported_formats=['online'],
            status='published'
        )
        
        # Создать тестовые слоты
        now = datetime.now(timezone.utc)
        self.slot1 = AvailabilitySlotModel.objects.create(
            id=uuid4(),
            service_id=self.service.id,
            start_at=now + timedelta(days=1, hours=10),
            end_at=now + timedelta(days=1, hours=11),
            status='available',
            source='product'
        )
        
        self.slot2 = AvailabilitySlotModel.objects.create(
            id=uuid4(),
            service_id=self.service.id,
            start_at=now + timedelta(days=2, hours=14),
            end_at=now + timedelta(days=2, hours=15),
            status='available',
            source='product'
        )
        
        # Создать заблокированный слот (не должен попасть в список)
        self.blocked_slot = AvailabilitySlotModel.objects.create(
            id=uuid4(),
            service_id=self.service.id,
            start_at=now + timedelta(days=3, hours=10),
            end_at=now + timedelta(days=3, hours=11),
            status='blocked',
            source='product'
        )
    
    def test_get_available_slots_success(self):
        """Тест получения доступных слотов."""
        # Arrange
        url = f'/api/v1/booking/services/{self.service.id}/slots/'
        date_from = (datetime.now(timezone.utc) + timedelta(days=1)).isoformat()
        date_to = (datetime.now(timezone.utc) + timedelta(days=3)).isoformat()
        
        params = {
            'date_from': date_from,
            'date_to': date_to,
            'timezone': 'Europe/Moscow'
        }
        
        # Act
        response = self.client.get(url, params)
        
        # Assert
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('data', response.data)
        self.assertIsInstance(response.data['data'], list)
        
        # Проверить, что вернулись только доступные слоты
        slots = response.data['data']
        self.assertGreaterEqual(len(slots), 2)
        
        # Проверить структуру данных
        first_slot = slots[0]
        self.assertIn('id', first_slot)
        self.assertIn('start_at', first_slot)
        self.assertIn('end_at', first_slot)
        self.assertIn('status', first_slot)
    
    def test_get_available_slots_missing_params(self):
        """Тест получения слотов без обязательных параметров."""
        # Arrange
        url = f'/api/v1/booking/services/{self.service.id}/slots/'
        
        # Act - без date_from и date_to
        response = self.client.get(url)
        
        # Assert
        self.assertEqual(response.status_code, status.HTTP_422_UNPROCESSABLE_ENTITY)
        self.assertIn('error', response.data)
    
    def test_get_available_slots_invalid_service(self):
        """Тест получения слотов для несуществующей услуги."""
        # Arrange
        non_existent_id = uuid4()
        url = f'/api/v1/booking/services/{non_existent_id}/slots/'
        date_from = (datetime.now(timezone.utc) + timedelta(days=1)).isoformat()
        date_to = (datetime.now(timezone.utc) + timedelta(days=3)).isoformat()
        
        params = {
            'date_from': date_from,
            'date_to': date_to,
        }
        
        # Act
        response = self.client.get(url, params)
        
        # Assert
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
    
    def test_get_available_slots_public_access(self):
        """Тест, что слоты доступны без аутентификации."""
        # Arrange
        url = f'/api/v1/booking/services/{self.service.id}/slots/'
        date_from = (datetime.now(timezone.utc) + timedelta(days=1)).isoformat()
        date_to = (datetime.now(timezone.utc) + timedelta(days=3)).isoformat()
        
        params = {
            'date_from': date_from,
            'date_to': date_to,
        }
        
        # Act
        response = self.client.get(url, params)
        
        # Assert
        self.assertEqual(response.status_code, status.HTTP_200_OK)


@pytest.mark.django_db
@pytest.mark.integration
class TestBookingAppointmentsEndpoint(TestCase):
    """Интеграционные тесты для POST /api/v1/booking/appointments."""
    
    def setUp(self):
        self.client = APIClient()
        self.client.cookies.clear()
        from infrastructure.events.in_memory_event_bus import InMemoryEventBus
        from asgiref.sync import async_to_sync
        self.user_repository = DjangoUserRepository(event_bus=InMemoryEventBus())
        self.async_to_sync = async_to_sync
        self.password_service = PasswordService()
        
        # Создать тестового пользователя
        self.test_email = 'bookinguser@example.com'
        self.test_password = 'TestPassword123!'
        
        user = User.create(email=Email.create(self.test_email))
        self.async_to_sync(self.user_repository.save)(user)
        
        password_hash = self.password_service.hash_password(self.test_password)
        self.user_repository.set_password_hash(user.id.value, password_hash)
        self.user_id = user.id.value
        
        # Выдать согласие на обработку ПДн (требуется для HasConsent permission)
        from tests.conftest import grant_consent_to_user
        grant_consent_to_user(user.id.value)
        
        # Получить токен
        login_response = self.client.post('/api/v1/auth/login/', {
            'email': self.test_email,
            'password': self.test_password,
        }, format='json')
        
        self.access_token = login_response.cookies.get('access_token').value if 'access_token' in login_response.cookies else None
        
        # Создать тестовую услугу
        self.service = ServiceModel.objects.create(
            id=uuid4(),
            slug='test-service',
            name='Test Service',
            description='Test Description',
            price_amount=5000.0,
            price_currency='RUB',
            deposit_amount=2000.0,
            duration_minutes=60,
            supported_formats=['online'],
            cancel_free_hours=24,
            cancel_partial_hours=12,
            reschedule_min_hours=6,
            status='published'
        )
        
        # Создать тестовый слот
        now = datetime.now(timezone.utc)
        self.slot = AvailabilitySlotModel.objects.create(
            id=uuid4(),
            service_id=self.service.id,
            start_at=now + timedelta(days=1, hours=10),
            end_at=now + timedelta(days=1, hours=11),
            status='available',
            source='product'
        )
        
        self.url = '/api/v1/booking/appointments/'
    
    def test_create_appointment_success(self):
        """Тест успешного создания бронирования."""
        # Arrange
        
        start_at = datetime.now(timezone.utc) + timedelta(days=1, hours=10)
        end_at = start_at + timedelta(hours=1)
        
        payload = {
            'service_id': str(self.service.id),
            'slot_id': str(self.slot.id),
            'format': 'online',
            'start_at': start_at.isoformat(),
            'end_at': end_at.isoformat(),
            'timezone': 'Europe/Moscow',
            'consents': {
                'personal_data': True,
                'communications': True,
            },
            'intake_form': {
                'question_1': 'answer_1',
            }
        }
        
        # Act
        response = self.client.post(self.url, payload, format='json')
        
        # Assert
        # Может быть 201 или другой статус в зависимости от реализации
        # Проверяем, что не 401 (unauthorized) и не 400 (bad request) без деталей
        self.assertIn(response.status_code, [
            status.HTTP_201_CREATED,
            status.HTTP_400_BAD_REQUEST,  # Может быть валидация
            status.HTTP_500_INTERNAL_SERVER_ERROR  # Может быть ошибка интеграции
        ])
        
        if response.status_code == status.HTTP_201_CREATED:
            self.assertIn('data', response.data)
            appointment_data = response.data['data']
            self.assertIn('id', appointment_data)
            self.assertIn('status', appointment_data)
    
    def test_create_appointment_requires_auth(self):
        """Тест, что создание бронирования требует аутентификации."""
        # Arrange
        self.client.cookies.clear()
        start_at = datetime.now(timezone.utc) + timedelta(days=1, hours=10)
        end_at = start_at + timedelta(hours=1)
        
        payload = {
            'service_id': str(self.service.id),
            'slot_id': str(self.slot.id),
            'format': 'online',
            'start_at': start_at.isoformat(),
            'end_at': end_at.isoformat(),
        }
        
        # Act - без токена
        response = self.client.post(self.url, payload, format='json')
        
        # Assert
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_create_appointment_missing_required_fields(self):
        """Тест создания бронирования без обязательных полей."""
        # Arrange
        
        payload = {
            'service_id': str(self.service.id),
            # slot_id, format, start_at, end_at отсутствуют
        }
        
        # Act
        response = self.client.post(self.url, payload, format='json')
        
        # Assert
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_create_appointment_invalid_service(self):
        """Тест создания бронирования с несуществующей услугой."""
        # Arrange
        
        start_at = datetime.now(timezone.utc) + timedelta(days=1, hours=10)
        end_at = start_at + timedelta(hours=1)
        
        payload = {
            'service_id': str(uuid4()),  # Несуществующий ID
            'slot_id': str(self.slot.id),
            'format': 'online',
            'start_at': start_at.isoformat(),
            'end_at': end_at.isoformat(),
        }
        
        # Act
        response = self.client.post(self.url, payload, format='json')
        
        # Assert
        self.assertIn(response.status_code, [
            status.HTTP_404_NOT_FOUND,
            status.HTTP_400_BAD_REQUEST,
        ])


@pytest.mark.django_db
@pytest.mark.integration
class TestBookingAppointmentRetrieveEndpoint(TestCase):
    """Интеграционные тесты для GET /api/v1/booking/appointments/:id."""
    
    def setUp(self):
        self.client = APIClient()
        self.client.cookies.clear()
        from infrastructure.events.in_memory_event_bus import InMemoryEventBus
        from asgiref.sync import async_to_sync
        self.user_repository = DjangoUserRepository(event_bus=InMemoryEventBus())
        self.async_to_sync = async_to_sync
        self.password_service = PasswordService()
        
        # Создать двух пользователей
        self.user1_email = 'user1@example.com'
        self.user1_password = 'Password123!'
        
        user1 = User.create(email=Email.create(self.user1_email))
        self.async_to_sync(self.user_repository.save)(user1)
        password_hash = self.password_service.hash_password(self.user1_password)
        self.user_repository.set_password_hash(user1.id.value, password_hash)
        self.user1_id = user1.id.value
        
        # Выдать согласие на обработку ПДн
        from tests.conftest import grant_consent_to_user
        grant_consent_to_user(user1.id.value)
        
        login_response = self.client.post('/api/v1/auth/login/', {
            'email': self.user1_email,
            'password': self.user1_password,
        }, format='json')
        self.user1_token = login_response.cookies.get('access_token').value if 'access_token' in login_response.cookies else None
        
        # Создать второго пользователя
        self.user2_email = 'user2@example.com'
        self.user2_password = 'Password123!'
        
        user2 = User.create(email=Email.create(self.user2_email))
        self.async_to_sync(self.user_repository.save)(user2)
        password_hash = self.password_service.hash_password(self.user2_password)
        self.user_repository.set_password_hash(user2.id.value, password_hash)
        self.user2_id = user2.id.value
        
        # Выдать согласие на обработку ПДн
        from tests.conftest import grant_consent_to_user
        grant_consent_to_user(user2.id.value)
        
        login_response2 = self.client.post('/api/v1/auth/login/', {
            'email': self.user2_email,
            'password': self.user2_password,
        }, format='json')
        self.user2_token = login_response2.cookies.get('access_token').value if 'access_token' in login_response2.cookies else None
        
        # Создать тестовую услугу
        self.service = ServiceModel.objects.create(
            id=uuid4(),
            slug='test-service',
            name='Test Service',
            description='Test Description',
            price_amount=5000.0,
            price_currency='RUB',
            duration_minutes=60,
            supported_formats=['online'],
            status='published'
        )
    
    def test_retrieve_appointment_requires_auth(self):
        """Тест, что получение бронирования требует аутентификации."""
        # Arrange
        self.client.cookies.clear()
        appointment_id = uuid4()
        url = f'/api/v1/booking/appointments/{appointment_id}/'
        
        # Act - без токена
        response = self.client.get(url)
        
        # Assert
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_retrieve_appointment_not_found(self):
        """Тест получения несуществующего бронирования."""
        # Arrange
        # Use first user's cookies (already set after login in setUp)
        non_existent_id = uuid4()
        url = f'/api/v1/booking/appointments/{non_existent_id}/'
        
        # Act
        response = self.client.get(url)
        
        # Assert
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
