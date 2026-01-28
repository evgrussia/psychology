"""
Use Case: регистрация пользователя.
"""
from dataclasses import dataclass
from typing import Optional
from uuid import UUID

from domain.identity.aggregates.user import User, UserId
from domain.identity.value_objects.email import Email
from domain.identity.value_objects.phone_number import PhoneNumber
from domain.identity.repositories import IUserRepository
from domain.identity.domain_events import UserCreatedEvent
from application.interfaces.event_bus import IEventBus
from application.exceptions import ConflictError


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
        event_bus: IEventBus
    ):
        self._user_repository = user_repository
        self._event_bus = event_bus
    
    async def execute(self, request: RegisterUserRequest) -> RegisterUserResponse:
        """
        Зарегистрировать нового пользователя.
        
        Returns:
            RegisterUserResponse с данными созданного пользователя.
        """
        # Конвертировать строки в Value Objects
        email = Email.create(request.email) if request.email else None
        phone = PhoneNumber.create(request.phone) if request.phone else None
        
        # Создать доменный объект через factory method
        user = User.create(
            email=email,
            phone=phone,
            telegram_user_id=request.telegram_user_id
        )
        
        # Установить display_name (если указан)
        if request.display_name:
            user._display_name = request.display_name
        
        # Сохранить через репозиторий
        try:
            await self._user_repository.save(user)
        except Exception as e:
            # Обработать IntegrityError (дубликат email/phone/telegram_user_id)
            error_msg = str(e).lower()
            if 'unique constraint' in error_msg or 'duplicate' in error_msg:
                if request.email and 'email' in error_msg:
                    raise ConflictError(f"User with email {request.email} already exists")
                elif request.phone and 'phone' in error_msg:
                    raise ConflictError(f"User with phone {request.phone} already exists")
                elif request.telegram_user_id and 'telegram' in error_msg:
                    raise ConflictError(f"User with telegram_user_id {request.telegram_user_id} already exists")
                else:
                    raise ConflictError("User with these credentials already exists")
            raise
        
        # Публикуем события
        events = user.get_domain_events()
        for event in events:
            await self._event_bus.publish(event)
        user.clear_domain_events()
        
        # Вернуть DTO
        return RegisterUserResponse(
            user_id=user.id.value,
            email=str(user.email) if user.email else None,
            telegram_user_id=user.telegram_user_id,
        )
