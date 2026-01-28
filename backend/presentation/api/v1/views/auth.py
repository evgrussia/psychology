"""
Views для Authentication endpoints.
"""
import time
from uuid import UUID
from django.conf import settings
from django.core.cache import cache
from django.core.signing import TimestampSigner, SignatureExpired, BadSignature
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework_simplejwt.serializers import TokenRefreshSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from drf_spectacular.utils import extend_schema
from asgiref.sync import async_to_sync

from application.identity.use_cases.register_user import RegisterUserRequest
from application.identity.use_cases.grant_consent import GrantConsentRequest
from application.exceptions import NotFoundError, UnauthorizedError
from presentation.api.v1.serializers.auth import (
    RegisterSerializer,
    LoginSerializer,
    AuthResponseSerializer,
    LogoutSerializer,
    MfaVerifySerializer,
    MfaSetupResponseSerializer,
)
from presentation.api.v1.throttling import AuthEndpointThrottle
from presentation.api.v1.dependencies import (
    get_sync_user_repository,
    get_register_user_use_case,
    get_authenticate_user_use_case,
    get_grant_consent_use_case,
    get_password_service,
    get_setup_mfa_use_case,
    get_verify_mfa_use_case,
)
from infrastructure.identity.password_service import PasswordService

MFA_PENDING_COOKIE = "mfa_pending"
MFA_PENDING_MAX_AGE = 300  # 5 minutes

LOGIN_LOCKOUT_MAX_ATTEMPTS = 5
LOGIN_LOCKOUT_TTL_SECONDS = 900  # 15 minutes

# Ограничение одновременных сессий (P2-03)
CONCURRENT_SESSIONS_LIMIT = 5
USER_SESSIONS_CACHE_KEY_PREFIX = "user_sessions:"
USER_SESSIONS_CACHE_TTL = 60 * 60 * 24 * 7  # 7 дней (как refresh token)


def _get_user_sessions_key(user_id) -> str:
    return f"{USER_SESSIONS_CACHE_KEY_PREFIX}{user_id}"


def _add_session(user_id, jti: str) -> bool:
    """Добавить сессию (jti). Возвращает False если достигнут лимит."""
    key = _get_user_sessions_key(str(user_id))
    sessions = cache.get(key) or []
    if len(sessions) >= CONCURRENT_SESSIONS_LIMIT:
        return False
    sessions.append({"jti": jti, "created_at": time.time()})
    sessions.sort(key=lambda x: x["created_at"])
    if len(sessions) > CONCURRENT_SESSIONS_LIMIT:
        sessions = sessions[-CONCURRENT_SESSIONS_LIMIT:]
    cache.set(key, sessions, timeout=USER_SESSIONS_CACHE_TTL)
    return True


def _remove_session(user_id, jti: str) -> None:
    """Удалить сессию по jti (например при refresh rotation)."""
    key = _get_user_sessions_key(str(user_id))
    sessions = cache.get(key) or []
    sessions = [s for s in sessions if s.get("jti") != jti]
    cache.set(key, sessions, timeout=USER_SESSIONS_CACHE_TTL)


def _get_login_lockout_key(email: str) -> str:
    return f"login_attempts:{email.strip().lower()}"


def _check_login_locked(email: str):
    """Возвращает (locked, locked_until_ts)."""
    key = _get_login_lockout_key(email)
    data = cache.get(key)
    if not data:
        return False, None
    count = data.get("count", 0)
    locked_until = data.get("locked_until")
    if count >= LOGIN_LOCKOUT_MAX_ATTEMPTS and locked_until and time.time() < locked_until:
        return True, locked_until
    if locked_until and time.time() >= locked_until:
        cache.delete(key)
        return False, None
    return False, None


def _record_failed_login(email: str) -> None:
    key = _get_login_lockout_key(email)
    data = cache.get(key) or {"count": 0, "locked_until": None}
    data["count"] = data["count"] + 1
    if data["count"] >= LOGIN_LOCKOUT_MAX_ATTEMPTS:
        data["locked_until"] = time.time() + LOGIN_LOCKOUT_TTL_SECONDS
    cache.set(key, data, timeout=LOGIN_LOCKOUT_TTL_SECONDS)


def _clear_login_attempts(email: str) -> None:
    cache.delete(_get_login_lockout_key(email))


class RegisterViewSet(viewsets.ViewSet):
    """
    Регистрация пользователя.
    """
    permission_classes = [AllowAny]
    throttle_classes = [AuthEndpointThrottle]
    
    @extend_schema(
        summary="Регистрация нового пользователя",
        request=RegisterSerializer,
        responses={201: AuthResponseSerializer},
    )
    def create(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        use_case = get_register_user_use_case()
        
        register_request = RegisterUserRequest(
            email=serializer.validated_data['email'],
            display_name=serializer.validated_data.get('display_name'),
        )
        
        result = async_to_sync(use_case.execute)(register_request)
        
        password_service = get_password_service()
        password_hash = password_service.hash_password(serializer.validated_data['password'])
        user_repository = get_sync_user_repository()
        user_repository.set_password_hash(result.user_id, password_hash)
        
        if serializer.validated_data.get('consents'):
            consent_use_case = get_grant_consent_use_case()
            for consent_type, granted in serializer.validated_data['consents'].items():
                if granted:
                    consent_request = GrantConsentRequest(
                        user_id=result.user_id,
                        consent_type=consent_type,
                        version='2026-01-26',
                        source='web',
                    )
                    consent_use_case.execute(consent_request)
        
        user_model = user_repository.get_django_model(result.user_id)
        if not user_model:
            raise NotFoundError("User not found")
        refresh = RefreshToken.for_user(user_model)
        
        email_value = result.email.value if hasattr(result.email, 'value') else str(result.email) if result.email else None
        response_data = {
            'data': {
                'user': {
                    'id': str(result.user_id),
                    'email': email_value,
                },
            }
        }
        
        response = Response(response_data, status=status.HTTP_201_CREATED)
        
        # Set httpOnly cookies
        response.set_cookie(
            key='access_token',
            value=str(refresh.access_token),
            httponly=True,
            secure=settings.SESSION_COOKIE_SECURE,  # Set to False for dev as requested
            samesite='Lax',
            max_age=settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'].total_seconds()
        )
        response.set_cookie(
            key='refresh_token',
            value=str(refresh),
            httponly=True,
            secure=settings.SESSION_COOKIE_SECURE,  # Set to False for dev as requested
            samesite='Lax',
            max_age=settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME'].total_seconds()
        )
        
        return response


class LoginViewSet(viewsets.ViewSet):
    """
    Авторизация пользователя.
    """
    permission_classes = [AllowAny]
    throttle_classes = [AuthEndpointThrottle]
    
    @extend_schema(
        summary="Авторизация пользователя",
        request=LoginSerializer,
        responses={200: AuthResponseSerializer},
    )
    def create(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        email = serializer.validated_data['email'].strip().lower()
        
        locked, locked_until = _check_login_locked(email)
        if locked:
            retry_after = int(locked_until - time.time()) if locked_until else LOGIN_LOCKOUT_TTL_SECONDS
            return Response(
                {
                    'error': {
                        'code': 'TOO_MANY_ATTEMPTS',
                        'message': 'Слишком много попыток входа. Попробуйте через 15 минут.',
                    }
                },
                status=status.HTTP_429_TOO_MANY_REQUESTS,
                headers={'Retry-After': str(min(retry_after, LOGIN_LOCKOUT_TTL_SECONDS))},
            )
        
        use_case = get_authenticate_user_use_case()
        
        user = use_case.execute(
            email=serializer.validated_data['email'],
            password=serializer.validated_data['password'],
        )
        
        if not user:
            _record_failed_login(email)
            raise UnauthorizedError("Invalid email or password")
        
        _clear_login_attempts(email)
        
        user_id = user.id.value if hasattr(user.id, 'value') else user.id
        user_repository = get_sync_user_repository()
        user_model = user_repository.get_django_model(user_id)
        if not user_model:
            raise NotFoundError("User not found")

        # Check for MFA requirement (roles owner and assistant)
        is_admin = False
        if hasattr(user_model, 'has_role') and not settings.TESTING:
            is_admin = user_model.has_role('owner') or user_model.has_role('assistant')
        
        if is_admin:
            # For admin roles, return MFA requirement and set mfa_pending cookie for verify step
            signer = TimestampSigner()
            mfa_pending_value = signer.sign(str(user_id))
            response = Response({
                'data': {
                    'mfa_required': True,
                    'mfa_type': 'totp',
                    'user': {
                        'id': str(user_id),
                        'email': user.email.value if hasattr(user.email, 'value') else str(user.email),
                    }
                }
            }, status=status.HTTP_200_OK)
            response.set_cookie(
                key=MFA_PENDING_COOKIE,
                value=mfa_pending_value,
                httponly=True,
                secure=settings.SESSION_COOKIE_SECURE,
                samesite='Lax',
                max_age=MFA_PENDING_MAX_AGE,
            )
            return response

        refresh = RefreshToken.for_user(user_model)
        jti = getattr(refresh, 'payload', {}).get('jti') or str(refresh)[:64]
        if not _add_session(user_id, jti):
            return Response(
                {
                    'error': {
                        'code': 'SESSION_LIMIT_EXCEEDED',
                        'message': 'Превышен лимит устройств. Выйдите из одного из устройств или подождите истечения сессии.',
                    }
                },
                status=status.HTTP_409_CONFLICT,
            )

        email_value = user.email.value if hasattr(user.email, 'value') else str(user.email) if user.email else None
        
        response_data = {
            'data': {
                'user': {
                    'id': str(user_id),
                    'email': email_value,
                },
            }
        }
        
        response = Response(response_data, status=status.HTTP_200_OK)
        
        # Set httpOnly cookies
        response.set_cookie(
            key='access_token',
            value=str(refresh.access_token),
            httponly=True,
            secure=settings.SESSION_COOKIE_SECURE,  # Set to False for dev as requested
            samesite='Lax',
            max_age=settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'].total_seconds()
        )
        response.set_cookie(
            key='refresh_token',
            value=str(refresh),
            httponly=True,
            secure=settings.SESSION_COOKIE_SECURE,  # Set to False for dev as requested
            samesite='Lax',
            max_age=settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME'].total_seconds()
        )
        
        return response


class RefreshTokenView(TokenRefreshView):
    """
    Обновление access token.
    """
    serializer_class = TokenRefreshSerializer
    permission_classes = [AllowAny]
    
    @extend_schema(
        summary="Обновление access token",
        request=TokenRefreshSerializer,
        responses={200: {'type': 'object', 'properties': {'token': {'type': 'string'}}}},
    )
    def post(self, request, *args, **kwargs):
        # If refresh token is not in body, try to get it from cookies
        if 'refresh' not in request.data:
            refresh_token = request.COOKIES.get('refresh_token')
            if refresh_token:
                request.data['refresh'] = refresh_token
        
        response = super().post(request, *args, **kwargs)
        
        if response.status_code == 200:
            # If successful, set new access token in cookie
            access_token = response.data.get('access')
            if access_token:
                response.set_cookie(
                    key='access_token',
                    value=access_token,
                    httponly=True,
                    secure=settings.SESSION_COOKIE_SECURE,  # Set to False for dev as requested
                    samesite='Lax',
                    max_age=settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'].total_seconds()
                )
                # Remove from body
                del response.data['access']
            
            # If ROTATE_REFRESH_TOKENS is True, it might return a new refresh token
            refresh_token = response.data.get('refresh')
            if refresh_token:
                response.set_cookie(
                    key='refresh_token',
                    value=refresh_token,
                    httponly=True,
                    secure=settings.SESSION_COOKIE_SECURE,  # Set to False for dev as requested
                    samesite='Lax',
                    max_age=settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME'].total_seconds()
                )
                # Remove from body
                del response.data['refresh']
                
        return response


class LogoutView(APIView):
    """
    Выход из системы.
    """
    permission_classes = [IsAuthenticated]
    
    @extend_schema(
        summary="Выход из системы",
        request=LogoutSerializer,
        responses={204: None},
    )
    def post(self, request):
        # Try to get refresh token from body or cookies
        refresh_token = request.data.get('refresh_token')
        if not refresh_token:
            refresh_token = request.COOKIES.get('refresh_token')
            
        if refresh_token:
            try:
                token = RefreshToken(refresh_token)
                token.blacklist()
            except Exception:
                # If token is invalid or already blacklisted, we still want to clear cookies
                pass
        
        response = Response(status=status.HTTP_204_NO_CONTENT)
        response.delete_cookie('access_token')
        response.delete_cookie('refresh_token')
        
        return response


def _get_user_id_from_mfa_pending(request):
    """Извлечь user_id из cookie mfa_pending. Возвращает UUID или None."""
    raw = request.COOKIES.get(MFA_PENDING_COOKIE)
    if not raw:
        return None
    signer = TimestampSigner()
    try:
        value = signer.unsign(raw, max_age=MFA_PENDING_MAX_AGE)
        return UUID(value)
    except (SignatureExpired, BadSignature, ValueError):
        return None


class MfaSetupView(APIView):
    """
    Первичная настройка MFA (TOTP). Доступно по cookie mfa_pending (после login с mfa_required).
    """
    permission_classes = [AllowAny]
    throttle_classes = [AuthEndpointThrottle]

    @extend_schema(
        summary="Настройка MFA",
        responses={200: MfaSetupResponseSerializer},
    )
    def post(self, request):
        user_id = _get_user_id_from_mfa_pending(request)
        if not user_id:
            raise UnauthorizedError("MFA pending session expired or missing. Please log in again.")
        use_case = get_setup_mfa_use_case()
        result = use_case.execute(user_id)
        return Response({
            'data': {
                'provisioning_uri': result.provisioning_uri,
                'secret': result.secret,
            }
        }, status=status.HTTP_200_OK)


class MfaVerifyView(APIView):
    """
    Верификация TOTP кода. Body: { "code": "123456" }. При успехе — access/refresh cookies и user.
    """
    permission_classes = [AllowAny]
    throttle_classes = [AuthEndpointThrottle]

    @extend_schema(
        summary="Верификация MFA кода",
        request=MfaVerifySerializer,
        responses={200: AuthResponseSerializer},
    )
    def post(self, request):
        serializer = MfaVerifySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        code = serializer.validated_data['code']
        user_id = _get_user_id_from_mfa_pending(request)
        if not user_id:
            raise UnauthorizedError("MFA pending session expired or missing. Please log in again.")
        use_case = get_verify_mfa_use_case()
        result = use_case.execute(user_id, code)
        user_repository = get_sync_user_repository()
        user_model = user_repository.get_django_model(result.user_id)
        if not user_model:
            raise NotFoundError("User not found")
        refresh = RefreshToken.for_user(user_model)
        jti = getattr(refresh, 'payload', {}).get('jti') if hasattr(refresh, 'payload') else getattr(refresh, 'get', lambda k: None)('jti') or str(refresh)[:64]
        if not _add_session(str(result.user_id), jti):
            return Response(
                {
                    'error': {
                        'code': 'SESSION_LIMIT_EXCEEDED',
                        'message': 'Превышен лимит устройств. Выйдите из одного из устройств или подождите истечения сессии.',
                    }
                },
                status=status.HTTP_409_CONFLICT,
            )
        response_data = {
            'data': {
                'user': {
                    'id': str(result.user_id),
                    'email': result.email,
                }
            }
        }
        response = Response(response_data, status=status.HTTP_200_OK)
        response.set_cookie(
            key='access_token',
            value=str(refresh.access_token),
            httponly=True,
            secure=settings.SESSION_COOKIE_SECURE,
            samesite='Lax',
            max_age=settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'].total_seconds()
        )
        response.set_cookie(
            key='refresh_token',
            value=str(refresh),
            httponly=True,
            secure=settings.SESSION_COOKIE_SECURE,
            samesite='Lax',
            max_age=settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME'].total_seconds()
        )
        response.delete_cookie(MFA_PENDING_COOKIE)
        return response
