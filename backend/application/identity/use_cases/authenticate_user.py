"""
Use Case: аутентификация пользователя.
"""
from typing import Optional
from domain.identity.aggregates.user import User
from domain.identity.repositories import IUserRepository
from application.interfaces.password_service import IPasswordService


class AuthenticateUserUseCase:
    """Use Case для аутентификации пользователя."""
    
    def __init__(self, user_repository: IUserRepository, password_service: IPasswordService):
        self._user_repository = user_repository
        self._password_service = password_service
    
    def execute(self, email: str, password: str) -> Optional[User]:
        """
        Аутентифицировать пользователя по email и паролю.
        
        Returns:
            User если аутентификация успешна, None иначе.
        """
        user = self._user_repository.get_by_email(email)
        if not user:
            return None
        
        # Проверить статус пользователя
        from domain.identity.value_objects.user_status import UserStatus
        if user.status != UserStatus.ACTIVE:
            return None
        
        # Получить password_hash из репозитория
        from uuid import UUID
        user_id_uuid = UUID(user.id.value) if hasattr(user.id, 'value') else user.id
        password_hash = self._user_repository.get_password_hash(user_id_uuid)
        if not password_hash:
            return None
        
        # Проверка пароля
        if not self._password_service.verify_password(password, password_hash):
            return None
        
        return user
