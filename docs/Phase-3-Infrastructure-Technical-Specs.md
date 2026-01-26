# Phase 3: Infrastructure Layer Implementation — Технические спецификации

**Версия:** v1.0  
**Дата:** 2026-01-26  
**Статус:** В работе  
**Основано на:** `docs/Development-Phase-Plan.md`, `docs/Domain-Model-Specification.md`, `docs/Модель-данных.md`, `docs/Архитектурный-обзор.md`, `docs/Technical-Decisions.md`, `docs/security/security-requirements.md`

---

## 1) Обзор Phase 3

### 1.1 Цель фазы

Реализовать **Infrastructure Layer** согласно Clean Architecture + DDD:
- Django ORM модели (persistence layer)
- Репозитории (реализация интерфейсов из Domain Layer)
- Интеграции с внешними сервисами (ЮKassa, Google Calendar, Telegram, Email)
- Event Bus для Domain Events

### 1.2 Входные артефакты

✅ **Готовы:**
- `docs/Domain-Model-Specification.md` — доменная модель с интерфейсами репозиториев
- `docs/Модель-данных.md` — физическая схема БД
- `docs/Архитектурный-обзор.md` — архитектурные решения
- `docs/Technical-Decisions.md` — технические решения
- `docs/api/api-contracts.md` — контракты API
- `docs/security/security-requirements.md` — требования безопасности

### 1.3 Выходные артефакты

- Работающие репозитории для всех доменов
- Интеграции с внешними сервисами
- Event Bus для публикации Domain Events
- Unit и integration тесты (покрытие ≥80%)
- Документация по использованию

### 1.4 Оценка

**XL (1+ месяц)**, может выполняться параллельно с Phase 2 (Domain Layer)

---

## 2) Структура Infrastructure Layer

### 2.1 Общая структура директорий

```
backend/
├── infrastructure/
│   ├── persistence/
│   │   ├── django_models/          # Django ORM модели
│   │   │   ├── __init__.py
│   │   │   ├── booking.py          # Appointment, Service, Payment, etc.
│   │   │   ├── interactive.py      # InteractiveRun, InteractiveDefinition
│   │   │   ├── identity.py         # User, Consent, Role
│   │   │   ├── content.py          # ContentItem, Topic, Tag, etc.
│   │   │   ├── payments.py         # Payment (если отдельный контекст)
│   │   │   ├── client_cabinet.py   # DiaryEntry, DataExportRequest
│   │   │   ├── telegram.py         # DeepLink
│   │   │   ├── crm.py              # Lead, LeadIdentity, LeadTimelineEvent
│   │   │   ├── moderation.py       # ModerationItem, Question, Answer
│   │   │   └── admin.py            # AuditLog, MessageTemplate
│   │   │
│   │   ├── repositories/          # Реализация Repository pattern
│   │   │   ├── __init__.py
│   │   │   ├── booking/
│   │   │   │   ├── appointment_repository.py
│   │   │   │   ├── service_repository.py
│   │   │   │   └── waitlist_repository.py
│   │   │   ├── interactive/
│   │   │   │   ├── interactive_run_repository.py
│   │   │   │   └── interactive_definition_repository.py
│   │   │   ├── identity/
│   │   │   │   └── user_repository.py
│   │   │   ├── content/
│   │   │   │   └── content_repository.py
│   │   │   ├── payments/
│   │   │   │   └── payment_repository.py
│   │   │   ├── client_cabinet/
│   │   │   │   └── diary_repository.py
│   │   │   ├── telegram/
│   │   │   │   └── deep_link_repository.py
│   │   │   ├── crm/
│   │   │   │   └── lead_repository.py
│   │   │   └── moderation/
│   │   │       └── moderation_repository.py
│   │   │
│   │   ├── mappers/               # Domain Entity ↔ DB Record
│   │   │   ├── __init__.py
│   │   │   ├── booking_mapper.py
│   │   │   ├── interactive_mapper.py
│   │   │   ├── identity_mapper.py
│   │   │   └── ...
│   │   │
│   │   └── migrations/            # Django migrations (автогенерация)
│   │
│   ├── external/                   # Интеграции с внешними сервисами
│   │   ├── __init__.py
│   │   ├── payments/
│   │   │   ├── __init__.py
│   │   │   ├── yookassa_client.py
│   │   │   ├── yookassa_adapter.py  # Anti-Corruption Layer
│   │   │   └── yookassa_webhook_handler.py
│   │   ├── calendar/
│   │   │   ├── __init__.py
│   │   │   ├── google_calendar_client.py
│   │   │   ├── google_calendar_adapter.py
│   │   │   └── calendar_service.py  # Domain Service interface impl
│   │   ├── telegram/
│   │   │   ├── __init__.py
│   │   │   ├── telegram_bot_client.py
│   │   │   ├── telegram_adapter.py
│   │   │   └── telegram_service.py
│   │   └── email/
│   │       ├── __init__.py
│   │       ├── email_client.py
│   │       └── email_service.py
│   │
│   ├── events/                     # Event Bus
│   │   ├── __init__.py
│   │   ├── event_bus.py            # Интерфейс IEventBus
│   │   ├── in_memory_event_bus.py  # In-memory реализация (Release 1)
│   │   └── event_handlers.py       # Регистрация обработчиков
│   │
│   ├── encryption/                 # Шифрование для P2 данных
│   │   ├── __init__.py
│   │   ├── encryption_service.py   # Интерфейс IEncryptionService
│   │   └── fernet_encryption.py    # Реализация через Fernet
│   │
│   └── exceptions.py               # Infrastructure-specific exceptions
```

---

## 3) Django ORM Модели (Persistence Layer)

### 3.1 Принципы маппинга Domain → Django ORM

#### Правила маппинга

1. **Aggregate Root → Django Model**
   - Один Aggregate Root = одна Django модель (или несколько связанных через ForeignKey)
   - Entities внутри агрегата → ForeignKey или JSONField (для простых Value Objects)

2. **Value Objects → поля модели**
   - Простые VO (Email, Money) → поля модели (CharField, DecimalField)
   - Сложные VO (TimeSlot, BookingMetadata) → JSONField или отдельные поля

3. **Domain Events → отдельная таблица (опционально)**
   - Для Event Sourcing или аудита: `domain_events` таблица
   - Для Release 1: события публикуются через Event Bus, не обязательно хранить

4. **Связи между агрегатами → только по ID**
   - ForeignKey на UUID, без cascade delete (удаление через доменную логику)

#### Пример: Appointment Aggregate → Django Model

```python
# infrastructure/persistence/django_models/booking.py

from django.db import models
from django.contrib.postgres.fields import JSONField
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
        choices=[('online', 'Online'), ('offline', 'Offline'), ('hybrid', 'Hybrid')]
    )
    
    # BookingMetadata Value Object → JSONField
    metadata = JSONField(default=dict, blank=True)  # entry_point, topic_code, deep_link_id, utm_params
    
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
    """Django ORM модель для Payment Entity (внутри Appointment aggregate)."""
    
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    appointment_id = models.UUIDField(db_index=True)
    
    # Money Value Object → отдельные поля
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default='RUB')
    
    # PaymentProvider Value Object → CharField
    provider = models.CharField(max_length=50, default='yookassa')
    
    # Provider payment ID (для идемпотентности webhooks)
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
            models.Index(fields=['provider', 'provider_payment_id']),
            models.Index(fields=['status']),
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
    
    title = models.CharField(max_length=255)
    description_markdown = models.TextField()
    
    # AppointmentFormat Value Object → CharField
    format = models.CharField(
        max_length=20,
        choices=[('online', 'Online'), ('offline', 'Offline'), ('hybrid', 'Hybrid')]
    )
    
    duration_minutes = models.IntegerField()
    
    # Money Value Object → отдельные поля
    price_amount = models.DecimalField(max_digits=10, decimal_places=2)
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
```

### 3.2 Модели для других доменов

#### Interactive Domain

```python
# infrastructure/persistence/django_models/interactive.py

class InteractiveDefinitionModel(models.Model):
    """Django ORM модель для InteractiveDefinition."""
    
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    slug = models.SlugField(unique=True, db_index=True)
    
    interactive_type = models.CharField(
        max_length=50,
        choices=[
            ('quiz', 'Quiz'),
            ('navigator', 'Navigator'),
            ('thermometer', 'Thermometer'),
            ('boundaries', 'Boundaries Script'),
            ('prep', 'Prep'),
            ('ritual', 'Ritual'),
        ]
    )
    
    title = models.CharField(max_length=255)
    topic_code = models.CharField(max_length=50, null=True, blank=True)
    
    status = models.CharField(
        max_length=20,
        choices=[('draft', 'Draft'), ('published', 'Published'), ('archived', 'Archived')],
        default='draft'
    )
    
    published_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'interactive_definitions'
        indexes = [
            models.Index(fields=['interactive_type', 'status']),
            models.Index(fields=['topic_code']),
        ]


class InteractiveRunModel(models.Model):
    """Django ORM модель для InteractiveRun Aggregate Root."""
    
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    interactive_definition_id = models.UUIDField(db_index=True)
    
    # User reference (nullable для анонимных прохождений)
    user_id = models.UUIDField(null=True, blank=True, db_index=True)
    anonymous_id = models.CharField(max_length=255, null=True, blank=True, db_index=True)
    
    # Timestamps
    started_at = models.DateTimeField(auto_now_add=True, db_index=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    # InteractiveResult Value Object → отдельные поля (агрегаты, без сырых ответов)
    result_level = models.CharField(
        max_length=20,
        choices=[('low', 'Low'), ('moderate', 'Moderate'), ('high', 'High')],
        null=True,
        blank=True
    )
    result_profile = models.CharField(max_length=255, null=True, blank=True)  # для навигатора
    crisis_triggered = models.BooleanField(default=False)
    
    duration_ms = models.IntegerField(null=True, blank=True)
    
    # RunMetadata Value Object → JSONField
    metadata = JSONField(default=dict, blank=True)  # entry_point, topic_code, deep_link_id
    
    # RunStatus Value Object → CharField
    status = models.CharField(
        max_length=20,
        choices=[('in_progress', 'In Progress'), ('completed', 'Completed'), ('abandoned', 'Abandoned')],
        default='in_progress',
        db_index=True
    )
    
    class Meta:
        db_table = 'interactive_runs'
        indexes = [
            models.Index(fields=['user_id', 'status']),
            models.Index(fields=['anonymous_id', 'status']),
            models.Index(fields=['interactive_definition_id', 'started_at']),
        ]
```

#### Identity Domain

```python
# infrastructure/persistence/django_models/identity.py

class UserModel(models.Model):
    """Django ORM модель для User Aggregate Root."""
    
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    
    # P1 данные
    email = models.EmailField(unique=True, null=True, blank=True, db_index=True)
    phone = models.CharField(max_length=20, unique=True, null=True, blank=True, db_index=True)
    telegram_user_id = models.CharField(max_length=255, unique=True, null=True, blank=True, db_index=True)
    telegram_username = models.CharField(max_length=255, null=True, blank=True)
    display_name = models.CharField(max_length=255, null=True, blank=True)
    
    # UserStatus Value Object → CharField
    status = models.CharField(
        max_length=20,
        choices=[('active', 'Active'), ('blocked', 'Blocked'), ('deleted', 'Deleted')],
        default='active',
        db_index=True
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(null=True, blank=True)  # soft delete
    
    class Meta:
        db_table = 'users'
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['telegram_user_id']),
            models.Index(fields=['status']),
        ]


class ConsentModel(models.Model):
    """Django ORM модель для Consent Entity (внутри User aggregate)."""
    
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    user_id = models.UUIDField(db_index=True)
    
    # ConsentType Value Object → CharField
    consent_type = models.CharField(
        max_length=50,
        choices=[
            ('personal_data', 'Personal Data'),
            ('communications', 'Communications'),
            ('telegram', 'Telegram'),
            ('review_publication', 'Review Publication'),
        ],
        db_index=True
    )
    
    granted = models.BooleanField(default=True)
    version = models.CharField(max_length=50)  # например, "2026-01-26"
    source = models.CharField(max_length=50)  # 'web', 'telegram', 'admin'
    
    granted_at = models.DateTimeField(auto_now_add=True)
    revoked_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'consents'
        indexes = [
            models.Index(fields=['user_id', 'consent_type']),
            models.Index(fields=['user_id', 'consent_type', 'granted']),
        ]


class UserRoleModel(models.Model):
    """Django ORM модель для связи User ↔ Role (many-to-many)."""
    
    user_id = models.UUIDField(db_index=True)
    role_code = models.CharField(max_length=50, db_index=True)  # 'owner', 'assistant', 'editor', 'client'
    granted_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'user_roles'
        unique_together = [['user_id', 'role_code']]
        indexes = [
            models.Index(fields=['user_id']),
            models.Index(fields=['role_code']),
        ]
```

### 3.3 Миграции Django

#### Создание миграций

```bash
# После создания моделей
python manage.py makemigrations

# Применение миграций
python manage.py migrate
```

#### Пример миграции (автогенерация)

Django автоматически создаст миграции на основе моделей. Пример структуры:

```python
# infrastructure/persistence/migrations/0001_initial.py (автогенерация)

from django.db import migrations, models
import uuid


class Migration(migrations.Migration):
    initial = True
    
    dependencies = []
    
    operations = [
        migrations.CreateModel(
            name='AppointmentModel',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True)),
                ('service_id', models.UUIDField(db_index=True)),
                ('client_user_id', models.UUIDField(db_index=True, null=True)),
                # ... остальные поля
            ],
            options={
                'db_table': 'appointments',
            },
        ),
        # ... индексы и constraints
    ]
```

---

## 4) Репозитории (Repository Pattern Implementation)

### 4.1 Принципы реализации

#### Правила реализации

1. **Реализуем интерфейсы из Domain Layer**
   - `IAppointmentRepository` → `PostgresAppointmentRepository`
   - Все методы из интерфейса должны быть реализованы

2. **Маппинг Domain Entity ↔ DB Record**
   - Используем Mapper классы для преобразования
   - Domain Entity → Django Model → DB Record (при сохранении)
   - DB Record → Django Model → Domain Entity (при чтении)

3. **Транзакции и консистентность**
   - Используем Django transactions для атомарности
   - Optimistic locking для защиты от race conditions

4. **Обработка Domain Events**
   - После сохранения агрегата публикуем Domain Events через Event Bus
   - Очищаем события из агрегата после публикации

### 4.2 Пример: AppointmentRepository

```python
# infrastructure/persistence/repositories/booking/appointment_repository.py

from typing import List, Optional
from django.db import transaction
from django.utils import timezone

from domain.booking.entities import Appointment
from domain.booking.value_objects import AppointmentId, ClientId, TimeSlot
from domain.booking.repositories import IAppointmentRepository
from infrastructure.persistence.django_models.booking import AppointmentModel, PaymentModel, IntakeFormModel
from infrastructure.persistence.mappers.booking_mapper import AppointmentMapper
from infrastructure.events.event_bus import IEventBus
from infrastructure.exceptions import InfrastructureError


class PostgresAppointmentRepository(IAppointmentRepository):
    """Реализация IAppointmentRepository для PostgreSQL через Django ORM."""
    
    def __init__(self, event_bus: IEventBus):
        self._event_bus = event_bus
    
    async def find_by_id(self, appointment_id: AppointmentId) -> Optional[Appointment]:
        """Найти Appointment по ID."""
        try:
            record = await AppointmentModel.objects.aget(id=appointment_id.value)
            return AppointmentMapper.to_domain(record)
        except AppointmentModel.DoesNotExist:
            return None
        except Exception as e:
            raise InfrastructureError(f"Failed to find appointment: {e}") from e
    
    async def find_by_client_id(self, client_id: ClientId) -> List[Appointment]:
        """Найти все Appointment для клиента."""
        try:
            records = AppointmentModel.objects.filter(
                client_user_id=client_id.value
            ).order_by('-start_at_utc')
            
            appointments = []
            async for record in records:
                appointments.append(AppointmentMapper.to_domain(record))
            
            return appointments
        except Exception as e:
            raise InfrastructureError(f"Failed to find appointments by client: {e}") from e
    
    async def find_conflicting_appointments(self, slot: TimeSlot) -> List[Appointment]:
        """Найти конфликтующие Appointment для слота."""
        try:
            records = AppointmentModel.objects.filter(
                start_at_utc__lt=slot.end_at,
                end_at_utc__gt=slot.start_at,
                status__in=['pending_payment', 'confirmed']
            )
            
            appointments = []
            async for record in records:
                appointments.append(AppointmentMapper.to_domain(record))
            
            return appointments
        except Exception as e:
            raise InfrastructureError(f"Failed to find conflicting appointments: {e}") from e
    
    async def find_upcoming_appointments(
        self, 
        from_date: timezone.datetime, 
        to_date: timezone.datetime
    ) -> List[Appointment]:
        """Найти предстоящие Appointment в диапазоне дат."""
        try:
            records = AppointmentModel.objects.filter(
                start_at_utc__gte=from_date,
                start_at_utc__lte=to_date,
                status__in=['confirmed', 'pending_payment']
            ).order_by('start_at_utc')
            
            appointments = []
            async for record in records:
                appointments.append(AppointmentMapper.to_domain(record))
            
            return appointments
        except Exception as e:
            raise InfrastructureError(f"Failed to find upcoming appointments: {e}") from e
    
    @transaction.atomic
    async def save(self, appointment: Appointment) -> None:
        """Сохранить Appointment (создать или обновить)."""
        try:
            # Маппинг Domain Entity → DB Record
            record_data = AppointmentMapper.to_persistence(appointment)
            
            # Сохранение через Django ORM
            record, created = await AppointmentModel.objects.aupdate_or_create(
                id=record_data['id'],
                defaults=record_data
            )
            
            # Сохранение вложенных entities (Payment, IntakeForm)
            await self._save_payment(appointment, record)
            await self._save_intake_form(appointment, record)
            
            # Публикация Domain Events
            domain_events = appointment.get_domain_events()
            if domain_events:
                await self._event_bus.publish_all(domain_events)
                appointment.clear_domain_events()
            
        except Exception as e:
            raise InfrastructureError(f"Failed to save appointment: {e}") from e
    
    @transaction.atomic
    async def save_with_conflict_check(self, appointment: Appointment) -> None:
        """Сохранить Appointment с проверкой конфликтов (optimistic locking)."""
        try:
            # Проверка конфликтов в транзакции
            conflicts = await self.find_conflicting_appointments(appointment.time_slot)
            
            if conflicts:
                # Исключаем текущий appointment из проверки (если обновление)
                existing_ids = {c.appointment_id.value for c in conflicts}
                if appointment.appointment_id.value not in existing_ids:
                    from domain.booking.exceptions import ConflictError
                    raise ConflictError("Slot is already booked")
            
            # Сохранение
            await self.save(appointment)
            
        except ConflictError:
            raise
        except Exception as e:
            raise InfrastructureError(f"Failed to save appointment with conflict check: {e}") from e
    
    async def _save_payment(self, appointment: Appointment, record: AppointmentModel) -> None:
        """Сохранить Payment entity."""
        payment = appointment.payment
        if not payment:
            return
        
        payment_data = {
            'appointment_id': record.id,
            'amount': float(payment.amount.amount),
            'currency': payment.amount.currency.code,
            'provider': payment.provider.name,
            'provider_payment_id': payment.provider_payment_id,
            'status': payment.status.value,
            'confirmed_at': payment.confirmed_at,
        }
        
        await PaymentModel.objects.aupdate_or_create(
            appointment_id=record.id,
            defaults=payment_data
        )
    
    async def _save_intake_form(self, appointment: Appointment, record: AppointmentModel) -> None:
        """Сохранить IntakeForm entity (P2 данные, шифрованные)."""
        intake_form = appointment.intake_form
        if not intake_form:
            return
        
        from infrastructure.encryption.encryption_service import IEncryptionService
        encryption_service = IEncryptionService.get_instance()
        
        # Шифрование payload
        encrypted_payload = encryption_service.encrypt(intake_form.encrypted_payload)
        
        form_data = {
            'appointment_id': record.id,
            'payload_encrypted': encrypted_payload,
            'status': 'submitted' if intake_form.submitted_at else 'draft',
            'submitted_at': intake_form.submitted_at,
        }
        
        await IntakeFormModel.objects.aupdate_or_create(
            appointment_id=record.id,
            defaults=form_data
        )
```

### 4.3 Mapper: AppointmentMapper

```python
# infrastructure/persistence/mappers/booking_mapper.py

from typing import Dict, Any
from domain.booking.entities import Appointment, Payment, IntakeForm
from domain.booking.value_objects import (
    AppointmentId, ServiceId, ClientId,
    TimeSlot, AppointmentStatus, AppointmentFormat,
    BookingMetadata, Money, Currency, PaymentStatus, PaymentProvider
)
from infrastructure.persistence.django_models.booking import AppointmentModel, PaymentModel, IntakeFormModel
from infrastructure.encryption.encryption_service import IEncryptionService


class AppointmentMapper:
    """Mapper для преобразования Domain Entity ↔ DB Record."""
    
    @staticmethod
    def to_domain(record: AppointmentModel) -> Appointment:
        """Преобразовать DB Record → Domain Entity."""
        # Восстановление Value Objects
        time_slot = TimeSlot(
            start_at=record.start_at_utc,
            end_at=record.end_at_utc,
            timezone=Timezone.create(record.timezone)
        )
        
        status = AppointmentStatus.from_string(record.status)
        format_vo = AppointmentFormat.from_string(record.format)
        
        metadata = BookingMetadata(
            entry_point=record.metadata.get('entry_point', ''),
            topic_code=record.metadata.get('topic_code'),
            deep_link_id=record.metadata.get('deep_link_id'),
            utm_params=record.metadata.get('utm_params')
        )
        
        # Восстановление Payment (если есть)
        payment = None
        try:
            payment_record = PaymentModel.objects.get(appointment_id=record.id)
            payment = AppointmentMapper._payment_to_domain(payment_record)
        except PaymentModel.DoesNotExist:
            pass
        
        # Восстановление IntakeForm (если есть)
        intake_form = None
        try:
            form_record = IntakeFormModel.objects.get(appointment_id=record.id)
            intake_form = AppointmentMapper._intake_form_to_domain(form_record)
        except IntakeFormModel.DoesNotExist:
            pass
        
        # Восстановление агрегата через reconstitute (приватный конструктор)
        return Appointment.reconstitute(
            id=AppointmentId(record.id),
            service_id=ServiceId(record.service_id),
            client_id=ClientId(record.client_user_id) if record.client_user_id else None,
            slot=time_slot,
            status=status,
            format=format_vo,
            metadata=metadata,
            payment=payment,
            intake_form=intake_form,
            created_at=record.created_at,
            updated_at=record.updated_at
        )
    
    @staticmethod
    def to_persistence(appointment: Appointment) -> Dict[str, Any]:
        """Преобразовать Domain Entity → DB Record (словарь для Django ORM)."""
        return {
            'id': appointment.appointment_id.value,
            'service_id': appointment.service_id.value,
            'client_user_id': appointment.client_id.value if appointment.client_id else None,
            'start_at_utc': appointment.time_slot.start_at,
            'end_at_utc': appointment.time_slot.end_at,
            'timezone': appointment.time_slot.timezone.iana,
            'status': appointment.current_status.value,
            'format': appointment.format.value,
            'metadata': {
                'entry_point': appointment.metadata.entry_point,
                'topic_code': appointment.metadata.topic_code,
                'deep_link_id': appointment.metadata.deep_link_id,
                'utm_params': appointment.metadata.utm_params,
            },
            'slot_id': appointment.slot_id,
            'external_calendar_event_id': appointment.external_calendar_event_id,
            'meeting_url': appointment.meeting_url,
            'location_text': appointment.location_text,
        }
    
    @staticmethod
    def _payment_to_domain(record: PaymentModel) -> Payment:
        """Преобразовать Payment DB Record → Domain Entity."""
        money = Money(
            amount=float(record.amount),
            currency=Currency.from_code(record.currency)
        )
        
        provider = PaymentProvider.from_string(record.provider)
        status = PaymentStatus.from_string(record.status)
        
        return Payment.reconstitute(
            id=PaymentId(record.id),
            amount=money,
            provider=provider,
            provider_payment_id=record.provider_payment_id,
            status=status,
            confirmed_at=record.confirmed_at,
            created_at=record.created_at
        )
    
    @staticmethod
    def _intake_form_to_domain(record: IntakeFormModel) -> IntakeForm:
        """Преобразовать IntakeForm DB Record → Domain Entity (расшифровка P2 данных)."""
        from infrastructure.encryption.encryption_service import IEncryptionService
        encryption_service = IEncryptionService.get_instance()
        
        # Расшифровка payload
        decrypted_payload = encryption_service.decrypt(record.payload_encrypted)
        
        return IntakeForm.reconstitute(
            id=FormId(record.id),
            encrypted_payload=decrypted_payload,  # В домене храним расшифрованным
            submitted_at=record.submitted_at
        )
```

### 4.4 Репозитории для других доменов

Аналогично `AppointmentRepository`, реализуем репозитории для:
- `InteractiveRunRepository`
- `UserRepository`
- `ContentRepository`
- `PaymentRepository` (если отдельный контекст)
- `DiaryRepository`
- `LeadRepository`
- `ModerationRepository`

---

## 5) Интеграции с внешними сервисами

### 5.1 ЮKassa (Payments)

#### Архитектура интеграции

```
Application Layer (Use Case)
    ↓
Domain Service (IPaymentProviderService interface)
    ↓
Infrastructure: YooKassaAdapter (Anti-Corruption Layer)
    ↓
YooKassaClient (HTTP client)
    ↓
ЮKassa API
```

#### YooKassaClient

```python
# infrastructure/external/payments/yookassa_client.py

import httpx
from typing import Dict, Any, Optional
from dataclasses import dataclass


@dataclass
class YooKassaConfig:
    """Конфигурация ЮKassa."""
    shop_id: str
    secret_key: str
    api_url: str = "https://api.yookassa.ru/v3"
    test_mode: bool = False


class YooKassaClient:
    """HTTP клиент для работы с ЮKassa API."""
    
    def __init__(self, config: YooKassaConfig):
        self.config = config
        self._client = httpx.AsyncClient(
            base_url=config.api_url,
            auth=(config.shop_id, config.secret_key),
            timeout=30.0
        )
    
    async def create_payment(
        self,
        amount: float,
        currency: str,
        description: str,
        return_url: str,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Создать платеж в ЮKassa."""
        payload = {
            "amount": {
                "value": str(amount),
                "currency": currency
            },
            "confirmation": {
                "type": "redirect",
                "return_url": return_url
            },
            "description": description,
            "metadata": metadata or {}
        }
        
        response = await self._client.post("/payments", json=payload)
        response.raise_for_status()
        return response.json()
    
    async def get_payment(self, payment_id: str) -> Dict[str, Any]:
        """Получить информацию о платеже."""
        response = await self._client.get(f"/payments/{payment_id}")
        response.raise_for_status()
        return response.json()
    
    async def cancel_payment(self, payment_id: str) -> Dict[str, Any]:
        """Отменить платеж."""
        response = await self._client.post(f"/payments/{payment_id}/cancel")
        response.raise_for_status()
        return response.json()
    
    async def close(self):
        """Закрыть HTTP клиент."""
        await self._client.aclose()
```

#### YooKassaAdapter (Anti-Corruption Layer)

```python
# infrastructure/external/payments/yookassa_adapter.py

from typing import Optional
from domain.payments.value_objects import Money, PaymentProvider
from domain.payments.services import IPaymentProviderService
from infrastructure.external.payments.yookassa_client import YooKassaClient, YooKassaConfig
from infrastructure.exceptions import InfrastructureError


class YooKassaAdapter(IPaymentProviderService):
    """Адаптер для интеграции с ЮKassa (Anti-Corruption Layer)."""
    
    def __init__(self, client: YooKassaClient):
        self._client = client
    
    async def create_payment_intent(
        self,
        amount: Money,
        description: str,
        return_url: str,
        metadata: Optional[dict] = None
    ) -> dict:
        """Создать намерение оплаты в ЮKassa."""
        try:
            result = await self._client.create_payment(
                amount=float(amount.amount),
                currency=amount.currency.code,
                description=description,
                return_url=return_url,
                metadata=metadata
            )
            
            # Преобразование ответа ЮKassa в доменный формат
            return {
                'payment_id': result['id'],
                'status': result['status'],
                'confirmation_url': result.get('confirmation', {}).get('confirmation_url'),
            }
        except Exception as e:
            raise InfrastructureError(f"Failed to create payment in YooKassa: {e}") from e
    
    async def get_payment_status(self, provider_payment_id: str) -> dict:
        """Получить статус платежа из ЮKassa."""
        try:
            result = await self._client.get_payment(provider_payment_id)
            
            return {
                'payment_id': result['id'],
                'status': result['status'],
                'amount': float(result['amount']['value']),
                'currency': result['amount']['currency'],
                'paid': result.get('paid', False),
                'cancelled': result.get('cancelled', False),
            }
        except Exception as e:
            raise InfrastructureError(f"Failed to get payment status from YooKassa: {e}") from e
    
    async def cancel_payment(self, provider_payment_id: str) -> bool:
        """Отменить платеж в ЮKassa."""
        try:
            await self._client.cancel_payment(provider_payment_id)
            return True
        except Exception as e:
            raise InfrastructureError(f"Failed to cancel payment in YooKassa: {e}") from e
```

#### YooKassaWebhookHandler

```python
# infrastructure/external/payments/yookassa_webhook_handler.py

import hmac
import hashlib
from typing import Dict, Any
from django.http import HttpRequest, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
import json

from infrastructure.external.payments.yookassa_adapter import YooKassaAdapter
from infrastructure.events.event_bus import IEventBus
from domain.payments.domain_events import PaymentSucceededEvent, PaymentFailedEvent
from infrastructure.exceptions import InfrastructureError


class YooKassaWebhookHandler:
    """Обработчик webhooks от ЮKassa."""
    
    def __init__(self, adapter: YooKassaAdapter, event_bus: IEventBus, secret_key: str):
        self._adapter = adapter
        self._event_bus = event_bus
        self._secret_key = secret_key
    
    def verify_signature(self, request_body: bytes, signature: str) -> bool:
        """Проверить подпись webhook от ЮKassa."""
        expected_signature = hmac.new(
            self._secret_key.encode(),
            request_body,
            hashlib.sha256
        ).hexdigest()
        
        return hmac.compare_digest(expected_signature, signature)
    
    @csrf_exempt
    @require_POST
    async def handle_webhook(self, request: HttpRequest) -> HttpResponse:
        """Обработать webhook от ЮKassa."""
        # Валидация подписи
        signature = request.headers.get('X-YooMoney-Signature')
        if not signature or not self.verify_signature(request.body, signature):
            return HttpResponse(status=401)
        
        # Парсинг payload
        try:
            payload = json.loads(request.body)
            event_type = payload.get('event')
            payment_data = payload.get('object', {})
        except (json.JSONDecodeError, KeyError) as e:
            return HttpResponse(status=400)
        
        # Идемпотентность: проверяем, не обрабатывали ли мы уже этот webhook
        payment_id = payment_data.get('id')
        if await self._is_already_processed(payment_id, event_type):
            return HttpResponse(status=200)  # Уже обработано
        
        # Обработка события
        try:
            if event_type == 'payment.succeeded':
                await self._handle_payment_succeeded(payment_data)
            elif event_type == 'payment.canceled':
                await self._handle_payment_canceled(payment_data)
            elif event_type == 'payment.waiting_for_capture':
                await self._handle_payment_waiting(payment_data)
            else:
                # Игнорируем неизвестные события
                pass
            
            # Отмечаем как обработанное
            await self._mark_as_processed(payment_id, event_type)
            
            return HttpResponse(status=200)
        except Exception as e:
            # Логируем ошибку, но возвращаем 200 (чтобы ЮKassa не повторял)
            # В production: отправляем в систему мониторинга
            return HttpResponse(status=200)
    
    async def _handle_payment_succeeded(self, payment_data: Dict[str, Any]) -> None:
        """Обработать событие успешной оплаты."""
        # Получаем appointment_id из metadata
        appointment_id = payment_data.get('metadata', {}).get('appointment_id')
        if not appointment_id:
            raise InfrastructureError("appointment_id not found in payment metadata")
        
        # Публикуем Domain Event
        event = PaymentSucceededEvent(
            payment_id=PaymentId(payment_data['id']),
            appointment_id=AppointmentId(appointment_id),
            amount=Money(
                amount=float(payment_data['amount']['value']),
                currency=Currency.from_code(payment_data['amount']['currency'])
            )
        )
        
        await self._event_bus.publish(event)
    
    async def _is_already_processed(self, payment_id: str, event_type: str) -> bool:
        """Проверить, был ли webhook уже обработан (идемпотентность)."""
        # Реализация через кэш (Redis) или БД таблицу webhook_events
        # Для Release 1: простая проверка по payment_id + event_type в БД
        from infrastructure.persistence.django_models.payments import WebhookEventModel
        return await WebhookEventModel.objects.filter(
            payment_id=payment_id,
            event_type=event_type
        ).aexists()
    
    async def _mark_as_processed(self, payment_id: str, event_type: str) -> None:
        """Отметить webhook как обработанный."""
        from infrastructure.persistence.django_models.payments import WebhookEventModel
        await WebhookEventModel.objects.acreate(
            payment_id=payment_id,
            event_type=event_type
        )
```

### 5.2 Google Calendar (Booking)

#### GoogleCalendarClient

```python
# infrastructure/external/calendar/google_calendar_client.py

from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from typing import List, Dict, Any, Optional
from datetime import datetime


class GoogleCalendarClient:
    """Клиент для работы с Google Calendar API."""
    
    def __init__(self, credentials: Credentials, calendar_id: str):
        self._service = build('calendar', 'v3', credentials=credentials)
        self._calendar_id = calendar_id
    
    async def get_events(
        self,
        time_min: datetime,
        time_max: datetime,
        timezone: str = 'UTC'
    ) -> List[Dict[str, Any]]:
        """Получить события из календаря."""
        try:
            events_result = self._service.events().list(
                calendarId=self._calendar_id,
                timeMin=time_min.isoformat(),
                timeMax=time_max.isoformat(),
                timeZone=timezone,
                singleEvents=True,
                orderBy='startTime'
            ).execute()
            
            return events_result.get('items', [])
        except HttpError as e:
            raise InfrastructureError(f"Failed to get events from Google Calendar: {e}") from e
    
    async def create_event(
        self,
        summary: str,
        start: datetime,
        end: datetime,
        timezone: str = 'UTC',
        description: Optional[str] = None,
        attendees: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """Создать событие в календаре."""
        event = {
            'summary': summary,
            'start': {
                'dateTime': start.isoformat(),
                'timeZone': timezone,
            },
            'end': {
                'dateTime': end.isoformat(),
                'timeZone': timezone,
            },
        }
        
        if description:
            event['description'] = description
        
        if attendees:
            event['attendees'] = [{'email': email} for email in attendees]
        
        try:
            created_event = self._service.events().insert(
                calendarId=self._calendar_id,
                body=event
            ).execute()
            
            return created_event
        except HttpError as e:
            raise InfrastructureError(f"Failed to create event in Google Calendar: {e}") from e
    
    async def delete_event(self, event_id: str) -> None:
        """Удалить событие из календаря."""
        try:
            self._service.events().delete(
                calendarId=self._calendar_id,
                eventId=event_id
            ).execute()
        except HttpError as e:
            raise InfrastructureError(f"Failed to delete event from Google Calendar: {e}") from e
    
    async def is_time_slot_free(
        self,
        start: datetime,
        end: datetime,
        timezone: str = 'UTC'
    ) -> bool:
        """Проверить, свободен ли временной слот."""
        events = await self.get_events(start, end, timezone)
        
        # Проверяем пересечения
        for event in events:
            event_start = datetime.fromisoformat(event['start']['dateTime'])
            event_end = datetime.fromisoformat(event['end']['dateTime'])
            
            if start < event_end and end > event_start:
                return False
        
        return True
```

#### GoogleCalendarAdapter

```python
# infrastructure/external/calendar/google_calendar_adapter.py

from domain.booking.value_objects import TimeSlot
from domain.booking.services import IGoogleCalendarService
from infrastructure.external.calendar.google_calendar_client import GoogleCalendarClient
from infrastructure.exceptions import InfrastructureError


class GoogleCalendarAdapter(IGoogleCalendarService):
    """Адаптер для интеграции с Google Calendar (Anti-Corruption Layer)."""
    
    def __init__(self, client: GoogleCalendarClient):
        self._client = client
    
    async def is_time_slot_free(self, slot: TimeSlot) -> bool:
        """Проверить, свободен ли слот в Google Calendar."""
        try:
            return await self._client.is_time_slot_free(
                start=slot.start_at,
                end=slot.end_at,
                timezone=slot.timezone.iana
            )
        except Exception as e:
            raise InfrastructureError(f"Failed to check slot availability: {e}") from e
    
    async def create_appointment_event(
        self,
        appointment_id: str,
        slot: TimeSlot,
        summary: str,
        description: Optional[str] = None,
        attendee_email: Optional[str] = None
    ) -> str:
        """Создать событие в календаре для Appointment."""
        try:
            event = await self._client.create_event(
                summary=summary,
                start=slot.start_at,
                end=slot.end_at,
                timezone=slot.timezone.iana,
                description=description,
                attendees=[attendee_email] if attendee_email else None
            )
            
            return event['id']
        except Exception as e:
            raise InfrastructureError(f"Failed to create calendar event: {e}") from e
    
    async def delete_appointment_event(self, event_id: str) -> None:
        """Удалить событие из календаря."""
        try:
            await self._client.delete_event(event_id)
        except Exception as e:
            raise InfrastructureError(f"Failed to delete calendar event: {e}") from e
```

### 5.3 Telegram Bot API

#### TelegramBotClient

```python
# infrastructure/external/telegram/telegram_bot_client.py

import httpx
from typing import Dict, Any, Optional, List
from dataclasses import dataclass


@dataclass
class TelegramConfig:
    """Конфигурация Telegram Bot."""
    bot_token: str
    api_url: str = "https://api.telegram.org/bot"


class TelegramBotClient:
    """HTTP клиент для работы с Telegram Bot API."""
    
    def __init__(self, config: TelegramConfig):
        self.config = config
        self._base_url = f"{config.api_url}{config.bot_token}"
        self._client = httpx.AsyncClient(timeout=30.0)
    
    async def send_message(
        self,
        chat_id: int,
        text: str,
        reply_markup: Optional[Dict[str, Any]] = None,
        parse_mode: str = "Markdown"
    ) -> Dict[str, Any]:
        """Отправить сообщение в чат."""
        payload = {
            "chat_id": chat_id,
            "text": text,
            "parse_mode": parse_mode
        }
        
        if reply_markup:
            payload["reply_markup"] = reply_markup
        
        response = await self._client.post(
            f"{self._base_url}/sendMessage",
            json=payload
        )
        response.raise_for_status()
        return response.json()
    
    async def send_photo(
        self,
        chat_id: int,
        photo: str,  # file_id или URL
        caption: Optional[str] = None
    ) -> Dict[str, Any]:
        """Отправить фото в чат."""
        payload = {
            "chat_id": chat_id,
            "photo": photo
        }
        
        if caption:
            payload["caption"] = caption
        
        response = await self._client.post(
            f"{self._base_url}/sendPhoto",
            json=payload
        )
        response.raise_for_status()
        return response.json()
    
    async def set_webhook(self, url: str, secret_token: Optional[str] = None) -> bool:
        """Установить webhook для получения обновлений."""
        payload = {"url": url}
        
        if secret_token:
            payload["secret_token"] = secret_token
        
        response = await self._client.post(
            f"{self._base_url}/setWebhook",
            json=payload
        )
        response.raise_for_status()
        return True
    
    async def get_webhook_info(self) -> Dict[str, Any]:
        """Получить информацию о webhook."""
        response = await self._client.get(f"{self._base_url}/getWebhookInfo")
        response.raise_for_status()
        return response.json()
    
    async def close(self):
        """Закрыть HTTP клиент."""
        await self._client.aclose()
```

#### TelegramAdapter

```python
# infrastructure/external/telegram/telegram_adapter.py

from domain.telegram.services import ITelegramService
from infrastructure.external.telegram.telegram_bot_client import TelegramBotClient
from infrastructure.exceptions import InfrastructureError


class TelegramAdapter(ITelegramService):
    """Адаптер для интеграции с Telegram Bot API."""
    
    def __init__(self, client: TelegramBotClient):
        self._client = client
    
    async def send_welcome_message(
        self,
        user_id: int,
        deep_link_id: Optional[str] = None
    ) -> None:
        """Отправить приветственное сообщение пользователю."""
        text = "Добро пожаловать! 👋\n\nЯ помогу вам..."
        
        if deep_link_id:
            text += f"\n\nВаша ссылка: {deep_link_id}"
        
        try:
            await self._client.send_message(chat_id=user_id, text=text)
        except Exception as e:
            raise InfrastructureError(f"Failed to send Telegram message: {e}") from e
    
    async def send_plan(
        self,
        user_id: int,
        plan_content: str,
        deep_link_id: Optional[str] = None
    ) -> None:
        """Отправить план пользователю."""
        try:
            await self._client.send_message(
                chat_id=user_id,
                text=plan_content,
                parse_mode="Markdown"
            )
        except Exception as e:
            raise InfrastructureError(f"Failed to send plan: {e}") from e
```

### 5.4 Email (Уведомления)

#### EmailClient

```python
# infrastructure/external/email/email_client.py

import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import List, Optional
from dataclasses import dataclass


@dataclass
class EmailConfig:
    """Конфигурация email сервера."""
    smtp_host: str
    smtp_port: int
    smtp_user: str
    smtp_password: str
    from_email: str
    from_name: str = "Эмоциональный баланс"


class EmailClient:
    """Клиент для отправки email через SMTP."""
    
    def __init__(self, config: EmailConfig):
        self.config = config
    
    async def send_email(
        self,
        to_email: str,
        subject: str,
        body_text: str,
        body_html: Optional[str] = None
    ) -> bool:
        """Отправить email."""
        msg = MIMEMultipart('alternative')
        msg['From'] = f"{self.config.from_name} <{self.config.from_email}>"
        msg['To'] = to_email
        msg['Subject'] = subject
        
        # Текстовая версия
        part1 = MIMEText(body_text, 'plain', 'utf-8')
        msg.attach(part1)
        
        # HTML версия (если есть)
        if body_html:
            part2 = MIMEText(body_html, 'html', 'utf-8')
            msg.attach(part2)
        
        try:
            with smtplib.SMTP(self.config.smtp_host, self.config.smtp_port) as server:
                server.starttls()
                server.login(self.config.smtp_user, self.config.smtp_password)
                server.send_message(msg)
            
            return True
        except Exception as e:
            raise InfrastructureError(f"Failed to send email: {e}") from e
```

#### EmailService

```python
# infrastructure/external/email/email_service.py

from domain.notifications.services import IEmailService
from infrastructure.external.email.email_client import EmailClient
from infrastructure.exceptions import InfrastructureError


class EmailService(IEmailService):
    """Сервис для отправки email уведомлений."""
    
    def __init__(self, client: EmailClient):
        self._client = client
    
    async def send_appointment_confirmation(
        self,
        to_email: str,
        appointment_details: dict
    ) -> None:
        """Отправить подтверждение записи."""
        subject = "Подтверждение записи на консультацию"
        
        body_text = f"""
Здравствуйте!

Ваша запись на консультацию подтверждена.

Дата и время: {appointment_details['start_at']}
Формат: {appointment_details['format']}
        
С уважением,
Команда "Эмоциональный баланс"
        """
        
        try:
            await self._client.send_email(
                to_email=to_email,
                subject=subject,
                body_text=body_text
            )
        except Exception as e:
            raise InfrastructureError(f"Failed to send appointment confirmation: {e}") from e
```

---

## 6) Event Bus (Domain Events)

### 6.1 Интерфейс IEventBus

```python
# infrastructure/events/event_bus.py

from abc import ABC, abstractmethod
from typing import List
from domain.shared.events import DomainEvent


class IEventBus(ABC):
    """Интерфейс для публикации Domain Events."""
    
    @abstractmethod
    async def publish(self, event: DomainEvent) -> None:
        """Опубликовать одно событие."""
        pass
    
    @abstractmethod
    async def publish_all(self, events: List[DomainEvent]) -> None:
        """Опубликовать несколько событий."""
        pass
    
    @abstractmethod
    def subscribe(self, event_type: type, handler: callable) -> None:
        """Подписаться на события определенного типа."""
        pass
```

### 6.2 InMemoryEventBus (Release 1)

```python
# infrastructure/events/in_memory_event_bus.py

from typing import Dict, List, Callable
from domain.shared.events import DomainEvent
from infrastructure.events.event_bus import IEventBus
import asyncio


class InMemoryEventBus(IEventBus):
    """In-memory реализация Event Bus (для Release 1)."""
    
    def __init__(self):
        self._handlers: Dict[type, List[Callable]] = {}
        self._event_queue: asyncio.Queue = asyncio.Queue()
        self._running = False
    
    async def publish(self, event: DomainEvent) -> None:
        """Опубликовать одно событие."""
        await self._event_queue.put(event)
    
    async def publish_all(self, events: List[DomainEvent]) -> None:
        """Опубликовать несколько событий."""
        for event in events:
            await self._event_queue.put(event)
    
    def subscribe(self, event_type: type, handler: Callable) -> None:
        """Подписаться на события определенного типа."""
        if event_type not in self._handlers:
            self._handlers[event_type] = []
        self._handlers[event_type].append(handler)
    
    async def start(self) -> None:
        """Запустить обработку событий."""
        self._running = True
        asyncio.create_task(self._process_events())
    
    async def stop(self) -> None:
        """Остановить обработку событий."""
        self._running = False
    
    async def _process_events(self) -> None:
        """Обработать события из очереди."""
        while self._running:
            try:
                event = await asyncio.wait_for(self._event_queue.get(), timeout=1.0)
                await self._handle_event(event)
            except asyncio.TimeoutError:
                continue
            except Exception as e:
                # Логируем ошибку, но продолжаем обработку
                # В production: отправляем в систему мониторинга
                pass
    
    async def _handle_event(self, event: DomainEvent) -> None:
        """Обработать одно событие."""
        event_type = type(event)
        handlers = self._handlers.get(event_type, [])
        
        # Вызываем все обработчики параллельно
        tasks = [handler(event) for handler in handlers]
        await asyncio.gather(*tasks, return_exceptions=True)
```

### 6.3 Регистрация обработчиков

```python
# infrastructure/events/event_handlers.py

from infrastructure.events.in_memory_event_bus import InMemoryEventBus
from domain.booking.domain_events import (
    AppointmentCreatedEvent,
    AppointmentConfirmedEvent,
    AppointmentCanceledEvent
)
from application.booking.event_handlers import (
    AppointmentCreatedEventHandler,
    AppointmentConfirmedEventHandler,
    AppointmentCanceledEventHandler
)


def register_event_handlers(event_bus: InMemoryEventBus) -> None:
    """Зарегистрировать все обработчики Domain Events."""
    
    # Booking events
    appointment_created_handler = AppointmentCreatedEventHandler(...)
    event_bus.subscribe(AppointmentCreatedEvent, appointment_created_handler.handle)
    
    appointment_confirmed_handler = AppointmentConfirmedEventHandler(...)
    event_bus.subscribe(AppointmentConfirmedEvent, appointment_confirmed_handler.handle)
    
    appointment_canceled_handler = AppointmentCanceledEventHandler(...)
    event_bus.subscribe(AppointmentCanceledEvent, appointment_canceled_handler.handle)
    
    # ... остальные обработчики
```

---

## 7) Шифрование (P2 данные)

### 7.1 EncryptionService

```python
# infrastructure/encryption/encryption_service.py

from abc import ABC, abstractmethod


class IEncryptionService(ABC):
    """Интерфейс для шифрования P2 данных."""
    
    @abstractmethod
    def encrypt(self, plaintext: str) -> str:
        """Зашифровать данные."""
        pass
    
    @abstractmethod
    def decrypt(self, ciphertext: str) -> str:
        """Расшифровать данные."""
        pass
```

### 7.2 FernetEncryption (реализация)

```python
# infrastructure/encryption/fernet_encryption.py

from cryptography.fernet import Fernet
from infrastructure.encryption.encryption_service import IEncryptionService
from infrastructure.exceptions import InfrastructureError
import os


class FernetEncryptionService(IEncryptionService):
    """Реализация шифрования через Fernet (symmetric encryption)."""
    
    def __init__(self, key: bytes = None):
        if key is None:
            # В production: ключ из secrets manager
            key = os.environ.get('ENCRYPTION_KEY')
            if not key:
                raise InfrastructureError("ENCRYPTION_KEY not set")
            key = key.encode()
        
        self._fernet = Fernet(key)
    
    def encrypt(self, plaintext: str) -> str:
        """Зашифровать данные."""
        try:
            encrypted = self._fernet.encrypt(plaintext.encode())
            return encrypted.decode()
        except Exception as e:
            raise InfrastructureError(f"Failed to encrypt data: {e}") from e
    
    def decrypt(self, ciphertext: str) -> str:
        """Расшифровать данные."""
        try:
            decrypted = self._fernet.decrypt(ciphertext.encode())
            return decrypted.decode()
        except Exception as e:
            raise InfrastructureError(f"Failed to decrypt data: {e}") from e
```

---

## 8) Тестирование

### 8.1 Unit тесты для репозиториев

```python
# tests/infrastructure/persistence/repositories/test_appointment_repository.py

import pytest
from django.test import override_settings
from domain.booking.entities import Appointment
from infrastructure.persistence.repositories.booking.appointment_repository import PostgresAppointmentRepository


@pytest.mark.django_db
class TestPostgresAppointmentRepository:
    """Unit тесты для PostgresAppointmentRepository."""
    
    @pytest.fixture
    def repository(self, event_bus):
        return PostgresAppointmentRepository(event_bus)
    
    @pytest.fixture
    def appointment(self, service, client_id, time_slot):
        return Appointment.create(
            service=service,
            client_id=client_id,
            slot=time_slot,
            format=AppointmentFormat.Online,
            metadata=BookingMetadata(entry_point='web')
        )
    
    async def test_save_and_find_by_id(self, repository, appointment):
        """Тест сохранения и поиска по ID."""
        await repository.save(appointment)
        
        found = await repository.find_by_id(appointment.appointment_id)
        
        assert found is not None
        assert found.appointment_id == appointment.appointment_id
        assert found.time_slot.start_at == appointment.time_slot.start_at
    
    async def test_find_conflicting_appointments(self, repository, appointment, conflicting_slot):
        """Тест поиска конфликтующих Appointment."""
        await repository.save(appointment)
        
        conflicts = await repository.find_conflicting_appointments(conflicting_slot)
        
        assert len(conflicts) > 0
        assert any(c.appointment_id == appointment.appointment_id for c in conflicts)
    
    async def test_save_with_conflict_check_raises_on_conflict(self, repository, appointment, conflicting_appointment):
        """Тест проверки конфликтов при сохранении."""
        await repository.save(conflicting_appointment)
        
        with pytest.raises(ConflictError):
            await repository.save_with_conflict_check(appointment)
```

### 8.2 Integration тесты для интеграций

```python
# tests/infrastructure/external/payments/test_yookassa_adapter.py

import pytest
from unittest.mock import AsyncMock, patch
from infrastructure.external.payments.yookassa_adapter import YooKassaAdapter
from domain.payments.value_objects import Money, Currency


@pytest.mark.asyncio
class TestYooKassaAdapter:
    """Integration тесты для YooKassaAdapter."""
    
    @pytest.fixture
    def adapter(self, yookassa_client):
        return YooKassaAdapter(yookassa_client)
    
    async def test_create_payment_intent(self, adapter, yookassa_client):
        """Тест создания намерения оплаты."""
        yookassa_client.create_payment = AsyncMock(return_value={
            'id': 'payment_123',
            'status': 'pending',
            'confirmation': {
                'confirmation_url': 'https://yookassa.ru/...'
            }
        })
        
        amount = Money(amount=5000.0, currency=Currency.RUB)
        result = await adapter.create_payment_intent(
            amount=amount,
            description='Test payment',
            return_url='https://example.com/return'
        )
        
        assert result['payment_id'] == 'payment_123'
        assert result['status'] == 'pending'
        assert 'confirmation_url' in result
```

---

## 9) Последовательность реализации

### 9.1 Этап 1: Django ORM модели и миграции (1 неделя)

**Задачи:**
1. Создать Django ORM модели для всех доменов
2. Настроить индексы и constraints
3. Создать и применить миграции
4. Написать unit тесты для моделей

**Выходные артефакты:**
- Django ORM модели в `infrastructure/persistence/django_models/`
- Миграции в `infrastructure/persistence/migrations/`
- Тесты в `tests/infrastructure/persistence/django_models/`

### 9.2 Этап 2: Mappers (3-5 дней)

**Задачи:**
1. Создать Mapper классы для всех доменов
2. Реализовать `to_domain()` и `to_persistence()`
3. Написать unit тесты для мапперов

**Выходные артефакты:**
- Mapper классы в `infrastructure/persistence/mappers/`
- Тесты в `tests/infrastructure/persistence/mappers/`

### 9.3 Этап 3: Репозитории (2 недели)

**Задачи:**
1. Реализовать репозитории для всех доменов (по приоритету):
   - Identity & Access (UserRepository)
   - Booking (AppointmentRepository, ServiceRepository)
   - Payments (PaymentRepository)
   - Interactive (InteractiveRunRepository)
   - Content (ContentRepository)
   - Client Cabinet (DiaryRepository)
   - CRM (LeadRepository)
   - Moderation (ModerationRepository)
2. Реализовать обработку Domain Events в репозиториях
3. Написать unit и integration тесты

**Выходные артефакты:**
- Репозитории в `infrastructure/persistence/repositories/`
- Тесты в `tests/infrastructure/persistence/repositories/`

### 9.4 Этап 4: Event Bus (3-5 дней)

**Задачи:**
1. Реализовать InMemoryEventBus
2. Настроить регистрацию обработчиков
3. Интегрировать с репозиториями
4. Написать тесты

**Выходные артефакты:**
- Event Bus в `infrastructure/events/`
- Тесты в `tests/infrastructure/events/`

### 9.5 Этап 5: Интеграции (2-3 недели)

**Задачи:**
1. ЮKassa (YooKassaClient, YooKassaAdapter, YooKassaWebhookHandler)
2. Google Calendar (GoogleCalendarClient, GoogleCalendarAdapter)
3. Telegram (TelegramBotClient, TelegramAdapter)
4. Email (EmailClient, EmailService)
5. Написать integration тесты (с моками)

**Выходные артефакты:**
- Интеграции в `infrastructure/external/`
- Тесты в `tests/infrastructure/external/`

### 9.6 Этап 6: Шифрование (2-3 дня)

**Задачи:**
1. Реализовать EncryptionService (Fernet)
2. Интегрировать с репозиториями для P2 данных
3. Написать тесты

**Выходные артефакты:**
- EncryptionService в `infrastructure/encryption/`
- Тесты в `tests/infrastructure/encryption/`

---

## 10) Критерии готовности (Definition of Done)

### 10.1 Для каждого компонента

- ✅ Код реализован согласно Clean Architecture + DDD
- ✅ Unit тесты написаны (покрытие ≥80%)
- ✅ Integration тесты написаны (для интеграций)
- ✅ Code review пройден
- ✅ Документация обновлена (docstrings, README)
- ✅ Нет критичных багов

### 10.2 Для Phase 3 в целом

- ✅ Все репозитории реализованы и протестированы
- ✅ Все интеграции реализованы и протестированы
- ✅ Event Bus работает и интегрирован
- ✅ Шифрование P2 данных работает
- ✅ Миграции БД применены
- ✅ Все тесты проходят (≥80% покрытие)
- ✅ Документация готова

---

## 11) Зависимости и риски

### 11.1 Зависимости

- **Phase 2 (Domain Layer)** должна быть завершена (интерфейсы репозиториев готовы)
- **Phase 1 (Platform & Foundations)** должна быть завершена (Django проект, БД настроена)

### 11.2 Риски и митигация

#### Риск 1: Сложность маппинга Domain ↔ DB
**Митигация:** Раннее создание Mapper классов, тестирование на простых случаях

#### Риск 2: Задержки в интеграциях (ЮKassa, Google Calendar)
**Митигация:** Раннее начало интеграций, mock-реализации для разработки

#### Риск 3: Производительность репозиториев
**Митигация:** Оптимизация запросов, использование индексов, нагрузочное тестирование

#### Риск 4: Безопасность шифрования
**Митигация:** Использование проверенных библиотек (Fernet), правильное управление ключами

---

## 12) Следующие шаги

После завершения Phase 3:

1. ✅ Начать Phase 4: Application Layer (Use Cases)
2. ✅ Интегрировать репозитории в Use Cases
3. ✅ Использовать интеграции в Use Cases
4. ✅ Публиковать Domain Events через Event Bus

---

**Версия:** v1.0  
**Последнее обновление:** 2026-01-26  
**Статус:** ✅ Готово для реализации
