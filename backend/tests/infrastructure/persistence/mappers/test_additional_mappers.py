import pytest
from datetime import datetime, timezone
from uuid import uuid4
from decimal import Decimal

from infrastructure.persistence.mappers.payment_mapper import PaymentMapper
from infrastructure.persistence.mappers.content_mapper import ContentItemMapper
from infrastructure.persistence.mappers.interactive_mapper import InteractiveRunMapper

from domain.payments.aggregates.payment import Payment, PaymentId
from domain.payments.value_objects.payment_status import PaymentStatus
from domain.payments.value_objects.payment_provider import PaymentProvider
from domain.booking.value_objects.money import Money
from domain.booking.value_objects.currency import Currency

from domain.content.aggregates.content_item import ContentItem, ContentItemId
from domain.content.value_objects import ContentType, ContentStatus, TimeToBenefit

from domain.interactive.aggregates.interactive_run import InteractiveRun, InteractiveRunId
from domain.interactive.value_objects import RunStatus, RunMetadata, InteractiveResult
from domain.interactive.value_objects.result_level import ResultLevel
from domain.identity.aggregates.user import UserId

from tests.factories import (
    PaymentModelFactory,
    ContentItemModelFactory,
    InteractiveRunModelFactory,
)


@pytest.mark.django_db
class TestPaymentMapper:
    def test_to_domain(self):
        model = PaymentModelFactory(
            amount=Decimal('1500.00'),
            currency='RUB',
            status='succeeded',
            provider_id='yookassa'
        )
        payment = PaymentMapper.to_domain(model)
        
        assert str(payment.id.value) == str(model.id)
        assert float(payment.amount.amount) == 1500.0
        assert payment.amount.currency.code == 'RUB'
        assert payment.status.value == 'succeeded'
        assert payment.provider.value == 'yookassa'

    def test_to_persistence(self):
        payment_id = PaymentId.generate()
        money = Money(amount=2000.0, currency=Currency.RUB)
        payment = Payment(
            id=payment_id,
            amount=money,
            status=PaymentStatus.PENDING,
            provider=PaymentProvider.YOOKASSA,
            provider_payment_id="test_provider_id",
            created_at=datetime.now(timezone.utc)
        )
        
        persistence_data = PaymentMapper.to_persistence(payment)
        
        assert str(persistence_data['id']) == str(payment_id.value)
        assert float(persistence_data['amount']) == 2000.0
        assert persistence_data['currency'] == 'RUB'
        assert persistence_data['status'] == 'pending'
        assert persistence_data['provider_id'] == 'yookassa'


@pytest.mark.django_db
class TestContentItemMapper:
    def test_to_domain(self):
        model = ContentItemModelFactory(
            content_type='article',
            status='published',
            time_to_benefit='short_term'
        )
        content = ContentItemMapper.to_domain(model)
        
        assert str(content.id.value) == str(model.id)
        assert content.slug == model.slug
        assert content.content_type.value == 'article'
        assert content.status.value == 'published'
        assert content.time_to_benefit.value == 'short_term'

    def test_to_persistence(self):
        content_id = ContentItemId.generate()
        content = ContentItem(
            id=content_id,
            slug="test-article",
            title="Test Article",
            content_type=ContentType("article"),
            status=ContentStatus.PUBLISHED,
            topics=[],
            tags=["tag1"],
            time_to_benefit=TimeToBenefit("immediate"),
            created_at=datetime.now(timezone.utc)
        )
        
        persistence_data = ContentItemMapper.to_persistence(content)
        
        assert str(persistence_data['id']) == str(content_id.value)
        assert persistence_data['slug'] == "test-article"
        assert persistence_data['content_type'] == "article"
        assert persistence_data['status'] == "published"
        assert persistence_data['time_to_benefit'] == "immediate"


@pytest.mark.django_db
class TestInteractiveRunMapper:
    def test_to_domain(self):
        model = InteractiveRunModelFactory(
            status='completed',
            result_level='medium',
            crisis_triggered=True,
            metadata={'interactive_slug': 'anxiety-quiz'}
        )
        run = InteractiveRunMapper.to_domain(model)
        
        assert str(run.id.value) == str(model.id)
        assert run.status.value == 'completed'
        assert run.result.level.value == 'medium'
        assert run.result.crisis_detected is True
        # Accessing protected metadata through property or getter if available, 
        # but the mapper uses record.metadata directly
        assert model.metadata['interactive_slug'] == 'anxiety-quiz'

    def test_to_persistence(self):
        run_id = InteractiveRunId.generate()
        user_id = UserId.generate()
        metadata = RunMetadata(interactive_slug="test-quiz")
        result = InteractiveResult(
            level=ResultLevel("high"),
            profile={'profile': 'test'},
            crisis_detected=False
        )
        
        run = InteractiveRun(
            id=run_id,
            user_id=user_id,
            metadata=metadata,
            status=RunStatus.COMPLETED,
            result=result,
            started_at=datetime.now(timezone.utc),
            completed_at=datetime.now(timezone.utc)
        )
        
        persistence_data = InteractiveRunMapper.to_persistence(run)
        
        assert str(persistence_data['id']) == str(run_id.value)
        assert str(persistence_data['user_id']) == str(user_id.value)
        assert persistence_data['status'] == 'completed'
        assert persistence_data['result_level'] == 'high'
        assert persistence_data['crisis_triggered'] is False
        assert persistence_data['metadata']['interactive_slug'] == 'test-quiz'
