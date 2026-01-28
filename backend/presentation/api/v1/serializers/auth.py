"""
Serializers для Authentication endpoints.
"""
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
    """Serializer для регистрации пользователя."""
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
        """Дополнительная валидация пароля."""
        if len(value) < 12:
            raise serializers.ValidationError("Password must be at least 12 characters long")
        # Проверка сложности (опционально)
        return value


class LoginSerializer(serializers.Serializer):
    """Serializer для авторизации пользователя."""
    email = serializers.EmailField(required=True)
    password = serializers.CharField(
        required=True,
        write_only=True,
        style={'input_type': 'password'},
    )


class AuthResponseSerializer(serializers.Serializer):
    """Serializer для ответа авторизации."""
    user = serializers.DictField(required=False)
    mfa_required = serializers.BooleanField(required=False)
    mfa_type = serializers.CharField(required=False)


class RefreshTokenSerializer(serializers.Serializer):
    """Serializer для обновления токена."""
    refresh_token = serializers.CharField(required=True)


class LogoutSerializer(serializers.Serializer):
    """Serializer для выхода из системы."""
    refresh_token = serializers.CharField(required=False)
