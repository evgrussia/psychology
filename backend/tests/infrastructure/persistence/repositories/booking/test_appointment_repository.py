"""
Unit тесты для PostgresAppointmentRepository.
"""
import pytest
from datetime import datetime, timezone, timedelta
from domain.booking.aggregates.appointment import Appointment, AppointmentId
from domain.booking.aggregates.service import Service, ServiceId
from domain.booking.value_objects import (
    TimeSlot,
    AppointmentStatus,
    AppointmentFormat,
    BookingMetadata,
    Money,
    Currency,
)
from domain.booking.value_objects.timezone import Timezone
from domain.identity.aggregates.user import UserId
from infrastructure.persistence.repositories.booking.appointment_repository import PostgresAppointmentRepository
from infrastructure.events.in_memory_event_bus import InMemoryEventBus


@pytest.mark.django_db
class TestPostgresAppointmentRepository:
    """Unit тесты для PostgresAppointmentRepository."""
    
    @pytest.fixture
    def event_bus(self):
        return InMemoryEventBus()
    
    @pytest.fixture
    def repository(self, event_bus):
        return PostgresAppointmentRepository(event_bus)
    
    @pytest.fixture
    def service(self):
        """Создать тестовую услугу."""
        return Service(
            id=ServiceId.generate(),
            slug='test-service',
            name='Test Service',
            description='Test Description',
            price=Money(5000.0, Currency.RUB),
            duration_minutes=60,
            supported_formats=[AppointmentFormat.ONLINE, AppointmentFormat.OFFLINE],
            cancel_free_hours=24,
            cancel_partial_hours=12,
            reschedule_min_hours=6
        )
    
    @pytest.fixture
    def client_id(self):
        return UserId.generate()
    
    @pytest.fixture
    def time_slot(self):
        """Создать тестовый временной слот."""
        start = datetime.now(timezone.utc) + timedelta(days=1)
        end = start + timedelta(hours=1)
        return TimeSlot(
            start_at=start,
            end_at=end,
            timezone=Timezone('Europe/Moscow')
        )
    
    @pytest.mark.asyncio
    async def test_save_and_find_by_id(self, repository, service, client_id, time_slot):
        """Тест сохранения и поиска по ID."""
        # Создать appointment через factory method
        appointment = Appointment.create(
            service=service,
            client_id=client_id,
            slot=time_slot,
            format=AppointmentFormat.ONLINE,
            metadata=BookingMetadata()
        )
        
        await repository.save(appointment)
        
        found = await repository.find_by_id(appointment.id)
        
        assert found is not None
        assert found.id.value == appointment.id.value
        assert found.slot.start_at == appointment.slot.start_at
    
    @pytest.mark.asyncio
    async def test_find_by_client_id(self, repository, service, client_id, time_slot):
        """Тест поиска по client_id."""
        appointment = Appointment.create(
            service=service,
            client_id=client_id,
            slot=time_slot,
            format=AppointmentFormat.ONLINE,
            metadata=BookingMetadata()
        )
        
        await repository.save(appointment)
        
        appointments = await repository.find_by_client_id(client_id)
        
        assert len(appointments) > 0
        assert any(a.id.value == appointment.id.value for a in appointments)
    
    @pytest.mark.asyncio
    async def test_find_conflicting_appointments(self, repository, service, client_id, time_slot):
        """Тест поиска конфликтующих Appointment."""
        appointment = Appointment.create(
            service=service,
            client_id=client_id,
            slot=time_slot,
            format=AppointmentFormat.ONLINE,
            metadata=BookingMetadata()
        )
        
        await repository.save(appointment)
        
        # Создать конфликтующий слот
        conflicting_slot = TimeSlot(
            start_at=time_slot.start_at + timedelta(minutes=30),
            end_at=time_slot.end_at + timedelta(minutes=30),
            timezone=time_slot.timezone
        )
        
        conflicts = await repository.find_conflicting_appointments(conflicting_slot)
        
        assert len(conflicts) > 0
        assert any(c.id.value == appointment.id.value for c in conflicts)
