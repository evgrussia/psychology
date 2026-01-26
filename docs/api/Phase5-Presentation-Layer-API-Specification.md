# Техническая спецификация Phase 5: Presentation Layer (API)

**Версия:** v1.0  
**Дата:** 2026-01-26  
**Статус:** Спецификация для разработки  
**Основано на:** Development-Phase-Plan.md, Domain-Model-Specification.md, api-contracts.md, security-requirements.md, NFR-SLO-SLI-Performance-Security-Scalability.md

---

## 1) Назначение документа

Этот документ описывает **максимально подробную техническую спецификацию** для реализации Presentation Layer (REST API) проекта «Эмоциональный баланс» в рамках Phase 5.

**Цель Phase 5:** Реализовать REST API для всех доменов системы, обеспечив:
- Полное покрытие всех Use Cases из Application Layer
- Соответствие Clean Architecture принципам
- Безопасность и валидацию на уровне API
- Документацию (OpenAPI/Swagger)
- Готовность к интеграции с Frontend

**Входные артефакты:**
- ✅ Application Layer (Use Cases) — Phase 4
- ✅ Infrastructure Layer (Repositories, Integrations) — Phase 3
- ✅ Domain Layer (Aggregates, Entities, Value Objects) — Phase 2
- ✅ `docs/api/api-contracts.md` — контракты API
- ✅ `docs/security/security-requirements.md` — требования безопасности
- ✅ `docs/NFR-SLO-SLI-Performance-Security-Scalability.md` — NFR требования

---

## 2) Технологический стек

### 2.1 Основные библиотеки

```python
# requirements.txt (API dependencies)
django>=4.2,<5.0
djangorestframework>=3.14.0
djangorestframework-simplejwt>=5.3.0  # JWT authentication
django-cors-headers>=4.3.0  # CORS
drf-spectacular>=0.26.0  # OpenAPI/Swagger
django-filter>=23.3  # Filtering
django-ratelimit>=4.1.0  # Rate limiting
```

### 2.2 Структура проекта (Clean Architecture)

```
backend/
├── config/
│   ├── settings/
│   │   ├── base.py
│   │   ├── development.py
│   │   ├── production.py
│   │   └── testing.py
│   └── urls.py
│
├── presentation/                    # Presentation Layer
│   ├── api/
│   │   ├── __init__.py
│   │   ├── v1/
│   │   │   ├── __init__.py
│   │   │   ├── urls.py              # API routing
│   │   │   ├── views/               # ViewSets/APIViews
│   │   │   │   ├── __init__.py
│   │   │   │   ├── auth.py
│   │   │   │   ├── booking.py
│   │   │   │   ├── interactive.py
│   │   │   │   ├── content.py
│   │   │   │   ├── cabinet.py
│   │   │   │   ├── payments.py
│   │   │   │   ├── moderation.py
│   │   │   │   ├── admin.py
│   │   │   │   └── webhooks.py
│   │   │   ├── serializers/         # DTOs (Data Transfer Objects)
│   │   │   │   ├── __init__.py
│   │   │   │   ├── auth.py
│   │   │   │   ├── booking.py
│   │   │   │   ├── interactive.py
│   │   │   │   ├── content.py
│   │   │   │   ├── cabinet.py
│   │   │   │   ├── payments.py
│   │   │   │   ├── moderation.py
│   │   │   │   └── admin.py
│   │   │   ├── permissions.py       # Custom permissions
│   │   │   ├── authentication.py   # Custom authentication
│   │   │   ├── pagination.py       # Custom pagination
│   │   │   ├── filters.py          # Custom filters
│   │   │   ├── exceptions.py       # Custom exception handlers
│   │   │   └── throttling.py       # Rate limiting
│   │   └── middleware/              # Custom middleware (optional)
│   │       ├── request_id.py       # Request ID tracking
│   │       └── logging.py           # Request/response logging
│   └── admin/                       # Django Admin (optional)
│
├── application/                     # Application Layer (Use Cases)
│   ├── booking/
│   │   ├── use_cases.py
│   │   └── dto.py
│   └── ...
│
├── domain/                         # Domain Layer
│   └── ...
│
└── infrastructure/                 # Infrastructure Layer
    └── ...
```

---

## 3) Настройка Django REST Framework

### 3.1 Базовые настройки DRF

```python
# config/settings/base.py

INSTALLED_APPS = [
    # ...
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    'drf_spectacular',
    'django_filters',
    # ...
]

# Django REST Framework
REST_FRAMEWORK = {
    # Default settings
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    
    # Pagination
    'DEFAULT_PAGINATION_CLASS': 'presentation.api.v1.pagination.StandardResultsSetPagination',
    'PAGE_SIZE': 20,
    
    # Filtering
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
    
    # Rendering/Parsing
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
    ],
    'DEFAULT_PARSER_CLASSES': [
        'rest_framework.parsers.JSONParser',
        'rest_framework.parsers.FormParser',
        'rest_framework.parsers.MultiPartParser',
    ],
    
    # Exception handling
    'EXCEPTION_HANDLER': 'presentation.api.v1.exceptions.custom_exception_handler',
    
    # Throttling
    'DEFAULT_THROTTLE_CLASSES': [
        'presentation.api.v1.throttling.PublicEndpointThrottle',
    ],
    'DEFAULT_THROTTLE_RATES': {
        'public': '100/minute',
        'auth': '10/minute',
        'authenticated': '1000/minute',
        'admin': '5000/minute',
    },
    
    # OpenAPI/Swagger
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
}

# JWT Settings
from datetime import timedelta

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=15),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'UPDATE_LAST_LOGIN': True,
    
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'VERIFYING_KEY': None,
    'AUDIENCE': None,
    'ISSUER': 'emotional-balance-api',
    
    'AUTH_HEADER_TYPES': ('Bearer',),
    'AUTH_HEADER_NAME': 'HTTP_AUTHORIZATION',
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
    
    'AUTH_TOKEN_CLASSES': ('rest_framework_simplejwt.tokens.AccessToken',),
    'TOKEN_TYPE_CLAIM': 'token_type',
    
    'JTI_CLAIM': 'jti',
    
    'SLIDING_TOKEN_REFRESH_EXP_CLAIM': 'refresh_exp',
    'SLIDING_TOKEN_LIFETIME': timedelta(minutes=5),
    'SLIDING_TOKEN_REFRESH_LIFETIME': timedelta(days=1),
}

# CORS Settings
CORS_ALLOWED_ORIGINS = [
    "https://emotional-balance.ru",
    "https://www.emotional-balance.ru",
]

CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
    'x-request-id',
]

# OpenAPI/Swagger
SPECTACULAR_SETTINGS = {
    'TITLE': 'Эмоциональный баланс API',
    'DESCRIPTION': 'REST API для платформы психологической поддержки',
    'VERSION': '1.0.0',
    'SERVE_INCLUDE_SCHEMA': False,
    'SCHEMA_PATH_PREFIX': '/api/v1',
    'COMPONENT_SPLIT_REQUEST': True,
    'COMPONENT_NO_READ_ONLY_REQUIRED': True,
}
```

### 3.2 URL Routing

```python
# config/urls.py

from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView,
)

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # API v1
    path('api/v1/', include('presentation.api.v1.urls')),
    
    # OpenAPI/Swagger
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
]
```

```python
# presentation/api/v1/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    auth,
    booking,
    interactive,
    content,
    cabinet,
    payments,
    moderation,
    admin,
    webhooks,
)

router = DefaultRouter()

# Auth
router.register(r'auth/register', auth.RegisterViewSet, basename='register')
router.register(r'auth/login', auth.LoginViewSet, basename='login')

# Booking
router.register(r'booking/services', booking.ServiceViewSet, basename='service')
router.register(r'booking/appointments', booking.AppointmentViewSet, basename='appointment')
router.register(r'booking/slots', booking.SlotViewSet, basename='slot')

# Interactive
router.register(r'interactive/quizzes', interactive.QuizViewSet, basename='quiz')
router.register(r'interactive/runs', interactive.InteractiveRunViewSet, basename='interactive-run')
router.register(r'interactive/diaries', interactive.DiaryViewSet, basename='diary')

# Content
router.register(r'content/articles', content.ArticleViewSet, basename='article')
router.register(r'content/resources', content.ResourceViewSet, basename='resource')

# Client Cabinet
router.register(r'cabinet/appointments', cabinet.CabinetAppointmentViewSet, basename='cabinet-appointment')
router.register(r'cabinet/diaries', cabinet.CabinetDiaryViewSet, basename='cabinet-diary')
router.register(r'cabinet/exports', cabinet.ExportViewSet, basename='export')

# Payments
router.register(r'payments', payments.PaymentViewSet, basename='payment')

# Moderation (UGC)
router.register(r'moderation/questions', moderation.QuestionViewSet, basename='question')

# Admin
router.register(r'admin/appointments', admin.AdminAppointmentViewSet, basename='admin-appointment')
router.register(r'admin/leads', admin.LeadViewSet, basename='admin-lead')
router.register(r'admin/content', admin.AdminContentViewSet, basename='admin-content')
router.register(r'admin/moderation', admin.AdminModerationViewSet, basename='admin-moderation')

urlpatterns = [
    path('', include(router.urls)),
    
    # Auth endpoints (non-viewset)
    path('auth/refresh/', auth.RefreshTokenView.as_view(), name='token-refresh'),
    path('auth/logout/', auth.LogoutView.as_view(), name='token-logout'),
    
    # Webhooks
    path('webhooks/yookassa/', webhooks.YooKassaWebhookView.as_view(), name='yookassa-webhook'),
    path('webhooks/telegram/', webhooks.TelegramWebhookView.as_view(), name='telegram-webhook'),
    
    # Special endpoints
    path('booking/services/<uuid:service_id>/slots/', booking.ServiceSlotsView.as_view(), name='service-slots'),
    path('interactive/quizzes/<slug:slug>/start/', interactive.StartQuizView.as_view(), name='quiz-start'),
    path('interactive/quizzes/<slug:slug>/submit/', interactive.SubmitQuizView.as_view(), name='quiz-submit'),
    path('cabinet/data/export/', cabinet.ExportDataView.as_view(), name='export-data'),
    path('cabinet/data/delete/', cabinet.DeleteDataView.as_view(), name='delete-data'),
]
```

---

## 4) Аутентификация и авторизация

### 4.1 Custom Authentication

```python
# presentation/api/v1/authentication.py

from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework.authentication import CSRFCheck
from django.conf import settings
from domain.identity.repositories import IUserRepository


class CustomJWTAuthentication(JWTAuthentication):
    """
    Custom JWT Authentication с дополнительной проверкой пользователя
    """
    
    def authenticate(self, request):
        header = self.get_header(request)
        if header is None:
            return None
        
        raw_token = self.get_raw_token(header)
        if raw_token is None:
            return None
        
        validated_token = self.get_validated_token(raw_token)
        user = self.get_user(validated_token)
        
        # Дополнительная проверка: пользователь активен
        if not user.is_active:
            raise InvalidToken('User is inactive')
        
        # Проверка блокировки
        if user.status == 'blocked':
            raise InvalidToken('User is blocked')
        
        return (user, validated_token)
```

### 4.2 Custom Permissions

```python
# presentation/api/v1/permissions.py

from rest_framework import permissions
from domain.identity.value_objects import Role


class IsOwner(permissions.BasePermission):
    """
    Разрешение только для Owner роли
    """
    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            request.user.has_role(Role.Owner)
        )


class IsOwnerOrAssistant(permissions.BasePermission):
    """
    Разрешение для Owner или Assistant
    """
    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            (request.user.has_role(Role.Owner) or request.user.has_role(Role.Assistant))
        )


class IsOwnerOrEditor(permissions.BasePermission):
    """
    Разрешение для Owner или Editor (контент)
    """
    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            (request.user.has_role(Role.Owner) or request.user.has_role(Role.Editor))
        )


class IsClientOrOwner(permissions.BasePermission):
    """
    Разрешение для Client (собственные данные) или Owner
    """
    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            (request.user.has_role(Role.Client) or request.user.has_role(Role.Owner))
        )
    
    def has_object_permission(self, request, view, obj):
        # Client может видеть только свои данные
        if request.user.has_role(Role.Client):
            return obj.user_id == request.user.id
        # Owner видит всё
        return request.user.has_role(Role.Owner)


class IsPublicOrAuthenticated(permissions.BasePermission):
    """
    Публичный доступ или для аутентифицированных пользователей
    """
    def has_permission(self, request, view):
        # GET запросы публичны
        if request.method in permissions.SAFE_METHODS:
            return True
        # POST/PUT/DELETE требуют аутентификации
        return request.user and request.user.is_authenticated


class HasConsent(permissions.BasePermission):
    """
    Проверка наличия согласия на обработку ПДн
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        from domain.identity.value_objects import ConsentType
        return request.user.has_active_consent(ConsentType.PersonalData)
```

### 4.3 Throttling (Rate Limiting)

```python
# presentation/api/v1/throttling.py

from rest_framework.throttling import UserRateThrottle, AnonRateThrottle


class PublicEndpointThrottle(AnonRateThrottle):
    """
    Rate limiting для публичных endpoints
    """
    rate = '100/minute'


class AuthEndpointThrottle(AnonRateThrottle):
    """
    Rate limiting для auth endpoints (защита от брутфорса)
    """
    rate = '10/minute'


class AuthenticatedThrottle(UserRateThrottle):
    """
    Rate limiting для аутентифицированных пользователей
    """
    rate = '1000/minute'


class AdminThrottle(UserRateThrottle):
    """
    Rate limiting для админки
    """
    rate = '5000/minute'
    
    def allow_request(self, request, view):
        # Только для админов
        if not request.user or not request.user.is_authenticated:
            return False
        
        from domain.identity.value_objects import Role
        if not (request.user.has_role(Role.Owner) or 
                request.user.has_role(Role.Assistant) or 
                request.user.has_role(Role.Editor)):
            return False
        
        return super().allow_request(request, view)
```

---

## 5) Pagination

```python
# presentation/api/v1/pagination.py

from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response


class StandardResultsSetPagination(PageNumberPagination):
    """
    Стандартная пагинация для списков
    """
    page_size = 20
    page_size_query_param = 'per_page'
    max_page_size = 100
    
    def get_paginated_response(self, data):
        return Response({
            'data': data,
            'pagination': {
                'page': self.page.number,
                'per_page': self.page.paginator.per_page,
                'total': self.page.paginator.count,
                'total_pages': self.page.paginator.num_pages,
                'has_next': self.page.has_next(),
                'has_previous': self.page.has_previous(),
            }
        })


class LargeResultsSetPagination(PageNumberPagination):
    """
    Пагинация для больших списков (админка)
    """
    page_size = 50
    page_size_query_param = 'per_page'
    max_page_size = 200
```

---

## 6) Exception Handling

```python
# presentation/api/v1/exceptions.py

from rest_framework.views import exception_handler
from rest_framework import status
from rest_framework.response import Response
from domain.shared.exceptions import DomainError
from application.shared.exceptions import ApplicationError
import logging

logger = logging.getLogger(__name__)


def custom_exception_handler(exc, context):
    """
    Кастомный обработчик исключений для единообразного формата ошибок
    """
    # Стандартная обработка DRF
    response = exception_handler(exc, context)
    
    if response is not None:
        # Форматируем ошибку DRF
        custom_response_data = {
            'error': {
                'code': _get_error_code(exc),
                'message': str(exc.detail) if hasattr(exc, 'detail') else str(exc),
                'details': _get_error_details(exc),
            }
        }
        response.data = custom_response_data
        return response
    
    # Обработка доменных исключений
    if isinstance(exc, DomainError):
        logger.warning(f"Domain error: {exc}", exc_info=True)
        return Response(
            {
                'error': {
                    'code': 'DOMAIN_ERROR',
                    'message': str(exc),
                    'details': [],
                }
            },
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Обработка исключений Application Layer
    if isinstance(exc, ApplicationError):
        logger.warning(f"Application error: {exc}", exc_info=True)
        return Response(
            {
                'error': {
                    'code': 'APPLICATION_ERROR',
                    'message': str(exc),
                    'details': [],
                }
            },
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Необработанное исключение
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return Response(
        {
            'error': {
                'code': 'INTERNAL_ERROR',
                'message': 'An internal error occurred',
                'details': [],
            }
        },
        status=status.HTTP_500_INTERNAL_SERVER_ERROR
    )


def _get_error_code(exc):
    """
    Получить код ошибки из исключения
    """
    error_code_map = {
        'validation_error': 'VALIDATION_ERROR',
        'not_authenticated': 'UNAUTHORIZED',
        'permission_denied': 'FORBIDDEN',
        'not_found': 'NOT_FOUND',
        'throttled': 'RATE_LIMIT_EXCEEDED',
    }
    
    if hasattr(exc, 'default_code'):
        return error_code_map.get(exc.default_code, 'ERROR')
    
    return 'ERROR'


def _get_error_details(exc):
    """
    Получить детали ошибки (для валидации)
    """
    if hasattr(exc, 'detail') and isinstance(exc.detail, dict):
        details = []
        for field, messages in exc.detail.items():
            if isinstance(messages, list):
                for message in messages:
                    details.append({
                        'field': field,
                        'message': str(message),
                    })
            else:
                details.append({
                    'field': field,
                    'message': str(messages),
                })
        return details
    
    return []
```

---

## 7) API Endpoints по доменам

### 7.1 Authentication Endpoints

#### 7.1.1 POST /api/v1/auth/register

**Описание:** Регистрация нового пользователя

**ViewSet:**

```python
# presentation/api/v1/views/auth.py

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from drf_spectacular.utils import extend_schema, OpenApiParameter
from application.identity.use_cases import RegisterUserUseCase
from application.identity.dto import RegisterUserDto
from .serializers import RegisterSerializer, AuthResponseSerializer


class RegisterViewSet(viewsets.ViewSet):
    """
    Регистрация пользователя
    """
    permission_classes = [AllowAny]
    throttle_classes = ['presentation.api.v1.throttling.AuthEndpointThrottle']
    
    @extend_schema(
        summary="Регистрация нового пользователя",
        request=RegisterSerializer,
        responses={201: AuthResponseSerializer},
    )
    @action(detail=False, methods=['post'])
    def create(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Вызов Use Case
        use_case = RegisterUserUseCase(
            user_repository=...,
            event_bus=...,
        )
        
        dto = RegisterUserDto(
            email=serializer.validated_data['email'],
            password=serializer.validated_data['password'],
            display_name=serializer.validated_data.get('display_name'),
            consents=serializer.validated_data.get('consents', {}),
        )
        
        result = use_case.execute(dto)
        
        # Формируем ответ
        response_serializer = AuthResponseSerializer(result)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)
```

**Serializer:**

```python
# presentation/api/v1/serializers/auth.py

from rest_framework import serializers
from drf_spectacular.utils import extend_schema_serializer


@extend_schema_serializer(
    examples=[
        {
            "email": "user@example.com",
            "password": "SecurePass123!",
            "display_name": "Иван Иванов",
            "consents": {
                "personal_data": True,
                "communications": False,
            }
        }
    ]
)
class RegisterSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    password = serializers.CharField(
        required=True,
        min_length=12,
        write_only=True,
        style={'input_type': 'password'},
    )
    display_name = serializers.CharField(
        required=False,
        max_length=255,
        allow_blank=True,
    )
    consents = serializers.DictField(
        required=False,
        child=serializers.BooleanField(),
    )
    
    def validate_password(self, value):
        # Дополнительная валидация пароля
        if len(value) < 12:
            raise serializers.ValidationError("Password must be at least 12 characters long")
        # Проверка сложности (опционально)
        return value


class AuthResponseSerializer(serializers.Serializer):
    user = serializers.DictField()
    token = serializers.CharField()
    refresh_token = serializers.CharField()
```

#### 7.1.2 POST /api/v1/auth/login

**Описание:** Авторизация пользователя

**ViewSet:**

```python
class LoginViewSet(viewsets.ViewSet):
    """
    Авторизация пользователя
    """
    permission_classes = [AllowAny]
    throttle_classes = ['presentation.api.v1.throttling.AuthEndpointThrottle']
    
    @extend_schema(
        summary="Авторизация пользователя",
        request=LoginSerializer,
        responses={200: AuthResponseSerializer},
    )
    @action(detail=False, methods=['post'])
    def create(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Вызов Use Case
        use_case = LoginUserUseCase(
            user_repository=...,
            password_service=...,
        )
        
        dto = LoginUserDto(
            email=serializer.validated_data['email'],
            password=serializer.validated_data['password'],
        )
        
        result = use_case.execute(dto)
        
        response_serializer = AuthResponseSerializer(result)
        return Response(response_serializer.data, status=status.HTTP_200_OK)
```

#### 7.1.3 POST /api/v1/auth/refresh

**Описание:** Обновление access token

**View:**

```python
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework_simplejwt.serializers import TokenRefreshSerializer


class RefreshTokenView(TokenRefreshView):
    """
    Обновление access token
    """
    serializer_class = TokenRefreshSerializer
    permission_classes = [AllowAny]
    
    @extend_schema(
        summary="Обновление access token",
        request=TokenRefreshSerializer,
        responses={200: {'type': 'object', 'properties': {'token': {'type': 'string'}}}},
    )
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)
```

#### 7.1.4 POST /api/v1/auth/logout

**Описание:** Выход из системы (инвалидация токена)

**View:**

```python
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken


class LogoutView(APIView):
    """
    Выход из системы
    """
    permission_classes = [IsAuthenticated]
    
    @extend_schema(
        summary="Выход из системы",
        responses={204: None},
    )
    def post(self, request):
        try:
            refresh_token = request.data.get('refresh_token')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
        except Exception as e:
            # Игнорируем ошибки (токен уже невалиден)
            pass
        
        return Response(status=status.HTTP_204_NO_CONTENT)
```

---

### 7.2 Booking Endpoints

#### 7.2.1 GET /api/v1/booking/services

**Описание:** Список доступных услуг

**ViewSet:**

```python
# presentation/api/v1/views/booking.py

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsPublicOrAuthenticated
from drf_spectacular.utils import extend_schema
from application.booking.use_cases import ListServicesUseCase
from .serializers import ServiceSerializer, ServiceListSerializer


class ServiceViewSet(viewsets.ViewSet):
    """
    Управление услугами (booking)
    """
    permission_classes = [IsPublicOrAuthenticated]
    
    @extend_schema(
        summary="Список доступных услуг",
        responses={200: ServiceListSerializer},
    )
    @action(detail=False, methods=['get'])
    def list(self, request):
        use_case = ListServicesUseCase(
            service_repository=...,
        )
        
        services = use_case.execute()
        
        serializer = ServiceListSerializer(services, many=True)
        return Response({
            'data': serializer.data,
        })
    
    @extend_schema(
        summary="Получить услугу по ID",
        responses={200: ServiceSerializer},
    )
    @action(detail=True, methods=['get'])
    def retrieve(self, request, pk=None):
        use_case = GetServiceUseCase(
            service_repository=...,
        )
        
        service = use_case.execute(service_id=pk)
        
        if not service:
            return Response(
                {'error': {'code': 'NOT_FOUND', 'message': 'Service not found'}},
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = ServiceSerializer(service)
        return Response({'data': serializer.data})
```

**Serializer:**

```python
# presentation/api/v1/serializers/booking.py

from rest_framework import serializers


class ServiceSerializer(serializers.Serializer):
    id = serializers.UUIDField()
    slug = serializers.SlugField()
    title = serializers.CharField()
    description = serializers.CharField(allow_blank=True)
    duration_minutes = serializers.IntegerField()
    price_amount = serializers.DecimalField(max_digits=10, decimal_places=2)
    deposit_amount = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        allow_null=True,
    )
    format = serializers.ChoiceField(choices=['online', 'offline', 'hybrid'])
    cancel_free_hours = serializers.IntegerField()
    cancel_partial_hours = serializers.IntegerField()
    reschedule_min_hours = serializers.IntegerField()


class ServiceListSerializer(ServiceSerializer):
    # Упрощённая версия для списка
    pass
```

#### 7.2.2 GET /api/v1/booking/services/:id/slots

**Описание:** Получить доступные слоты для услуги

**View:**

```python
class ServiceSlotsView(APIView):
    """
    Получить доступные слоты для услуги
    """
    permission_classes = [IsPublicOrAuthenticated]
    
    @extend_schema(
        summary="Получить доступные слоты",
        parameters=[
            OpenApiParameter(
                'date_from',
                type=str,
                location=OpenApiParameter.QUERY,
                description='Начало периода (ISO8601)',
            ),
            OpenApiParameter(
                'date_to',
                type=str,
                location=OpenApiParameter.QUERY,
                description='Конец периода (ISO8601)',
            ),
            OpenApiParameter(
                'timezone',
                type=str,
                location=OpenApiParameter.QUERY,
                description='Таймзона пользователя (например, Europe/Moscow)',
            ),
        ],
        responses={200: SlotListSerializer},
    )
    def get(self, request, service_id):
        date_from = request.query_params.get('date_from')
        date_to = request.query_params.get('date_to')
        timezone = request.query_params.get('timezone', 'Europe/Moscow')
        
        use_case = GetAvailableSlotsUseCase(
            service_repository=...,
            appointment_repository=...,
            google_calendar_service=...,
        )
        
        dto = GetAvailableSlotsDto(
            service_id=service_id,
            date_from=date_from,
            date_to=date_to,
            timezone=timezone,
        )
        
        slots = use_case.execute(dto)
        
        serializer = SlotListSerializer(slots, many=True)
        return Response({'data': serializer.data})
```

#### 7.2.3 POST /api/v1/booking/appointments

**Описание:** Создать бронирование

**ViewSet:**

```python
class AppointmentViewSet(viewsets.ViewSet):
    """
    Управление бронированиями
    """
    permission_classes = [IsAuthenticated, HasConsent]
    
    @extend_schema(
        summary="Создать бронирование",
        request=CreateAppointmentSerializer,
        responses={201: AppointmentSerializer},
    )
    @action(detail=False, methods=['post'])
    def create(self, request):
        serializer = CreateAppointmentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        use_case = BookAppointmentUseCase(
            appointment_repository=...,
            service_repository=...,
            user_repository=...,
            slot_availability_service=...,
            payment_service=...,
            event_bus=...,
        )
        
        dto = BookAppointmentDto(
            user_id=request.user.id,
            service_id=serializer.validated_data['service_id'],
            slot_id=serializer.validated_data['slot_id'],
            intake_form=serializer.validated_data.get('intake_form'),
            consents=serializer.validated_data.get('consents', {}),
            entry_point=serializer.validated_data.get('entry_point', 'web'),
            topic_code=serializer.validated_data.get('topic_code'),
            deep_link_id=serializer.validated_data.get('deep_link_id'),
            utm_params=serializer.validated_data.get('utm_params'),
        )
        
        result = use_case.execute(dto)
        
        response_serializer = AppointmentSerializer(result)
        return Response(
            {'data': response_serializer.data},
            status=status.HTTP_201_CREATED
        )
    
    @extend_schema(
        summary="Получить бронирование по ID",
        responses={200: AppointmentSerializer},
    )
    @action(detail=True, methods=['get'])
    def retrieve(self, request, pk=None):
        use_case = GetAppointmentUseCase(
            appointment_repository=...,
        )
        
        appointment = use_case.execute(
            appointment_id=pk,
            user_id=request.user.id,
        )
        
        if not appointment:
            return Response(
                {'error': {'code': 'NOT_FOUND', 'message': 'Appointment not found'}},
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = AppointmentSerializer(appointment)
        return Response({'data': serializer.data})
```

**Serializer:**

```python
class CreateAppointmentSerializer(serializers.Serializer):
    service_id = serializers.UUIDField(required=True)
    slot_id = serializers.UUIDField(required=True)
    intake_form = serializers.DictField(required=False, allow_null=True)
    consents = serializers.DictField(
        required=False,
        child=serializers.BooleanField(),
    )
    entry_point = serializers.CharField(required=False, default='web')
    topic_code = serializers.CharField(required=False, allow_null=True)
    deep_link_id = serializers.CharField(required=False, allow_null=True)
    utm_params = serializers.DictField(required=False, allow_null=True)


class AppointmentSerializer(serializers.Serializer):
    id = serializers.UUIDField()
    service = ServiceSerializer()
    slot = SlotSerializer()
    status = serializers.ChoiceField(
        choices=[
            'pending_payment',
            'confirmed',
            'canceled',
            'rescheduled',
            'completed',
            'no_show',
        ]
    )
    payment = PaymentInfoSerializer(allow_null=True)
    created_at = serializers.DateTimeField()
    updated_at = serializers.DateTimeField()
```

---

### 7.3 Interactive Endpoints

#### 7.3.1 GET /api/v1/interactive/quizzes

**Описание:** Список доступных квизов

**ViewSet:**

```python
# presentation/api/v1/views/interactive.py

class QuizViewSet(viewsets.ViewSet):
    """
    Управление квизами
    """
    permission_classes = [IsPublicOrAuthenticated]
    
    @extend_schema(
        summary="Список доступных квизов",
        responses={200: QuizListSerializer},
    )
    @action(detail=False, methods=['get'])
    def list(self, request):
        use_case = ListQuizzesUseCase(
            interactive_definition_repository=...,
        )
        
        quizzes = use_case.execute()
        
        serializer = QuizListSerializer(quizzes, many=True)
        return Response({'data': serializer.data})
```

#### 7.3.2 POST /api/v1/interactive/quizzes/:slug/start

**Описание:** Начать прохождение квиза

**View:**

```python
class StartQuizView(APIView):
    """
    Начать прохождение квиза
    """
    permission_classes = [IsPublicOrAuthenticated]
    
    @extend_schema(
        summary="Начать прохождение квиза",
        request=None,
        responses={201: QuizRunSerializer},
    )
    def post(self, request, slug):
        use_case = StartInteractiveRunUseCase(
            interactive_definition_repository=...,
            interactive_run_repository=...,
            event_bus=...,
        )
        
        dto = StartInteractiveRunDto(
            definition_slug=slug,
            user_id=request.user.id if request.user.is_authenticated else None,
            anonymous_id=request.session.get('anonymous_id'),
            entry_point=request.query_params.get('entry_point', 'web'),
            topic_code=request.query_params.get('topic_code'),
            deep_link_id=request.query_params.get('dl'),
        )
        
        result = use_case.execute(dto)
        
        serializer = QuizRunSerializer(result)
        return Response(
            {'data': serializer.data},
            status=status.HTTP_201_CREATED
        )
```

#### 7.3.3 POST /api/v1/interactive/quizzes/:slug/submit

**Описание:** Отправить ответы квиза

**View:**

```python
class SubmitQuizView(APIView):
    """
    Отправить ответы квиза
    """
    permission_classes = [IsPublicOrAuthenticated]
    
    @extend_schema(
        summary="Отправить ответы квиза",
        request=SubmitQuizSerializer,
        responses={200: QuizResultSerializer},
    )
    def post(self, request, slug):
        serializer = SubmitQuizSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        use_case = CompleteInteractiveRunUseCase(
            interactive_run_repository=...,
            interactive_definition_repository=...,
            event_bus=...,
        )
        
        dto = CompleteInteractiveRunDto(
            run_id=serializer.validated_data['run_id'],
            answers=serializer.validated_data['answers'],
        )
        
        result = use_case.execute(dto)
        
        response_serializer = QuizResultSerializer(result)
        return Response({'data': response_serializer.data})
```

**Serializer:**

```python
# presentation/api/v1/serializers/interactive.py

class SubmitQuizSerializer(serializers.Serializer):
    run_id = serializers.UUIDField(required=True)
    answers = serializers.ListField(
        child=serializers.DictField(),
        required=True,
    )


class QuizResultSerializer(serializers.Serializer):
    run_id = serializers.UUIDField()
    result = serializers.DictField()  # {level, profile, recommendations}
    deep_link_id = serializers.CharField(allow_null=True)
```

#### 7.3.4 GET /api/v1/interactive/diaries

**Описание:** Список записей дневника (только для авторизованного пользователя)

**ViewSet:**

```python
class DiaryViewSet(viewsets.ViewSet):
    """
    Управление дневниками
    """
    permission_classes = [IsAuthenticated, HasConsent]
    
    @extend_schema(
        summary="Список записей дневника",
        responses={200: DiaryListSerializer},
    )
    @action(detail=False, methods=['get'])
    def list(self, request):
        use_case = ListDiaryEntriesUseCase(
            diary_repository=...,
        )
        
        entries = use_case.execute(user_id=request.user.id)
        
        serializer = DiaryListSerializer(entries, many=True)
        return Response({'data': serializer.data})
    
    @extend_schema(
        summary="Создать запись дневника",
        request=CreateDiaryEntrySerializer,
        responses={201: DiaryEntrySerializer},
    )
    @action(detail=False, methods=['post'])
    def create(self, request):
        serializer = CreateDiaryEntrySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        use_case = CreateDiaryEntryUseCase(
            diary_repository=...,
            encryption_service=...,
        )
        
        dto = CreateDiaryEntryDto(
            user_id=request.user.id,
            type=serializer.validated_data['type'],
            content=serializer.validated_data['content'],
        )
        
        result = use_case.execute(dto)
        
        response_serializer = DiaryEntrySerializer(result)
        return Response(
            {'data': response_serializer.data},
            status=status.HTTP_201_CREATED
        )
```

---

### 7.4 Content Endpoints

#### 7.4.1 GET /api/v1/content/articles

**Описание:** Список статей блога

**ViewSet:**

```python
# presentation/api/v1/views/content.py

from rest_framework import filters
from django_filters.rest_framework import DjangoFilterBackend


class ArticleViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Управление статьями (публичный доступ)
    """
    permission_classes = [IsPublicOrAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'tags']
    search_fields = ['title', 'excerpt', 'content']
    ordering_fields = ['published_at', 'created_at']
    ordering = ['-published_at']
    
    @extend_schema(
        summary="Список статей",
        responses={200: ArticleListSerializer},
    )
    def list(self, request):
        use_case = ListArticlesUseCase(
            content_repository=...,
        )
        
        articles = use_case.execute(
            page=request.query_params.get('page', 1),
            per_page=request.query_params.get('per_page', 20),
            category=request.query_params.get('category'),
            tag=request.query_params.get('tag'),
            search=request.query_params.get('search'),
        )
        
        serializer = ArticleListSerializer(articles['items'], many=True)
        return Response({
            'data': serializer.data,
            'pagination': articles['pagination'],
        })
    
    @extend_schema(
        summary="Получить статью по slug",
        responses={200: ArticleSerializer},
    )
    def retrieve(self, request, pk=None):
        use_case = GetArticleUseCase(
            content_repository=...,
        )
        
        article = use_case.execute(slug=pk)
        
        if not article:
            return Response(
                {'error': {'code': 'NOT_FOUND', 'message': 'Article not found'}},
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = ArticleSerializer(article)
        return Response({'data': serializer.data})
```

---

### 7.5 Client Cabinet Endpoints

#### 7.5.1 GET /api/v1/cabinet/appointments

**Описание:** Список встреч клиента

**ViewSet:**

```python
# presentation/api/v1/views/cabinet.py

class CabinetAppointmentViewSet(viewsets.ViewSet):
    """
    Личный кабинет: встречи
    """
    permission_classes = [IsAuthenticated, HasConsent]
    
    @extend_schema(
        summary="Список встреч клиента",
        responses={200: AppointmentListSerializer},
    )
    @action(detail=False, methods=['get'])
    def list(self, request):
        use_case = ListClientAppointmentsUseCase(
            appointment_repository=...,
        )
        
        appointments = use_case.execute(user_id=request.user.id)
        
        serializer = AppointmentListSerializer(appointments, many=True)
        return Response({'data': serializer.data})
```

#### 7.5.2 POST /api/v1/cabinet/diaries/export

**Описание:** Экспорт дневников в PDF

**ViewSet:**

```python
class ExportViewSet(viewsets.ViewSet):
    """
    Экспорт данных
    """
    permission_classes = [IsAuthenticated, HasConsent]
    
    @extend_schema(
        summary="Экспорт дневников в PDF",
        request=ExportDiariesSerializer,
        responses={202: ExportStatusSerializer},
    )
    @action(detail=False, methods=['post'], url_path='diaries/export')
    def export_diaries(self, request):
        serializer = ExportDiariesSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        use_case = ExportDiariesUseCase(
            diary_repository=...,
            pdf_service=...,
        )
        
        dto = ExportDiariesDto(
            user_id=request.user.id,
            date_from=serializer.validated_data['date_from'],
            date_to=serializer.validated_data['date_to'],
            format=serializer.validated_data.get('format', 'pdf'),
        )
        
        result = use_case.execute(dto)
        
        response_serializer = ExportStatusSerializer(result)
        return Response(
            {'data': response_serializer.data},
            status=status.HTTP_202_ACCEPTED
        )
```

#### 7.5.3 DELETE /api/v1/cabinet/data

**Описание:** Удаление всех данных пользователя (GDPR/152-ФЗ)

**View:**

```python
class DeleteDataView(APIView):
    """
    Удаление всех данных пользователя
    """
    permission_classes = [IsAuthenticated]
    
    @extend_schema(
        summary="Удаление всех данных пользователя",
        responses={204: None},
    )
    def delete(self, request):
        use_case = DeleteUserDataUseCase(
            user_repository=...,
            appointment_repository=...,
            diary_repository=...,
            encryption_service=...,
        )
        
        use_case.execute(user_id=request.user.id)
        
        return Response(status=status.HTTP_204_NO_CONTENT)
```

---

### 7.6 Payments Endpoints

#### 7.6.1 POST /api/v1/webhooks/yookassa

**Описание:** Webhook от ЮKassa для статусов платежей

**View:**

```python
# presentation/api/v1/views/webhooks.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from drf_spectacular.utils import extend_schema
from application.payments.use_cases import ProcessPaymentWebhookUseCase


class YooKassaWebhookView(APIView):
    """
    Webhook от ЮKassa
    """
    permission_classes = [AllowAny]  # Проверка по подписи
    
    @extend_schema(
        summary="Webhook от ЮKassa",
        request=None,
        responses={200: None},
        exclude=True,  # Не показывать в Swagger
    )
    def post(self, request):
        # Валидация подписи
        signature = request.headers.get('X-YooMoney-Signature')
        if not self._validate_signature(request.body, signature):
            return Response(
                {'error': {'code': 'INVALID_SIGNATURE', 'message': 'Invalid signature'}},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        # Обработка webhook
        use_case = ProcessPaymentWebhookUseCase(
            payment_repository=...,
            appointment_repository=...,
            event_bus=...,
        )
        
        dto = ProcessPaymentWebhookDto(
            event_type=request.data.get('event'),
            payment_data=request.data.get('object', {}),
        )
        
        # Идемпотентная обработка
        try:
            use_case.execute(dto)
        except DuplicateWebhookError:
            # Уже обработано
            pass
        
        return Response(status=status.HTTP_200_OK)
    
    def _validate_signature(self, body, signature):
        # Реализация проверки подписи ЮKassa
        # ...
        return True
```

---

### 7.7 Admin Endpoints

#### 7.7.1 GET /api/v1/admin/appointments

**Описание:** Список всех бронирований (для админа)

**ViewSet:**

```python
# presentation/api/v1/views/admin.py

class AdminAppointmentViewSet(viewsets.ViewSet):
    """
    Админка: управление бронированиями
    """
    permission_classes = [IsAuthenticated, IsOwnerOrAssistant]
    throttle_classes = ['presentation.api.v1.throttling.AdminThrottle']
    pagination_class = LargeResultsSetPagination
    
    @extend_schema(
        summary="Список всех бронирований",
        responses={200: AdminAppointmentListSerializer},
    )
    @action(detail=False, methods=['get'])
    def list(self, request):
        use_case = ListAllAppointmentsUseCase(
            appointment_repository=...,
        )
        
        appointments = use_case.execute(
            page=request.query_params.get('page', 1),
            per_page=request.query_params.get('per_page', 50),
            status=request.query_params.get('status'),
            date_from=request.query_params.get('date_from'),
            date_to=request.query_params.get('date_to'),
        )
        
        serializer = AdminAppointmentListSerializer(appointments['items'], many=True)
        return Response({
            'data': serializer.data,
            'pagination': appointments['pagination'],
        })
```

#### 7.7.2 GET /api/v1/admin/leads

**Описание:** Список лидов (CRM)

**ViewSet:**

```python
class LeadViewSet(viewsets.ViewSet):
    """
    Админка: управление лидами
    """
    permission_classes = [IsAuthenticated, IsOwnerOrAssistant]
    throttle_classes = ['presentation.api.v1.throttling.AdminThrottle']
    
    @extend_schema(
        summary="Список лидов",
        responses={200: LeadListSerializer},
    )
    @action(detail=False, methods=['get'])
    def list(self, request):
        use_case = ListLeadsUseCase(
            lead_repository=...,
        )
        
        leads = use_case.execute(
            page=request.query_params.get('page', 1),
            per_page=request.query_params.get('per_page', 50),
            status=request.query_params.get('status'),
            source=request.query_params.get('source'),
        )
        
        serializer = LeadListSerializer(leads['items'], many=True)
        return Response({
            'data': serializer.data,
            'pagination': leads['pagination'],
        })
```

---

### 7.8 Moderation Endpoints

#### 7.8.1 POST /api/v1/moderation/questions

**Описание:** Отправить анонимный вопрос

**ViewSet:**

```python
# presentation/api/v1/views/moderation.py

class QuestionViewSet(viewsets.ViewSet):
    """
    Управление вопросами (UGC)
    """
    permission_classes = [IsPublicOrAuthenticated]
    
    @extend_schema(
        summary="Отправить анонимный вопрос",
        request=SubmitQuestionSerializer,
        responses={201: QuestionSerializer},
    )
    @action(detail=False, methods=['post'])
    def create(self, request):
        serializer = SubmitQuestionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Предмодерация (кризисные слова, PII)
        content = serializer.validated_data['content']
        if self._has_crisis_indicators(content):
            return Response(
                {
                    'error': {
                        'code': 'CRISIS_DETECTED',
                        'message': 'Crisis indicators detected. Please contact emergency services.',
                        'details': [{
                            'field': 'content',
                            'message': 'Emergency contact information provided',
                        }],
                    }
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        use_case = SubmitQuestionUseCase(
            moderation_repository=...,
            encryption_service=...,
            event_bus=...,
        )
        
        dto = SubmitQuestionDto(
            user_id=request.user.id if request.user.is_authenticated else None,
            content=content,
        )
        
        result = use_case.execute(dto)
        
        response_serializer = QuestionSerializer(result)
        return Response(
            {'data': response_serializer.data},
            status=status.HTTP_201_CREATED
        )
    
    def _has_crisis_indicators(self, content):
        # Простая проверка кризисных слов (в реальности - более сложная логика)
        crisis_keywords = ['суицид', 'самоубийство', 'убить себя']
        content_lower = content.lower()
        return any(keyword in content_lower for keyword in crisis_keywords)
```

---

## 8) Валидация запросов

### 8.1 Custom Validators

```python
# presentation/api/v1/validators.py

from rest_framework import serializers
from datetime import datetime, timedelta
import pytz


class TimezoneValidator:
    """
    Валидатор таймзоны (IANA)
    """
    def __call__(self, value):
        try:
            pytz.timezone(value)
        except pytz.exceptions.UnknownTimeZoneError:
            raise serializers.ValidationError(f"Invalid timezone: {value}")


class FutureDateValidator:
    """
    Валидатор даты в будущем
    """
    def __call__(self, value):
        if value < datetime.now(value.tzinfo):
            raise serializers.ValidationError("Date must be in the future")


class SlotDurationValidator:
    """
    Валидатор длительности слота
    """
    def __init__(self, min_minutes=15, max_minutes=480):
        self.min_minutes = min_minutes
        self.max_minutes = max_minutes
    
    def __call__(self, value):
        start, end = value['start_at'], value['end_at']
        duration = (end - start).total_seconds() / 60
        
        if duration < self.min_minutes:
            raise serializers.ValidationError(
                f"Slot duration must be at least {self.min_minutes} minutes"
            )
        
        if duration > self.max_minutes:
            raise serializers.ValidationError(
                f"Slot duration must not exceed {self.max_minutes} minutes"
            )
```

### 8.2 Использование валидаторов

```python
class CreateAppointmentSerializer(serializers.Serializer):
    service_id = serializers.UUIDField(required=True)
    slot_id = serializers.UUIDField(required=True)
    timezone = serializers.CharField(
        required=False,
        default='Europe/Moscow',
        validators=[TimezoneValidator()],
    )
    # ...
```

---

## 9) Middleware (опционально)

### 9.1 Request ID Tracking

```python
# presentation/api/middleware/request_id.py

import uuid
from django.utils.deprecation import MiddlewareMixin


class RequestIDMiddleware(MiddlewareMixin):
    """
    Добавляет уникальный ID к каждому запросу для трейсинга
    """
    def process_request(self, request):
        request_id = request.headers.get('X-Request-ID')
        if not request_id:
            request_id = str(uuid.uuid4())
        request.request_id = request_id
    
    def process_response(self, request, response):
        response['X-Request-ID'] = getattr(request, 'request_id', None)
        return response
```

### 9.2 Request/Response Logging

```python
# presentation/api/middleware/logging.py

import logging
import json
from django.utils.deprecation import MiddlewareMixin

logger = logging.getLogger('api')


class APILoggingMiddleware(MiddlewareMixin):
    """
    Логирование запросов и ответов (без чувствительных данных)
    """
    def process_request(self, request):
        # Логируем только метаданные
        log_data = {
            'method': request.method,
            'path': request.path,
            'query_params': dict(request.query_params),
            'user_id': request.user.id if request.user.is_authenticated else None,
            'request_id': getattr(request, 'request_id', None),
        }
        
        # НЕ логируем body (может содержать PII)
        logger.info(f"API Request: {json.dumps(log_data)}")
    
    def process_response(self, request, response):
        log_data = {
            'method': request.method,
            'path': request.path,
            'status_code': response.status_code,
            'request_id': getattr(request, 'request_id', None),
        }
        
        logger.info(f"API Response: {json.dumps(log_data)}")
        return response
```

---

## 10) Тестирование

### 10.1 Unit Tests для Serializers

```python
# tests/presentation/api/v1/serializers/test_booking.py

from django.test import TestCase
from rest_framework.exceptions import ValidationError
from presentation.api.v1.serializers.booking import CreateAppointmentSerializer


class CreateAppointmentSerializerTest(TestCase):
    def test_valid_data(self):
        serializer = CreateAppointmentSerializer(data={
            'service_id': '123e4567-e89b-12d3-a456-426614174000',
            'slot_id': '123e4567-e89b-12d3-a456-426614174001',
        })
        self.assertTrue(serializer.is_valid())
    
    def test_missing_required_fields(self):
        serializer = CreateAppointmentSerializer(data={})
        self.assertFalse(serializer.is_valid())
        self.assertIn('service_id', serializer.errors)
        self.assertIn('slot_id', serializer.errors)
```

### 10.2 Integration Tests для ViewSets

```python
# tests/presentation/api/v1/views/test_booking.py

from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from domain.identity.entities import User
from domain.identity.value_objects import Role


class BookingAPITest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.create(
            email='user@example.com',
            phone=None,
            telegram_user_id=None,
        )
        self.user.assign_role(Role.Client)
        # ... сохранение пользователя
    
    def test_list_services(self):
        response = self.client.get('/api/v1/booking/services/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('data', response.data)
    
    def test_create_appointment_requires_auth(self):
        response = self.client.post('/api/v1/booking/appointments/', {
            'service_id': '...',
            'slot_id': '...',
        })
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_create_appointment_with_auth(self):
        # Получаем токен
        token = self._get_auth_token()
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        
        response = self.client.post('/api/v1/booking/appointments/', {
            'service_id': '...',
            'slot_id': '...',
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
    
    def _get_auth_token(self):
        # Получение JWT токена для тестов
        # ...
        pass
```

---

## 11) Документация API (OpenAPI/Swagger)

### 11.1 Настройка drf-spectacular

Документация автоматически генерируется на основе:
- ViewSets и их методы
- Serializers
- `@extend_schema` декораторы

**Доступ:**
- Swagger UI: `https://api.domain.com/api/docs/`
- ReDoc: `https://api.domain.com/api/redoc/`
- OpenAPI Schema: `https://api.domain.com/api/schema/`

### 11.2 Примеры использования декораторов

```python
@extend_schema(
    summary="Создать бронирование",
    description="Создаёт новое бронирование для авторизованного пользователя",
    request=CreateAppointmentSerializer,
    responses={
        201: AppointmentSerializer,
        400: {'type': 'object', 'properties': {'error': {'type': 'object'}}},
        401: {'type': 'object', 'properties': {'error': {'type': 'object'}}},
    },
    tags=['Booking'],
)
def create(self, request):
    # ...
```

---

## 12) Checklist реализации

### 12.1 Настройка DRF
- [ ] Установка зависимостей
- [ ] Настройка REST_FRAMEWORK в settings
- [ ] Настройка JWT (SIMPLE_JWT)
- [ ] Настройка CORS
- [ ] Настройка OpenAPI/Swagger

### 12.2 Аутентификация и авторизация
- [ ] Custom JWT Authentication
- [ ] Custom Permissions (IsOwner, IsOwnerOrAssistant, etc.)
- [ ] Throttling classes
- [ ] Тесты авторизации

### 12.3 Endpoints по доменам
- [ ] Auth endpoints (register, login, refresh, logout)
- [ ] Booking endpoints (services, slots, appointments)
- [ ] Interactive endpoints (quizzes, runs, diaries)
- [ ] Content endpoints (articles, resources)
- [ ] Cabinet endpoints (appointments, diaries, export, delete)
- [ ] Payments endpoints (webhooks)
- [ ] Admin endpoints (appointments, leads, content, moderation)
- [ ] Moderation endpoints (questions)

### 12.4 Serializers
- [ ] Serializers для всех DTOs
- [ ] Валидация входных данных
- [ ] Валидаторы (timezone, dates, etc.)
- [ ] Тесты serializers

### 12.5 Обработка ошибок
- [ ] Custom exception handler
- [ ] Единый формат ошибок
- [ ] Логирование ошибок (без PII)

### 12.6 Документация
- [ ] OpenAPI schema generation
- [ ] Swagger UI доступен
- [ ] ReDoc доступен
- [ ] Примеры в документации

### 12.7 Тестирование
- [ ] Unit tests для serializers
- [ ] Integration tests для ViewSets
- [ ] Тесты авторизации
- [ ] Тесты валидации
- [ ] Тесты обработки ошибок

### 12.8 Безопасность
- [ ] Rate limiting настроен
- [ ] CORS настроен правильно
- [ ] Валидация входных данных
- [ ] Защита от SQL injection (Django ORM)
- [ ] Защита от XSS (сериализация)
- [ ] Аудит-лог критичных операций

---

## 13) Следующие шаги

После завершения Phase 5:

1. **Phase 6: Frontend Integration** — интеграция API с Frontend
2. **Phase 7: Integration & Testing** — интеграционное тестирование
3. **Phase 8: Deployment & Go Live** — деплой в production

---

**Версия:** v1.0  
**Последнее обновление:** 2026-01-26  
**Статус:** ✅ Спецификация готова для разработки
