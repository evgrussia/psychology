---
name: django-ddd-patterns
description: Паттерны и шаблоны кода для реализации Clean Architecture + DDD на Django. Включает структуру проекта, базовые классы, примеры для всех слоёв архитектуры.
---

# Django DDD Patterns

## Назначение
Детальные паттерны и код для реализации Clean Architecture + Domain-Driven Design на Django в проекте «Эмоциональный баланс».

## Когда применять
- При создании новых доменных сущностей (Aggregates, Entities, Value Objects)
- При реализации Use Cases
- При создании Repository implementations
- При написании API endpoints
- При настройке Domain Events

## Источники истины
- `docs/Domain-Model-Specification.md` — доменная модель
- `docs/Модель-данных.md` — физическая схема БД
- `docs/Phase-2-Domain-Layer-Technical-Specification.md` — техспека Domain Layer
- `docs/api/api-contracts.md` — контракты API

---

## Структура проекта

```
backend/
├── config/                    # Django configuration
│   ├── settings/
│   │   ├── __init__.py
│   │   ├── base.py           # Общие настройки
│   │   ├── development.py    # Dev environment
│   │   ├── production.py     # Prod environment
│   │   └── testing.py        # Test environment
│   ├── urls.py
│   ├── wsgi.py
│   └── asgi.py
│
├── domain/                    # Domain Layer (чистый Python, без Django!)
│   ├── __init__.py
│   ├── shared/               # Shared Kernel
│   │   ├── __init__.py
│   │   ├── entity_base.py    # Базовые классы Entity, AggregateRoot
│   │   ├── value_object_base.py
│   │   ├── domain_event_base.py
│   │   └── repository_base.py
│   │
│   ├── booking/              # Bounded Context: Booking
│   │   ├── __init__.py
│   │   ├── entities.py       # Booking (Aggregate Root)
│   │   ├── value_objects.py  # TimeSlot, Money, BookingStatus
│   │   ├── domain_services.py
│   │   ├── domain_events.py  # BookingCreated, BookingConfirmed
│   │   └── repositories.py   # IBookingRepository (interface)
│   │
│   ├── interactive/          # Bounded Context: Interactive Modules
│   │   ├── __init__.py
│   │   ├── entities.py       # Quiz, DiaryEntry, Challenge
│   │   ├── value_objects.py  # QuizResult, EmotionLevel, CrisisLevel
│   │   ├── domain_services.py # CrisisDetectionService
│   │   └── repositories.py
│   │
│   ├── identity/             # Bounded Context: Identity & Access
│   ├── payments/             # Bounded Context: Payments
│   ├── content/              # Bounded Context: Content
│   └── ...
│
├── application/              # Application Layer (Use Cases)
│   ├── __init__.py
│   ├── booking/
│   │   ├── __init__.py
│   │   ├── use_cases.py      # CreateBooking, ConfirmBooking, etc.
│   │   ├── dto.py            # Request/Response DTOs
│   │   └── queries.py        # Query handlers (CQRS optional)
│   └── ...
│
├── infrastructure/           # Infrastructure Layer
│   ├── __init__.py
│   ├── persistence/
│   │   ├── __init__.py
│   │   ├── django_models.py  # Django ORM models
│   │   └── repositories/     # Repository implementations
│   │       ├── __init__.py
│   │       └── booking_repository.py
│   ├── external/
│   │   ├── __init__.py
│   │   ├── telegram/         # Telegram integration
│   │   ├── payments/         # ЮKassa integration
│   │   └── calendar/         # Calendar integration
│   └── events/
│       ├── __init__.py
│       └── event_bus.py      # Domain Event Bus
│
├── presentation/             # Presentation Layer
│   ├── __init__.py
│   ├── api/
│   │   ├── __init__.py
│   │   └── v1/
│   │       ├── __init__.py
│   │       ├── urls.py
│   │       ├── views/
│   │       │   ├── __init__.py
│   │       │   └── booking_views.py
│   │       └── serializers/
│   │           ├── __init__.py
│   │           └── booking_serializers.py
│   └── admin/                # Custom Django Admin (optional)
│
├── shared/                   # Cross-cutting concerns
│   ├── __init__.py
│   ├── exceptions.py         # Application exceptions
│   ├── validators.py
│   └── utils.py
│
└── tests/
    ├── __init__.py
    ├── domain/
    ├── application/
    ├── infrastructure/
    └── presentation/
```

---

## Базовые классы (Shared Kernel)

### Entity Base

```python
# domain/shared/entity_base.py
from abc import ABC
from dataclasses import dataclass, field
from datetime import datetime
from typing import List, Any
from uuid import UUID, uuid4

@dataclass
class Entity(ABC):
    """Базовый класс для Entity."""
    id: UUID = field(default_factory=uuid4)
    
    def __eq__(self, other: Any) -> bool:
        if not isinstance(other, Entity):
            return False
        return self.id == other.id
    
    def __hash__(self) -> int:
        return hash(self.id)


@dataclass
class AggregateRoot(Entity):
    """Базовый класс для Aggregate Root с поддержкой Domain Events."""
    _events: List["DomainEvent"] = field(default_factory=list, repr=False)
    created_at: datetime = field(default_factory=datetime.utcnow)
    updated_at: datetime = field(default_factory=datetime.utcnow)
    
    def _add_event(self, event: "DomainEvent") -> None:
        """Добавить доменное событие."""
        self._events.append(event)
    
    def get_events(self) -> List["DomainEvent"]:
        """Получить все накопленные события."""
        return self._events.copy()
    
    def clear_events(self) -> None:
        """Очистить события после публикации."""
        self._events.clear()
```

### Value Object Base

```python
# domain/shared/value_object_base.py
from dataclasses import dataclass
from typing import Any

@dataclass(frozen=True)
class ValueObject:
    """
    Базовый класс для Value Object.
    
    Value Objects:
    - Immutable (frozen=True)
    - Equality by value (не по id)
    - Не имеют жизненного цикла
    """
    
    def __eq__(self, other: Any) -> bool:
        if not isinstance(other, self.__class__):
            return False
        return self.__dict__ == other.__dict__
    
    def __hash__(self) -> int:
        return hash(tuple(sorted(self.__dict__.items())))
```

### Domain Event Base

```python
# domain/shared/domain_event_base.py
from dataclasses import dataclass, field
from datetime import datetime
from uuid import UUID, uuid4

@dataclass
class DomainEvent:
    """Базовый класс для Domain Event."""
    event_id: UUID = field(default_factory=uuid4)
    occurred_at: datetime = field(default_factory=datetime.utcnow)
    
    @property
    def event_type(self) -> str:
        return self.__class__.__name__
```

### Repository Interface Base

```python
# domain/shared/repository_base.py
from abc import ABC, abstractmethod
from typing import Generic, TypeVar, Optional, List
from uuid import UUID

T = TypeVar('T')

class IRepository(ABC, Generic[T]):
    """Базовый интерфейс репозитория."""
    
    @abstractmethod
    def save(self, entity: T) -> None:
        """Сохранить entity."""
        pass
    
    @abstractmethod
    def get_by_id(self, id: UUID) -> Optional[T]:
        """Получить entity по ID."""
        pass
    
    @abstractmethod
    def delete(self, entity: T) -> None:
        """Удалить entity."""
        pass
```

---

## Domain Layer Patterns

### Entity с бизнес-логикой

```python
# domain/booking/entities.py
from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional
from uuid import UUID

from domain.shared.entity_base import AggregateRoot
from domain.booking.value_objects import TimeSlot, BookingStatus, Money
from domain.booking.domain_events import (
    BookingCreated,
    BookingConfirmed,
    BookingCancelled
)

@dataclass
class Booking(AggregateRoot):
    """
    Aggregate Root: Бронирование консультации.
    
    Инварианты:
    - Бронирование может быть подтверждено только из PENDING
    - Отменить можно только PENDING или CONFIRMED
    - Время отмены влияет на возврат депозита
    """
    client_id: UUID
    service_id: UUID
    time_slot: TimeSlot
    deposit: Money
    status: BookingStatus = BookingStatus.PENDING
    confirmed_at: Optional[datetime] = None
    cancelled_at: Optional[datetime] = None
    cancellation_reason: Optional[str] = None
    
    # Business Rules
    CANCELLATION_DEADLINE_HOURS = 24
    
    def confirm(self, payment_id: UUID) -> None:
        """Подтвердить бронирование после оплаты."""
        if self.status != BookingStatus.PENDING:
            raise ValueError(
                f"Нельзя подтвердить бронирование в статусе {self.status.value}"
            )
        
        self.status = BookingStatus.CONFIRMED
        self.confirmed_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()
        
        self._add_event(BookingConfirmed(
            booking_id=self.id,
            payment_id=payment_id,
            confirmed_at=self.confirmed_at
        ))
    
    def cancel(self, reason: str | None = None) -> bool:
        """
        Отменить бронирование.
        
        Returns:
            True если депозит должен быть возвращён
        """
        if self.status not in (BookingStatus.PENDING, BookingStatus.CONFIRMED):
            raise ValueError(
                f"Нельзя отменить бронирование в статусе {self.status.value}"
            )
        
        now = datetime.utcnow()
        hours_before = (self.time_slot.start - now).total_seconds() / 3600
        should_refund = hours_before >= self.CANCELLATION_DEADLINE_HOURS
        
        self.status = BookingStatus.CANCELLED
        self.cancelled_at = now
        self.cancellation_reason = reason
        self.updated_at = now
        
        self._add_event(BookingCancelled(
            booking_id=self.id,
            cancelled_at=now,
            refund_deposit=should_refund,
            reason=reason
        ))
        
        return should_refund
    
    def complete(self) -> None:
        """Отметить консультацию как проведённую."""
        if self.status != BookingStatus.CONFIRMED:
            raise ValueError("Можно завершить только подтверждённое бронирование")
        
        self.status = BookingStatus.COMPLETED
        self.updated_at = datetime.utcnow()
    
    def mark_no_show(self) -> None:
        """Отметить неявку клиента."""
        if self.status != BookingStatus.CONFIRMED:
            raise ValueError("Можно отметить неявку только для подтверждённого")
        
        self.status = BookingStatus.NO_SHOW
        self.updated_at = datetime.utcnow()
    
    @classmethod
    def create(
        cls,
        client_id: UUID,
        service_id: UUID,
        time_slot: TimeSlot,
        deposit: Money
    ) -> "Booking":
        """Factory method для создания нового бронирования."""
        booking = cls(
            client_id=client_id,
            service_id=service_id,
            time_slot=time_slot,
            deposit=deposit
        )
        
        booking._add_event(BookingCreated(
            booking_id=booking.id,
            client_id=client_id,
            service_id=service_id,
            time_slot=time_slot,
            deposit=deposit
        ))
        
        return booking
```

### Value Objects

```python
# domain/booking/value_objects.py
from dataclasses import dataclass
from datetime import datetime
from decimal import Decimal
from enum import Enum

from domain.shared.value_object_base import ValueObject

class BookingStatus(Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    CANCELLED = "cancelled"
    COMPLETED = "completed"
    NO_SHOW = "no_show"

@dataclass(frozen=True)
class TimeSlot(ValueObject):
    """Временной слот для консультации."""
    start: datetime
    end: datetime
    timezone: str = "Europe/Moscow"
    
    def __post_init__(self):
        if self.end <= self.start:
            raise ValueError("Время окончания должно быть позже времени начала")
    
    @property
    def duration_minutes(self) -> int:
        return int((self.end - self.start).total_seconds() / 60)
    
    def overlaps(self, other: "TimeSlot") -> bool:
        """Проверить пересечение со слотом."""
        return self.start < other.end and other.start < self.end

@dataclass(frozen=True)
class Money(ValueObject):
    """Денежная сумма."""
    amount: Decimal
    currency: str = "RUB"
    
    def __post_init__(self):
        if self.amount < 0:
            raise ValueError("Сумма не может быть отрицательной")
    
    def add(self, other: "Money") -> "Money":
        if self.currency != other.currency:
            raise ValueError("Нельзя складывать разные валюты")
        return Money(amount=self.amount + other.amount, currency=self.currency)
    
    def __str__(self) -> str:
        return f"{self.amount} {self.currency}"


# domain/interactive/value_objects.py
from dataclasses import dataclass
from enum import Enum
from typing import List, Dict

@dataclass(frozen=True)
class QuizAnswer(ValueObject):
    """Ответ на вопрос квиза."""
    question_id: str
    answer_value: str | int
    score: int = 0

class CrisisLevel(Enum):
    NONE = "none"
    LOW = "low"
    MODERATE = "moderate"
    HIGH = "high"

@dataclass(frozen=True)
class QuizResult(ValueObject):
    """Результат прохождения квиза."""
    quiz_id: str
    total_score: int
    level: str  # "low" | "moderate" | "high"
    crisis_level: CrisisLevel
    recommendations: List[str]
    
    @property
    def show_crisis_block(self) -> bool:
        return self.crisis_level == CrisisLevel.HIGH
    
    @property
    def disable_marketing_cta(self) -> bool:
        return self.crisis_level == CrisisLevel.HIGH
```

### Domain Events

```python
# domain/booking/domain_events.py
from dataclasses import dataclass
from datetime import datetime
from uuid import UUID

from domain.shared.domain_event_base import DomainEvent
from domain.booking.value_objects import TimeSlot, Money

@dataclass
class BookingCreated(DomainEvent):
    """Событие: бронирование создано."""
    booking_id: UUID
    client_id: UUID
    service_id: UUID
    time_slot: TimeSlot
    deposit: Money

@dataclass
class BookingConfirmed(DomainEvent):
    """Событие: бронирование подтверждено (оплачено)."""
    booking_id: UUID
    payment_id: UUID
    confirmed_at: datetime

@dataclass
class BookingCancelled(DomainEvent):
    """Событие: бронирование отменено."""
    booking_id: UUID
    cancelled_at: datetime
    refund_deposit: bool
    reason: str | None = None
```

### Repository Interface

```python
# domain/booking/repositories.py
from abc import abstractmethod
from typing import Optional, List
from uuid import UUID
from datetime import datetime

from domain.shared.repository_base import IRepository
from domain.booking.entities import Booking
from domain.booking.value_objects import BookingStatus

class IBookingRepository(IRepository[Booking]):
    """Интерфейс репозитория бронирований."""
    
    @abstractmethod
    def find_by_client(self, client_id: UUID) -> List[Booking]:
        """Найти все бронирования клиента."""
        pass
    
    @abstractmethod
    def find_by_status(self, status: BookingStatus) -> List[Booking]:
        """Найти бронирования по статусу."""
        pass
    
    @abstractmethod
    def find_by_date_range(
        self, 
        start: datetime, 
        end: datetime
    ) -> List[Booking]:
        """Найти бронирования в диапазоне дат."""
        pass
    
    @abstractmethod
    def find_conflicts(
        self, 
        service_id: UUID, 
        start: datetime, 
        end: datetime,
        exclude_id: UUID | None = None
    ) -> List[Booking]:
        """Найти конфликтующие бронирования."""
        pass
```

---

## Application Layer Patterns

### Use Case

```python
# application/booking/use_cases.py
from dataclasses import dataclass
from uuid import UUID
from datetime import datetime

from domain.booking.entities import Booking
from domain.booking.repositories import IBookingRepository
from domain.booking.value_objects import TimeSlot, Money, BookingStatus
from infrastructure.events.event_bus import IDomainEventBus
from shared.exceptions import BookingSlotUnavailableError, ValidationError

@dataclass
class CreateBookingRequest:
    """DTO: запрос на создание бронирования."""
    client_id: UUID
    service_id: UUID
    start_time: str  # ISO format
    end_time: str    # ISO format
    deposit_amount: str  # Decimal as string

@dataclass
class CreateBookingResponse:
    """DTO: ответ на создание бронирования."""
    booking_id: UUID
    status: str
    time_slot_start: str
    time_slot_end: str

class CreateBookingUseCase:
    """
    Use Case: Создание бронирования.
    
    Шаги:
    1. Валидация входных данных
    2. Проверка доступности слота
    3. Создание доменного объекта
    4. Сохранение через репозиторий
    5. Публикация событий
    6. Возврат DTO
    """
    
    def __init__(
        self,
        booking_repository: IBookingRepository,
        event_bus: IDomainEventBus
    ):
        self._booking_repository = booking_repository
        self._event_bus = event_bus
    
    def execute(self, request: CreateBookingRequest) -> CreateBookingResponse:
        # 1. Валидация и парсинг
        try:
            time_slot = TimeSlot(
                start=datetime.fromisoformat(request.start_time),
                end=datetime.fromisoformat(request.end_time)
            )
        except ValueError as e:
            raise ValidationError(f"Некорректный формат времени: {e}")
        
        deposit = Money(
            amount=Decimal(request.deposit_amount),
            currency="RUB"
        )
        
        # 2. Проверка доступности слота
        conflicts = self._booking_repository.find_conflicts(
            service_id=request.service_id,
            start=time_slot.start,
            end=time_slot.end
        )
        
        if conflicts:
            raise BookingSlotUnavailableError(
                "К сожалению, это время уже занято. "
                "Давайте подберём другой слот."
            )
        
        # 3. Создание доменного объекта
        booking = Booking.create(
            client_id=request.client_id,
            service_id=request.service_id,
            time_slot=time_slot,
            deposit=deposit
        )
        
        # 4. Сохранение
        self._booking_repository.save(booking)
        
        # 5. Публикация событий
        for event in booking.get_events():
            self._event_bus.publish(event)
        booking.clear_events()
        
        # 6. Возврат DTO
        return CreateBookingResponse(
            booking_id=booking.id,
            status=booking.status.value,
            time_slot_start=time_slot.start.isoformat(),
            time_slot_end=time_slot.end.isoformat()
        )
```

### Query Handler (CQRS optional)

```python
# application/booking/queries.py
from dataclasses import dataclass
from typing import List
from uuid import UUID

from domain.booking.repositories import IBookingRepository
from domain.booking.value_objects import BookingStatus

@dataclass
class BookingDTO:
    """DTO для отображения бронирования."""
    id: UUID
    service_name: str
    start_time: str
    end_time: str
    status: str
    can_cancel: bool

class GetClientBookingsQuery:
    """Query: получить бронирования клиента."""
    
    def __init__(self, booking_repository: IBookingRepository):
        self._repository = booking_repository
    
    def execute(self, client_id: UUID) -> List[BookingDTO]:
        bookings = self._repository.find_by_client(client_id)
        
        return [
            BookingDTO(
                id=b.id,
                service_name=b.service_id,  # TODO: resolve from Service
                start_time=b.time_slot.start.isoformat(),
                end_time=b.time_slot.end.isoformat(),
                status=b.status.value,
                can_cancel=b.status in (
                    BookingStatus.PENDING, 
                    BookingStatus.CONFIRMED
                )
            )
            for b in bookings
        ]
```

---

## Infrastructure Layer Patterns

### Django ORM Model

```python
# infrastructure/persistence/django_models.py
import uuid
from django.db import models

class BookingModel(models.Model):
    """Django ORM модель для Booking aggregate."""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    client_id = models.UUIDField(db_index=True)
    service_id = models.UUIDField(db_index=True)
    
    # TimeSlot
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    timezone = models.CharField(max_length=50, default="Europe/Moscow")
    
    # Money (deposit)
    deposit_amount = models.DecimalField(max_digits=10, decimal_places=2)
    deposit_currency = models.CharField(max_length=3, default="RUB")
    
    # Status
    status = models.CharField(max_length=20, db_index=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    confirmed_at = models.DateTimeField(null=True, blank=True)
    cancelled_at = models.DateTimeField(null=True, blank=True)
    cancellation_reason = models.TextField(null=True, blank=True)
    
    class Meta:
        db_table = "bookings"
        indexes = [
            models.Index(fields=["client_id", "status"]),
            models.Index(fields=["service_id", "start_time"]),
        ]
```

### Repository Implementation

```python
# infrastructure/persistence/repositories/booking_repository.py
from typing import Optional, List
from uuid import UUID
from datetime import datetime
from decimal import Decimal

from domain.booking.entities import Booking
from domain.booking.repositories import IBookingRepository
from domain.booking.value_objects import TimeSlot, Money, BookingStatus
from infrastructure.persistence.django_models import BookingModel

class DjangoBookingRepository(IBookingRepository):
    """Django ORM реализация IBookingRepository."""
    
    def save(self, booking: Booking) -> None:
        BookingModel.objects.update_or_create(
            id=booking.id,
            defaults={
                "client_id": booking.client_id,
                "service_id": booking.service_id,
                "start_time": booking.time_slot.start,
                "end_time": booking.time_slot.end,
                "timezone": booking.time_slot.timezone,
                "deposit_amount": booking.deposit.amount,
                "deposit_currency": booking.deposit.currency,
                "status": booking.status.value,
                "confirmed_at": booking.confirmed_at,
                "cancelled_at": booking.cancelled_at,
                "cancellation_reason": booking.cancellation_reason,
            }
        )
    
    def get_by_id(self, id: UUID) -> Optional[Booking]:
        try:
            model = BookingModel.objects.get(id=id)
            return self._to_entity(model)
        except BookingModel.DoesNotExist:
            return None
    
    def delete(self, booking: Booking) -> None:
        BookingModel.objects.filter(id=booking.id).delete()
    
    def find_by_client(self, client_id: UUID) -> List[Booking]:
        models = BookingModel.objects.filter(client_id=client_id)
        return [self._to_entity(m) for m in models]
    
    def find_by_status(self, status: BookingStatus) -> List[Booking]:
        models = BookingModel.objects.filter(status=status.value)
        return [self._to_entity(m) for m in models]
    
    def find_by_date_range(
        self, 
        start: datetime, 
        end: datetime
    ) -> List[Booking]:
        models = BookingModel.objects.filter(
            start_time__gte=start,
            start_time__lt=end
        )
        return [self._to_entity(m) for m in models]
    
    def find_conflicts(
        self,
        service_id: UUID,
        start: datetime,
        end: datetime,
        exclude_id: UUID | None = None
    ) -> List[Booking]:
        queryset = BookingModel.objects.filter(
            service_id=service_id,
            status__in=[BookingStatus.PENDING.value, BookingStatus.CONFIRMED.value],
            start_time__lt=end,
            end_time__gt=start
        )
        
        if exclude_id:
            queryset = queryset.exclude(id=exclude_id)
        
        return [self._to_entity(m) for m in queryset]
    
    def _to_entity(self, model: BookingModel) -> Booking:
        """Маппинг Django модели в доменную сущность."""
        booking = Booking(
            id=model.id,
            client_id=model.client_id,
            service_id=model.service_id,
            time_slot=TimeSlot(
                start=model.start_time,
                end=model.end_time,
                timezone=model.timezone
            ),
            deposit=Money(
                amount=Decimal(str(model.deposit_amount)),
                currency=model.deposit_currency
            ),
            status=BookingStatus(model.status),
            created_at=model.created_at,
            updated_at=model.updated_at,
            confirmed_at=model.confirmed_at,
            cancelled_at=model.cancelled_at,
            cancellation_reason=model.cancellation_reason
        )
        return booking
```

### Domain Event Bus

```python
# infrastructure/events/event_bus.py
from abc import ABC, abstractmethod
from typing import Dict, List, Callable, Type
import logging

from domain.shared.domain_event_base import DomainEvent

logger = logging.getLogger(__name__)

class IDomainEventBus(ABC):
    """Интерфейс шины доменных событий."""
    
    @abstractmethod
    def publish(self, event: DomainEvent) -> None:
        pass
    
    @abstractmethod
    def subscribe(
        self, 
        event_type: Type[DomainEvent], 
        handler: Callable[[DomainEvent], None]
    ) -> None:
        pass

class InMemoryDomainEventBus(IDomainEventBus):
    """In-memory реализация шины событий."""
    
    def __init__(self):
        self._handlers: Dict[str, List[Callable]] = {}
    
    def publish(self, event: DomainEvent) -> None:
        event_type = event.event_type
        handlers = self._handlers.get(event_type, [])
        
        logger.info(f"Publishing event: {event_type}", extra={
            "event_id": str(event.event_id),
            "event_type": event_type
        })
        
        for handler in handlers:
            try:
                handler(event)
            except Exception as e:
                logger.error(
                    f"Error handling event {event_type}: {e}",
                    exc_info=True
                )
    
    def subscribe(
        self, 
        event_type: Type[DomainEvent], 
        handler: Callable[[DomainEvent], None]
    ) -> None:
        type_name = event_type.__name__
        if type_name not in self._handlers:
            self._handlers[type_name] = []
        self._handlers[type_name].append(handler)
```

---

## Presentation Layer Patterns

### DRF ViewSet

```python
# presentation/api/v1/views/booking_views.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from drf_spectacular.utils import extend_schema

from application.booking.use_cases import (
    CreateBookingUseCase,
    CreateBookingRequest
)
from application.booking.queries import GetClientBookingsQuery
from presentation.api.v1.serializers.booking_serializers import (
    CreateBookingRequestSerializer,
    BookingResponseSerializer,
    BookingListSerializer
)
from infrastructure.persistence.repositories.booking_repository import (
    DjangoBookingRepository
)
from infrastructure.events.event_bus import InMemoryDomainEventBus
from shared.exceptions import BookingSlotUnavailableError

class BookingViewSet(viewsets.ViewSet):
    """
    API для бронирований.
    
    Endpoints:
    - POST /api/v1/bookings/ — создать бронирование
    - GET /api/v1/bookings/ — список бронирований клиента
    - GET /api/v1/bookings/{id}/ — детали бронирования
    - POST /api/v1/bookings/{id}/cancel/ — отменить бронирование
    """
    permission_classes = [IsAuthenticated]
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # Dependency Injection (в продакшне через DI container)
        self._booking_repository = DjangoBookingRepository()
        self._event_bus = InMemoryDomainEventBus()
    
    @extend_schema(
        request=CreateBookingRequestSerializer,
        responses={201: BookingResponseSerializer}
    )
    def create(self, request):
        """POST /api/v1/bookings/ — создать бронирование."""
        serializer = CreateBookingRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        use_case = CreateBookingUseCase(
            booking_repository=self._booking_repository,
            event_bus=self._event_bus
        )
        
        try:
            result = use_case.execute(CreateBookingRequest(
                client_id=request.user.id,
                **serializer.validated_data
            ))
        except BookingSlotUnavailableError as e:
            return Response(
                {"error": str(e), "code": "slot_unavailable"},
                status=status.HTTP_409_CONFLICT
            )
        
        return Response(
            BookingResponseSerializer(result).data,
            status=status.HTTP_201_CREATED
        )
    
    @extend_schema(responses={200: BookingListSerializer(many=True)})
    def list(self, request):
        """GET /api/v1/bookings/ — список бронирований клиента."""
        query = GetClientBookingsQuery(self._booking_repository)
        bookings = query.execute(client_id=request.user.id)
        
        return Response(
            BookingListSerializer(bookings, many=True).data
        )
```

### DRF Serializers

```python
# presentation/api/v1/serializers/booking_serializers.py
from rest_framework import serializers

class CreateBookingRequestSerializer(serializers.Serializer):
    """Сериализатор запроса на создание бронирования."""
    service_id = serializers.UUIDField()
    start_time = serializers.DateTimeField()
    end_time = serializers.DateTimeField()
    deposit_amount = serializers.DecimalField(max_digits=10, decimal_places=2)
    
    def validate(self, data):
        if data["end_time"] <= data["start_time"]:
            raise serializers.ValidationError(
                "Время окончания должно быть позже времени начала"
            )
        return data

class BookingResponseSerializer(serializers.Serializer):
    """Сериализатор ответа на создание бронирования."""
    booking_id = serializers.UUIDField()
    status = serializers.CharField()
    time_slot_start = serializers.DateTimeField()
    time_slot_end = serializers.DateTimeField()

class BookingListSerializer(serializers.Serializer):
    """Сериализатор для списка бронирований."""
    id = serializers.UUIDField()
    service_name = serializers.CharField()
    start_time = serializers.DateTimeField()
    end_time = serializers.DateTimeField()
    status = serializers.CharField()
    can_cancel = serializers.BooleanField()
```

---

## Testing Patterns

### Domain Layer Tests

```python
# tests/domain/test_booking.py
import pytest
from datetime import datetime, timedelta
from decimal import Decimal
from uuid import uuid4

from domain.booking.entities import Booking
from domain.booking.value_objects import TimeSlot, Money, BookingStatus

class TestBooking:
    def test_create_booking(self):
        """Тест создания бронирования."""
        client_id = uuid4()
        service_id = uuid4()
        time_slot = TimeSlot(
            start=datetime.utcnow() + timedelta(days=1),
            end=datetime.utcnow() + timedelta(days=1, hours=1)
        )
        deposit = Money(amount=Decimal("1000"), currency="RUB")
        
        booking = Booking.create(
            client_id=client_id,
            service_id=service_id,
            time_slot=time_slot,
            deposit=deposit
        )
        
        assert booking.status == BookingStatus.PENDING
        assert len(booking.get_events()) == 1
        assert booking.get_events()[0].event_type == "BookingCreated"
    
    def test_confirm_booking(self):
        """Тест подтверждения бронирования."""
        booking = self._create_booking()
        payment_id = uuid4()
        
        booking.confirm(payment_id)
        
        assert booking.status == BookingStatus.CONFIRMED
        assert booking.confirmed_at is not None
    
    def test_cannot_confirm_cancelled_booking(self):
        """Нельзя подтвердить отменённое бронирование."""
        booking = self._create_booking()
        booking.cancel()
        
        with pytest.raises(ValueError):
            booking.confirm(uuid4())
    
    def _create_booking(self) -> Booking:
        return Booking.create(
            client_id=uuid4(),
            service_id=uuid4(),
            time_slot=TimeSlot(
                start=datetime.utcnow() + timedelta(days=1),
                end=datetime.utcnow() + timedelta(days=1, hours=1)
            ),
            deposit=Money(amount=Decimal("1000"))
        )
```

### Use Case Tests

```python
# tests/application/test_create_booking.py
import pytest
from unittest.mock import Mock, MagicMock
from uuid import uuid4
from datetime import datetime, timedelta

from application.booking.use_cases import (
    CreateBookingUseCase,
    CreateBookingRequest
)
from shared.exceptions import BookingSlotUnavailableError

class TestCreateBookingUseCase:
    def test_creates_booking_successfully(self):
        """Тест успешного создания бронирования."""
        # Arrange
        repository = Mock()
        repository.find_conflicts.return_value = []
        
        event_bus = Mock()
        
        use_case = CreateBookingUseCase(
            booking_repository=repository,
            event_bus=event_bus
        )
        
        request = CreateBookingRequest(
            client_id=uuid4(),
            service_id=uuid4(),
            start_time=(datetime.utcnow() + timedelta(days=1)).isoformat(),
            end_time=(datetime.utcnow() + timedelta(days=1, hours=1)).isoformat(),
            deposit_amount="1000"
        )
        
        # Act
        result = use_case.execute(request)
        
        # Assert
        assert result.status == "pending"
        repository.save.assert_called_once()
        event_bus.publish.assert_called()
    
    def test_raises_error_when_slot_unavailable(self):
        """Тест ошибки при занятом слоте."""
        repository = Mock()
        repository.find_conflicts.return_value = [Mock()]  # Has conflict
        
        use_case = CreateBookingUseCase(
            booking_repository=repository,
            event_bus=Mock()
        )
        
        request = CreateBookingRequest(
            client_id=uuid4(),
            service_id=uuid4(),
            start_time=(datetime.utcnow() + timedelta(days=1)).isoformat(),
            end_time=(datetime.utcnow() + timedelta(days=1, hours=1)).isoformat(),
            deposit_amount="1000"
        )
        
        with pytest.raises(BookingSlotUnavailableError):
            use_case.execute(request)
```

---

## Best Practices Summary

### Domain Layer
- ✅ Чистый Python, никаких импортов Django
- ✅ Бизнес-логика только в Entity и Domain Services
- ✅ Инварианты проверяются в Entity
- ✅ Domain Events для интеграций

### Application Layer
- ✅ Use Cases — единая точка входа для бизнес-операций
- ✅ DTOs для input/output (не domain entities)
- ✅ Оркестрация: валидация → домен → persistence → events

### Infrastructure Layer
- ✅ Repository implementations знают о Django
- ✅ Маппинг Model ↔ Entity в репозитории
- ✅ External services за абстракциями

### Presentation Layer
- ✅ Serializers для validation и transformation
- ✅ ViewSets вызывают Use Cases
- ✅ Никакой бизнес-логики в views
