"""
Тесты для RegisterUserUseCase.
"""
import pytest
from unittest.mock import Mock, MagicMock
from datetime import datetime
from uuid import uuid4

from domain.identity.entities import User, UserStatus
from domain.identity.domain_events import UserCreated
from application.identity.use_cases.register_user import (
    RegisterUserUseCase,
    RegisterUserRequest,
)


class TestRegisterUserUseCase:
    """Тесты для RegisterUserUseCase."""
    
    def test_register_user_with_email(self):
        """Тест регистрации пользователя с email."""
        # Arrange
        user_id = uuid4()
        saved_user = User(
            id=user_id,
            email="newuser@example.com",
            status=UserStatus.ACTIVE,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        
        user_repository = Mock()
        user_repository.save.return_value = saved_user
        
        event_bus = Mock()
        
        use_case = RegisterUserUseCase(user_repository, event_bus)
        
        request = RegisterUserRequest(
            email="newuser@example.com",
            display_name="New User",
        )
        
        # Act
        response = use_case.execute(request)
        
        # Assert
        assert response.user_id == user_id
        assert response.email == "newuser@example.com"
        user_repository.save.assert_called_once()
        event_bus.publish.assert_called_once()
        
        # Проверить, что событие правильное
        published_event = event_bus.publish.call_args[0][0]
        assert isinstance(published_event, UserCreated)
        assert published_event.user_id == user_id
        assert published_event.email == "newuser@example.com"
    
    def test_register_user_with_telegram(self):
        """Тест регистрации пользователя через Telegram."""
        # Arrange
        user_id = uuid4()
        saved_user = User(
            id=user_id,
            telegram_user_id="123456789",
            telegram_username="testuser",
            status=UserStatus.ACTIVE,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        
        user_repository = Mock()
        user_repository.save.return_value = saved_user
        
        event_bus = Mock()
        
        use_case = RegisterUserUseCase(user_repository, event_bus)
        
        request = RegisterUserRequest(
            telegram_user_id="123456789",
            telegram_username="testuser",
            display_name="Test User",
        )
        
        # Act
        response = use_case.execute(request)
        
        # Assert
        assert response.user_id == user_id
        assert response.telegram_user_id == "123456789"
        user_repository.save.assert_called_once()
        event_bus.publish.assert_called_once()
    
    def test_register_user_with_phone(self):
        """Тест регистрации пользователя с телефоном."""
        # Arrange
        user_id = uuid4()
        saved_user = User(
            id=user_id,
            phone="+79991234567",
            status=UserStatus.ACTIVE,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        
        user_repository = Mock()
        user_repository.save.return_value = saved_user
        
        event_bus = Mock()
        
        use_case = RegisterUserUseCase(user_repository, event_bus)
        
        request = RegisterUserRequest(
            phone="+79991234567",
            display_name="Phone User",
        )
        
        # Act
        response = use_case.execute(request)
        
        # Assert
        assert response.user_id == user_id
        user_repository.save.assert_called_once()
        event_bus.publish.assert_called_once()
