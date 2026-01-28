"""
Тесты для AuthenticateUserUseCase.
"""
import pytest
from unittest.mock import Mock, MagicMock
from datetime import datetime
from uuid import uuid4

from domain.identity.aggregates.user import User, UserId
from domain.identity.value_objects.user_status import UserStatus
from domain.identity.value_objects.email import Email
from application.identity.use_cases.authenticate_user import AuthenticateUserUseCase


class TestAuthenticateUserUseCase:
    """Тесты для AuthenticateUserUseCase."""
    
    def test_authenticate_success(self):
        """Тест успешной аутентификации."""
        # Arrange
        user = User.create(email=Email.create("test@example.com"))
        user_id = user.id
        
        user_repository = Mock()
        user_repository.get_by_email.return_value = user
        user_repository.get_password_hash.return_value = "hashed_password"
        
        password_service = Mock()
        password_service.verify_password.return_value = True
        
        use_case = AuthenticateUserUseCase(user_repository, password_service)
        
        # Act
        result = use_case.execute("test@example.com", "password123")
        
        # Assert
        assert result is not None
        assert result.id == user_id
        assert result.email.value == "test@example.com"
        user_repository.get_by_email.assert_called_once_with("test@example.com")
        from uuid import UUID
        user_repository.get_password_hash.assert_called_once_with(UUID(user_id.value))
        password_service.verify_password.assert_called_once_with("password123", "hashed_password")
    
    def test_authenticate_user_not_found(self):
        """Тест аутентификации несуществующего пользователя."""
        # Arrange
        user_repository = Mock()
        user_repository.get_by_email.return_value = None
        password_service = Mock()
        
        use_case = AuthenticateUserUseCase(user_repository, password_service)
        
        # Act
        result = use_case.execute("nonexistent@example.com", "password123")
        
        # Assert
        assert result is None
        user_repository.get_by_email.assert_called_once_with("nonexistent@example.com")
    
    def test_authenticate_inactive_user(self):
        """Тест аутентификации неактивного пользователя."""
        # Arrange
        user = User.create(email=Email.create("test@example.com"))
        user.block("Test block reason")
        
        user_repository = Mock()
        user_repository.get_by_email.return_value = user
        password_service = Mock()
        
        use_case = AuthenticateUserUseCase(user_repository, password_service)
        
        # Act
        result = use_case.execute("test@example.com", "password123")
        
        # Assert
        assert result is None
        user_repository.get_by_email.assert_called_once_with("test@example.com")
    
    def test_authenticate_wrong_password(self):
        """Тест аутентификации с неверным паролем."""
        # Arrange
        user = User.create(email=Email.create("test@example.com"))
        user_id = user.id
        
        user_repository = Mock()
        user_repository.get_by_email.return_value = user
        user_repository.get_password_hash.return_value = "hashed_password"
        
        password_service = Mock()
        password_service.verify_password.return_value = False
        
        use_case = AuthenticateUserUseCase(user_repository, password_service)
        
        # Act
        result = use_case.execute("test@example.com", "wrong_password")
        
        # Assert
        assert result is None
        password_service.verify_password.assert_called_once_with("wrong_password", "hashed_password")
    
    def test_authenticate_no_password_hash(self):
        """Тест аутентификации пользователя без пароля."""
        # Arrange
        user = User.create(email=Email.create("test@example.com"))
        user_id = user.id
        
        user_repository = Mock()
        user_repository.get_by_email.return_value = user
        user_repository.get_password_hash.return_value = None
        password_service = Mock()
        
        use_case = AuthenticateUserUseCase(user_repository, password_service)
        
        # Act
        result = use_case.execute("test@example.com", "password123")
        
        # Assert
        assert result is None
