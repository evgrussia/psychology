"""
Use Case: регистрация пользователя.
"""
from dataclasses import dataclass
from uuid import UUID, uuid4
from datetime import datetime

from domain.identity.entities import User, UserStatus
from domain.identity.repositories import IUserRepository
from domain.identity.domain_events import UserCreated
from infrastructure.events.event_bus import IDomainEventBus


@dataclass
class RegisterUserRequest:
    """DTO: запрос на регистрацию."""
    email: str = None
    phone: str = None
    telegram_user_id: str = None
    telegram_username: str = None
    display_name: str = None


@dataclass
class RegisterUserResponse:
    """DTO: ответ на регистрацию."""
    user_id: UUID
    email: str = None
    telegram_user_id: str = None


class RegisterUserUseCase:
    """Use Case для регистрации пользователя."""
    
    def __init__(
        self,
        user_repository: IUserRepository,
        event_bus: IDomainEventBus
    ):
        self._user_repository = user_repository
        self._event_bus = event_bus
    
    def execute(self, request: RegisterUserRequest) -> RegisterUserResponse:
        """
        Зарегистрировать нового пользователя.
        
        Returns:
            RegisterUserResponse с данными созданного пользователя.
        """
        # Создать доменный объект
        user = User(
            id=uuid4(),
            email=request.email,
            phone=request.phone,
            telegram_user_id=request.telegram_user_id,
            telegram_username=request.telegram_username,
            display_name=request.display_name,
            status=UserStatus.ACTIVE,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        
        # Сохранить через репозиторий
        user = self._user_repository.save(user)
        
        # Публиковать доменное событие
        event = UserCreated(
            user_id=user.id,
            email=user.email,
            telegram_user_id=user.telegram_user_id,
        )
        self._event_bus.publish(event)
        
        # Вернуть DTO
        return RegisterUserResponse(
            user_id=user.id,
            email=user.email,
            telegram_user_id=user.telegram_user_id,
        )
