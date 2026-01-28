"""
Django ORM модели для Booking Domain.
"""
from django.db import models
from uuid import uuid4


class AppointmentModel(models.Model):
    """Django ORM модель для Appointment Aggregate Root."""
    
    # Primary Key
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    
    # References to other aggregates (by ID only)
    service_id = models.UUIDField(db_index=True)
    client_user_id = models.UUIDField(db_index=True, null=True)  # nullable для leads
    lead_id = models.UUIDField(null=True, blank=True)
    
    # TimeSlot Value Object → отдельные поля
    start_at_utc = models.DateTimeField(db_index=True)
    end_at_utc = models.DateTimeField()
    timezone = models.CharField(max_length=50)  # IANA timezone
    
    # AppointmentStatus Value Object → CharField
    status = models.CharField(
        max_length=50,
        choices=[
            ('pending_payment', 'Pending Payment'),
            ('confirmed', 'Confirmed'),
            ('canceled', 'Canceled'),
            ('rescheduled', 'Rescheduled'),
            ('completed', 'Completed'),
            ('no_show', 'No Show'),
        ],
        default='pending_payment',
        db_index=True
    )
    
    # AppointmentFormat Value Object → CharField
    format = models.CharField(
        max_length=20,
        choices=[('online', 'Online'), ('offline', 'Offline'), ('hybrid', 'Hybrid')],
        default='online'
    )
    
    # BookingMetadata Value Object → JSONField
    metadata = models.JSONField(default=dict, blank=True)  # entry_point, topic_code, deep_link_id, utm_params
    
    # Optional: slot reference
    slot_id = models.UUIDField(null=True, blank=True)
    
    # External calendar integration
    external_calendar_event_id = models.CharField(max_length=255, null=True, blank=True)
    
    # Meeting details
    meeting_url = models.URLField(null=True, blank=True)
    location_text = models.TextField(null=True, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'appointments'
        indexes = [
            models.Index(fields=['start_at_utc', 'status']),
            models.Index(fields=['client_user_id', 'status']),
            models.Index(fields=['service_id']),
        ]
        # Защита от конфликтов: уникальность по времени (в рамках одного провайдера)
        constraints = [
            models.UniqueConstraint(
                fields=['start_at_utc'],
                condition=models.Q(status__in=['pending_payment', 'confirmed']),
                name='unique_active_appointment_time'
            )
        ]


class PaymentModel(models.Model):
    """Django ORM модель для Payment Entity (внутри Appointment aggregate) или Payment Aggregate Root."""
    
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    appointment_id = models.UUIDField(db_index=True, null=True, blank=True)  # Опционально для Payment aggregate
    
    # Money Value Object → отдельные поля
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default='RUB')
    
    # PaymentProvider Value Object → CharField
    provider_id = models.CharField(max_length=50, default='yookassa')
    provider_payment_id = models.CharField(max_length=255, unique=True, db_index=True)
    
    # PaymentStatus Value Object → CharField
    status = models.CharField(
        max_length=50,
        choices=[
            ('intent', 'Intent'),
            ('pending', 'Pending'),
            ('succeeded', 'Succeeded'),
            ('failed', 'Failed'),
            ('canceled', 'Canceled'),
            ('refunded', 'Refunded'),
        ],
        default='intent',
        db_index=True
    )
    
    failure_reason = models.TextField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    confirmed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'payments'
        indexes = [
            models.Index(fields=['appointment_id']),
            models.Index(fields=['provider_id', 'provider_payment_id']),
            models.Index(fields=['status']),
        ]


class WebhookEventModel(models.Model):
    """Django ORM модель для отслеживания обработанных webhook событий (идемпотентность)."""
    
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    provider_payment_id = models.CharField(max_length=255, db_index=True)
    event_type = models.CharField(max_length=50, db_index=True)  # 'payment.succeeded', 'payment.canceled', etc.
    
    processed_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'webhook_events'
        indexes = [
            models.Index(fields=['provider_payment_id', 'event_type']),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=['provider_payment_id', 'event_type'],
                name='unique_webhook_event'
            )
        ]


class IntakeFormModel(models.Model):
    """Django ORM модель для IntakeForm Entity (P2 данные, шифрованные)."""
    
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    appointment_id = models.UUIDField(unique=True, db_index=True)
    
    # P2 данные: храним шифрованными
    payload_encrypted = models.TextField()  # Fernet-encrypted JSON
    
    status = models.CharField(
        max_length=20,
        choices=[('draft', 'Draft'), ('submitted', 'Submitted')],
        default='draft'
    )
    
    submitted_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'intake_forms'


class ServiceModel(models.Model):
    """Django ORM модель для Service (Read Model или отдельный агрегат)."""
    
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    slug = models.SlugField(unique=True, db_index=True)
    
    name = models.CharField(max_length=255)
    description = models.TextField()
    
    # AppointmentFormat Value Object → CharField (поддерживаемые форматы)
    supported_formats = models.JSONField(default=list)  # ['online', 'offline', 'hybrid']
    
    duration_minutes = models.IntegerField()
    
    # Money Value Object → отдельные поля
    price_amount = models.DecimalField(max_digits=10, decimal_places=2)
    price_currency = models.CharField(max_length=3, default='RUB')
    deposit_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    
    # Cancellation rules
    cancel_free_hours = models.IntegerField(null=True, blank=True)
    cancel_partial_hours = models.IntegerField(null=True, blank=True)
    reschedule_min_hours = models.IntegerField(null=True, blank=True)
    
    status = models.CharField(
        max_length=20,
        choices=[('draft', 'Draft'), ('published', 'Published'), ('archived', 'Archived')],
        default='draft'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'services'
        indexes = [
            models.Index(fields=['slug']),
            models.Index(fields=['status']),
        ]


class WaitlistRequestModel(models.Model):
    """Django ORM модель для WaitlistRequest Aggregate Root."""
    
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    service_id = models.UUIDField(db_index=True)
    client_user_id = models.UUIDField(db_index=True, null=True)
    lead_id = models.UUIDField(null=True, blank=True)
    
    preferred_time_slots = models.JSONField(default=list)  # список временных слотов
    preferred_format = models.CharField(
        max_length=20,
        choices=[('online', 'Online'), ('offline', 'Offline'), ('hybrid', 'Hybrid')],
        null=True,
        blank=True
    )
    
    status = models.CharField(
        max_length=20,
        choices=[
            ('pending', 'Pending'),
            ('fulfilled', 'Fulfilled'),
            ('canceled', 'Canceled'),
        ],
        default='pending',
        db_index=True
    )
    
    fulfilled_appointment_id = models.UUIDField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'waitlist_requests'
        indexes = [
            models.Index(fields=['service_id', 'status']),
            models.Index(fields=['client_user_id', 'status']),
        ]


class OutcomeRecordModel(models.Model):
    """Django ORM модель для OutcomeRecord Entity (внутри Appointment aggregate)."""
    
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    appointment_id = models.UUIDField(unique=True, db_index=True)
    
    # AppointmentOutcome Value Object → JSONField
    outcome_data = models.JSONField(default=dict)  # структурированные данные результата
    
    recorded_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'outcome_records'


class AvailabilitySlotModel(models.Model):
    """Django ORM модель для AvailabilitySlot Entity."""
    
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    service_id = models.UUIDField(db_index=True, null=True, blank=True)
    
    # Временные слоты
    start_at = models.DateTimeField(db_index=True)
    end_at = models.DateTimeField()
    
    # Статус и источник
    status = models.CharField(
        max_length=20,
        choices=[
            ('available', 'Available'),
            ('reserved', 'Reserved'),
            ('blocked', 'Blocked'),
        ],
        default='available',
        db_index=True
    )
    
    source = models.CharField(
        max_length=50,
        choices=[
            ('product', 'Product'),
            ('google_calendar', 'Google Calendar'),
        ],
        default='product'
    )
    
    external_event_id = models.CharField(max_length=255, null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'availability_slots'
        indexes = [
            models.Index(fields=['service_id', 'start_at', 'status']),
            models.Index(fields=['start_at', 'end_at']),
        ]
