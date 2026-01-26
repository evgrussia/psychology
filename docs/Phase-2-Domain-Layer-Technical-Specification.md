# Phase 2: Domain Layer Implementation — Техническая спецификация

**Версия:** v1.0  
**Дата:** 2026-01-26  
**Статус:** Готово к реализации  
**Основано на:** `docs/Development-Phase-Plan.md`, `docs/Domain-Model-Specification.md`, `docs/Модель-данных.md`, `docs/Technical-Decisions.md`

---

## 1) Обзор Phase 2

### 1.1 Цель
Реализовать доменную модель согласно принципам DDD (Domain-Driven Design) и Clean Architecture:
- Aggregate Roots и Entities
- Value Objects
- Domain Services
- Domain Events
- Repository Interfaces

### 1.2 Принципы реализации

✅ **Domain Layer — чистый Python** (без зависимостей от Django/фреймворков)  
✅ **Бизнес-правила в доменных сущностях** (Rich Domain Model)  
✅ **Неизменяемые Value Objects** (immutability)  
✅ **Aggregate boundaries** — одна транзакция = один агрегат  
✅ **Domain Events** для асинхронной коммуникации между контекстами  
✅ **Repository Interfaces** в Domain Layer (реализация в Infrastructure)

### 1.3 Структура проекта

```
backend/
├── domain/                          # Domain Layer (Phase 2)
│   ├── shared/                      # Shared Kernel
│   │   ├── __init__.py
│   │   ├── entity_id.py            # Базовый класс для ID
│   │   ├── domain_event.py          # Базовый класс для событий
│   │   ├── value_object.py          # Базовый класс для VO
│   │   ├── aggregate_root.py        # Базовый класс для Aggregate Root
│   │   └── exceptions.py            # Domain exceptions
│   │
│   ├── identity/                    # Identity & Access Context
│   │   ├── __init__.py
│   │   ├── aggregates/
│   │   │   └── user.py
│   │   ├── entities/
│   │   │   └── consent.py
│   │   ├── value_objects/
│   │   │   ├── email.py
│   │   │   ├── phone_number.py
│   │   │   ├── role.py
│   │   │   ├── user_status.py
│   │   │   └── consent_type.py
│   │   ├── domain_events.py
│   │   ├── domain_services.py
│   │   └── repositories.py          # Interfaces only
│   │
│   ├── booking/                     # Booking Context (CORE)
│   │   ├── __init__.py
│   │   ├── aggregates/
│   │   │   ├── appointment.py
│   │   │   ├── service.py
│   │   │   └── waitlist_request.py
│   │   ├── entities/
│   │   │   ├── payment.py
│   │   │   ├── intake_form.py
│   │   │   └── outcome_record.py
│   │   ├── value_objects/
│   │   │   ├── time_slot.py
│   │   │   ├── money.py
│   │   │   ├── currency.py
│   │   │   ├── appointment_status.py
│   │   │   ├── appointment_format.py
│   │   │   ├── booking_metadata.py
│   │   │   ├── timezone.py
│   │   │   └── cancellation_reason.py
│   │   ├── domain_events.py
│   │   ├── domain_services.py
│   │   └── repositories.py
│   │
│   ├── payments/                   # Payments Context
│   │   ├── __init__.py
│   │   ├── aggregates/
│   │   │   └── payment.py
│   │   ├── value_objects/
│   │   │   ├── payment_status.py
│   │   │   └── payment_provider.py
│   │   ├── domain_events.py
│   │   └── repositories.py
│   │
│   ├── interactive/                 # Interactive Context (CORE)
│   │   ├── __init__.py
│   │   ├── aggregates/
│   │   │   └── interactive_run.py
│   │   ├── value_objects/
│   │   │   ├── interactive_result.py
│   │   │   ├── result_level.py
│   │   │   ├── run_status.py
│   │   │   └── run_metadata.py
│   │   ├── domain_events.py
│   │   └── repositories.py
│   │
│   ├── content/                     # Content Context
│   │   ├── __init__.py
│   │   ├── aggregates/
│   │   │   └── content_item.py
│   │   ├── value_objects/
│   │   │   ├── content_type.py
│   │   │   ├── content_status.py
│   │   │   ├── topic_code.py
│   │   │   └── time_to_benefit.py
│   │   ├── domain_events.py
│   │   └── repositories.py
│   │
│   ├── client_cabinet/              # Client Cabinet Context
│   │   ├── __init__.py
│   │   ├── aggregates/
│   │   │   └── diary_entry.py
│   │   ├── value_objects/
│   │   │   ├── diary_type.py
│   │   │   └── export_type.py
│   │   ├── domain_events.py
│   │   └── repositories.py
│   │
│   ├── ugc_moderation/              # UGC Moderation Context
│   │   ├── __init__.py
│   │   ├── aggregates/
│   │   │   └── moderation_item.py
│   │   ├── entities/
│   │   │   ├── moderation_action.py
│   │   │   └── answer.py
│   │   ├── value_objects/
│   │   │   ├── moderation_status.py
│   │   │   ├── moderation_decision.py
│   │   │   ├── trigger_flag.py
│   │   │   ├── rejection_reason.py
│   │   │   └── ugc_content_type.py
│   │   ├── domain_events.py
│   │   └── repositories.py
│   │
│   ├── telegram/                    # Telegram Integration Context
│   │   ├── __init__.py
│   │   ├── aggregates/
│   │   │   └── deep_link.py
│   │   ├── value_objects/
│   │   │   ├── deep_link_flow.py
│   │   │   └── telegram_user.py
│   │   ├── domain_events.py
│   │   └── repositories.py
│   │
│   └── analytics/                   # Analytics Context
│       ├── __init__.py
│       ├── aggregates/
│       │   └── lead.py
│       ├── value_objects/
│       │   ├── lead_status.py
│       │   ├── lead_source.py
│       │   ├── lead_identity.py
│       │   ├── timeline_event.py
│       │   └── utm_params.py
│       ├── domain_events.py
│       └── repositories.py
│
└── tests/
    └── domain/                      # Unit tests для Domain Layer
        ├── shared/
        ├── identity/
        ├── booking/
        ├── payments/
        ├── interactive/
        ├── content/
        ├── client_cabinet/
        ├── ugc_moderation/
        ├── telegram/
        └── analytics/
```

---

## 2) Shared Kernel (базовые классы)

### 2.1 EntityId (базовый класс для идентификаторов)

**Файл:** `domain/shared/entity_id.py`

```python
from abc import ABC
from typing import Any
from uuid import UUID, uuid4


class EntityId(ABC):
    """Базовый класс для идентификаторов сущностей."""
    
    def __init__(self, value: str | UUID):
        """
        Args:
            value: UUID в виде строки или UUID объекта
        """
        if isinstance(value, UUID):
            self._value = str(value)
        elif isinstance(value, str):
            # Валидация UUID формата
            try:
                UUID(value)
                self._value = value
            except ValueError:
                raise ValueError(f"Invalid UUID format: {value}")
        else:
            raise TypeError(f"EntityId value must be str or UUID, got {type(value)}")
    
    @classmethod
    def generate(cls) -> "EntityId":
        """Генерирует новый UUID."""
        return cls(str(uuid4()))
    
    @property
    def value(self) -> str:
        """Возвращает значение ID как строку."""
        return self._value
    
    def __eq__(self, other: Any) -> bool:
        if not isinstance(other, EntityId):
            return False
        return self._value == other._value
    
    def __hash__(self) -> int:
        return hash(self._value)
    
    def __str__(self) -> str:
        return self._value
    
    def __repr__(self) -> str:
        return f"{self.__class__.__name__}({self._value})"
```

**Примеры использования:**
```python
# Конкретные ID для каждого домена
class UserId(EntityId):
    pass

class AppointmentId(EntityId):
    pass

class PaymentId(EntityId):
    pass
```

### 2.2 DomainEvent (базовый класс для событий)

**Файл:** `domain/shared/domain_event.py`

```python
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from datetime import datetime
from uuid import uuid4


@dataclass(frozen=True)
class DomainEvent(ABC):
    """Базовый класс для доменных событий.
    
    Все события неизменяемые (immutable) и содержат минимум данных.
    """
    
    event_id: str = field(default_factory=lambda: str(uuid4()))
    occurred_at: datetime = field(default_factory=datetime.utcnow)
    
    @property
    @abstractmethod
    def aggregate_id(self) -> str:
        """ID агрегата, который породил событие."""
        pass
    
    @property
    @abstractmethod
    def event_name(self) -> str:
        """Имя события (для логирования/маршрутизации)."""
        pass
    
    def __repr__(self) -> str:
        return f"{self.__class__.__name__}(aggregate_id={self.aggregate_id}, occurred_at={self.occurred_at})"
```

### 2.3 ValueObject (базовый класс для Value Objects)

**Файл:** `domain/shared/value_object.py`

```python
from abc import ABC
from typing import Any


class ValueObject(ABC):
    """Базовый класс для Value Objects.
    
    Value Objects:
    - Неизменяемые (immutable)
    - Определяются значениями атрибутов
    - Сравниваются по значениям, а не по ID
    """
    
    def __eq__(self, other: Any) -> bool:
        if not isinstance(other, self.__class__):
            return False
        return self.__dict__ == other.__dict__
    
    def __hash__(self) -> int:
        return hash(tuple(sorted(self.__dict__.items())))
    
    def __repr__(self) -> str:
        attrs = ", ".join(f"{k}={v!r}" for k, v in self.__dict__.items())
        return f"{self.__class__.__name__}({attrs})"
```

### 2.4 AggregateRoot (базовый класс для Aggregate Roots)

**Файл:** `domain/shared/aggregate_root.py`

```python
from abc import ABC
from typing import List
from domain.shared.domain_event import DomainEvent


class AggregateRoot(ABC):
    """Базовый класс для Aggregate Roots.
    
    Aggregate Root:
    - Единственная точка входа для изменений агрегата
    - Управляет Domain Events
    - Обеспечивает инкапсуляцию бизнес-правил
    """
    
    def __init__(self):
        self._domain_events: List[DomainEvent] = []
    
    def get_domain_events(self) -> List[DomainEvent]:
        """Возвращает список накопленных Domain Events."""
        return list(self._domain_events)
    
    def clear_domain_events(self) -> None:
        """Очищает список Domain Events (после публикации)."""
        self._domain_events.clear()
    
    def add_domain_event(self, event: DomainEvent) -> None:
        """Добавляет Domain Event."""
        if not isinstance(event, DomainEvent):
            raise TypeError(f"Event must be DomainEvent, got {type(event)}")
        self._domain_events.append(event)
    
    def has_domain_events(self) -> bool:
        """Проверяет наличие Domain Events."""
        return len(self._domain_events) > 0
```

### 2.5 Domain Exceptions

**Файл:** `domain/shared/exceptions.py`

```python
class DomainError(Exception):
    """Базовое исключение для доменных ошибок."""
    pass


class ConflictError(DomainError):
    """Ошибка конфликта (например, слот уже занят)."""
    pass


class BusinessRuleViolationError(DomainError):
    """Нарушение бизнес-правила."""
    pass


class InvalidStateError(DomainError):
    """Некорректное состояние агрегата для операции."""
    pass
```

---

## 3) Identity & Access Context (Приоритет 1)

### 3.1 Aggregate: User

**Файл:** `domain/identity/aggregates/user.py`

```python
from datetime import datetime
from typing import List, Optional
from domain.shared.aggregate_root import AggregateRoot
from domain.shared.entity_id import EntityId
from domain.identity.entities.consent import Consent
from domain.identity.value_objects.email import Email
from domain.identity.value_objects.phone_number import PhoneNumber
from domain.identity.value_objects.role import Role
from domain.identity.value_objects.user_status import UserStatus
from domain.identity.value_objects.consent_type import ConsentType
from domain.identity.domain_events import (
    UserCreatedEvent,
    ConsentGrantedEvent,
    ConsentRevokedEvent,
    RoleAssignedEvent,
    UserBlockedEvent
)


class UserId(EntityId):
    """ID пользователя."""
    pass


class User(AggregateRoot):
    """Aggregate Root для пользователя.
    
    Бизнес-правила:
    - Пользователь должен иметь хотя бы один способ связи (email/phone/telegram)
    - Согласия должны быть уникальными по типу (нельзя иметь два активных согласия одного типа)
    - Роли назначаются явно (по умолчанию - Client)
    - Блокировка пользователя меняет статус на Blocked
    """
    
    def __init__(
        self,
        id: UserId,
        email: Optional[Email],
        phone: Optional[PhoneNumber],
        telegram_user_id: Optional[str],
        display_name: Optional[str],
        status: UserStatus,
        roles: List[Role],
        consents: List[Consent],
        created_at: datetime
    ):
        super().__init__()
        self._id = id
        self._email = email
        self._phone = phone
        self._telegram_user_id = telegram_user_id
        self._display_name = display_name
        self._status = status
        self._roles = roles
        self._consents = consents
        self._created_at = created_at
    
    @classmethod
    def create(
        cls,
        email: Optional[Email] = None,
        phone: Optional[PhoneNumber] = None,
        telegram_user_id: Optional[str] = None
    ) -> "User":
        """Factory method для создания нового пользователя.
        
        Args:
            email: Email пользователя (опционально)
            phone: Телефон пользователя (опционально)
            telegram_user_id: Telegram user ID (опционально)
        
        Returns:
            Новый экземпляр User
        
        Raises:
            DomainError: Если не указан ни один способ связи
        """
        if not email and not phone and not telegram_user_id:
            raise DomainError("At least one contact method is required")
        
        user = cls(
            id=UserId.generate(),
            email=email,
            phone=phone,
            telegram_user_id=telegram_user_id,
            display_name=None,
            status=UserStatus.ACTIVE,
            roles=[Role.CLIENT],  # По умолчанию роль Client
            consents=[],
            created_at=datetime.utcnow()
        )
        
        user.add_domain_event(
            UserCreatedEvent(
                user_id=user._id,
                email=email,
                phone=phone,
                telegram_user_id=telegram_user_id
            )
        )
        
        return user
    
    def grant_consent(
        self,
        consent_type: ConsentType,
        version: str,
        source: str
    ) -> None:
        """Выдает согласие пользователя.
        
        Args:
            consent_type: Тип согласия
            version: Версия политики согласия
            source: Источник согласия (web/telegram/admin)
        
        Raises:
            DomainError: Если согласие такого типа уже выдано
        """
        # Проверяем, нет ли уже активного согласия
        existing_consent = next(
            (c for c in self._consents 
             if c.consent_type == consent_type and c.is_active()),
            None
        )
        
        if existing_consent:
            raise DomainError(
                f"Consent of type {consent_type.value} already granted"
            )
        
        consent = Consent.create(consent_type, version, source)
        self._consents.append(consent)
        
        self.add_domain_event(
            ConsentGrantedEvent(
                user_id=self._id,
                consent_type=consent_type,
                version=version
            )
        )
    
    def revoke_consent(self, consent_type: ConsentType) -> None:
        """Отзывает согласие пользователя.
        
        Args:
            consent_type: Тип согласия для отзыва
        
        Raises:
            DomainError: Если активное согласие не найдено
        """
        consent = next(
            (c for c in self._consents 
             if c.consent_type == consent_type and c.is_active()),
            None
        )
        
        if not consent:
            raise DomainError(
                f"Active consent of type {consent_type.value} not found"
            )
        
        consent.revoke()
        
        self.add_domain_event(
            ConsentRevokedEvent(
                user_id=self._id,
                consent_type=consent_type
            )
        )
    
    def assign_role(self, role: Role) -> None:
        """Назначает роль пользователю.
        
        Args:
            role: Роль для назначения
        
        Raises:
            DomainError: Если роль уже назначена
        """
        if role in self._roles:
            raise DomainError(f"Role {role.code} already assigned")
        
        self._roles.append(role)
        
        self.add_domain_event(
            RoleAssignedEvent(
                user_id=self._id,
                role=role
            )
        )
    
    def block(self, reason: str) -> None:
        """Блокирует пользователя.
        
        Args:
            reason: Причина блокировки
        
        Raises:
            DomainError: Если пользователь уже не активен
        """
        if not self._status.is_active():
            raise DomainError("User is not active")
        
        self._status = UserStatus.BLOCKED
        
        self.add_domain_event(
            UserBlockedEvent(
                user_id=self._id,
                reason=reason
            )
        )
    
    def has_active_consent(self, consent_type: ConsentType) -> bool:
        """Проверяет наличие активного согласия.
        
        Args:
            consent_type: Тип согласия
        
        Returns:
            True если согласие активно, иначе False
        """
        return any(
            c.consent_type == consent_type and c.is_active()
            for c in self._consents
        )
    
    def has_role(self, role: Role) -> bool:
        """Проверяет наличие роли.
        
        Args:
            role: Роль для проверки
        
        Returns:
            True если роль назначена, иначе False
        """
        return role in self._roles
    
    # Getters
    @property
    def id(self) -> UserId:
        return self._id
    
    @property
    def email(self) -> Optional[Email]:
        return self._email
    
    @property
    def phone(self) -> Optional[PhoneNumber]:
        return self._phone
    
    @property
    def telegram_user_id(self) -> Optional[str]:
        return self._telegram_user_id
    
    @property
    def status(self) -> UserStatus:
        return self._status
    
    @property
    def roles(self) -> List[Role]:
        return list(self._roles)
    
    @property
    def consents(self) -> List[Consent]:
        return list(self._consents)
```

### 3.2 Entity: Consent

**Файл:** `domain/identity/entities/consent.py`

```python
from datetime import datetime
from typing import Optional
from domain.shared.entity_id import EntityId
from domain.identity.value_objects.consent_type import ConsentType


class ConsentId(EntityId):
    """ID согласия."""
    pass


class Consent:
    """Entity: Согласие пользователя.
    
    Бизнес-правила:
    - Согласие может быть отозвано (revoked_at устанавливается)
    - Согласие активно, если revoked_at == None
    """
    
    def __init__(
        self,
        id: ConsentId,
        consent_type: ConsentType,
        version: str,
        source: str,
        granted_at: datetime,
        revoked_at: Optional[datetime]
    ):
        self._id = id
        self._consent_type = consent_type
        self._version = version
        self._source = source
        self._granted_at = granted_at
        self._revoked_at = revoked_at
    
    @classmethod
    def create(
        cls,
        consent_type: ConsentType,
        version: str,
        source: str
    ) -> "Consent":
        """Factory method для создания согласия."""
        return cls(
            id=ConsentId.generate(),
            consent_type=consent_type,
            version=version,
            source=source,
            granted_at=datetime.utcnow(),
            revoked_at=None
        )
    
    def revoke(self) -> None:
        """Отзывает согласие.
        
        Raises:
            DomainError: Если согласие уже отозвано
        """
        if self._revoked_at:
            raise DomainError("Consent is already revoked")
        
        self._revoked_at = datetime.utcnow()
    
    def is_active(self) -> bool:
        """Проверяет, активно ли согласие."""
        return self._revoked_at is None
    
    # Getters
    @property
    def id(self) -> ConsentId:
        return self._id
    
    @property
    def consent_type(self) -> ConsentType:
        return self._consent_type
    
    @property
    def version(self) -> str:
        return self._version
    
    @property
    def granted_at(self) -> datetime:
        return self._granted_at
    
    @property
    def revoked_at(self) -> Optional[datetime]:
        return self._revoked_at
```

### 3.3 Value Objects

#### Email

**Файл:** `domain/identity/value_objects/email.py`

```python
import re
from domain.shared.value_object import ValueObject


class Email(ValueObject):
    """Value Object для email адреса.
    
    Бизнес-правила:
    - Email должен быть валидным форматом
    - Email нормализуется (lowercase, trim)
    """
    
    EMAIL_REGEX = re.compile(
        r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    )
    
    def __init__(self, value: str):
        if not self._is_valid(value):
            raise ValueError(f"Invalid email format: {value}")
        
        self._value = value.lower().strip()
    
    @classmethod
    def create(cls, email: str) -> "Email":
        """Создает Email Value Object."""
        return cls(email)
    
    @staticmethod
    def _is_valid(email: str) -> bool:
        """Проверяет валидность email."""
        if not email or not isinstance(email, str):
            return False
        return bool(Email.EMAIL_REGEX.match(email.strip()))
    
    @property
    def value(self) -> str:
        return self._value
    
    def __str__(self) -> str:
        return self._value
```

#### PhoneNumber

**Файл:** `domain/identity/value_objects/phone_number.py`

```python
import re
from domain.shared.value_object import ValueObject


class PhoneNumber(ValueObject):
    """Value Object для номера телефона.
    
    Бизнес-правила:
    - Телефон нормализуется (только цифры)
    - Длина: 10-15 цифр
    - Форматирование для отображения
    """
    
    def __init__(self, value: str):
        normalized = self._normalize(value)
        
        if not self._is_valid(normalized):
            raise ValueError(f"Invalid phone number: {value}")
        
        self._value = normalized
    
    @classmethod
    def create(cls, phone: str) -> "PhoneNumber":
        """Создает PhoneNumber Value Object."""
        return cls(phone)
    
    @staticmethod
    def _normalize(phone: str) -> str:
        """Нормализует телефон (только цифры)."""
        return re.sub(r'\D', '', phone)
    
    @staticmethod
    def _is_valid(normalized: str) -> bool:
        """Проверяет валидность телефона."""
        return 10 <= len(normalized) <= 15
    
    def format(self) -> str:
        """Форматирует телефон для отображения.
        
        Пример: +7 (XXX) XXX-XX-XX для российских номеров
        """
        if len(self._value) == 11 and self._value.startswith('7'):
            return f"+7 ({self._value[1:4]}) {self._value[4:7]}-{self._value[7:9]}-{self._value[9:]}"
        return self._value
    
    @property
    def value(self) -> str:
        return self._value
    
    def __str__(self) -> str:
        return self._value
```

#### Role

**Файл:** `domain/identity/value_objects/role.py`

```python
from domain.shared.value_object import ValueObject


class Role(ValueObject):
    """Value Object для роли пользователя.
    
    Роли:
    - OWNER: Владелец (психолог) - полный доступ
    - ASSISTANT: Ассистент - расписание/лиды/модерация
    - EDITOR: Редактор - контент/ресурсы
    - CLIENT: Клиент - базовый доступ
    """
    
    def __init__(self, code: str, scope: str):
        if code not in ['owner', 'assistant', 'editor', 'client']:
            raise ValueError(f"Invalid role code: {code}")
        if scope not in ['admin', 'product']:
            raise ValueError(f"Invalid role scope: {scope}")
        
        self._code = code
        self._scope = scope
    
    @property
    def code(self) -> str:
        return self._code
    
    @property
    def scope(self) -> str:
        return self._scope
    
    def is_admin(self) -> bool:
        """Проверяет, является ли роль административной."""
        return self._scope == 'admin'
    
    # Предопределенные роли
    OWNER = None
    ASSISTANT = None
    EDITOR = None
    CLIENT = None


# Инициализация предопределенных ролей
Role.OWNER = Role('owner', 'admin')
Role.ASSISTANT = Role('assistant', 'admin')
Role.EDITOR = Role('editor', 'admin')
Role.CLIENT = Role('client', 'product')
```

#### UserStatus

**Файл:** `domain/identity/value_objects/user_status.py`

```python
from domain.shared.value_object import ValueObject


class UserStatus(ValueObject):
    """Value Object для статуса пользователя."""
    
    def __init__(self, value: str):
        if value not in ['active', 'blocked', 'deleted']:
            raise ValueError(f"Invalid user status: {value}")
        self._value = value
    
    def is_active(self) -> bool:
        return self._value == 'active'
    
    @property
    def value(self) -> str:
        return self._value
    
    # Предопределенные статусы
    ACTIVE = None
    BLOCKED = None
    DELETED = None


UserStatus.ACTIVE = UserStatus('active')
UserStatus.BLOCKED = UserStatus('blocked')
UserStatus.DELETED = UserStatus('deleted')
```

#### ConsentType

**Файл:** `domain/identity/value_objects/consent_type.py`

```python
from domain.shared.value_object import ValueObject


class ConsentType(ValueObject):
    """Value Object для типа согласия."""
    
    def __init__(self, value: str):
        if value not in [
            'personal_data',
            'communications',
            'telegram',
            'review_publication'
        ]:
            raise ValueError(f"Invalid consent type: {value}")
        self._value = value
    
    @property
    def value(self) -> str:
        return self._value
    
    # Предопределенные типы
    PERSONAL_DATA = None
    COMMUNICATIONS = None
    TELEGRAM = None
    REVIEW_PUBLICATION = None


ConsentType.PERSONAL_DATA = ConsentType('personal_data')
ConsentType.COMMUNICATIONS = ConsentType('communications')
ConsentType.TELEGRAM = ConsentType('telegram')
ConsentType.REVIEW_PUBLICATION = ConsentType('review_publication')
```

### 3.4 Domain Events

**Файл:** `domain/identity/domain_events.py`

```python
from dataclasses import dataclass
from typing import Optional
from domain.shared.domain_event import DomainEvent
from domain.identity.aggregates.user import UserId
from domain.identity.value_objects.email import Email
from domain.identity.value_objects.phone_number import PhoneNumber
from domain.identity.value_objects.consent_type import ConsentType
from domain.identity.value_objects.role import Role


@dataclass(frozen=True)
class UserCreatedEvent(DomainEvent):
    """Событие создания пользователя."""
    user_id: UserId
    email: Optional[Email]
    phone: Optional[PhoneNumber]
    telegram_user_id: Optional[str]
    
    @property
    def aggregate_id(self) -> str:
        return self.user_id.value
    
    @property
    def event_name(self) -> str:
        return "UserCreated"


@dataclass(frozen=True)
class ConsentGrantedEvent(DomainEvent):
    """Событие выдачи согласия."""
    user_id: UserId
    consent_type: ConsentType
    version: str
    
    @property
    def aggregate_id(self) -> str:
        return self.user_id.value
    
    @property
    def event_name(self) -> str:
        return "ConsentGranted"


@dataclass(frozen=True)
class ConsentRevokedEvent(DomainEvent):
    """Событие отзыва согласия."""
    user_id: UserId
    consent_type: ConsentType
    
    @property
    def aggregate_id(self) -> str:
        return self.user_id.value
    
    @property
    def event_name(self) -> str:
        return "ConsentRevoked"


@dataclass(frozen=True)
class RoleAssignedEvent(DomainEvent):
    """Событие назначения роли."""
    user_id: UserId
    role: Role
    
    @property
    def aggregate_id(self) -> str:
        return self.user_id.value
    
    @property
    def event_name(self) -> str:
        return "RoleAssigned"


@dataclass(frozen=True)
class UserBlockedEvent(DomainEvent):
    """Событие блокировки пользователя."""
    user_id: UserId
    reason: str
    
    @property
    def aggregate_id(self) -> str:
        return self.user_id.value
    
    @property
    def event_name(self) -> str:
        return "UserBlocked"
```

### 3.5 Repository Interface

**Файл:** `domain/identity/repositories.py`

```python
from abc import ABC, abstractmethod
from typing import List, Optional
from domain.identity.aggregates.user import User, UserId
from domain.identity.value_objects.email import Email
from domain.identity.value_objects.phone_number import PhoneNumber


class IUserRepository(ABC):
    """Интерфейс репозитория пользователей.
    
    Важно: Это интерфейс в Domain Layer.
    Реализация будет в Infrastructure Layer.
    """
    
    @abstractmethod
    async def find_by_id(self, user_id: UserId) -> Optional[User]:
        """Находит пользователя по ID."""
        pass
    
    @abstractmethod
    async def find_by_email(self, email: Email) -> Optional[User]:
        """Находит пользователя по email."""
        pass
    
    @abstractmethod
    async def find_by_phone(self, phone: PhoneNumber) -> Optional[User]:
        """Находит пользователя по телефону."""
        pass
    
    @abstractmethod
    async def find_by_telegram_user_id(
        self,
        telegram_user_id: str
    ) -> Optional[User]:
        """Находит пользователя по Telegram user ID."""
        pass
    
    @abstractmethod
    async def save(self, user: User) -> None:
        """Сохраняет пользователя."""
        pass
    
    @abstractmethod
    async def delete(self, user_id: UserId) -> None:
        """Удаляет пользователя (soft delete)."""
        pass
```

---

## 4) Booking Context (Приоритет 2 — CORE)

### 4.1 Aggregate: Appointment

**Файл:** `domain/booking/aggregates/appointment.py`

```python
from datetime import datetime
from typing import Optional
from domain.shared.aggregate_root import AggregateRoot
from domain.shared.entity_id import EntityId
from domain.shared.exceptions import DomainError
from domain.identity.aggregates.user import UserId
from domain.booking.entities.payment import Payment
from domain.booking.entities.intake_form import IntakeForm
from domain.booking.entities.outcome_record import OutcomeRecord
from domain.booking.value_objects.time_slot import TimeSlot
from domain.booking.value_objects.appointment_status import AppointmentStatus
from domain.booking.value_objects.appointment_format import AppointmentFormat
from domain.booking.value_objects.booking_metadata import BookingMetadata
from domain.booking.value_objects.money import Money
from domain.booking.aggregates.service import Service
from domain.booking.domain_events import (
    AppointmentCreatedEvent,
    AppointmentConfirmedEvent,
    AppointmentCanceledEvent,
    AppointmentRescheduledEvent,
    AppointmentNoShowEvent
)


class AppointmentId(EntityId):
    """ID встречи."""
    pass


class ServiceId(EntityId):
    """ID услуги."""
    pass


class Appointment(AggregateRoot):
    """Aggregate Root для встречи.
    
    Бизнес-правила:
    - Нельзя создать встречу в прошлом
    - Услуга должна поддерживать выбранный формат
    - Оплата должна быть подтверждена перед подтверждением встречи
    - Отмена возможна только для confirmed/pending_payment статусов
    - Перенос возможен только для confirmed статуса и за N часов до начала
    - Результат можно записать только для confirmed/completed встреч и после времени начала
    """
    
    def __init__(
        self,
        id: AppointmentId,
        service_id: ServiceId,
        client_id: UserId,
        slot: TimeSlot,
        status: AppointmentStatus,
        format: AppointmentFormat,
        metadata: BookingMetadata,
        payment: Optional[Payment] = None,
        intake_form: Optional[IntakeForm] = None,
        outcome_record: Optional[OutcomeRecord] = None
    ):
        super().__init__()
        self._id = id
        self._service_id = service_id
        self._client_id = client_id
        self._slot = slot
        self._status = status
        self._format = format
        self._metadata = metadata
        self._payment = payment
        self._intake_form = intake_form
        self._outcome_record = outcome_record
    
    @classmethod
    def create(
        cls,
        service: Service,
        client_id: UserId,
        slot: TimeSlot,
        format: AppointmentFormat,
        metadata: BookingMetadata
    ) -> "Appointment":
        """Factory method для создания встречи.
        
        Args:
            service: Услуга
            client_id: ID клиента
            slot: Временной слот
            format: Формат встречи
            metadata: Метаданные бронирования
        
        Returns:
            Новый экземпляр Appointment со статусом PENDING_PAYMENT
        
        Raises:
            DomainError: Если слот в прошлом или услуга не поддерживает формат
        """
        # Бизнес-правила
        if slot.is_in_past():
            raise DomainError("Cannot book appointment in the past")
        
        if not service.is_available_for(format):
            raise DomainError(
                f"Service does not support {format.value} format"
            )
        
        appointment = cls(
            id=AppointmentId.generate(),
            service_id=service.id,
            client_id=client_id,
            slot=slot,
            status=AppointmentStatus.PENDING_PAYMENT,
            format=format,
            metadata=metadata
        )
        
        appointment.add_domain_event(
            AppointmentCreatedEvent(
                appointment_id=appointment._id,
                service_id=appointment._service_id,
                slot=slot,
                deep_link_id=metadata.deep_link_id
            )
        )
        
        return appointment
    
    def confirm_payment(
        self,
        payment: Payment,
        service: Service
    ) -> None:
        """Подтверждает оплату и меняет статус на CONFIRMED.
        
        Args:
            payment: Платеж
            service: Услуга (для проверки суммы)
        
        Raises:
            DomainError: Если статус не PENDING_PAYMENT или платеж не успешен
        """
        if not self._status.is_pending_payment():
            raise DomainError("Appointment is not waiting for payment")
        
        if not payment.is_succeeded():
            raise DomainError("Payment must be succeeded")
        
        if not payment.amount.equals(service.price):
            raise DomainError("Payment amount does not match service price")
        
        self._payment = payment
        self._status = AppointmentStatus.CONFIRMED
        
        self.add_domain_event(
            AppointmentConfirmedEvent(
                appointment_id=self._id,
                client_id=self._client_id,
                slot=self._slot,
                service_slug=service.slug,
                paid_amount=payment.amount
            )
        )
    
    def cancel(
        self,
        reason: str,
        service: Service
    ) -> Optional[Money]:
        """Отменяет встречу и возвращает сумму возврата.
        
        Args:
            reason: Причина отмены
            service: Услуга (для расчета возврата)
        
        Returns:
            Сумма возврата или None если возврат не предусмотрен
        
        Raises:
            DomainError: Если встреча не может быть отменена
        """
        if not self._can_be_canceled():
            raise DomainError("Appointment cannot be canceled")
        
        refund_amount = self._calculate_refund(service)
        self._status = AppointmentStatus.CANCELED
        
        self.add_domain_event(
            AppointmentCanceledEvent(
                appointment_id=self._id,
                reason=reason,
                refund_amount=refund_amount
            )
        )
        
        return refund_amount
    
    def reschedule(
        self,
        new_slot: TimeSlot,
        service: Service
    ) -> None:
        """Переносит встречу на новый слот.
        
        Args:
            new_slot: Новый временной слот
            service: Услуга (для проверки правил переноса)
        
        Raises:
            DomainError: Если встреча не может быть перенесена
        """
        if not self._can_be_rescheduled(service):
            raise DomainError("Appointment cannot be rescheduled")
        
        if new_slot.is_in_past():
            raise DomainError("Cannot reschedule to past time")
        
        old_slot = self._slot
        self._slot = new_slot
        self._status = AppointmentStatus.RESCHEDULED
        
        self.add_domain_event(
            AppointmentRescheduledEvent(
                appointment_id=self._id,
                old_slot=old_slot,
                new_slot=new_slot
            )
        )
    
    def record_outcome(
        self,
        outcome: "AppointmentOutcome"
    ) -> None:
        """Записывает результат встречи.
        
        Args:
            outcome: Результат встречи
        
        Raises:
            DomainError: Если результат нельзя записать
        """
        if not (self._status.is_confirmed() or self._status.is_completed()):
            raise DomainError(
                "Cannot record outcome for non-confirmed appointment"
            )
        
        if self._slot.is_in_future():
            raise DomainError("Cannot record outcome for future appointment")
        
        self._outcome_record = OutcomeRecord.create(outcome)
        self._status = AppointmentStatus.COMPLETED
        
        if outcome.is_no_show():
            self.add_domain_event(
                AppointmentNoShowEvent(
                    appointment_id=self._id,
                    client_id=self._client_id
                )
            )
    
    def attach_intake_form(self, form: IntakeForm) -> None:
        """Прикрепляет анкету к встрече.
        
        Args:
            form: Анкета
        
        Raises:
            DomainError: Если анкету нельзя прикрепить
        """
        if not (self._status.is_pending_payment() or 
                self._status.is_confirmed()):
            raise DomainError(
                "Cannot attach form to invalid appointment"
            )
        
        self._intake_form = form
    
    # Приватные методы для бизнес-правил
    def _can_be_canceled(self) -> bool:
        """Проверяет, можно ли отменить встречу."""
        return (self._status.is_confirmed() or 
                self._status.is_pending_payment())
    
    def _can_be_rescheduled(self, service: Service) -> bool:
        """Проверяет, можно ли перенести встречу."""
        if not self._status.is_confirmed():
            return False
        
        hours_until = self._slot.hours_until_start()
        return hours_until >= service.reschedule_min_hours
    
    def _calculate_refund(self, service: Service) -> Optional[Money]:
        """Рассчитывает сумму возврата.
        
        Правила:
        - Полный возврат если отмена за N часов до начала
        - Частичный возврат (50%) если отмена за M часов
        - Без возврата если отмена менее чем за M часов
        """
        if not self._payment:
            return None
        
        hours_until = self._slot.hours_until_start()
        
        if hours_until >= service.cancel_free_hours:
            # Полный возврат
            return self._payment.amount
        elif hours_until >= service.cancel_partial_hours:
            # Частичный возврат (50%)
            return self._payment.amount.multiply(0.5)
        else:
            # Без возврата
            return None
    
    # Getters
    @property
    def id(self) -> AppointmentId:
        return self._id
    
    @property
    def service_id(self) -> ServiceId:
        return self._service_id
    
    @property
    def client_id(self) -> UserId:
        return self._client_id
    
    @property
    def slot(self) -> TimeSlot:
        return self._slot
    
    @property
    def status(self) -> AppointmentStatus:
        return self._status
    
    @property
    def format(self) -> AppointmentFormat:
        return self._format
    
    @property
    def payment(self) -> Optional[Payment]:
        return self._payment
```

### 4.2 Value Objects для Booking

#### TimeSlot

**Файл:** `domain/booking/value_objects/time_slot.py`

```python
from datetime import datetime
from domain.shared.value_object import ValueObject
from domain.shared.exceptions import DomainError
from domain.booking.value_objects.timezone import Timezone


class TimeSlot(ValueObject):
    """Value Object для временного интервала.
    
    Бизнес-правила:
    - Конец должен быть после начала
    - Всегда хранится в UTC
    - Имеет таймзону для отображения
    """
    
    def __init__(
        self,
        start_at: datetime,
        end_at: datetime,
        timezone: Timezone
    ):
        if end_at <= start_at:
            raise DomainError("End time must be after start time")
        
        self._start_at = start_at
        self._end_at = end_at
        self._timezone = timezone
    
    def is_in_past(self) -> bool:
        """Проверяет, находится ли слот в прошлом."""
        return self._start_at < datetime.utcnow()
    
    def is_in_future(self) -> bool:
        """Проверяет, находится ли слот в будущем."""
        return self._start_at > datetime.utcnow()
    
    def hours_until_start(self) -> float:
        """Возвращает количество часов до начала."""
        now = datetime.utcnow()
        delta = self._start_at - now
        return delta.total_seconds() / 3600.0
    
    def overlaps(self, other: "TimeSlot") -> bool:
        """Проверяет пересечение с другим слотом."""
        return (self._start_at < other._end_at and 
                self._end_at > other._start_at)
    
    def duration_minutes(self) -> int:
        """Возвращает длительность в минутах."""
        delta = self._end_at - self._start_at
        return int(delta.total_seconds() / 60)
    
    @property
    def start_at(self) -> datetime:
        return self._start_at
    
    @property
    def end_at(self) -> datetime:
        return self._end_at
    
    @property
    def timezone(self) -> Timezone:
        return self._timezone
```

#### Money

**Файл:** `domain/booking/value_objects/money.py`

```python
from domain.shared.value_object import ValueObject
from domain.shared.exceptions import DomainError
from domain.booking.value_objects.currency import Currency


class Money(ValueObject):
    """Value Object для денежной суммы.
    
    Бизнес-правила:
    - Сумма не может быть отрицательной
    - Операции возможны только с одинаковой валютой
    """
    
    def __init__(self, amount: float, currency: Currency):
        if amount < 0:
            raise DomainError("Amount cannot be negative")
        
        self._amount = amount
        self._currency = currency
    
    def add(self, other: "Money") -> "Money":
        """Складывает две суммы."""
        self._ensure_same_currency(other)
        return Money(self._amount + other._amount, self._currency)
    
    def subtract(self, other: "Money") -> "Money":
        """Вычитает сумму."""
        self._ensure_same_currency(other)
        if self._amount < other._amount:
            raise DomainError("Result cannot be negative")
        return Money(self._amount - other._amount, self._currency)
    
    def multiply(self, factor: float) -> "Money":
        """Умножает сумму на коэффициент."""
        if factor < 0:
            raise DomainError("Factor cannot be negative")
        return Money(self._amount * factor, self._currency)
    
    def equals(self, other: "Money") -> bool:
        """Проверяет равенство сумм."""
        return (self._amount == other._amount and 
                self._currency == other._currency)
    
    def _ensure_same_currency(self, other: "Money") -> None:
        """Проверяет, что валюты совпадают."""
        if not self._currency.equals(other._currency):
            raise DomainError("Cannot operate on different currencies")
    
    @property
    def amount(self) -> float:
        return self._amount
    
    @property
    def currency(self) -> Currency:
        return self._currency
```

#### AppointmentStatus

**Файл:** `domain/booking/value_objects/appointment_status.py`

```python
from domain.shared.value_object import ValueObject


class AppointmentStatus(ValueObject):
    """Value Object для статуса встречи."""
    
    def __init__(self, value: str):
        valid_statuses = [
            'pending_payment',
            'confirmed',
            'canceled',
            'rescheduled',
            'completed',
            'no_show'
        ]
        if value not in valid_statuses:
            raise ValueError(f"Invalid appointment status: {value}")
        self._value = value
    
    def is_pending_payment(self) -> bool:
        return self._value == 'pending_payment'
    
    def is_confirmed(self) -> bool:
        return self._value == 'confirmed'
    
    def is_completed(self) -> bool:
        return self._value == 'completed'
    
    @property
    def value(self) -> str:
        return self._value
    
    # Предопределенные статусы
    PENDING_PAYMENT = None
    CONFIRMED = None
    CANCELED = None
    RESCHEDULED = None
    COMPLETED = None
    NO_SHOW = None


AppointmentStatus.PENDING_PAYMENT = AppointmentStatus('pending_payment')
AppointmentStatus.CONFIRMED = AppointmentStatus('confirmed')
AppointmentStatus.CANCELED = AppointmentStatus('canceled')
AppointmentStatus.RESCHEDULED = AppointmentStatus('rescheduled')
AppointmentStatus.COMPLETED = AppointmentStatus('completed')
AppointmentStatus.NO_SHOW = AppointmentStatus('no_show')
```

### 4.3 Entities для Booking

#### Payment (Entity внутри Appointment)

**Файл:** `domain/booking/entities/payment.py`

```python
from datetime import datetime
from domain.shared.entity_id import EntityId
from domain.shared.exceptions import DomainError
from domain.booking.value_objects.money import Money
from domain.booking.value_objects.payment_status import PaymentStatus


class PaymentId(EntityId):
    """ID платежа."""
    pass


class Payment:
    """Entity: Платеж внутри Appointment aggregate.
    
    Бизнес-правила:
    - Платеж может быть помечен как успешный только из pending статуса
    - Провайдер payment ID должен быть уникальным
    """
    
    def __init__(
        self,
        id: PaymentId,
        amount: Money,
        status: PaymentStatus,
        provider_id: str,
        provider_payment_id: str,
        created_at: datetime,
        confirmed_at: datetime | None = None
    ):
        self._id = id
        self._amount = amount
        self._status = status
        self._provider_id = provider_id
        self._provider_payment_id = provider_payment_id
        self._created_at = created_at
        self._confirmed_at = confirmed_at
    
    @classmethod
    def create(
        cls,
        amount: Money,
        provider_id: str,
        provider_payment_id: str
    ) -> "Payment":
        """Factory method для создания платежа."""
        return cls(
            id=PaymentId.generate(),
            amount=amount,
            status=PaymentStatus.PENDING,
            provider_id=provider_id,
            provider_payment_id=provider_payment_id,
            created_at=datetime.utcnow()
        )
    
    def mark_as_succeeded(self) -> None:
        """Помечает платеж как успешный."""
        if not self._status.is_pending():
            raise DomainError("Payment is not in pending state")
        
        self._status = PaymentStatus.SUCCEEDED
        self._confirmed_at = datetime.utcnow()
    
    def mark_as_failed(self, reason: str) -> None:
        """Помечает платеж как неудачный."""
        if not self._status.is_pending():
            raise DomainError("Payment is not in pending state")
        
        self._status = PaymentStatus.FAILED
    
    def is_succeeded(self) -> bool:
        """Проверяет, успешен ли платеж."""
        return self._status.is_succeeded()
    
    @property
    def id(self) -> PaymentId:
        return self._id
    
    @property
    def amount(self) -> Money:
        return self._amount
    
    @property
    def status(self) -> PaymentStatus:
        return self._status
```

### 4.4 Domain Services для Booking

**Файл:** `domain/booking/domain_services.py`

```python
from abc import ABC, abstractmethod
from domain.booking.aggregates.appointment import Appointment, AppointmentId
from domain.booking.value_objects.time_slot import TimeSlot
from domain.booking.value_objects.money import Money
from domain.booking.repositories import IAppointmentRepository


class IGoogleCalendarService(ABC):
    """Интерфейс для интеграции с Google Calendar."""
    
    @abstractmethod
    async def is_time_slot_free(self, slot: TimeSlot) -> bool:
        """Проверяет, свободен ли слот в календаре."""
        pass


class SlotAvailabilityService:
    """Domain Service для проверки доступности слотов.
    
    Координирует проверку доступности между:
    - Google Calendar (внешний источник)
    - БД (существующие встречи)
    """
    
    def __init__(
        self,
        appointment_repository: IAppointmentRepository,
        google_calendar_service: IGoogleCalendarService
    ):
        self._appointment_repository = appointment_repository
        self._google_calendar_service = google_calendar_service
    
    async def is_slot_available(
        self,
        slot: TimeSlot,
        service_id: "ServiceId"
    ) -> bool:
        """Проверяет доступность слота.
        
        Args:
            slot: Временной слот
            service_id: ID услуги
        
        Returns:
            True если слот доступен, иначе False
        """
        # 1. Проверка в Google Calendar
        is_calendar_free = await self._google_calendar_service.is_time_slot_free(slot)
        if not is_calendar_free:
            return False
        
        # 2. Проверка конфликтов в БД
        conflicting = await self._appointment_repository.find_conflicting_appointments(slot)
        
        return len(conflicting) == 0
    
    async def reserve_slot(
        self,
        slot: TimeSlot,
        appointment: Appointment
    ) -> bool:
        """Резервирует слот с проверкой конфликтов.
        
        Args:
            slot: Временной слот
            appointment: Встреча для резервирования
        
        Returns:
            True если резервирование успешно, иначе False
        """
        try:
            await self._appointment_repository.save_with_conflict_check(appointment)
            return True
        except ConflictError:
            return False
```

### 4.5 Domain Events для Booking

**Файл:** `domain/booking/domain_events.py`

```python
from dataclasses import dataclass
from typing import Optional
from domain.shared.domain_event import DomainEvent
from domain.booking.aggregates.appointment import AppointmentId, ServiceId
from domain.booking.value_objects.time_slot import TimeSlot
from domain.booking.value_objects.money import Money
from domain.identity.aggregates.user import UserId


@dataclass(frozen=True)
class AppointmentCreatedEvent(DomainEvent):
    """Событие создания встречи."""
    appointment_id: AppointmentId
    service_id: ServiceId
    slot: TimeSlot
    deep_link_id: Optional[str]
    
    @property
    def aggregate_id(self) -> str:
        return self.appointment_id.value
    
    @property
    def event_name(self) -> str:
        return "AppointmentCreated"


@dataclass(frozen=True)
class AppointmentConfirmedEvent(DomainEvent):
    """Событие подтверждения встречи."""
    appointment_id: AppointmentId
    client_id: UserId
    slot: TimeSlot
    service_slug: str
    paid_amount: Money
    
    @property
    def aggregate_id(self) -> str:
        return self.appointment_id.value
    
    @property
    def event_name(self) -> str:
        return "AppointmentConfirmed"


@dataclass(frozen=True)
class AppointmentCanceledEvent(DomainEvent):
    """Событие отмены встречи."""
    appointment_id: AppointmentId
    reason: str
    refund_amount: Optional[Money]
    
    @property
    def aggregate_id(self) -> str:
        return self.appointment_id.value
    
    @property
    def event_name(self) -> str:
        return "AppointmentCanceled"
```

### 4.6 Repository Interface для Booking

**Файл:** `domain/booking/repositories.py`

```python
from abc import ABC, abstractmethod
from typing import List, Optional
from datetime import datetime
from domain.booking.aggregates.appointment import Appointment, AppointmentId
from domain.booking.aggregates.service import Service, ServiceId
from domain.booking.value_objects.time_slot import TimeSlot
from domain.identity.aggregates.user import UserId


class IAppointmentRepository(ABC):
    """Интерфейс репозитория встреч."""
    
    @abstractmethod
    async def find_by_id(self, id: AppointmentId) -> Optional[Appointment]:
        """Находит встречу по ID."""
        pass
    
    @abstractmethod
    async def find_by_client_id(self, client_id: UserId) -> List[Appointment]:
        """Находит все встречи клиента."""
        pass
    
    @abstractmethod
    async def find_conflicting_appointments(
        self,
        slot: TimeSlot
    ) -> List[Appointment]:
        """Находит встречи, конфликтующие со слотом."""
        pass
    
    @abstractmethod
    async def find_upcoming_appointments(
        self,
        from_date: datetime,
        to_date: datetime
    ) -> List[Appointment]:
        """Находит предстоящие встречи в диапазоне."""
        pass
    
    @abstractmethod
    async def save(self, appointment: Appointment) -> None:
        """Сохраняет встречу."""
        pass
    
    @abstractmethod
    async def save_with_conflict_check(
        self,
        appointment: Appointment
    ) -> None:
        """Сохраняет встречу с проверкой конфликтов (atomic)."""
        pass


class IServiceRepository(ABC):
    """Интерфейс репозитория услуг."""
    
    @abstractmethod
    async def find_by_id(self, id: ServiceId) -> Optional[Service]:
        """Находит услугу по ID."""
        pass
    
    @abstractmethod
    async def find_by_slug(self, slug: str) -> Optional[Service]:
        """Находит услугу по slug."""
        pass
    
    @abstractmethod
    async def find_all(self) -> List[Service]:
        """Находит все услуги."""
        pass
```

---

## 5) Продолжение спецификаций

### 5.1 Структура оставшихся доменов

Каждый домен должен содержать:

1. **Aggregate Roots** (если есть)
2. **Entities** (если есть)
3. **Value Objects** (обязательно)
4. **Domain Events** (обязательно)
5. **Domain Services** (если нужны операции между агрегатами)
6. **Repository Interfaces** (обязательно)

### 5.2 Payments Context (Приоритет 3)

**Основные компоненты:**
- **Aggregate:** `Payment` (отдельный агрегат или часть Booking)
- **Value Objects:** `PaymentStatus`, `PaymentProvider`
- **Domain Events:** `PaymentIntentCreatedEvent`, `PaymentSucceededEvent`, `PaymentFailedEvent`
- **Repository:** `IPaymentRepository`

**Ключевые бизнес-правила:**
- Платеж создается как Intent, затем переходит в Pending после создания в провайдере
- Подтверждение платежа происходит только через webhook провайдера
- Идемпотентность по `provider_payment_id`

### 5.3 Interactive Context (Приоритет 4 — CORE)

**Основные компоненты:**
- **Aggregate:** `InteractiveRun` (результат прохождения интерактива)
- **Value Objects:** `InteractiveResult`, `ResultLevel`, `RunStatus`, `RunMetadata`
- **Domain Events:** `InteractiveRunStartedEvent`, `InteractiveRunCompletedEvent`, `InteractiveRunAbandonedEvent`, `CrisisTriggeredEvent`
- **Repository:** `IInteractiveRunRepository`, `IInteractiveDefinitionRepository`

**Ключевые бизнес-правила:**
- Интерактив может быть запущен анонимно (без user_id)
- Результат содержит только агрегаты (level, profile), не сырые ответы
- Кризисный триггер генерирует отдельное событие
- Связь с пользователем может произойти позже (link_to_user)

### 5.4 Content Context (Приоритет 5)

**Основные компоненты:**
- **Aggregate:** `ContentItem` (статья/ресурс/лендинг)
- **Value Objects:** `ContentType`, `ContentStatus`, `TopicCode`, `TimeToBenefit`
- **Domain Events:** `ContentItemPublishedEvent`, `ContentItemArchivedEvent`
- **Repository:** `IContentItemRepository`

**Ключевые бизнес-правила:**
- Slug уникален в пределах content_type
- Публикация меняет статус на Published и устанавливает published_at
- Контент может быть связан с темами (topics) и тегами (tags)

### 5.5 Client Cabinet Context (Приоритет 6)

**Основные компоненты:**
- **Aggregate:** `DiaryEntry` (запись дневника)
- **Value Objects:** `DiaryType`, `ExportType`
- **Domain Events:** `DiaryEntryCreatedEvent`, `DiaryEntryDeletedEvent`, `DataExportRequestedEvent`
- **Repository:** `IDiaryEntryRepository`, `IDataExportRepository`

**Ключевые бизнес-правила:**
- Дневники приватны по умолчанию (P2 данные, шифрование)
- Экспорт PDF генерируется асинхронно
- Удаление дневников — физическое или soft delete

### 5.6 UGC Moderation Context (Приоритет 7)

**Основные компоненты:**
- **Aggregate:** `ModerationItem` (вопрос/отзыв на модерации)
- **Entities:** `ModerationAction`, `Answer`
- **Value Objects:** `ModerationStatus`, `ModerationDecision`, `TriggerFlag`, `RejectionReason`, `UGCContentType`
- **Domain Events:** `QuestionSubmittedEvent`, `UGCFlaggedEvent`, `UGCModeratedEvent`, `UGCAnsweredEvent`
- **Repository:** `IModerationItemRepository`

**Ключевые бизнес-правила:**
- Контент UGC хранится зашифрованным (P2 данные)
- Кризисные триггеры автоматически флагят контент
- Модерация требует роли owner/assistant
- Ответ на вопрос возможен только после одобрения

### 5.7 Telegram Integration Context (Приоритет 8)

**Основные компоненты:**
- **Aggregate:** `DeepLink` (для склейки Web ↔ Telegram)
- **Value Objects:** `DeepLinkFlow`, `TelegramUser`
- **Domain Events:** `DeepLinkCreatedEvent`, `TelegramUserLinkedEvent`
- **Repository:** `IDeepLinkRepository`

**Ключевые бизнес-правила:**
- Deep link содержит только P0 данные (без PII)
- TTL: 30 дней (автоматическая очистка)
- Deep link используется для склейки аналитики Web ↔ Telegram

### 5.8 Analytics Context (Приоритет 9)

**Основные компоненты:**
- **Aggregate:** `Lead` (CRM-лид)
- **Value Objects:** `LeadStatus`, `LeadSource`, `LeadIdentity`, `TimelineEvent`, `UTMParams`
- **Domain Events:** `LeadCreatedEvent`, `LeadStatusChangedEvent`, `LeadConvertedEvent`
- **Repository:** `ILeadRepository`

**Ключевые бизнес-правила:**
- Лид создается при первом "контактном" событии
- Timeline events содержат только P0 данные (без PII/текстов)
- Статус лида обновляется автоматически на основе событий
- Лид может иметь несколько идентичностей (userId, anonymousId, email, phone, telegram)

### 5.9 Порядок реализации

**Sprint 1-2:**
1. ✅ Shared Kernel (базовые классы)
2. ✅ Identity & Access (полностью)

**Sprint 3-4:**
3. ✅ Booking (Aggregate + Value Objects + Events + Services)
4. ✅ Payments (Aggregate + Value Objects + Events)

**Sprint 5-6:**
5. ✅ Interactive (Aggregate + Value Objects + Events)
6. ✅ Content (Aggregate + Value Objects + Events)

**Sprint 7-8:**
7. ✅ Client Cabinet (Aggregate + Value Objects + Events)
8. ✅ UGC Moderation (Aggregate + Value Objects + Events)

**Sprint 9-10:**
9. ✅ Telegram (Aggregate + Value Objects + Events)
10. ✅ Analytics (Aggregate + Value Objects + Events)

---

## 6) Критерии готовности (Definition of Done)

### Для каждого домена:

✅ **Код реализован:**
- Все Aggregate Roots с бизнес-правилами
- Все Entities
- Все Value Objects (неизменяемые, с валидацией)
- Все Domain Events (неизменяемые, минимальные данные)
- Все Repository Interfaces

✅ **Unit тесты написаны:**
- Покрытие ≥80%
- Тесты для бизнес-правил
- Тесты для валидации Value Objects
- Тесты для Domain Events

✅ **Документация:**
- Docstrings для всех публичных методов
- Комментарии для сложных бизнес-правил

✅ **Code review пройден:**
- Соответствие Clean Architecture
- Соответствие DDD принципам
- Нет зависимостей от Infrastructure Layer

---

## 7) Тестирование

### 7.1 Структура тестов

```
tests/
└── domain/
    ├── shared/
    │   ├── test_entity_id.py
    │   ├── test_domain_event.py
    │   └── test_value_object.py
    │
    ├── identity/
    │   ├── test_user.py
    │   ├── test_consent.py
    │   ├── test_email.py
    │   ├── test_phone_number.py
    │   └── test_role.py
    │
    └── booking/
        ├── test_appointment.py
        ├── test_time_slot.py
        ├── test_money.py
        └── test_appointment_status.py
```

### 7.2 Пример теста

**Файл:** `tests/domain/identity/test_user.py`

```python
import pytest
from domain.identity.aggregates.user import User
from domain.identity.value_objects.email import Email
from domain.identity.value_objects.consent_type import ConsentType
from domain.shared.exceptions import DomainError


def test_create_user_with_email():
    """Тест создания пользователя с email."""
    email = Email.create("test@example.com")
    user = User.create(email=email)
    
    assert user.email == email
    assert user.status.is_active()
    assert Role.CLIENT in user.roles
    assert len(user.get_domain_events()) == 1
    assert isinstance(user.get_domain_events()[0], UserCreatedEvent)


def test_create_user_requires_at_least_one_contact():
    """Тест: пользователь должен иметь хотя бы один способ связи."""
    with pytest.raises(DomainError, match="At least one contact method"):
        User.create()


def test_grant_consent():
    """Тест выдачи согласия."""
    email = Email.create("test@example.com")
    user = User.create(email=email)
    
    user.grant_consent(
        ConsentType.PERSONAL_DATA,
        version="2026-01-01",
        source="web"
    )
    
    assert user.has_active_consent(ConsentType.PERSONAL_DATA)
    assert len(user.get_domain_events()) == 2
    assert isinstance(user.get_domain_events()[1], ConsentGrantedEvent)


def test_cannot_grant_duplicate_consent():
    """Тест: нельзя выдать два активных согласия одного типа."""
    email = Email.create("test@example.com")
    user = User.create(email=email)
    
    user.grant_consent(
        ConsentType.PERSONAL_DATA,
        version="2026-01-01",
        source="web"
    )
    
    with pytest.raises(DomainError, match="already granted"):
        user.grant_consent(
            ConsentType.PERSONAL_DATA,
            version="2026-01-02",
            source="web"
        )
```

---

## 8) Зависимости между доменами

### 8.1 Граф зависимостей

```
Identity (нет зависимостей)
  ↓
Booking (зависит от Identity)
  ↓
Payments (зависит от Booking)
  ↓
Interactive (зависит от Identity)
  ↓
Content (нет зависимостей)
  ↓
Client Cabinet (зависит от Identity, Booking)
  ↓
UGC Moderation (зависит от Identity)
  ↓
Telegram (зависит от Identity)
  ↓
Analytics (зависит от всех остальных через события)
```

### 8.2 Shared Kernel

**Минимизация Shared Kernel:**
- Только базовые классы (EntityId, DomainEvent, ValueObject, AggregateRoot)
- Общие исключения (DomainError, ConflictError)

**Избегать:**
- Общих Value Objects между контекстами (лучше дублировать)
- Общих Entities между контекстами

---

## 9) Следующие шаги после Phase 2

После завершения Phase 2 (Domain Layer):

1. **Phase 3: Infrastructure Layer**
   - Реализация Repository (Django ORM)
   - Интеграции (ЮKassa, Google Calendar, Telegram)
   - Event Bus

2. **Phase 4: Application Layer**
   - Use Cases для каждого домена
   - Event Handlers
   - DTOs

3. **Phase 5: Presentation Layer**
   - Django REST Framework API
   - Serializers
   - Controllers

---

**Версия:** v1.0  
**Последнее обновление:** 2026-01-26  
**Статус:** ✅ Готово к реализации

**Примечание:** Полные спецификации для остальных доменов (Booking, Payments, Interactive, Content, Client Cabinet, UGC Moderation, Telegram, Analytics) будут добавлены в следующих версиях документа или в отдельных файлах по доменам.
