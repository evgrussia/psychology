# Техническая спецификация Phase 1: Platform & Foundations

**Версия:** v1.0  
**Дата:** 2026-01-26  
**Статус:** В разработке  
**Основано на:** `docs/Development-Phase-Plan.md`, `docs/Архитектурный-обзор.md`, `docs/Модель-данных.md`, `docs/Technical-Decisions.md`, `docs/security/security-requirements.md`

---

## 1) Обзор Phase 1

### 1.1 Цель
Создать базовую инфраструктуру Django-проекта со структурой Clean Architecture + DDD, настроить базу данных, реализовать систему аутентификации и авторизации (RBAC), настроить окружения и CI/CD.

### 1.2 Входные артефакты
- ✅ `docs/Development-Phase-Plan.md` — план работ
- ✅ `docs/Архитектурный-обзор.md` — системная архитектура
- ✅ `docs/Модель-данных.md` — физическая схема БД
- ✅ `docs/Technical-Decisions.md` — технические решения
- ✅ `docs/security/security-requirements.md` — требования безопасности
- ✅ `docs/Domain-Model-Specification.md` — доменная модель

### 1.3 Выходные артефакты
- ✅ Работающий Django-проект со структурой Clean Architecture
- ✅ База данных PostgreSQL с миграциями
- ✅ RBAC система (4 роли: owner, assistant, editor, client)
- ✅ Система сессий и аутентификации
- ✅ Медиа-статика (локальное хранилище + `/media/*`)
- ✅ Аудит-лог критичных действий
- ✅ CI/CD pipeline (базовая настройка)
- ✅ Окружения dev/stage/prod

### 1.4 Оценка
**L (Large): 2-4 недели**

---

## 2) Задача 1: Настройка Django-проекта со структурой Clean Architecture

### 2.1 Цель
Создать структуру Django-проекта согласно Clean Architecture + DDD принципам.

### 2.2 Требования

#### 2.2.1 Структура проекта

```
backend/
├── config/                          # Django settings
│   ├── __init__.py
│   ├── settings/
│   │   ├── __init__.py
│   │   ├── base.py                  # Общие настройки
│   │   ├── development.py           # Dev окружение
│   │   ├── staging.py                # Stage окружение
│   │   ├── production.py             # Prod окружение
│   │   └── testing.py                # Test окружение
│   ├── urls.py                       # Главный URLconf
│   ├── wsgi.py                       # WSGI конфигурация
│   └── asgi.py                       # ASGI конфигурация (опционально)
│
├── domain/                          # Domain Layer (DDD) - чистый Python
│   ├── __init__.py
│   ├── identity/                     # Identity & Access bounded context
│   │   ├── __init__.py
│   │   ├── entities.py               # User, Role, Consent entities
│   │   ├── value_objects.py         # Email, Phone, PasswordHash VOs
│   │   ├── domain_services.py       # AuthenticationService, AuthorizationService
│   │   ├── domain_events.py         # UserCreated, ConsentGranted, etc.
│   │   └── repositories.py           # IUserRepository, IConsentRepository (interfaces)
│   │
│   ├── shared/                       # Shared Kernel
│   │   ├── __init__.py
│   │   ├── exceptions.py            # Domain exceptions
│   │   ├── value_objects.py         # Общие Value Objects (Money, TimeSlot, etc.)
│   │   └── utils.py                 # Утилиты домена
│   │
│   └── audit/                        # Audit bounded context (для Phase 1)
│       ├── __init__.py
│       ├── entities.py               # AuditLogEntry entity
│       ├── value_objects.py         # AuditAction, AuditEntityType VOs
│       ├── domain_events.py         # AuditLogged domain event
│       └── repositories.py          # IAuditLogRepository interface
│
├── application/                      # Application Layer (Use Cases)
│   ├── __init__.py
│   ├── identity/
│   │   ├── __init__.py
│   │   ├── use_cases/
│   │   │   ├── __init__.py
│   │   │   ├── authenticate_user.py
│   │   │   ├── register_user.py
│   │   │   ├── grant_consent.py
│   │   │   └── revoke_consent.py
│   │   └── dto.py                    # DTOs для Identity Use Cases
│   │
│   └── audit/
│       ├── __init__.py
│       ├── use_cases/
│       │   ├── __init__.py
│       │   └── log_audit_event.py
│       └── dto.py
│
├── infrastructure/                   # Infrastructure Layer
│   ├── __init__.py
│   ├── persistence/
│   │   ├── __init__.py
│   │   ├── django_models/            # Django ORM models
│   │   │   ├── __init__.py
│   │   │   ├── user.py               # User model
│   │   │   ├── role.py               # Role model
│   │   │   ├── consent.py            # Consent model
│   │   │   └── audit_log.py          # AuditLog model
│   │   │
│   │   └── repositories/             # Repository implementations
│   │       ├── __init__.py
│   │       ├── user_repository.py
│   │       ├── consent_repository.py
│   │       └── audit_log_repository.py
│   │
│   ├── external/                     # External services (пока пусто, для Phase 2+)
│   │   ├── __init__.py
│   │   └── .gitkeep
│   │
│   ├── events/                       # Event Bus implementation
│   │   ├── __init__.py
│   │   ├── event_bus.py              # EventBus interface и реализация
│   │   └── django_signals_adapter.py # Адаптер Django Signals (опционально)
│   │
│   └── storage/                      # File storage (для Phase 1)
│       ├── __init__.py
│       └── local_storage.py          # Локальное хранилище медиа
│
├── presentation/                     # Presentation Layer
│   ├── __init__.py
│   ├── api/
│   │   ├── __init__.py
│   │   ├── v1/
│   │   │   ├── __init__.py
│   │   │   ├── urls.py
│   │   │   ├── views.py              # DRF ViewSets (пока минимальные)
│   │   │   └── serializers.py        # DRF Serializers
│   │   └── middleware.py             # API middleware (auth, logging)
│   │
│   └── admin/                        # Django Admin (базовая настройка)
│       ├── __init__.py
│       ├── admin.py
│       └── sites.py
│
├── shared/                           # Shared utilities (cross-cutting)
│   ├── __init__.py
│   ├── exceptions.py                 # Общие исключения
│   ├── validators.py                 # Валидаторы
│   ├── utils.py                      # Утилиты
│   └── constants.py                  # Константы
│
├── manage.py                         # Django management script
├── requirements.txt                  # Python зависимости
├── requirements-dev.txt              # Dev зависимости
├── .env.example                      # Пример переменных окружения
├── .gitignore
├── pytest.ini                        # Конфигурация pytest
└── README.md                          # Документация проекта
```

#### 2.2.2 Django Settings

**Файл: `config/settings/base.py`**

Должен содержать:
- Базовые настройки Django
- Общие middleware
- Общие INSTALLED_APPS
- Настройки логирования
- Конфигурацию для Clean Architecture (запрет импорта Django в Domain Layer)

**Файлы окружений:**
- `development.py` — для локальной разработки
- `staging.py` — для staging окружения
- `production.py` — для production (безопасность, производительность)
- `testing.py` — для тестов (изоляция, скорость)

#### 2.2.3 Зависимости (requirements.txt)

**Минимальный набор:**
```
Django>=4.2,<5.0
djangorestframework>=3.14.0
django-cors-headers>=4.0.0
psycopg2-binary>=2.9.0
python-dotenv>=1.0.0
```

**Dev зависимости (requirements-dev.txt):**
```
pytest>=7.4.0
pytest-django>=4.5.0
pytest-cov>=4.1.0
black>=23.0.0
flake8>=6.0.0
mypy>=1.5.0
```

#### 2.2.4 Принципы Clean Architecture

**Правила зависимостей:**
1. **Domain Layer** — чистый Python, **без** Django зависимостей
2. **Application Layer** — зависит только от Domain, **без** Django
3. **Infrastructure Layer** — зависит от Domain и Django
4. **Presentation Layer** — зависит от Application и Infrastructure

**Проверка зависимостей:**
- Использовать `import-linter` или `deptry` для проверки
- Настроить pre-commit hooks для автоматической проверки

### 2.3 Acceptance Criteria

- ✅ Проект создан со структурой выше
- ✅ Django settings разделены по окружениям
- ✅ Domain Layer не содержит Django-зависимостей (проверка линтерами)
- ✅ Базовые тесты структуры проекта проходят
- ✅ `.env.example` содержит все необходимые переменные
- ✅ README.md содержит инструкции по настройке

### 2.4 Тесты

**Unit тесты:**
- Проверка структуры проекта (импорты работают)
- Проверка отсутствия Django в Domain Layer
- Проверка настроек окружений

---

## 3) Задача 2: Настройка PostgreSQL + миграции

### 3.1 Цель
Настроить подключение к PostgreSQL и создать миграции для Identity & Access и Audit доменов.

### 3.2 Требования

#### 3.2.1 База данных

**Настройки подключения (`config/settings/base.py`):**
```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': env('DB_NAME'),
        'USER': env('DB_USER'),
        'PASSWORD': env('DB_PASSWORD'),
        'HOST': env('DB_HOST', default='localhost'),
        'PORT': env('DB_PORT', default='5432'),
        'OPTIONS': {
            'connect_timeout': 10,
        },
    }
}
```

**Переменные окружения:**
- `DB_NAME` — имя базы данных
- `DB_USER` — пользователь БД
- `DB_PASSWORD` — пароль
- `DB_HOST` — хост (по умолчанию localhost)
- `DB_PORT` — порт (по умолчанию 5432)

#### 3.2.2 Django ORM Models

**Файл: `infrastructure/persistence/django_models/user.py`**

Модель User:
```python
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.db import models
import uuid

class UserModel(AbstractBaseUser, PermissionsMixin):
    """
    Django ORM модель для User (из Domain Layer: domain.identity.entities.User)
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True, null=True, blank=True)
    phone = models.CharField(max_length=20, unique=True, null=True, blank=True)
    telegram_user_id = models.CharField(max_length=255, unique=True, null=True, blank=True)
    telegram_username = models.CharField(max_length=255, null=True, blank=True)
    display_name = models.CharField(max_length=255, null=True, blank=True)
    status = models.CharField(
        max_length=20,
        choices=[
            ('active', 'Active'),
            ('blocked', 'Blocked'),
            ('deleted', 'Deleted'),
        ],
        default='active'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(null=True, blank=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    class Meta:
        db_table = 'users'
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['phone']),
            models.Index(fields=['telegram_user_id']),
            models.Index(fields=['status']),
        ]
```

**Файл: `infrastructure/persistence/django_models/role.py`**

Модель Role:
```python
from django.db import models

class RoleModel(models.Model):
    """
    Django ORM модель для Role (из Domain Layer)
    """
    code = models.CharField(primary_key=True, max_length=50)
    scope = models.CharField(
        max_length=20,
        choices=[
            ('admin', 'Admin'),
            ('product', 'Product'),
        ]
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'roles'
```

**Файл: `infrastructure/persistence/django_models/user_role.py`**

Связь User-Role:
```python
from django.db import models
import uuid

class UserRoleModel(models.Model):
    """
    Many-to-Many связь User <-> Role
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey('UserModel', on_delete=models.CASCADE, related_name='user_roles')
    role = models.ForeignKey('RoleModel', on_delete=models.CASCADE, related_name='user_roles')
    granted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'user_roles'
        unique_together = [['user', 'role']]
        indexes = [
            models.Index(fields=['user']),
            models.Index(fields=['role']),
        ]
```

**Файл: `infrastructure/persistence/django_models/consent.py`**

Модель Consent:
```python
from django.db import models
import uuid

class ConsentModel(models.Model):
    """
    Django ORM модель для Consent (из Domain Layer)
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey('UserModel', on_delete=models.CASCADE, related_name='consents')
    consent_type = models.CharField(
        max_length=50,
        choices=[
            ('personal_data', 'Personal Data'),
            ('communications', 'Communications'),
            ('telegram', 'Telegram'),
            ('review_publication', 'Review Publication'),
        ]
    )
    granted = models.BooleanField(default=False)
    version = models.CharField(max_length=50)  # например, "2026-01-26"
    source = models.CharField(
        max_length=20,
        choices=[
            ('web', 'Web'),
            ('telegram', 'Telegram'),
            ('admin', 'Admin'),
        ]
    )
    granted_at = models.DateTimeField(null=True, blank=True)
    revoked_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'consents'
        unique_together = [['user', 'consent_type']]
        indexes = [
            models.Index(fields=['user', 'consent_type']),
            models.Index(fields=['granted']),
        ]
```

**Файл: `infrastructure/persistence/django_models/audit_log.py`**

Модель AuditLog:
```python
from django.db import models
import uuid

class AuditLogModel(models.Model):
    """
    Django ORM модель для AuditLog (из Domain Layer)
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    actor_user = models.ForeignKey('UserModel', on_delete=models.SET_NULL, null=True, related_name='audit_actions')
    actor_role = models.CharField(
        max_length=20,
        choices=[
            ('owner', 'Owner'),
            ('assistant', 'Assistant'),
            ('editor', 'Editor'),
        ]
    )
    action = models.CharField(max_length=100)  # например, "admin_price_changed"
    entity_type = models.CharField(max_length=50)  # например, "service", "content", "user"
    entity_id = models.UUIDField(null=True, blank=True)
    old_value = models.JSONField(null=True, blank=True)
    new_value = models.JSONField(null=True, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'audit_log'
        indexes = [
            models.Index(fields=['actor_user', 'created_at']),
            models.Index(fields=['action']),
            models.Index(fields=['entity_type', 'entity_id']),
            models.Index(fields=['created_at']),
        ]
        ordering = ['-created_at']
```

#### 3.2.3 Миграции

**Создание миграций:**
```bash
python manage.py makemigrations
python manage.py migrate
```

**Структура миграций:**
- Первая миграция: создание таблиц `users`, `roles`, `user_roles`, `consents`, `audit_log`
- Data migration: создание начальных ролей (owner, assistant, editor, client)

**Data migration для ролей:**
```python
# infrastructure/persistence/django_models/migrations/0002_initial_roles.py
from django.db import migrations

def create_initial_roles(apps, schema_editor):
    RoleModel = apps.get_model('persistence', 'RoleModel')
    RoleModel.objects.get_or_create(code='owner', defaults={'scope': 'admin'})
    RoleModel.objects.get_or_create(code='assistant', defaults={'scope': 'admin'})
    RoleModel.objects.get_or_create(code='editor', defaults={'scope': 'admin'})
    RoleModel.objects.get_or_create(code='client', defaults={'scope': 'product'})

def reverse_initial_roles(apps, schema_editor):
    RoleModel = apps.get_model('persistence', 'RoleModel')
    RoleModel.objects.filter(code__in=['owner', 'assistant', 'editor', 'client']).delete()
```

### 3.3 Acceptance Criteria

- ✅ PostgreSQL подключение настроено для всех окружений
- ✅ Django ORM модели созданы для User, Role, UserRole, Consent, AuditLog
- ✅ Миграции созданы и применены
- ✅ Начальные роли созданы через data migration
- ✅ Индексы созданы согласно модели данных
- ✅ Тесты подключения к БД проходят

### 3.4 Тесты

**Integration тесты:**
- Подключение к БД
- Создание/чтение/обновление User
- Связь User-Role
- Создание Consent
- Создание AuditLog

---

## 4) Задача 3: RBAC система (owner/assistant/editor/client) + сессии

### 4.1 Цель
Реализовать систему аутентификации и авторизации с RBAC (4 роли) и управлением сессиями.

### 4.2 Требования

#### 4.2.1 Domain Layer: Identity & Access

**Файл: `domain/identity/entities.py`**

```python
from dataclasses import dataclass
from datetime import datetime
from enum import Enum
from typing import Optional
from uuid import UUID

class UserStatus(Enum):
    ACTIVE = "active"
    BLOCKED = "blocked"
    DELETED = "deleted"

@dataclass(frozen=True)
class User:
    """
    User Entity (Aggregate Root для Identity context)
    """
    id: UUID
    email: Optional[str]
    phone: Optional[str]
    telegram_user_id: Optional[str]
    telegram_username: Optional[str]
    display_name: Optional[str]
    status: UserStatus
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime]
    
    def is_active(self) -> bool:
        return self.status == UserStatus.ACTIVE and self.deleted_at is None
    
    def has_role(self, role_code: str) -> bool:
        # Проверяется через UserRole связь
        pass
```

**Файл: `domain/identity/value_objects.py`**

```python
from dataclasses import dataclass
from typing import Optional

@dataclass(frozen=True)
class Email:
    value: str
    
    def __post_init__(self):
        if not self.value or '@' not in self.value:
            raise ValueError("Invalid email format")

@dataclass(frozen=True)
class PasswordHash:
    value: str  # Argon2id hash
    
    @classmethod
    def from_password(cls, password: str) -> 'PasswordHash':
        # Используется passlib или argon2-cffi
        pass
```

**Файл: `domain/identity/repositories.py`**

```python
from abc import ABC, abstractmethod
from typing import Optional
from uuid import UUID
from domain.identity.entities import User

class IUserRepository(ABC):
    @abstractmethod
    def get_by_id(self, user_id: UUID) -> Optional[User]:
        pass
    
    @abstractmethod
    def get_by_email(self, email: str) -> Optional[User]:
        pass
    
    @abstractmethod
    def get_by_telegram_id(self, telegram_user_id: str) -> Optional[User]:
        pass
    
    @abstractmethod
    def save(self, user: User) -> User:
        pass
    
    @abstractmethod
    def delete(self, user_id: UUID) -> None:
        pass
```

#### 4.2.2 Application Layer: Use Cases

**Файл: `application/identity/use_cases/authenticate_user.py`**

```python
from typing import Optional
from domain.identity.entities import User
from domain.identity.repositories import IUserRepository
from domain.identity.value_objects import PasswordHash

class AuthenticateUserUseCase:
    def __init__(self, user_repository: IUserRepository):
        self._user_repository = user_repository
    
    def execute(self, email: str, password: str) -> Optional[User]:
        user = self._user_repository.get_by_email(email)
        if not user or not user.is_active():
            return None
        
        # Проверка пароля (используется passlib)
        if not self._verify_password(password, user.password_hash):
            return None
        
        return user
```

#### 4.2.3 Infrastructure: Repository Implementation

**Файл: `infrastructure/persistence/repositories/user_repository.py`**

```python
from typing import Optional
from uuid import UUID
from domain.identity.entities import User, UserStatus
from domain.identity.repositories import IUserRepository
from infrastructure.persistence.django_models.user import UserModel

class DjangoUserRepository(IUserRepository):
    def get_by_id(self, user_id: UUID) -> Optional[User]:
        try:
            model = UserModel.objects.get(id=user_id, deleted_at__isnull=True)
            return self._to_domain(model)
        except UserModel.DoesNotExist:
            return None
    
    def _to_domain(self, model: UserModel) -> User:
        return User(
            id=model.id,
            email=model.email,
            phone=model.phone,
            telegram_user_id=model.telegram_user_id,
            telegram_username=model.telegram_username,
            display_name=model.display_name,
            status=UserStatus(model.status),
            created_at=model.created_at,
            updated_at=model.updated_at,
            deleted_at=model.deleted_at,
        )
```

#### 4.2.4 RBAC Middleware

**Файл: `presentation/api/middleware.py`**

```python
from django.http import JsonResponse
from rest_framework.authentication import BaseAuthentication
from rest_framework.permissions import BasePermission

class RBACPermission(BasePermission):
    """
    Проверка прав доступа по ролям
    """
    required_roles = []
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        user_roles = request.user.roles.values_list('code', flat=True)
        return any(role in user_roles for role in self.required_roles)

class OwnerPermission(RBACPermission):
    required_roles = ['owner']

class AssistantPermission(RBACPermission):
    required_roles = ['owner', 'assistant']

class EditorPermission(RBACPermission):
    required_roles = ['owner', 'editor']
```

#### 4.2.5 Сессии

**Настройки сессий (`config/settings/base.py`):**
```python
# Session Configuration
SESSION_ENGINE = 'django.contrib.sessions.backends.db'
SESSION_COOKIE_NAME = 'sessionid'
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SECURE = True  # В production
SESSION_COOKIE_SAMESITE = 'Strict'
SESSION_COOKIE_AGE = 86400  # 24 часа (absolute timeout)
SESSION_IDLE_TIMEOUT = 1800  # 30 минут (idle timeout)

# JWT для API (если используется djangorestframework-simplejwt)
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
}
```

### 4.3 Acceptance Criteria

- ✅ Domain Layer: User, Role, Consent entities реализованы
- ✅ Repository interfaces определены
- ✅ Repository implementations (Django ORM) работают
- ✅ Use Cases: authenticate_user, register_user, grant_consent реализованы
- ✅ RBAC middleware проверяет роли
- ✅ Сессии работают (DB-backed, настройки безопасности)
- ✅ JWT для API (access + refresh tokens)
- ✅ Тесты аутентификации и авторизации проходят

### 4.4 Тесты

**Unit тесты:**
- Domain entities (User, Role, Consent)
- Value Objects (Email, PasswordHash)
- Use Cases (authenticate, register, grant_consent)

**Integration тесты:**
- Repository implementations
- RBAC middleware
- Сессии

---

## 5) Задача 4: Медиа-статика (локальное хранилище + `/media/*`)

### 5.1 Цель
Настроить локальное хранилище для медиа-файлов и статики с доступом через `/media/*` и `/static/*`.

### 5.2 Требования

#### 5.2.1 Настройки медиа и статики

**Файл: `config/settings/base.py`**

```python
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent

# Static files (CSS, JavaScript, Images)
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_DIRS = [
    BASE_DIR / 'static',
]

# Media files (user uploads)
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# Static files finders
STATICFILES_FINDERS = [
    'django.contrib.staticfiles.finders.FileSystemFinder',
    'django.contrib.staticfiles.finders.AppDirectoriesFinder',
]
```

#### 5.2.2 URL Configuration

**Файл: `config/urls.py`**

```python
from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/', include('presentation.api.v1.urls')),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
```

#### 5.2.3 Storage Implementation

**Файл: `infrastructure/storage/local_storage.py`**

```python
from django.core.files.storage import FileSystemStorage
from django.conf import settings
import os

class LocalMediaStorage(FileSystemStorage):
    """
    Локальное хранилище для медиа-файлов
    """
    def __init__(self, location=None, base_url=None):
        if location is None:
            location = settings.MEDIA_ROOT
        if base_url is None:
            base_url = settings.MEDIA_URL
        super().__init__(location, base_url)
    
    def get_available_name(self, name, max_length=None):
        """
        Генерирует уникальное имя файла, если файл уже существует
        """
        if self.exists(name):
            name_base, name_ext = os.path.splitext(name)
            counter = 1
            while self.exists(f"{name_base}_{counter}{name_ext}"):
                counter += 1
            name = f"{name_base}_{counter}{name_ext}"
        return name
```

#### 5.2.4 Структура медиа

```
media/
├── uploads/
│   ├── images/
│   │   ├── 2026/
│   │   │   └── 01/
│   ├── audio/
│   │   ├── 2026/
│   │   │   └── 01/
│   └── pdf/
│       ├── 2026/
│       │   └── 01/
└── .gitkeep
```

### 5.3 Acceptance Criteria

- ✅ Медиа-файлы сохраняются в `media/` директорию
- ✅ Статика собирается в `staticfiles/`
- ✅ Доступ к медиа через `/media/*` (в development)
- ✅ Доступ к статике через `/static/*`
- ✅ Уникальные имена файлов при конфликтах
- ✅ Структура директорий по датам (YYYY/MM)

### 5.4 Тесты

**Integration тесты:**
- Загрузка файла
- Получение файла по URL
- Обработка конфликтов имен

---

## 6) Задача 5: Аудит-лог критичных действий

### 6.1 Цель
Реализовать систему аудит-логирования критичных действий админов.

### 6.2 Требования

#### 6.2.1 Domain Layer: Audit

**Файл: `domain/audit/entities.py`**

```python
from dataclasses import dataclass
from datetime import datetime
from typing import Optional, Dict, Any
from uuid import UUID

@dataclass(frozen=True)
class AuditLogEntry:
    """
    AuditLog Entry Entity (Aggregate Root для Audit context)
    """
    id: UUID
    actor_user_id: Optional[UUID]
    actor_role: str  # 'owner', 'assistant', 'editor'
    action: str  # например, 'admin_price_changed'
    entity_type: str  # например, 'service', 'content', 'user'
    entity_id: Optional[UUID]
    old_value: Optional[Dict[str, Any]]
    new_value: Optional[Dict[str, Any]]
    ip_address: Optional[str]
    user_agent: Optional[str]
    created_at: datetime
```

**Файл: `domain/audit/value_objects.py`**

```python
from enum import Enum

class AuditAction(Enum):
    ADMIN_PRICE_CHANGED = "admin_price_changed"
    ADMIN_DATA_EXPORTED = "admin_data_exported"
    ADMIN_CONTENT_PUBLISHED = "admin_content_published"
    ADMIN_USER_DELETED = "admin_user_deleted"
    ADMIN_ROLE_CHANGED = "admin_role_changed"
    ADMIN_CONSENT_REVOKED = "admin_consent_revoked"

class AuditEntityType(Enum):
    SERVICE = "service"
    CONTENT = "content"
    USER = "user"
    PAYMENT = "payment"
    APPOINTMENT = "appointment"
```

**Файл: `domain/audit/repositories.py`**

```python
from abc import ABC, abstractmethod
from typing import List
from uuid import UUID
from domain.audit.entities import AuditLogEntry

class IAuditLogRepository(ABC):
    @abstractmethod
    def save(self, entry: AuditLogEntry) -> AuditLogEntry:
        pass
    
    @abstractmethod
    def get_by_actor(self, actor_user_id: UUID, limit: int = 100) -> List[AuditLogEntry]:
        pass
    
    @abstractmethod
    def get_by_entity(self, entity_type: str, entity_id: UUID) -> List[AuditLogEntry]:
        pass
```

#### 6.2.2 Application Layer: Use Case

**Файл: `application/audit/use_cases/log_audit_event.py`**

```python
from uuid import UUID, uuid4
from datetime import datetime
from typing import Optional, Dict, Any
from domain.audit.entities import AuditLogEntry
from domain.audit.repositories import IAuditLogRepository

class LogAuditEventUseCase:
    def __init__(self, audit_repository: IAuditLogRepository):
        self._audit_repository = audit_repository
    
    def execute(
        self,
        actor_user_id: Optional[UUID],
        actor_role: str,
        action: str,
        entity_type: str,
        entity_id: Optional[UUID] = None,
        old_value: Optional[Dict[str, Any]] = None,
        new_value: Optional[Dict[str, Any]] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
    ) -> AuditLogEntry:
        entry = AuditLogEntry(
            id=uuid4(),
            actor_user_id=actor_user_id,
            actor_role=actor_role,
            action=action,
            entity_type=entity_type,
            entity_id=entity_id,
            old_value=old_value,
            new_value=new_value,
            ip_address=ip_address,
            user_agent=user_agent,
            created_at=datetime.utcnow(),
        )
        return self._audit_repository.save(entry)
```

#### 6.2.3 Infrastructure: Repository Implementation

**Файл: `infrastructure/persistence/repositories/audit_log_repository.py`**

```python
from typing import List
from uuid import UUID
from domain.audit.entities import AuditLogEntry
from domain.audit.repositories import IAuditLogRepository
from infrastructure.persistence.django_models.audit_log import AuditLogModel

class DjangoAuditLogRepository(IAuditLogRepository):
    def save(self, entry: AuditLogEntry) -> AuditLogEntry:
        model = AuditLogModel.objects.create(
            id=entry.id,
            actor_user_id=entry.actor_user_id,
            actor_role=entry.actor_role,
            action=entry.action,
            entity_type=entry.entity_type,
            entity_id=entry.entity_id,
            old_value=entry.old_value,
            new_value=entry.new_value,
            ip_address=entry.ip_address,
            user_agent=entry.user_agent,
            created_at=entry.created_at,
        )
        return self._to_domain(model)
    
    def _to_domain(self, model: AuditLogModel) -> AuditLogEntry:
        return AuditLogEntry(
            id=model.id,
            actor_user_id=model.actor_user_id,
            actor_role=model.actor_role,
            action=model.action,
            entity_type=model.entity_type,
            entity_id=model.entity_id,
            old_value=model.old_value,
            new_value=model.new_value,
            ip_address=str(model.ip_address) if model.ip_address else None,
            user_agent=model.user_agent,
            created_at=model.created_at,
        )
```

#### 6.2.4 Декоратор для аудит-логирования

**Файл: `shared/decorators.py`**

```python
from functools import wraps
from typing import Optional
from uuid import UUID
from application.audit.use_cases.log_audit_event import LogAuditEventUseCase

def audit_log(action: str, entity_type: str):
    """
    Декоратор для автоматического логирования действий
    """
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            # Получаем request из args или kwargs
            request = kwargs.get('request') or (args[0] if args else None)
            
            # Получаем entity_id из kwargs или args
            entity_id = kwargs.get('entity_id') or kwargs.get('id')
            
            # Выполняем функцию
            result = func(*args, **kwargs)
            
            # Логируем действие
            if hasattr(request, 'user') and request.user.is_authenticated:
                log_use_case = LogAuditEventUseCase(...)  # Dependency injection
                log_use_case.execute(
                    actor_user_id=request.user.id,
                    actor_role=request.user.primary_role,  # Нужно определить
                    action=action,
                    entity_type=entity_type,
                    entity_id=entity_id,
                    ip_address=self._get_client_ip(request),
                    user_agent=request.META.get('HTTP_USER_AGENT'),
                )
            
            return result
        return wrapper
    return decorator
```

### 6.3 Acceptance Criteria

- ✅ Domain Layer: AuditLogEntry entity реализована
- ✅ Repository interface и implementation работают
- ✅ Use Case log_audit_event реализован
- ✅ Декоратор audit_log автоматически логирует действия
- ✅ Критичные действия логируются (изменение цен, экспорт данных, удаление)
- ✅ Тесты аудит-логирования проходят

### 6.4 Тесты

**Unit тесты:**
- AuditLogEntry entity
- Use Case log_audit_event

**Integration тесты:**
- Repository implementation
- Декоратор audit_log

---

## 7) Задача 6: CI/CD pipeline (базовая настройка)

### 7.1 Цель
Настроить базовый CI/CD pipeline для автоматизации тестов, проверок кода и деплоя.

### 7.2 Требования

#### 7.2.1 GitHub Actions (рекомендуется)

**Файл: `.github/workflows/ci.yml`**

```yaml
name: CI

on:
  push:
    branches: [ main, development ]
  pull_request:
    branches: [ main, development ]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      - name: Install dependencies
        run: |
          pip install -r requirements-dev.txt
      - name: Run black
        run: black --check .
      - name: Run flake8
        run: flake8 .
      - name: Run mypy
        run: mypy .

  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test_db
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v3
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      - name: Install dependencies
        run: |
          pip install -r requirements.txt
          pip install -r requirements-dev.txt
      - name: Run tests
        env:
          DB_NAME: test_db
          DB_USER: postgres
          DB_PASSWORD: postgres
          DB_HOST: localhost
          DB_PORT: 5432
        run: |
          pytest --cov=. --cov-report=xml
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage.xml
```

#### 7.2.2 Pre-commit Hooks

**Файл: `.pre-commit-config.yaml`**

```yaml
repos:
  - repo: https://github.com/psf/black
    rev: 23.3.0
    hooks:
      - id: black
        language_version: python3.11

  - repo: https://github.com/pycqa/flake8
    rev: 6.0.0
    hooks:
      - id: flake8

  - repo: https://github.com/pre-commit/mirrors-mypy
    rev: v1.3.0
    hooks:
      - id: mypy
        additional_dependencies: [django-stubs, djangorestframework-stubs]

  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.4.0
    hooks:
      - id: trailing-whitespace
      - id: end-of-file-fixer
      - id: check-yaml
      - id: check-added-large-files
```

#### 7.2.3 Dockerfile (опционально, для Phase 1)

**Файл: `Dockerfile`**

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Установка зависимостей
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Копирование кода
COPY . .

# Запуск
CMD ["gunicorn", "config.wsgi:application", "--bind", "0.0.0.0:8000"]
```

### 7.3 Acceptance Criteria

- ✅ CI pipeline запускается на push/PR
- ✅ Линтеры проверяют код (black, flake8, mypy)
- ✅ Тесты запускаются автоматически
- ✅ Покрытие кода рассчитывается
- ✅ Pre-commit hooks настроены
- ✅ Dockerfile создан (опционально)

### 7.4 Тесты

**Smoke тесты:**
- CI pipeline успешно проходит
- Все проверки проходят

---

## 8) Задача 7: Окружения dev/stage/prod

### 8.1 Цель
Настроить конфигурации для трёх окружений: development, staging, production.

### 8.2 Требования

#### 8.2.1 Settings по окружениям

**Файл: `config/settings/development.py`**

```python
from .base import *

DEBUG = True
ALLOWED_HOSTS = ['localhost', '127.0.0.1', '0.0.0.0']

# Database
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': env('DB_NAME', default='psychology_dev'),
        'USER': env('DB_USER', default='postgres'),
        'PASSWORD': env('DB_PASSWORD', default='postgres'),
        'HOST': env('DB_HOST', default='localhost'),
        'PORT': env('DB_PORT', default='5432'),
    }
}

# CORS для разработки
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

# Email (консоль для dev)
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

# Logging
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'DEBUG',
    },
}
```

**Файл: `config/settings/staging.py`**

```python
from .base import *

DEBUG = False
ALLOWED_HOSTS = env.list('ALLOWED_HOSTS', default=['staging.example.com'])

# Database
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': env('DB_NAME'),
        'USER': env('DB_USER'),
        'PASSWORD': env('DB_PASSWORD'),
        'HOST': env('DB_HOST'),
        'PORT': env('DB_PORT', default='5432'),
        'OPTIONS': {
            'sslmode': 'require',
        },
    }
}

# Security
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True

# Logging (структурированное)
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'json': {
            'format': '{"timestamp": "%(asctime)s", "level": "%(levelname)s", "message": "%(message)s"}',
        },
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'json',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'INFO',
    },
}
```

**Файл: `config/settings/production.py`**

```python
from .base import *

DEBUG = False
ALLOWED_HOSTS = env.list('ALLOWED_HOSTS')

# Database
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': env('DB_NAME'),
        'USER': env('DB_USER'),
        'PASSWORD': env('DB_PASSWORD'),
        'HOST': env('DB_HOST'),
        'PORT': env('DB_PORT', default='5432'),
        'OPTIONS': {
            'sslmode': 'require',
            'connect_timeout': 10,
        },
        'CONN_MAX_AGE': 600,  # Connection pooling
    }
}

# Security
SECURE_SSL_REDIRECT = True
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_BROWSER_XSS_FILTER = True
X_FRAME_OPTIONS = 'DENY'

# Static files (через CDN или S3 в будущем)
STATIC_ROOT = '/var/www/static/'
MEDIA_ROOT = '/var/www/media/'

# Logging (production)
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'json': {
            '()': 'pythonjsonlogger.jsonlogger.JsonFormatter',
            'format': '%(asctime)s %(name)s %(levelname)s %(message)s',
        },
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'json',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'INFO',
    },
}
```

#### 8.2.2 Environment Variables

**Файл: `.env.example`**

```bash
# Django
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database
DB_NAME=psychology_dev
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432

# Security
SECURE_SSL_REDIRECT=False
SESSION_COOKIE_SECURE=False
CSRF_COOKIE_SECURE=False

# Email (для production)
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@example.com
EMAIL_HOST_PASSWORD=your-password

# JWT
JWT_SECRET_KEY=your-jwt-secret-key
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_LIFETIME=900  # 15 минут
JWT_REFRESH_TOKEN_LIFETIME=604800  # 7 дней
```

#### 8.2.3 Управление окружениями

**Файл: `manage.py`**

```python
#!/usr/bin/env python
import os
import sys

if __name__ == '__main__':
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
    
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)
```

**Переключение окружений:**
```bash
# Development (по умолчанию)
python manage.py runserver

# Staging
DJANGO_SETTINGS_MODULE=config.settings.staging python manage.py runserver

# Production
DJANGO_SETTINGS_MODULE=config.settings.production python manage.py runserver
```

### 8.3 Acceptance Criteria

- ✅ Settings разделены по окружениям (development, staging, production)
- ✅ `.env.example` содержит все необходимые переменные
- ✅ Security настройки для production (HTTPS, HSTS, secure cookies)
- ✅ Logging настроен для каждого окружения
- ✅ Database настройки для каждого окружения
- ✅ Тесты проходят во всех окружениях

### 8.4 Тесты

**Smoke тесты:**
- Запуск сервера в каждом окружении
- Проверка настроек безопасности

---

## 9) Зависимости между задачами

```
Задача 1 (Django проект)
    ↓
Задача 2 (PostgreSQL + миграции)
    ↓
Задача 3 (RBAC + сессии)
    ↓
Задача 4 (Медиа-статика)
    ↓
Задача 5 (Аудит-лог)
    ↓
Задача 6 (CI/CD)
    ↓
Задача 7 (Окружения)
```

**Параллельная работа:**
- Задачи 4 и 5 могут выполняться параллельно после задачи 3
- Задача 6 может настраиваться параллельно с задачами 3-5
- Задача 7 настраивается вместе с задачами 1-2

---

## 10) Критерии готовности Phase 1

### 10.1 Definition of Done

- ✅ Все 7 задач выполнены
- ✅ Код соответствует Clean Architecture + DDD
- ✅ Unit тесты написаны (покрытие ≥80% для Domain и Application слоёв)
- ✅ Integration тесты написаны (Repository, Middleware)
- ✅ Code review пройден
- ✅ Документация обновлена (README.md, .env.example)
- ✅ CI/CD pipeline проходит
- ✅ Нет критичных багов

### 10.2 Checklist перед завершением Phase 1

- [ ] Структура проекта создана
- [ ] PostgreSQL подключена и миграции применены
- [ ] RBAC система работает (4 роли)
- [ ] Аутентификация и сессии работают
- [ ] Медиа-статика настроена
- [ ] Аудит-лог работает
- [ ] CI/CD pipeline настроен
- [ ] Окружения dev/stage/prod настроены
- [ ] Все тесты проходят
- [ ] Документация готова

---

## 11) Риски и митигация

### Риск 1: Сложность адаптации Django под Clean Architecture
**Митигация:** Чёткая структура проекта, проверка зависимостей линтерами, code review

### Риск 2: Задержки в настройке CI/CD
**Митигация:** Начать настройку CI/CD параллельно с разработкой, использовать простые решения для начала

### Риск 3: Проблемы с миграциями БД
**Митигация:** Тестирование миграций на каждом этапе, резервные копии БД

---

## 12) Следующие шаги после Phase 1

1. **Phase 2:** Domain Layer Implementation (полная реализация всех bounded contexts)
2. **Phase 3:** Infrastructure Layer Implementation (внешние интеграции)
3. **Phase 4:** Application Layer (Use Cases)

---

**Версия:** v1.0  
**Последнее обновление:** 2026-01-26  
**Статус:** ✅ Готово к разработке
