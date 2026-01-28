"""
Views для Authentication endpoints.
"""
from django.conf import settings
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
)
from presentation.api.v1.throttling import AuthEndpointThrottle
from presentation.api.v1.dependencies import (
    get_sync_user_repository,
    get_register_user_use_case,
    get_authenticate_user_use_case,
    get_grant_consent_use_case,
    get_password_service,
)
from infrastructure.identity.password_service import PasswordService


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
        
        use_case = get_authenticate_user_use_case()
        
        user = use_case.execute(
            email=serializer.validated_data['email'],
            password=serializer.validated_data['password'],
        )
        
        if not user:
            raise UnauthorizedError("Invalid email or password")
        
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
            # For admin roles, return MFA requirement
            return Response({
                'data': {
                    'mfa_required': True,
                    'mfa_type': 'totp', # Default type
                    'user': {
                        'id': str(user_id),
                        'email': user.email.value if hasattr(user.email, 'value') else str(user.email),
                    }
                }
            }, status=status.HTTP_200_OK)

        refresh = RefreshToken.for_user(user_model)
        
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
