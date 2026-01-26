"""
Use Case: аутентификация пользователя.
"""
from typing import Optional
from domain.identity.entities import User
from domain.identity.repositories import IUserRepository
from infrastructure.identity.password_service import PasswordService


class AuthenticateUserUseCase:
    """Use Case для аутентификации пользователя."""
    
    def __init__(self, user_repository: IUserRepository):
        self._user_repository = user_repository
        self._password_service = PasswordService()
    
    def execute(self, email: str, password: str) -> Optional[User]:
        """
        Аутентифицировать пользователя по email и паролю.
        
        Returns:
            User если аутентификация успешна, None иначе.
        """
        user = self._user_repository.get_by_email(email)
        if not user or not user.is_active():
            return None
        
        # Получить password_hash из репозитория
        password_hash = self._user_repository.get_password_hash(user.id)
        if not password_hash:
            return None
        
        # Проверка пароля
        if not self._password_service.verify_password(password, password_hash):
            return None
        
        return user
