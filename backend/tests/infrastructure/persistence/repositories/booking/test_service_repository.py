"""
Unit тесты для PostgresServiceRepository.
"""
import pytest
from domain.booking.aggregates.service import Service, ServiceId
from domain.booking.value_objects.money import Money
from domain.booking.value_objects.currency import Currency
from domain.booking.value_objects.appointment_format import AppointmentFormat
from infrastructure.persistence.repositories.booking.service_repository import PostgresServiceRepository
from infrastructure.persistence.django_models.booking import ServiceModel


@pytest.mark.django_db
class TestPostgresServiceRepository:
    """Unit тесты для PostgresServiceRepository."""
    
    @pytest.fixture
    def repository(self):
        return PostgresServiceRepository()
    
    @pytest.mark.asyncio
    async def test_find_by_id(self, repository):
        """Тест поиска по ID."""
        from asgiref.sync import sync_to_async
        
        service_model = await sync_to_async(ServiceModel.objects.create)(
            id=ServiceId.generate().value,
            slug='test-service',
            name='Test Service',
            description='Test Description',
            price_amount=5000.0,
            price_currency='RUB',
            duration_minutes=60,
            supported_formats=['online', 'offline'],
            cancel_free_hours=24,
            cancel_partial_hours=12,
            reschedule_min_hours=6,
            status='published'
        )
        
        service_id = ServiceId(service_model.id)
        
        found = await repository.find_by_id(service_id)
        
        assert found is not None
        assert found.id.value == service_model.id
        assert found.slug == service_model.slug
        assert found.name == service_model.name
        assert found.price.amount == float(service_model.price_amount)
        assert found.price.currency.code == service_model.price_currency
    
    @pytest.mark.asyncio
    async def test_find_by_id_not_found(self, repository):
        """Тест поиска по несуществующему ID."""
        non_existent_id = ServiceId.generate()
        
        found = await repository.find_by_id(non_existent_id)
        
        assert found is None
    
    @pytest.mark.asyncio
    async def test_find_by_slug(self, repository):
        """Тест поиска по slug."""
        from asgiref.sync import sync_to_async
        
        service_model = await sync_to_async(ServiceModel.objects.create)(
            id=ServiceId.generate().value,
            slug='test-service-by-slug',
            name='Test Service By Slug',
            description='Test Description',
            price_amount=5000.0,
            price_currency='RUB',
            duration_minutes=60,
            supported_formats=['online', 'offline'],
            cancel_free_hours=24,
            cancel_partial_hours=12,
            reschedule_min_hours=6,
            status='published'
        )
        
        found = await repository.find_by_slug('test-service-by-slug')
        
        assert found is not None
        assert found.id.value == service_model.id
        assert found.slug == 'test-service-by-slug'
    
    @pytest.mark.asyncio
    async def test_find_by_slug_not_found(self, repository):
        """Тест поиска по несуществующему slug."""
        found = await repository.find_by_slug('non-existent-service')
        
        assert found is None
    
    @pytest.mark.asyncio
    async def test_find_all(self, repository):
        """Тест поиска всех опубликованных услуг."""
        from asgiref.sync import sync_to_async
        
        # Создать несколько услуг
        service1 = await sync_to_async(ServiceModel.objects.create)(
            id=ServiceId.generate().value,
            slug='service-1',
            name='Service 1',
            description='Description 1',
            price_amount=1000.0,
            price_currency='RUB',
            duration_minutes=30,
            supported_formats=['online'],
            status='published'
        )
        
        service2 = await sync_to_async(ServiceModel.objects.create)(
            id=ServiceId.generate().value,
            slug='service-2',
            name='Service 2',
            description='Description 2',
            price_amount=2000.0,
            price_currency='RUB',
            duration_minutes=45,
            supported_formats=['offline'],
            status='published'
        )
        
        # Создать черновик (не должен попасть в результаты)
        await sync_to_async(ServiceModel.objects.create)(
            id=ServiceId.generate().value,
            slug='service-draft',
            name='Service Draft',
            description='Description Draft',
            price_amount=3000.0,
            price_currency='RUB',
            duration_minutes=60,
            supported_formats=['online'],
            status='draft'
        )
        
        services = await repository.find_all()
        
        assert len(services) >= 2
        service_ids = [s.id.value for s in services]
        assert service1.id in service_ids
        assert service2.id in service_ids
        # Проверяем, что черновик не попал
        draft_ids = [s.id.value for s in services if s.slug == 'service-draft']
        assert len(draft_ids) == 0
