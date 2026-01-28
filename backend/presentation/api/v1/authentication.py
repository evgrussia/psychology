"""
Custom JWT Authentication для API.
"""
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken
from infrastructure.persistence.django_models.user import UserModel


class CustomJWTAuthentication(JWTAuthentication):
    """
    Custom JWT Authentication с дополнительной проверкой пользователя.
    Использует UserModel вместо стандартной Django User модели.
    """
    
    def get_user(self, validated_token):
        """Получить пользователя из токена, используя UserModel."""
        from rest_framework_simplejwt.settings import api_settings
        from uuid import UUID
        
        try:
            user_id = validated_token[api_settings.USER_ID_CLAIM]
            # Преобразуем строку в UUID, если нужно
            if isinstance(user_id, str):
                user_id = UUID(user_id)
            # Используем UserModel вместо стандартной модели
            user = UserModel.objects.get(id=user_id, deleted_at__isnull=True)
        except UserModel.DoesNotExist:
            raise InvalidToken('User not found')
        except (ValueError, TypeError) as e:
            raise InvalidToken(f'Invalid user ID format: {e}')
        
        return user
    
    def authenticate(self, request):
        header = self.get_header(request)
        raw_token = None
        
        if header is not None:
            raw_token = self.get_raw_token(header)
        
        # If no token in header, try to get it from cookies
        if raw_token is None:
            raw_token = request.COOKIES.get('access_token')
            
        if raw_token is None:
            return None
        
        validated_token = self.get_validated_token(raw_token)
        user = self.get_user(validated_token)
        
        # Дополнительная проверка: пользователь активен
        if not user.is_active:
            raise InvalidToken('User is inactive')
        
        # Проверка блокировки (если есть поле status)
        if hasattr(user, 'status') and user.status == 'blocked':
            raise InvalidToken('User is blocked')
        
        return (user, validated_token)
