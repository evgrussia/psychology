"""
Тесты для RegisterUserUseCase.
"""
import pytest
from unittest.mock import Mock, MagicMock, AsyncMock
from datetime import datetime
from uuid import uuid4

from domain.identity.aggregates.user import User, UserId
from domain.identity.value_objects.user_status import UserStatus
from domain.identity.value_objects.email import Email
from domain.identity.domain_events import UserCreatedEvent
from application.identity.use_cases.register_user import (
    RegisterUserUseCase,
    RegisterUserRequest,
)


class TestRegisterUserUseCase:
    """Тесты для RegisterUserUseCase."""
    
    @pytest.mark.asyncio
    async def test_register_user_with_email(self):
        """Тест регистрации пользователя с email."""
        # Arrange
        saved_user = User.create(email=Email.create("newuser@example.com"))
        user_id = saved_user.id
        
        user_repository = AsyncMock()
        user_repository.save.return_value = None
        
        event_bus = AsyncMock()
        
        use_case = RegisterUserUseCase(user_repository, event_bus)
        
        request = RegisterUserRequest(
            email="newuser@example.com",
            display_name="New User",
        )
        
        # Act
        response = await use_case.execute(request)
        
        # Assert
        from uuid import UUID
        assert isinstance(response.user_id, str)
        UUID(response.user_id)  # Should not raise ValueError
        assert response.email == "newuser@example.com"
        user_repository.save.assert_called_once()
        event_bus.publish.assert_called_once()
        
        # Проверить, что событие правильное
        published_event = event_bus.publish.call_args[0][0]
        assert isinstance(published_event, UserCreatedEvent)
        from uuid import UUID
        assert isinstance(published_event.user_id.value, str)
        assert published_event.email.value == "newuser@example.com"
    
    @pytest.mark.asyncio
    async def test_register_user_with_telegram(self):
        """Тест регистрации пользователя через Telegram."""
        # Arrange
        saved_user = User.create(telegram_user_id="123456789")
        user_id = saved_user.id
        
        user_repository = AsyncMock()
        user_repository.save.return_value = None
        
        event_bus = AsyncMock()
        
        use_case = RegisterUserUseCase(user_repository, event_bus)
        
        request = RegisterUserRequest(
            telegram_user_id="123456789",
            telegram_username="testuser",
            display_name="Test User",
        )
        
        # Act
        response = await use_case.execute(request)
        
        # Assert
        from uuid import UUID
        assert isinstance(response.user_id, str)
        UUID(response.user_id)  # Should not raise ValueError
        assert response.telegram_user_id == "123456789"
        user_repository.save.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_register_user_with_phone(self):
        """Тест регистрации пользователя с телефоном."""
        # Arrange
        from domain.identity.value_objects.phone_number import PhoneNumber
        saved_user = User.create(phone=PhoneNumber.create("+79991234567"))
        user_id = saved_user.id
        
        user_repository = AsyncMock()
        user_repository.save.return_value = None
        
        event_bus = AsyncMock()
        
        use_case = RegisterUserUseCase(user_repository, event_bus)
        
        request = RegisterUserRequest(
            phone="+79991234567",
            display_name="Phone User",
        )
        
        # Act
        response = await use_case.execute(request)
        
        # Assert
        from uuid import UUID
        assert isinstance(response.user_id, str)
        UUID(response.user_id)  # Should not raise ValueError
        user_repository.save.assert_called_once()
