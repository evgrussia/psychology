"""
Factories для создания тестовых данных (factory-boy).
"""
import factory
from uuid import uuid4
from datetime import datetime, timedelta, timezone
from decimal import Decimal

from infrastructure.persistence.django_models.booking import (
    ServiceModel,
    AvailabilitySlotModel,
    AppointmentModel,
    PaymentModel,
    IntakeFormModel,
)
from infrastructure.persistence.django_models.interactive import (
    InteractiveDefinitionModel,
    InteractiveRunModel,
)
from infrastructure.persistence.django_models.content import ContentItemModel
from infrastructure.persistence.django_models.user import UserModel
from infrastructure.persistence.django_models.client_cabinet import DiaryEntryModel


class UserModelFactory(factory.django.DjangoModelFactory):
    """Factory для UserModel."""
    
    class Meta:
        model = UserModel
    
    id = factory.LazyFunction(uuid4)
    email = factory.Sequence(lambda n: f'user_{n}@example.com')
    display_name = factory.Faker('name')
    status = 'active'


class ServiceModelFactory(factory.django.DjangoModelFactory):
    """Factory для ServiceModel."""
    
    class Meta:
        model = ServiceModel
    
    id = factory.LazyFunction(uuid4)
    slug = factory.Sequence(lambda n: f'service-{n}')
    name = factory.Sequence(lambda n: f'Service {n}')
    description = factory.Faker('text', max_nb_chars=200)
    supported_formats = ['online']
    duration_minutes = 60
    price_amount = factory.Faker('pydecimal', left_digits=4, right_digits=2, positive=True)
    price_currency = 'RUB'
    deposit_amount = factory.LazyAttribute(lambda obj: obj.price_amount * Decimal('0.4'))
    cancel_free_hours = 24
    cancel_partial_hours = 12
    reschedule_min_hours = 6
    status = 'published'


class AvailabilitySlotModelFactory(factory.django.DjangoModelFactory):
    """Factory для AvailabilitySlotModel."""
    
    class Meta:
        model = AvailabilitySlotModel
    
    id = factory.LazyFunction(uuid4)
    service_id = factory.LazyFunction(uuid4)
    start_at = factory.LazyFunction(
        lambda: datetime.now(timezone.utc) + timedelta(days=1, hours=10)
    )
    end_at = factory.LazyAttribute(
        lambda obj: obj.start_at + timedelta(hours=1)
    )
    status = 'available'
    source = 'product'
    external_event_id = None


class AppointmentModelFactory(factory.django.DjangoModelFactory):
    """Factory для AppointmentModel."""
    
    class Meta:
        model = AppointmentModel
    
    id = factory.LazyFunction(uuid4)
    service_id = factory.LazyFunction(uuid4)
    client_user_id = factory.LazyFunction(uuid4)
    lead_id = None
    start_at_utc = factory.LazyFunction(
        lambda: datetime.now(timezone.utc) + timedelta(days=1, hours=10)
    )
    end_at_utc = factory.LazyAttribute(
        lambda obj: obj.start_at_utc + timedelta(hours=1)
    )
    timezone = 'Europe/Moscow'
    status = 'pending_payment'
    format = 'online'
    metadata = factory.LazyFunction(dict)
    slot_id = factory.LazyFunction(uuid4)
    external_calendar_event_id = None
    meeting_url = None
    location_text = None


class PaymentModelFactory(factory.django.DjangoModelFactory):
    """Factory для PaymentModel."""
    
    class Meta:
        model = PaymentModel
    
    id = factory.LazyFunction(uuid4)
    appointment_id = factory.LazyFunction(uuid4)
    amount = factory.Faker('pydecimal', left_digits=4, right_digits=2, positive=True)
    currency = 'RUB'
    provider_id = 'yookassa'
    provider_payment_id = factory.Sequence(lambda n: f'payment_{n}')
    status = 'intent'
    failure_reason = None
    confirmed_at = None


class IntakeFormModelFactory(factory.django.DjangoModelFactory):
    """Factory для IntakeFormModel."""
    
    class Meta:
        model = IntakeFormModel
    
    id = factory.LazyFunction(uuid4)
    appointment_id = factory.LazyFunction(uuid4)
    payload_encrypted = factory.Faker('text', max_nb_chars=500)
    submitted_at = factory.LazyFunction(lambda: datetime.now(timezone.utc))


class InteractiveDefinitionModelFactory(factory.django.DjangoModelFactory):
    """Factory для InteractiveDefinitionModel."""
    
    class Meta:
        model = InteractiveDefinitionModel
    
    id = factory.LazyFunction(uuid4)
    slug = factory.Sequence(lambda n: f'quiz-{n}')
    interactive_type = 'quiz'
    title = factory.Sequence(lambda n: f'Quiz {n}')
    topic_code = None
    status = 'published'
    published_at = factory.LazyFunction(lambda: datetime.now(timezone.utc))


class InteractiveRunModelFactory(factory.django.DjangoModelFactory):
    """Factory для InteractiveRunModel."""
    
    class Meta:
        model = InteractiveRunModel
    
    id = factory.LazyFunction(uuid4)
    interactive_definition_id = factory.LazyFunction(uuid4)
    user_id = factory.LazyFunction(uuid4)
    anonymous_id = None
    started_at = factory.LazyFunction(lambda: datetime.now(timezone.utc))
    completed_at = None
    result_level = None
    result_profile = None
    crisis_triggered = False
    duration_ms = None
    metadata = factory.LazyFunction(dict)
    status = 'started'


class ContentItemModelFactory(factory.django.DjangoModelFactory):
    """Factory для ContentItemModel."""
    
    class Meta:
        model = ContentItemModel
    
    id = factory.LazyFunction(uuid4)
    slug = factory.Sequence(lambda n: f'article-{n}')
    title = factory.Sequence(lambda n: f'Article {n}')
    content_type = 'article'
    status = 'published'
    topics = factory.LazyFunction(list)
    tags = factory.LazyFunction(list)
    time_to_benefit = 'short_term'
    content_body = factory.Faker('text', max_nb_chars=1000)
    published_at = factory.LazyFunction(lambda: datetime.now(timezone.utc))


class DiaryEntryModelFactory(factory.django.DjangoModelFactory):
    """Factory для DiaryEntryModel."""
    
    class Meta:
        model = DiaryEntryModel
    
    id = factory.LazyFunction(uuid4)
    user_id = factory.LazyFunction(uuid4)
    diary_type = 'mood'
    content_encrypted = factory.Faker('text', max_nb_chars=500)
    deleted_at = None
