import pytest
from datetime import datetime, timezone
from uuid import uuid4

from infrastructure.persistence.mappers.user_mapper import UserMapper
from infrastructure.persistence.mappers.booking_mapper import AppointmentMapper, ServiceMapper
from infrastructure.persistence.mappers.client_cabinet_mapper import DiaryEntryMapper

from domain.identity.aggregates.user import User, UserId
from domain.identity.value_objects.email import Email
from domain.identity.value_objects.user_status import UserStatus
from domain.identity.value_objects.role import Role
from domain.booking.aggregates.appointment import Appointment, AppointmentId
from domain.booking.aggregates.service import Service, ServiceId
from domain.booking.value_objects.time_slot import TimeSlot
from domain.booking.value_objects.timezone import Timezone
from domain.booking.value_objects.appointment_format import AppointmentFormat
from domain.booking.value_objects.appointment_status import AppointmentStatus
from domain.booking.value_objects.money import Money
from domain.booking.value_objects.currency import Currency
from domain.client_cabinet.aggregates.diary_entry import DiaryEntry, DiaryEntryId
from domain.client_cabinet.value_objects.diary_type import DiaryType

from tests.factories import (
    UserModelFactory,
    AppointmentModelFactory,
    ServiceModelFactory,
    DiaryEntryModelFactory,
)


@pytest.mark.django_db
class TestUserMapper:
    def test_to_domain(self):
        model = UserModelFactory()
        user = UserMapper.to_domain(model, roles=[], consents=[])
        
        assert str(user.id.value) == str(model.id)
        assert user.email.value == model.email
        assert user.display_name == model.display_name
        assert user.status.value == model.status

    def test_to_persistence(self):
        user_id = UserId.generate()
        email = Email("test@example.com")
        user = User(
            id=user_id,
            email=email,
            phone=None,
            telegram_user_id=None,
            display_name="Test User",
            status=UserStatus.ACTIVE,
            roles=[Role.CLIENT],
            consents=[],
            created_at=datetime.now(timezone.utc)
        )
        
        persistence_data = UserMapper.to_persistence(user)
        
        assert str(persistence_data['id']) == str(user_id.value)
        assert persistence_data['email'] == email.value
        assert persistence_data['display_name'] == "Test User"
        assert persistence_data['status'] == UserStatus.ACTIVE.value


@pytest.mark.django_db
class TestServiceMapper:
    def test_to_domain(self):
        model = ServiceModelFactory()
        service = ServiceMapper.to_domain(model)
        
        assert str(service.id.value) == str(model.id)
        assert service.slug == model.slug
        assert service.name == model.name
        assert float(service.price.amount) == float(model.price_amount)
        assert service.price.currency.code == model.price_currency

    def test_to_persistence(self):
        service_id = ServiceId.generate()
        money = Money(amount=1000.0, currency=Currency.RUB)
        service = Service(
            id=service_id,
            slug="test-service",
            name="Test Service",
            description="Description",
            price=money,
            duration_minutes=60,
            supported_formats=[AppointmentFormat.ONLINE],
            cancel_free_hours=24,
            cancel_partial_hours=12,
            reschedule_min_hours=6
        )
        
        persistence_data = ServiceMapper.to_persistence(service)
        
        assert str(persistence_data['id']) == str(service_id.value)
        assert persistence_data['slug'] == "test-service"
        assert float(persistence_data['price_amount']) == 1000.0
        assert persistence_data['price_currency'] == "RUB"


@pytest.mark.django_db
class TestAppointmentMapper:
    def test_to_persistence(self):
        appointment_id = AppointmentId.generate()
        service_id = ServiceId.generate()
        client_id = UserId.generate()
        slot = TimeSlot(
            start_at=datetime.now(timezone.utc),
            end_at=datetime.now(timezone.utc),
            timezone=Timezone("UTC")
        )
        from domain.booking.value_objects.booking_metadata import BookingMetadata
        appointment = Appointment(
            id=appointment_id,
            service_id=service_id,
            client_id=client_id,
            slot=slot,
            status=AppointmentStatus.PENDING_PAYMENT,
            format=AppointmentFormat.ONLINE,
            metadata=BookingMetadata()
        )
        
        persistence_data = AppointmentMapper.to_persistence(appointment)
        
        assert str(persistence_data['id']) == str(appointment_id.value)
        assert str(persistence_data['service_id']) == str(service_id.value)
        assert str(persistence_data['client_user_id']) == str(client_id.value)
        assert persistence_data['status'] == AppointmentStatus.PENDING_PAYMENT.value
        assert persistence_data['format'] == AppointmentFormat.ONLINE.value

    def test_to_domain_basic(self):
        model = AppointmentModelFactory()
        appointment = AppointmentMapper.to_domain(model)
        
        assert str(appointment.id.value) == str(model.id)
        assert str(appointment.service_id.value) == str(model.service_id)
        assert str(appointment.client_id.value) == str(model.client_user_id)
        assert appointment.status.value == model.status
        assert appointment.format.value == model.format

    def test_to_domain_with_payment_and_form(self):
        from tests.factories import PaymentModelFactory, IntakeFormModelFactory
        from infrastructure.encryption.fernet_encryption import FernetEncryptionService
        import json
        
        # Создаем модель записи
        model = AppointmentModelFactory()
        
        # Создаем платеж для этой записи
        payment_model = PaymentModelFactory(
            appointment_id=model.id, 
            amount=1500.0, 
            currency="RUB",
            status="pending"
        )
        
        # Создаем анкету
        encryption_service = FernetEncryptionService()
        payload = json.dumps({"question1": "answer1"})
        encrypted_payload = encryption_service.encrypt(payload)
        form_model = IntakeFormModelFactory(appointment_id=model.id, payload_encrypted=encrypted_payload)
        
        # Маппим
        appointment = AppointmentMapper.to_domain(model)
        
        # Проверяем платеж
        assert appointment.payment is not None
        assert float(appointment.payment.amount.amount) == 1500.0
        assert appointment.payment.amount.currency.code == "RUB"
        assert appointment.payment.status.value == "pending"
        
        # Проверяем анкету
        assert appointment.intake_form is not None
        assert appointment.intake_form.answers == {"question1": "answer1"}


@pytest.mark.django_db
class TestDiaryEntryMapper:
    def test_to_domain(self):
        from infrastructure.encryption.fernet_encryption import FernetEncryptionService
        encryption_service = FernetEncryptionService()
        encrypted_content = encryption_service.encrypt("Hello world")
        
        model = DiaryEntryModelFactory(content_encrypted=encrypted_content)
        entry = DiaryEntryMapper.to_domain(model)
        
        assert str(entry.id.value) == str(model.id)
        assert str(entry.user_id.value) == str(model.user_id)
        assert entry.content == "Hello world"
        assert entry.diary_type.value == model.diary_type

    def test_to_persistence(self):
        entry_id = DiaryEntryId.generate()
        user_id = UserId.generate()
        entry = DiaryEntry(
            id=entry_id,
            user_id=user_id,
            diary_type=DiaryType("mood"),
            content="Hello world",
            created_at=datetime.now(timezone.utc)
        )
        
        persistence_data = DiaryEntryMapper.to_persistence(entry)
        
        assert str(persistence_data['id']) == str(entry_id.value)
        assert str(persistence_data['user_id']) == str(user_id.value)
        assert persistence_data['diary_type'] == "mood"
        
        from infrastructure.encryption.fernet_encryption import FernetEncryptionService
        encryption_service = FernetEncryptionService()
        assert encryption_service.decrypt(persistence_data['content_encrypted']) == "Hello world"
