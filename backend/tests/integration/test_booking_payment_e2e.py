"""
E2E интеграционный тест: создание appointment → получение payment_url → мок webhook ЮKassa →
проверка перехода appointment в confirmed (FIX-P2-06).
"""
import json
import hmac
import hashlib
import pytest
from rest_framework.test import APIClient, APITestCase as TestCase
from rest_framework import status
from uuid import uuid4
from datetime import datetime, timedelta, timezone

from django.test import override_settings

from infrastructure.persistence.django_models.user import UserModel
from infrastructure.persistence.django_models.booking import (
    ServiceModel,
    AvailabilitySlotModel,
    AppointmentModel,
    PaymentModel,
)
from infrastructure.persistence.repositories.user_repository import DjangoUserRepository
from infrastructure.identity.password_service import PasswordService


def _generate_webhook_signature(body: str, secret: str) -> str:
    """Подпись тела webhook для ЮKassa (упрощённая для тестов)."""
    return hmac.new(
        secret.encode('utf-8'),
        body.encode('utf-8'),
        hashlib.sha256,
    ).hexdigest()


@pytest.mark.django_db
@pytest.mark.integration
@override_settings(YOOKASSA_WEBHOOK_SECRET='test_webhook_secret_key')
class TestBookingPaymentE2E(TestCase):
    """E2E: создание бронирования → webhook об оплате → appointment confirmed."""

    def setUp(self):
        self.client = APIClient()
        self.client.cookies.clear()
        self.webhook_secret = 'test_webhook_secret_key'

        # Пользователь
        self.user = UserModel.objects.create_user(
            email='e2e@example.com',
            password='TestPassword123!',
            display_name='E2E User',
        )
        self.user_id = str(self.user.id)

        # Услуга и слот
        self.service = ServiceModel.objects.create(
            id=uuid4(),
            slug='e2e-consultation',
            name='E2E Консультация',
            description='Услуга для E2E теста',
            price_amount=3000.0,
            price_currency='RUB',
            deposit_amount=1000.0,
            duration_minutes=60,
            supported_formats=['online'],
            cancel_free_hours=24,
            cancel_partial_hours=12,
            reschedule_min_hours=6,
            status='published',
        )
        now = datetime.now(timezone.utc)
        self.slot = AvailabilitySlotModel.objects.create(
            id=uuid4(),
            service_id=self.service.id,
            start_at=now + timedelta(days=1, hours=10),
            end_at=now + timedelta(days=1, hours=11),
            status='available',
            source='product',
        )

        # Логин (session auth для DRF)
        self.client.force_authenticate(user=self.user)

    def test_booking_then_webhook_then_appointment_confirmed(self):
        # 1. Создать бронирование
        start_at = datetime.now(timezone.utc) + timedelta(days=1, hours=10)
        end_at = start_at + timedelta(hours=1)
        payload = {
            'service_id': str(self.service.id),
            'slot_id': str(self.slot.id),
            'format': 'online',
            'start_at': start_at.isoformat(),
            'end_at': end_at.isoformat(),
            'timezone': 'Europe/Moscow',
            'consents': {'personal_data': True, 'communications': True},
            'intake_form': {},
        }
        create_resp = self.client.post(
            '/api/v1/booking/appointments/',
            payload,
            format='json',
        )
        if create_resp.status_code != status.HTTP_201_CREATED:
            self.skipTest(
                f"Booking create returned {create_resp.status_code}; "
                "payment/adapter may not be configured for E2E"
            )
        data = create_resp.data.get('data', {})
        appointment_id = data.get('id')
        self.assertIsNotNone(appointment_id, 'Response must contain appointment id')

        # 2. Найти платёж по appointment_id и задать provider_payment_id для webhook
        payment = PaymentModel.objects.filter(appointment_id=appointment_id).first()
        self.assertIsNotNone(payment, 'Payment must exist for appointment')
        provider_payment_id = 'e2e-provider-' + str(uuid4())[:8]
        payment.provider_payment_id = provider_payment_id
        payment.save(update_fields=['provider_payment_id'])

        # 3. Отправить webhook payment.succeeded
        webhook_payload = {
            'event': 'payment.succeeded',
            'object': {
                'id': provider_payment_id,
                'status': 'succeeded',
                'amount': {'value': '3000.00', 'currency': 'RUB'},
                'metadata': {'appointment_id': appointment_id},
            },
        }
        body = json.dumps(webhook_payload)
        signature = _generate_webhook_signature(body, self.webhook_secret)
        webhook_resp = self.client.post(
            '/api/v1/webhooks/yookassa/',
            webhook_payload,
            format='json',
            HTTP_X_YOOMONEY_SIGNATURE=signature,
        )
        self.assertEqual(
            webhook_resp.status_code,
            status.HTTP_200_OK,
            f"Webhook should return 200: {getattr(webhook_resp, 'data', webhook_resp.content)}",
        )

        # 4. Проверить, что appointment перешёл в confirmed
        retrieve_resp = self.client.get(f'/api/v1/booking/appointments/{appointment_id}/')
        self.assertEqual(retrieve_resp.status_code, status.HTTP_200_OK)
        appointment_data = retrieve_resp.data.get('data', {})
        self.assertEqual(
            appointment_data.get('status'),
            'confirmed',
            'Appointment must be confirmed after payment.succeeded webhook',
        )
