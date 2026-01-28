"""
Integration тесты для Booking API endpoints.
"""
import pytest
from rest_framework.test import APIClient
from rest_framework import status
from django.test import TestCase
from uuid import uuid4

from infrastructure.persistence.django_models.user import UserModel
from domain.identity.aggregates.user import User, UserId
from domain.identity.value_objects.user_status import UserStatus
from domain.identity.value_objects.email import Email
from infrastructure.persistence.repositories.user_repository import DjangoUserRepository
from infrastructure.events.in_memory_event_bus import InMemoryEventBus


@pytest.mark.django_db
@pytest.mark.integration
class TestBookingServicesEndpoint(TestCase):
    """Интеграционные тесты для GET /api/v1/booking/services."""
    
    def setUp(self):
        self.client = APIClient()
        self.url = '/api/v1/booking/services/'
    
    def test_list_services_public_access(self):
        """Тест получения списка услуг (публичный доступ)."""
        # Act
        response = self.client.get(self.url)
        
        # Assert
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('data', response.data)
        # Может быть пустой список, если нет услуг в БД
        self.assertIsInstance(response.data['data'], list)


@pytest.mark.django_db
@pytest.mark.integration
class TestBookingAppointmentsEndpoint(TestCase):
    """Интеграционные тесты для Booking Appointments endpoints."""
    
    def setUp(self):
        self.client = APIClient()
        self.user_repository = DjangoUserRepository(event_bus=InMemoryEventBus())
    
    def test_create_appointment_requires_auth(self):
        """Тест, что создание бронирования требует аутентификации."""
        payload = {
            'service_id': str(uuid4()),
            'slot_id': str(uuid4()),
        }
        
        # Act
        response = self.client.post('/api/v1/booking/appointments/', payload, format='json')
        
        # Assert
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
